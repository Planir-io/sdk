import { createClient, type Client, type Interceptor } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";

import type { NormalizedClientOptionsWithAuth } from "../BaseClient.js";
import { Supplier } from "../core/fetcher/Supplier.js";
import { PlanirApiEnvironment } from "../environments.js";
import { Process, Signal, type ProcessEvent } from "./gen/planir/runtime/v1/process_pb.js";

type ProcessClient = Client<typeof Process>;
type Selector = number | string;

export interface RunOptions {
    cwd?: string;
    env?: Readonly<Record<string, string>>;
    tag?: string;
    stdin?: string | Uint8Array;
    timeoutMs?: number;
    requestTimeoutMs?: number;
    signal?: AbortSignal;
    onStdout?: (data: Uint8Array) => void | Promise<void>;
    onStderr?: (data: Uint8Array) => void | Promise<void>;
    capture?: boolean;
}

export type ConnectOptions = Pick<RunOptions,
    "requestTimeoutMs" | "signal" | "onStdout" | "onStderr" | "capture">;

export interface PtyOptions {
    cols: number;
    rows: number;
    cwd?: string;
    env?: Readonly<Record<string, string>>;
    tag?: string;
    timeoutMs?: number;
    requestTimeoutMs?: number;
    signal?: AbortSignal;
    capture?: boolean;
    onData?: (data: Uint8Array) => void | Promise<void>;
}

export type PtyConnectOptions = Pick<PtyOptions,
    "requestTimeoutMs" | "signal" | "capture" | "onData">;

export interface PtyResult extends Omit<CommandResult, "stdout" | "stderr" | "stdoutBytes" | "stderrBytes"> {
    output: string;
    outputBytes: Uint8Array;
}

type ProcessResponse = { event?: ProcessEvent };
type CollectOptions = Pick<RunOptions, "capture" | "onStdout" | "onStderr"> & {
    onData?: (data: Uint8Array) => void | Promise<void>;
};

function bytes(value: string | Uint8Array): Uint8Array {
    return typeof value === "string" ? new TextEncoder().encode(value) : value;
}

function processSelector(value: Selector) {
    return { selector: typeof value === "number"
        ? { case: "pid" as const, value }
        : { case: "tag" as const, value } };
}

function processTimeout(value: number | undefined): bigint | undefined {
    if (value === undefined) return undefined;
    if (!Number.isSafeInteger(value) || value < 0) throw new RangeError("timeoutMs must be a non-negative safe integer");
    return BigInt(value);
}

export interface CommandResult {
    pid: number;
    exitCode: number;
    exited: boolean;
    status: string;
    error?: string;
    stdout: string;
    stderr: string;
    stdoutBytes: Uint8Array;
    stderrBytes: Uint8Array;
}

export interface ProcessInfo {
    pid: number;
    tag?: string;
    cmd: string;
    args: string[];
    env: Record<string, string>;
    cwd?: string;
}

type CapturedResult = CommandResult & { outputBytes: Uint8Array };

export class CommandExitError extends Error {
    readonly name = "CommandExitError";
    constructor(readonly result: CommandResult) {
        super(result.error ?? `Command exited with code ${result.exitCode}`);
    }
}

export class PtyExitError extends Error {
    readonly name = "PtyExitError";
    constructor(readonly result: PtyResult) {
        super(result.error ?? `PTY exited with code ${result.exitCode}`);
    }
}

function join(chunks: Uint8Array[]): Uint8Array {
    const joined = new Uint8Array(chunks.reduce((size, chunk) => size + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
        joined.set(chunk, offset);
        offset += chunk.length;
    }
    return joined;
}

async function collect(pid: number, stream: AsyncIterator<ProcessResponse>, options: CollectOptions,
                       controller: AbortController): Promise<CapturedResult> {
    const stdout: Uint8Array[] = [];
    const stderr: Uint8Array[] = [];
    const pty: Uint8Array[] = [];
    try {
        while (true) {
            const next = await stream.next();
            if (next.done) throw new Error("Process stream closed without an end event");
            const event = next.value.event?.event;
            if (event?.case === "data") {
                const output = event.value.output;
                if (output.case === "stdout") await options.onStdout?.(output.value);
                if (output.case === "stderr") await options.onStderr?.(output.value);
                if (output.case === "pty") await options.onData?.(output.value);
                if (options.capture !== false && output.case === "stdout") stdout.push(output.value);
                if (options.capture !== false && output.case === "stderr") stderr.push(output.value);
                if (options.capture !== false && output.case === "pty") pty.push(output.value);
            }
            if (event?.case !== "end") continue;
            const stdoutBytes = join(stdout);
            const stderrBytes = join(stderr);
            return { pid, ...event.value, stdoutBytes, stderrBytes, outputBytes: join(pty),
                stdout: new TextDecoder().decode(stdoutBytes), stderr: new TextDecoder().decode(stderrBytes) };
        }
    } finally {
        controller.abort();
        try { await stream.return?.(); } catch { /* the attachment is already canceled */ }
    }
}

async function openHandle<T>(
    events: AsyncIterable<ProcessResponse>,
    controller: AbortController,
    options: CollectOptions,
    create: (pid: number, result: Promise<CapturedResult>) => T,
): Promise<T> {
    const stream = events[Symbol.asyncIterator]();
    const first = await stream.next();
    const event = first.value?.event?.event;
    if (first.done || event?.case !== "start") {
        controller.abort();
        throw new Error("Process stream did not start with a PID");
    }
    const pid = event.value.pid;
    return create(pid, collect(pid, stream, options, controller));
}

export class CommandHandle {
    constructor(
        readonly pid: number,
        private readonly plane: ProcessPlane,
        private readonly controller: AbortController,
        private readonly result: Promise<CommandResult>,
    ) {
        void result.catch(() => undefined);
    }

    async wait(): Promise<CommandResult> {
        const result = await this.result;
        if (result.exitCode !== 0) throw new CommandExitError(result);
        return result;
    }

    async sendInput(data: string | Uint8Array): Promise<void> {
        await this.plane.sendInput({ process: processSelector(this.pid), input: { input: { case: "stdin", value: bytes(data) } } });
    }

    async closeStdin(): Promise<void> {
        await this.plane.closeStdin({ process: processSelector(this.pid) });
    }

    async terminate(): Promise<void> {
        await this.plane.sendSignal({ process: processSelector(this.pid), signal: Signal.SIGTERM });
    }

    async kill(): Promise<void> {
        await this.plane.sendSignal({ process: processSelector(this.pid), signal: Signal.SIGKILL });
    }

    disconnect(): void {
        this.controller.abort();
    }
}

export class PtyHandle {
    constructor(
        readonly pid: number,
        private readonly plane: ProcessPlane,
        private readonly controller: AbortController,
        private readonly result: Promise<CapturedResult>,
    ) {
        void result.catch(() => undefined);
    }

    async wait(): Promise<PtyResult> {
        const captured = await this.result;
        const result = { pid: captured.pid, exitCode: captured.exitCode, exited: captured.exited,
            status: captured.status, error: captured.error, outputBytes: captured.outputBytes,
            output: new TextDecoder().decode(captured.outputBytes) };
        if (result.exitCode !== 0) throw new PtyExitError(result);
        return result;
    }

    async sendInput(data: string | Uint8Array): Promise<void> {
        await this.plane.sendInput({ process: processSelector(this.pid), input: { input: { case: "pty", value: bytes(data) } } });
    }

    async resize(cols: number, rows: number): Promise<void> {
        if (cols <= 0 || rows <= 0) throw new RangeError("PTY dimensions must be positive");
        await this.plane.update({ process: processSelector(this.pid), pty: { size: { cols, rows } } });
    }

    async terminate(): Promise<void> {
        await this.plane.sendSignal({ process: processSelector(this.pid), signal: Signal.SIGTERM });
    }

    async kill(): Promise<void> {
        await this.plane.sendSignal({ process: processSelector(this.pid), signal: Signal.SIGKILL });
    }

    disconnect(): void { this.controller.abort(); }
}

class ProcessPlane {
    private readonly client: Promise<ProcessClient>;

    constructor(options: NormalizedClientOptionsWithAuth, runtimeId: string) {
        if (runtimeId === "." || runtimeId === "..") {
            throw new Error("runtimeId must not be a dot path segment");
        }
        if (options.fetch != null && options.processTransportOptions == null) {
            throw new Error("custom fetch does not serve Process calls; configure processTransportOptions");
        }
        const auth: Interceptor = (next) => async (request) => {
            for (const [name, supplied] of Object.entries(options.headers ?? {})) {
                if (request.header.has(name)) continue;
                const value = await Supplier.get(supplied);
                if (value != null) request.header.set(name, value);
            }
            const { headers } = await options.authProvider.getAuthRequest();
            for (const [name, value] of Object.entries(headers)) {
                if (!request.header.has(name)) request.header.set(name, value);
            }
            return next(request);
        };
        this.client = Supplier.get(options.baseUrl ?? options.environment ?? PlanirApiEnvironment.Default).then((baseUrl) =>
            createClient(Process, createConnectTransport({
                ...options.processTransportOptions,
                baseUrl: `${baseUrl.replace(/\/$/, "")}/v1/runtimes/${encodeURIComponent(runtimeId)}`,
                httpVersion: "1.1",
                interceptors: [auth],
                defaultTimeoutMs: options.timeoutInSeconds == null ? undefined : options.timeoutInSeconds * 1000,
            })),
        );
    }

    async *start(...args: Parameters<ProcessClient["start"]>) {
        const client = await this.client;
        yield* client.start(...args);
    }
    async *connect(...args: Parameters<ProcessClient["connect"]>) {
        const client = await this.client;
        yield* client.connect(...args);
    }
    list(...args: Parameters<ProcessClient["list"]>) { return this.client.then((client) => client.list(...args)); }
    streamInput(...args: Parameters<ProcessClient["streamInput"]>) { return this.client.then((client) => client.streamInput(...args)); }
    sendInput(...args: Parameters<ProcessClient["sendInput"]>) { return this.client.then((client) => client.sendInput(...args)); }
    closeStdin(...args: Parameters<ProcessClient["closeStdin"]>) { return this.client.then((client) => client.closeStdin(...args)); }
    update(...args: Parameters<ProcessClient["update"]>) { return this.client.then((client) => client.update(...args)); }
    sendSignal(...args: Parameters<ProcessClient["sendSignal"]>) { return this.client.then((client) => client.sendSignal(...args)); }
}

export class Commands {
    constructor(private readonly plane: ProcessPlane) {}

    async start(argv: readonly string[], options: RunOptions = {}): Promise<CommandHandle> {
        if (argv.length === 0 || argv[0] === "") throw new TypeError("argv must contain an executable");
        const controller = new AbortController();
        const signal = options.signal ? AbortSignal.any([controller.signal, options.signal]) : controller.signal;
        const events = this.plane.start({
            process: { cmd: argv[0], args: [...argv.slice(1)], envs: { ...options.env }, cwd: options.cwd },
            tag: options.tag,
            stdin: options.stdin === undefined ? undefined : bytes(options.stdin),
            timeoutMs: processTimeout(options.timeoutMs),
        }, { signal, timeoutMs: options.requestTimeoutMs });
        return openHandle(events, controller, options,
            (pid, result) => new CommandHandle(pid, this.plane, controller, result));
    }

    async run(argv: readonly string[], options: RunOptions = {}): Promise<CommandResult> {
        return (await this.start(argv, options)).wait();
    }

    async connect(process: Selector, options: ConnectOptions = {}): Promise<CommandHandle> {
        const controller = new AbortController();
        const signal = options.signal ? AbortSignal.any([controller.signal, options.signal]) : controller.signal;
        const events = this.plane.connect({ process: processSelector(process) }, {
            signal, timeoutMs: options.requestTimeoutMs,
        });
        return openHandle(events, controller, options,
            (pid, result) => new CommandHandle(pid, this.plane, controller, result));
    }

    async list(): Promise<ProcessInfo[]> {
        const result = await this.plane.list({});
        return result.processes.map(({ pid, tag, config }) => {
            if (!config) throw new Error(`Process ${pid} is missing config`);
            return { pid, tag, cmd: config.cmd, args: config.args, env: config.envs, cwd: config.cwd };
        });
    }
}

export class Pty {
    constructor(private readonly plane: ProcessPlane) {}

    async create(argv: readonly string[], options: PtyOptions): Promise<PtyHandle> {
        if (argv.length === 0 || argv[0] === "") throw new TypeError("argv must contain an executable");
        if (options.cols <= 0 || options.rows <= 0) throw new RangeError("PTY dimensions must be positive");
        const controller = new AbortController();
        const signal = options.signal ? AbortSignal.any([controller.signal, options.signal]) : controller.signal;
        const events = this.plane.start({
            process: { cmd: argv[0], args: [...argv.slice(1)], envs: { ...options.env }, cwd: options.cwd },
            pty: { size: { cols: options.cols, rows: options.rows } },
            tag: options.tag,
            timeoutMs: processTimeout(options.timeoutMs),
        }, { signal, timeoutMs: options.requestTimeoutMs });
        return openHandle(events, controller, options,
            (pid, result) => new PtyHandle(pid, this.plane, controller, result));
    }

    async connect(process: Selector, options: PtyConnectOptions = {}): Promise<PtyHandle> {
        const controller = new AbortController();
        const signal = options.signal ? AbortSignal.any([controller.signal, options.signal]) : controller.signal;
        const events = this.plane.connect({ process: processSelector(process) }, {
            signal, timeoutMs: options.requestTimeoutMs,
        });
        return openHandle(events, controller, options,
            (pid, result) => new PtyHandle(pid, this.plane, controller, result));
    }
}

export class RuntimeHandle {
    readonly commands: Commands;
    readonly pty: Pty;

    constructor(options: NormalizedClientOptionsWithAuth, runtimeId: string) {
        const plane = new ProcessPlane(options, runtimeId);
        this.commands = new Commands(plane);
        this.pty = new Pty(plane);
    }
}

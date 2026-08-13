import { createClient, type Client, type Interceptor } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";

import type { NormalizedClientOptionsWithAuth } from "../BaseClient.js";
import { Supplier } from "../core/fetcher/Supplier.js";
import { PlanirApiEnvironment } from "../environments.js";
import { Process } from "./gen/planir/runtime/v1/process_pb.js";

type ProcessClient = Client<typeof Process>;

export class ProcessPlane {
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

export class RuntimeHandle {
    readonly commands: ProcessPlane;
    readonly pty: ProcessPlane;

    constructor(options: NormalizedClientOptionsWithAuth, runtimeId: string) {
        this.commands = this.pty = new ProcessPlane(options, runtimeId);
    }
}

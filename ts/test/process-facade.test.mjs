import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";

import { connectNodeAdapter } from "@connectrpc/connect-node";
import { Commands, PlanirClient } from "../dist/index.js";
import { Process } from "../dist/process/gen/planir/runtime/v1/process_pb.js";

async function serveProcess(t, implementation) {
    const adapter = connectNodeAdapter({ routes: (router) => router.service(Process, implementation) });
    const server = createServer((request, response) => {
        request.url = request.url.replace(/^\/v1\/runtimes\/rt_test/, "");
        adapter(request, response);
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    t.after(() => server.close());
    return `http://127.0.0.1:${server.address().port}`;
}

test("commands.run sends exact argv and returns separated output", async (t) => {
    let received;
    const baseUrl = await serveProcess(t, {
        async *start(request) {
            received = request;
            yield { event: { event: { case: "start", value: { pid: 41 } } } };
            yield { event: { event: { case: "data", value: { output: { case: "stdout", value: new Uint8Array([104, 105]) } } } } };
            yield { event: { event: { case: "data", value: { output: { case: "stderr", value: new Uint8Array([33]) } } } } };
            yield { event: { event: { case: "end", value: { exitCode: 0, exited: true, status: "exited" } } } };
        },
    });
    const commands = new PlanirClient({ baseUrl, token: "test" }).runtimes.runtime("rt_test").commands;

    const result = await commands.run(["printf", "%s", "hi"], { cwd: "/work", env: { A: "b" } });

    assert.equal(received.process.cmd, "printf");
    assert.deepEqual(received.process.args, ["%s", "hi"]);
    assert.equal(received.process.cwd, "/work");
    assert.deepEqual(received.process.envs, { A: "b" });
    assert.equal(result.pid, 41);
    assert.equal(result.exitCode, 0);
    assert.equal(result.stdout, "hi");
    assert.equal(result.stderr, "!");
    assert.deepEqual(result.stdoutBytes, new Uint8Array([104, 105]));
    assert.deepEqual(result.stderrBytes, new Uint8Array([33]));
});

test("commands.start returns a handle before the process exits", async (t) => {
    let finish;
    const gate = new Promise((resolve) => { finish = resolve; });
    const baseUrl = await serveProcess(t, {
        async *start() {
            yield { event: { event: { case: "start", value: { pid: 42 } } } };
            await gate;
            yield { event: { event: { case: "end", value: { exitCode: 0, exited: true, status: "exited" } } } };
        },
    });
    const commands = new PlanirClient({ baseUrl, token: "test" }).runtimes.runtime("rt_test").commands;

    const handle = await commands.start(["sleep", "10"]);

    assert.equal(handle.pid, 42);
    finish();
    assert.equal((await handle.wait()).exitCode, 0);
});

test("a connected command handle owns input, EOF, and exact signals", async (t) => {
    const calls = [];
    let finish;
    const gate = new Promise((resolve) => { finish = resolve; });
    const baseUrl = await serveProcess(t, {
        async *connect(request) {
            calls.push(["connect", request.process.selector]);
            yield { event: { event: { case: "start", value: { pid: 77 } } } };
            await gate;
            yield { event: { event: { case: "end", value: { exitCode: 0, exited: true, status: "exited" } } } };
        },
        sendInput(request) { calls.push(["input", request.input.input]); return {}; },
        closeStdin(request) { calls.push(["eof", request.process.selector]); return {}; },
        sendSignal(request) { calls.push(["signal", request.signal]); return {}; },
    });
    const commands = new PlanirClient({ baseUrl, token: "test" }).runtimes.runtime("rt_test").commands;

    const handle = await commands.connect("worker");
    await handle.sendInput("hi");
    await handle.closeStdin();
    await handle.terminate();
    await handle.kill();
    finish();
    await handle.wait();

    assert.deepEqual(calls, [
        ["connect", { case: "tag", value: "worker" }],
        ["input", { case: "stdin", value: new Uint8Array([104, 105]) }],
        ["eof", { case: "pid", value: 77 }],
        ["signal", 15],
        ["signal", 9],
    ]);
});

test("a non-zero command throws an error carrying the complete result", async (t) => {
    const baseUrl = await serveProcess(t, {
        async *start() {
            yield { event: { event: { case: "start", value: { pid: 9 } } } };
            yield { event: { event: { case: "data", value: { output: { case: "stderr", value: new TextEncoder().encode("bad") } } } } };
            yield { event: { event: { case: "end", value: { exitCode: 7, exited: true, status: "exited", error: "failed" } } } };
        },
    });
    const commands = new PlanirClient({ baseUrl, token: "test" }).runtimes.runtime("rt_test").commands;

    await assert.rejects(commands.run(["false"]), (error) => {
        assert.equal(error.name, "CommandExitError");
        assert.equal(error.result.exitCode, 7);
        assert.equal(error.result.stderr, "bad");
        return true;
    });
});

test("pty.create preserves exact argv and returns one interactive handle", async (t) => {
    const calls = [];
    const baseUrl = await serveProcess(t, {
        async *start(request) {
            calls.push(["start", request.process, request.pty.size]);
            yield { event: { event: { case: "start", value: { pid: 88 } } } };
            yield { event: { event: { case: "data", value: { output: { case: "pty", value: new Uint8Array([36, 32]) } } } } };
            yield { event: { event: { case: "end", value: { exitCode: 0, exited: true, status: "exited" } } } };
        },
        sendInput(request) { calls.push(["input", request.input.input]); return {}; },
        update(request) { calls.push(["resize", request.pty.size]); return {}; },
    });
    const pty = new PlanirClient({ baseUrl, token: "test" }).runtimes.runtime("rt_test").pty;

    const handle = await pty.create(["/bin/sh", "-i"], { cols: 120, rows: 30 });
    await handle.sendInput("ls\n");
    await handle.resize(160, 40);
    const result = await handle.wait();

    assert.equal(handle.pid, 88);
    assert.equal(handle.closeStdin, undefined);
    assert.equal(result.output, "$ ");
    assert.deepEqual(result.outputBytes, new Uint8Array([36, 32]));
    assert.equal(calls[0][0], "start");
    assert.equal(calls[0][1].cmd, "/bin/sh");
    assert.deepEqual(calls[0][1].args, ["-i"]);
    assert.deepEqual({ cols: calls[0][2].cols, rows: calls[0][2].rows }, { cols: 120, rows: 30 });
    assert.deepEqual(calls[1], ["input", { case: "pty", value: new TextEncoder().encode("ls\n") }]);
    assert.equal(calls[2][0], "resize");
    assert.deepEqual({ cols: calls[2][1].cols, rows: calls[2][1].rows }, { cols: 160, rows: 40 });
});

test("commands.list returns running process metadata", async (t) => {
    const baseUrl = await serveProcess(t, {
        list() {
            return { processes: [{ pid: 12, tag: "worker", config: {
                cmd: "node", args: ["server.js"], envs: { PORT: "3000" }, cwd: "/app",
            } }] };
        },
    });
    const commands = new PlanirClient({ baseUrl, token: "test" }).runtimes.runtime("rt_test").commands;

    assert.deepEqual(await commands.list(), [{
        pid: 12, tag: "worker", cmd: "node", args: ["server.js"], env: { PORT: "3000" }, cwd: "/app",
    }]);
});

test("commands.list rejects malformed process metadata instead of inventing defaults", async (t) => {
    const baseUrl = await serveProcess(t, { list() { return { processes: [{ pid: 12 }] }; } });
    const commands = new PlanirClient({ baseUrl, token: "test" }).runtimes.runtime("rt_test").commands;

    await assert.rejects(commands.list(), /missing config/);
});

test("command inputs reject empty argv and unsafe process timeouts before transport", async () => {
    const commands = new PlanirClient({ token: "test" }).runtimes.runtime("rt_test").commands;

    await assert.rejects(commands.start([]), /executable/);
    await assert.rejects(commands.start(["true"], { timeoutMs: -1 }), /non-negative safe integer/);
});

test("pty.connect resumes future binary output", async (t) => {
    const chunks = [];
    const baseUrl = await serveProcess(t, {
        async *connect() {
            yield { event: { event: { case: "start", value: { pid: 88 } } } };
            yield { event: { event: { case: "data", value: { output: { case: "pty", value: new Uint8Array([0, 255]) } } } } };
            yield { event: { event: { case: "end", value: { exitCode: 0, exited: true, status: "exited" } } } };
        },
    });
    const pty = new PlanirClient({ baseUrl, token: "test" }).runtimes.runtime("rt_test").pty;

    const result = await (await pty.connect(88, { onData: (data) => chunks.push(data) })).wait();

    assert.deepEqual(chunks, [new Uint8Array([0, 255])]);
    assert.deepEqual(result.outputBytes, new Uint8Array([0, 255]));
});

test("disconnect cancels only the attachment without an unhandled rejection", async (t) => {
    const gate = new Promise(() => {});
    const baseUrl = await serveProcess(t, {
        async *connect() {
            yield { event: { event: { case: "start", value: { pid: 88 } } } };
            await gate;
        },
    });
    const handle = await new PlanirClient({ baseUrl, token: "test" })
        .runtimes.runtime("rt_test").commands.connect(88);

    handle.disconnect();
    await new Promise((resolve) => setImmediate(resolve));
});

test("pty disconnect also consumes the canceled attachment", async (t) => {
    const gate = new Promise(() => {});
    const baseUrl = await serveProcess(t, {
        async *connect() {
            yield { event: { event: { case: "start", value: { pid: 89 } } } };
            await gate;
        },
    });
    const handle = await new PlanirClient({ baseUrl, token: "test" })
        .runtimes.runtime("rt_test").pty.connect(89);

    handle.disconnect();
    await new Promise((resolve) => setImmediate(resolve));
});

test("wait closes the attachment after the terminal event", async () => {
    let closed = false;
    const responses = [
        { event: { event: { case: "start", value: { pid: 90 } } } },
        { event: { event: { case: "end", value: { exitCode: 0, exited: true, status: "exited" } } } },
    ];
    const plane = {
        start() {
            let index = 0;
            return { [Symbol.asyncIterator]() { return {
                async next() { return { value: responses[index++], done: false }; },
                async return() {
                    closed = true;
                    return { done: true };
                },
            }; } };
        },
    };

    await new Commands(plane).run(["true"]);

    assert.equal(closed, true);
});

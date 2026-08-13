import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";

import { Code } from "@connectrpc/connect";
import { connectNodeAdapter } from "@connectrpc/connect-node";
import { PlanirClient } from "../dist/index.js";
import { Process } from "../dist/process/gen/planir/runtime/v1/process_pb.js";

test("a runtime handle exposes commands and pty", () => {
    const runtime = new PlanirClient({ token: "test" }).runtimes.runtime("rt_test");
    const methods = ["start", "connect", "list", "streamInput", "sendInput", "closeStdin", "update", "sendSignal"];
    for (const method of methods) {
        assert.equal(typeof runtime.commands[method], "function");
        assert.equal(typeof runtime.pty[method], "function");
    }
});

test("dot-only runtime IDs are rejected", () => {
    const runtimes = new PlanirClient({ token: "test" }).runtimes;
    for (const runtimeId of [".", ".."]) {
        assert.throws(() => runtimes.runtime(runtimeId), /dot path segment/);
    }
});

test("streaming methods return async iterables without an extra await", () => {
    const commands = new PlanirClient({ token: "test" }).runtimes.runtime("rt_test").commands;
    for (const stream of [commands.start({}), commands.connect({})]) {
        assert.equal(typeof stream[Symbol.asyncIterator], "function");
    }
});

test("per-request Process headers override client suppliers", async (t) => {
    let headers;
    const adapter = connectNodeAdapter({
        routes: (router) => router.service(Process, {
            list(_request, context) {
                headers = context.requestHeader;
                return { processes: [] };
            },
        }),
    });
    const server = createServer((request, response) => {
        request.url = request.url.replace(/^\/v1\/runtimes\/rt_test/, "");
        adapter(request, response);
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    t.after(() => server.close());
    const address = server.address();
    const client = new PlanirClient({
        baseUrl: `http://127.0.0.1:${address.port}`,
        token: "test-token",
        headers: { "x-planir-test": () => { throw new Error("overridden supplier ran"); } },
    });

    await client.runtimes.runtime("rt_test").commands.list({}, { headers: { "x-planir-test": "request" } });

    assert.equal(headers.get("authorization"), "Bearer test-token");
    assert.equal(headers.get("x-planir-test"), "request");
});

test("Process requests inherit the configured client timeout", async (t) => {
    const adapter = connectNodeAdapter({
        routes: (router) => router.service(Process, {
            async list() {
                await new Promise((resolve) => setTimeout(resolve, 100));
                return { processes: [] };
            },
        }),
    });
    const server = createServer((request, response) => {
        request.url = request.url.replace(/^\/v1\/runtimes\/rt_test/, "");
        adapter(request, response);
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    t.after(() => server.close());
    const address = server.address();
    const commands = new PlanirClient({
        baseUrl: `http://127.0.0.1:${address.port}`,
        token: "test",
        timeoutInSeconds: 0.01,
    }).runtimes.runtime("rt_test").commands;

    await assert.rejects(commands.list({}), (error) => error.code === Code.DeadlineExceeded);
});

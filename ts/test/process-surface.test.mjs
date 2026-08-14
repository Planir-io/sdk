import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";

import { Code } from "@connectrpc/connect";
import { connectNodeAdapter } from "@connectrpc/connect-node";
import { PlanirClient } from "../dist/index.js";
import { Process } from "../dist/process/gen/planir/runtime/v1/process_pb.js";

test("the package root exposes facade errors, not the raw Process plane", async () => {
    const sdk = await import("../dist/index.js");

    assert.equal(typeof sdk.CommandExitError, "function");
    assert.equal(typeof sdk.PtyExitError, "function");
    assert.equal("ProcessPlane" in sdk, false);
    assert.equal("Process" in sdk, false);
});

test("a runtime handle exposes commands and pty", () => {
    const runtime = new PlanirClient({ token: "test" }).runtimes.runtime("rt_test");
    for (const method of ["run", "start", "connect", "list"]) {
        assert.equal(typeof runtime.commands[method], "function");
    }
    for (const method of ["create", "connect"]) assert.equal(typeof runtime.pty[method], "function");
});

test("dot-only runtime IDs are rejected", () => {
    const runtimes = new PlanirClient({ token: "test" }).runtimes;
    for (const runtimeId of [".", ".."]) {
        assert.throws(() => runtimes.runtime(runtimeId), /dot path segment/);
    }
});

test("Process requests include configured authentication and headers", async (t) => {
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
        headers: { "x-planir-test": "configured" },
    });

    await client.runtimes.runtime("rt_test").commands.list();

    assert.equal(headers.get("authorization"), "Bearer test-token");
    assert.equal(headers.get("x-planir-test"), "configured");
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

    await assert.rejects(commands.list(), (error) => error.code === Code.DeadlineExceeded);
});

test("custom REST fetch requires explicit Process transport options", () => {
    const client = new PlanirClient({ token: "test", fetch: async () => new Response() });

    assert.throws(
        () => client.runtimes.runtime("rt_test"),
        /processTransportOptions/,
    );
});

test("explicit Process transport options are applied", async (t) => {
    let contentType;
    const adapter = connectNodeAdapter({
        routes: (router) => router.service(Process, {
            list(_request, context) {
                contentType = context.requestHeader.get("content-type");
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
        fetch: async () => { throw new Error("REST fetch must not serve Process calls"); },
        processTransportOptions: { useBinaryFormat: false },
    }).runtimes.runtime("rt_test").commands;

    await commands.list();

    assert.match(contentType, /json/);
});

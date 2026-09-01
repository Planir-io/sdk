import assert from "node:assert/strict";
import test from "node:test";

import { PlanirClient } from "../dist/index.js";

const RUNTIME_ID = "01900000-0000-7000-8000-000000000001";

test("the runtime-url subpath derives canonical public URLs", async () => {
    const { runtimeUrl } = await import("planir/runtime-url");

    assert.equal(runtimeUrl(RUNTIME_ID, 1), `https://1-${RUNTIME_ID}.planir.dev`);
    assert.equal(runtimeUrl(RUNTIME_ID, 3000), `https://3000-${RUNTIME_ID}.planir.dev`);
    assert.equal(runtimeUrl(RUNTIME_ID, 65535), `https://65535-${RUNTIME_ID}.planir.dev`);
});

test("runtimeUrl rejects noncanonical runtime IDs and invalid ports", async () => {
    const { runtimeUrl } = await import("planir/runtime-url");

    for (const runtimeId of ["not-a-uuid", "01900000-0000-7000-8000-00000000000A", `${RUNTIME_ID}0`]) {
        assert.throws(() => runtimeUrl(runtimeId, 3000), /runtimeId/);
    }
    for (const port of [0, 62000, 65536, 1.5, Number.NaN, Number.POSITIVE_INFINITY, "3000"]) {
        assert.throws(() => runtimeUrl(RUNTIME_ID, port), /port/);
    }
});

test("the generated client exposes neither the deleted reach operation nor a root helper alias", async () => {
    const sdk = await import("../dist/index.js");
    const runtimes = new PlanirClient({ token: "test" }).runtimes;

    assert.equal("reach" in runtimes, false);
    assert.equal("runtimeUrl" in sdk, false);
});

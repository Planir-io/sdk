import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";

import { requestWithRetries } from "../dist/core/fetcher/requestWithRetries.js";

const cases = [
    { name: "zero general quota", policy: '"general";q=0;w=60', terminal: true },
    { name: "zero creation quota after a positive general quota", policy: '"general";q=5;w=60, "creations";q=0;w=60', terminal: true },
    { name: "zero lifecycle quota", policy: '"general";q=5;w=60, "lifecycle";q=0;w=60', terminal: true },
    { name: "finite quota with Retry-After", policy: '"general";q=10;w=60', retryAfter: "1", terminal: false },
    { name: "finite quota without Retry-After", policy: '"general";q=10;w=60', terminal: false },
    { name: "429 without a Planir policy", terminal: false },
];

for (const scenario of cases) {
    test(`${scenario.name}: ${scenario.terminal ? "returns the refusal without retrying" : "retries and returns success"}`, async (t) => {
        let requests = 0;
        const server = createServer((_request, response) => {
            requests++;
            const limited = scenario.terminal || requests === 1;
            const headers = { "Content-Type": "application/json" };
            if (scenario.policy) headers["RateLimit-Policy"] = scenario.policy;
            if (scenario.retryAfter) headers["Retry-After"] = scenario.retryAfter;
            response.writeHead(limited ? 429 : 200, headers);
            response.end(JSON.stringify(limited ? { error: { code: "RATE_LIMITED" } } : { ok: true }));
        });
        await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
        t.after(() => new Promise((resolve) => server.close(resolve)));

        const response = await requestWithRetries(() => fetch(`http://127.0.0.1:${server.address().port}/`));

        assert.equal(requests, scenario.terminal ? 1 : 2);
        assert.equal(response.status, scenario.terminal ? 429 : 200);
        assert.deepEqual(await response.json(), scenario.terminal ? { error: { code: "RATE_LIMITED" } } : { ok: true });
    });
}

# planir

Official TypeScript/JavaScript SDK for [planir.io](https://planir.io) — hosted,
hardware-isolated microVM runtimes with a stable public URL per runtime.

Requires Node.js 20 or newer.

## Install

```sh
npm install planir
```

## Usage

```ts
import { PlanirClient } from "planir";

const client = new PlanirClient({ token: process.env.PLANIR_TOKEN });

// List runtimes (auto-paginating)
for await (const runtime of await client.runtimes.list()) {
  console.log(runtime.id);
}

// Create a runtime
const runtime = await client.runtimes.create({
  body: { image: "ghcr.io/acme/agent:latest" },
});
console.log(runtime.urls);
```

The client defaults to `https://api.planir.io`; pass `baseUrl` to point elsewhere
(e.g. a mock server in tests). `client.runtimes.runtime(runtime.id).commands` and
`.pty` expose the generated streaming Process client. Commands use argv; no shell is
added implicitly.

## License

Apache-2.0

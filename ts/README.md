# planir

Official TypeScript/JavaScript SDK for [planir.io](https://planir.io) — hosted,
hardware-isolated microVM runtimes with a stable public URL per runtime.

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
const runtime = await client.runtimes.create({ image: "ghcr.io/acme/agent:latest" });
console.log(runtime.urls);
```

The client defaults to `https://api.planir.io`; pass `baseUrl` to point elsewhere
(e.g. a mock server in tests). `client.runtimes.exec(...)` runs synchronously; `client.runtimes.execDetached(...)`
returns an exec id you poll with `client.runtimes.getExec(...)`.

## License

Apache-2.0

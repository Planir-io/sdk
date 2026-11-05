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
import { runtimeUrl } from "planir/runtime-url";

const client = new PlanirClient({ token: process.env.PLANIR_TOKEN });

// List runtimes (auto-paginating)
for await (const runtime of await client.runtimes.list()) {
  console.log(runtime.id);
}

// Create a runtime
const runtime = await client.runtimes.create({
  image: "ghcr.io/acme/agent:latest",
});
console.log(runtimeUrl(runtime.id, 3000));
```

Create fields are typed directly on the request; older betas used `body: { ... }`.

## Commands and terminals

```ts
// Run exact argv. Planir does not add a shell.
const box = client.runtimes.runtime(runtime.id);
const result = await box.commands.run(["git", "status", "--short"]);
console.log(result.stdout);

// Keep a process running and control it through one handle.
const command = await box.commands.start(["python", "worker.py"], {
  tag: "worker",
  timeoutMs: 10 * 60_000,
  requestTimeoutMs: 11 * 60_000,
  onStdout: (data) => { process.stdout.write(data); },
});
await command.sendInput("work\n");
await command.closeStdin();
const completed = await command.wait();

// Open a PTY when the program needs a terminal.
const terminal = await box.pty.create(["/bin/sh"], { cols: 120, rows: 30 });
await terminal.sendInput("pwd\n");
await terminal.resize(160, 40);
```

`run()` and `wait()` throw `CommandExitError` or `PtyExitError` on a non-zero
exit; the error's `result` retains the exit code and captured output.

Commands and PTYs have a **60-second execution timeout** by default, including
`commands.start()`. Expiry kills the process. Set `timeoutMs` to a longer duration
in milliseconds, or `0` to disable it. `requestTimeoutMs` separately limits the
HTTP stream; let it outlast the command when waiting for completion. It inherits
the client's `timeoutInSeconds` when omitted. Runtime lifetime (`timeout` on
create, in seconds) is separate.

The client defaults to `https://api.planir.io`; pass `baseUrl` to point elsewhere
(e.g. a mock server in tests). `commands.connect(pidOrTag)` and
`pty.connect(pidOrTag)` reconnect to future output; output produced while disconnected
is not replayed. `disconnect()` closes only the attachment; discard that handle and
call `connect()` again to reattach. Use `capture: false` with
an output callback for long-running streams that must not be buffered in SDK memory.
A custom `fetch` also requires `processTransportOptions`, because Process calls use
the native Connect transport.

## License

Apache-2.0

# planir

Official Python SDK for [planir.io](https://planir.io) — hosted, hardware-isolated
microVM runtimes with a stable public URL per runtime. Sync and async clients.

## Install

```sh
pip install planir
```

## Usage

```python
import os
from planir import PlanirClient

client = PlanirClient(token=os.environ["PLANIR_TOKEN"])

# List runtimes (one page; pass cursor=page.next_cursor for the next one)
page = client.runtimes.list()
for runtime in page.runtimes:
    print(runtime.id)

# Create a runtime
runtime = client.runtimes.create(request={"image": "ghcr.io/acme/agent:latest"})
print(runtime.urls)
```

## Commands and terminals

```python
import sys

# Run exact argv. Planir does not add a shell.
box = client.runtimes.runtime(runtime.id)
result = box.commands.run(["git", "status", "--short"])
print(result.stdout)

# Keep a process running and control it through one handle.
command = box.commands.start(
    ["python", "worker.py"], tag="worker"
)
command.send_input("work\n")
command.close_stdin()
completed = command.wait(on_stdout=sys.stdout.buffer.write)

# Open a PTY when the program needs a terminal.
terminal = box.pty.create(["/bin/sh"], cols=120, rows=30)
terminal.send_input("pwd\n")
terminal.resize(160, 40)
```

The client defaults to `https://api.planir.io`; pass `base_url` to point elsewhere
(e.g. a mock server in tests). An async client is available as `AsyncPlanirClient`.
Its Process methods use the same names and are awaitable. `commands.connect(pid_or_tag)`
and `pty.connect(pid_or_tag)` reconnect to future output; output produced while
disconnected is not replayed. `disconnect()` closes only the attachment. Use
`capture=False` with an output callback for streams that must not be buffered in
SDK memory. Sync callbacks run during `run()` or `wait()`; async callbacks start
with the handle. A custom `httpx_client` also requires `process_http_client`, because
Process calls use Connect's native Pyqwest client.

## License

Apache-2.0

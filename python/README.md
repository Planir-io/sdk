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
runtime = client.runtimes.create(image="ghcr.io/acme/agent:latest")
print(runtime.urls)
```

The client defaults to `https://api.planir.io`; pass `base_url` or `environment` to
override. An async client is available as `AsyncPlanirClient`. `client.runtimes.exec(...)`
runs synchronously; `client.runtimes.exec_detached(...)` returns an exec id you poll with
`client.runtimes.get_exec(...)`.

## License

Apache-2.0

# Reference
## health
<details><summary><code>client.health.<a href="src/planir/health/client.py">check</a>() -> HealthStatus</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.health.check()

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## meta
<details><summary><code>client.meta.<a href="src/planir/meta/client.py">get_version</a>() -> ApiVersionInfo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.meta.get_version()

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## runtimes
<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">list</a>(...) -> RuntimesList</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Pages in creation order via `?limit=` (1–100, default 20) + `?cursor=` (opaque; pass the previous page's `nextCursor` verbatim). Equality-filter on correlation labels with DYNAMIC query params of the form `?metadata.<key>=<value>` (multiple filters AND together). Destroyed runtimes are excluded unless `?includeDestroyed=true`. Returns desired-side handles only — read an individual runtime for its observed state.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.runtimes.list()

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**limit:** `typing.Optional[int]` — Page size, 1–100 (default 20).
    
</dd>
</dl>

<dl>
<dd>

**cursor:** `typing.Optional[str]` — Opaque page cursor — pass the previous page's `nextCursor` verbatim. Omitted = from the start.
    
</dd>
</dl>

<dl>
<dd>

**include_destroyed:** `typing.Optional[ListRuntimesRequestIncludeDestroyed]` — Destroyed runtimes are excluded unless this is `true`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">create</a>(...) -> RuntimeWithObserved</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.runtimes.create(
    image="image",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**image:** `str` — Resolved container image ref the orchestrator pulls. MUST be anonymously pullable: no registry-credential channel exists (private registries are not supported). Echoed back on every Runtime read.
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[str]` — Optional client-supplied idempotency key. Same key + same body within the 24-hour replay window → 200 with the original runtime (not a new create); same key + different body → CONFLICT. Replay is the intended recovery path for a client that loses a runtime id after a 201: re-send the identical create and read the id back. Omitted = no idempotency claim — a retried create makes a second runtime.
    
</dd>
</dl>

<dl>
<dd>

**client_ref:** `typing.Optional[str]` — Opaque client correlation handle. No shared id-space, no FK. Optional — the orchestrator generates one when omitted (echoed on reads).
    
</dd>
</dl>

<dl>
<dd>

**config:** `typing.Optional[str]` — Optional opaque workload config, base64 over the wire (see the config description). Omitted = no config file is mounted at /etc/planir/config.
    
</dd>
</dl>

<dl>
<dd>

**env:** `typing.Optional[typing.Dict[str, str]]` — Optional env vars (default {}). See the EnvMap description.
    
</dd>
</dl>

<dl>
<dd>

**command:** `typing.Optional[typing.List[str]]` — Optional CMD override, Docker semantics (argv array, no shell). Omitted = the image's own CMD. Create-time only — there is no replace verb; recreate to change it.
    
</dd>
</dl>

<dl>
<dd>

**entrypoint:** `typing.Optional[typing.List[str]]` — Optional ENTRYPOINT override, Docker semantics (argv array, no shell). Omitted = the image's own ENTRYPOINT. Create-time only — there is no replace verb.
    
</dd>
</dl>

<dl>
<dd>

**resources:** `typing.Optional[CreateRuntimeRequestResources]` — Optional resource allocation. Omitted = the published defaults: 1 vCPU (cpuMillis 1000), 1 GiB memoryBytes (1073741824), 4 GiB storageBytes (4294967296). Reads always echo the effective (defaults-applied) values.
    
</dd>
</dl>

<dl>
<dd>

**ports:** `typing.Optional[typing.List[int]]` — Exposed ports the orchestrator routes the public handle to, as bare integers (e.g. [8080]). Omitted or [] = no public surface; never inferred from the image. Port numbers must be unique.
    
</dd>
</dl>

<dl>
<dd>

**readiness:** `typing.Optional[CreateRuntimeRequestReadiness]` — Optional explicit HTTP readiness gate — `observed: running` then means this path answered. Omitted = a TCP probe on the FIRST declared port (or, with no declared ports, running = the container started). Exactly ONE probe ever. Create-time only — there is no replace verb.
    
</dd>
</dl>

<dl>
<dd>

**network:** `typing.Optional[CreateRuntimeRequestNetwork]` — Optional egress posture (see NetworkSpec). Omitted = open egress minus the standing SSRF/private deny. Replaceable later via PUT /network (applies live, no restart).
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `typing.Optional[typing.Dict[str, str]]` — Optional correlation labels (default {}). See the metadata description.
    
</dd>
</dl>

<dl>
<dd>

**rootfs_read_only:** `typing.Optional[bool]` — Hardening knob, default false. false (default): the rootfs is writable — a standard machine; writes land in the ephemeral scratch budget. true: the rootfs is the image verbatim, read-only, with writable /tmp and /run scratch mounts (funded by the same budget); anything durable belongs on `/data`.
    
</dd>
</dl>

<dl>
<dd>

**desired_state:** `typing.Optional[CreateRuntimeRequestDesiredState]` — Initial desired state (default running). Cannot create destroyed.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">get</a>(...) -> RuntimeWithObserved</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.runtimes.get(
    id="id",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">destroy</a>(...) -> Runtime</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.runtimes.destroy(
    id="id",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">start</a>(...) -> Runtime</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.runtimes.start(
    id="id",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">stop</a>(...) -> Runtime</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.runtimes.stop(
    id="id",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">restart</a>(...) -> Runtime</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.runtimes.restart(
    id="id",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">exec</a>(...) -> ExecResult</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Synchronous: a 30-second wall-clock deadline and 1 MiB captured per stream (stdout/stderr each truncate with a marker); size client timeouts above 30 s. Longer commands: use POST /v1/runtimes/{id}/exec/detached, which has no sync deadline (30-minute ceiling) and is polled via GET /v1/runtimes/{id}/exec/{execId}.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.runtimes.exec(
    id="id",
    command=[
        "command"
    ],
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `ExecRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">exec_detached</a>(...) -> ExecId</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns 202 {execId} immediately; the command runs without the 30-second sync deadline (bounded by a generous 30-minute ceiling instead). Poll GET /v1/runtimes/{id}/exec/{execId} for status and captured output. Same capture limits as the synchronous verb (1 MiB per stream, truncated with a marker).
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.runtimes.exec_detached(
    id="id",
    command=[
        "command"
    ],
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `ExecRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">get_exec</a>(...) -> DetachedExec</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Results are retained BRIEFLY after exit (minutes, platform policy), then the execId 404s — read the result promptly and store what you need. An engine restart also loses in-flight detached execs (the command dies with its stream); a 404 on an execId you were polling means exactly that.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.runtimes.get_exec(
    id="id",
    exec_id="execId",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**exec_id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">update_config</a>(...) -> Runtime</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.runtimes.update_config(
    id="id",
    config="config",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**config:** `str` — Opaque workload config, base64 over the wire. Never parsed. Max 1 MiB encoded. Delivery: the DECODED bytes are mounted read-only at `/etc/planir/config` inside the workload — no env-var channel exists. Handling: held server-side solely for delivery; never parsed, logged, or echoed in error bodies. Replacing config rolls the workload only when the bytes actually change (content checksum); a byte-identical replace does not restart it.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">update_env</a>(...) -> Runtime</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.runtimes.update_env(
    id="id",
    env={
        "key": "value"
    },
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**env:** `typing.Dict[str, str]` — Plain environment variables delivered to the workload process. Keys match [A-Za-z_][A-Za-z0-9_]*; the JSON-encoded map is capped at 128 KiB. Replacing env rolls the workload only when the map actually changes; a byte-identical replace does not restart it. Echoed on reads; never logged or echoed in error bodies.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">update_network</a>(...) -> Runtime</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient, NetworkSpec
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.runtimes.update_network(
    id="id",
    network=NetworkSpec(),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**network:** `NetworkSpec` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">reach</a>(...) -> Reach</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.runtimes.reach(
    id="id",
    port=1,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**port:** `int` — The internal port to resolve. The caller always names it.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">get_logs</a>(...) -> str</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Server-side bounds: the last 1000 lines, capped at 1 MiB — a tail, not an archive; ship logs from inside the workload for retention. `?previous=true` reads the PRIOR container's tail after a crash — pair with `observed.lastExit` to debug a crash loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.runtimes.get_logs(
    id="id",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**previous:** `typing.Optional[GetLogsRuntimesRequestPrevious]` — `true` reads the PRIOR container's tail after a crash/restart — the dying breath a crash-looping workload never shows in its live logs.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">get_usage</a>(...) -> UsageList</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.runtimes.get_usage(
    id="id",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**from:** `typing.Optional[datetime.datetime]` — Inclusive lower bound (ISO-8601). Must precede `to`.
    
</dd>
</dl>

<dl>
<dd>

**to:** `typing.Optional[datetime.datetime]` — Exclusive upper bound (ISO-8601).
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">get_events</a>(...) -> EventsList</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from planir import PlanirClient
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.runtimes.get_events(
    id="id",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**cursor:** `typing.Optional[int]` — Return only events whose cursor is strictly greater than this value.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>


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

**include_destroyed:** `typing.Optional[ListRuntimesRequestIncludeDestroyed]` — Destroyed runtimes are excluded unless this is `true`. Ignored when an explicit `desiredState` filter is present (that filter fully determines state visibility).
    
</dd>
</dl>

<dl>
<dd>

**desired_state:** `typing.Optional[typing.Union[ListRuntimesRequestDesiredStateItem, typing.Sequence[ListRuntimesRequestDesiredStateItem]]]` — Repeatable desired-state filter (`running|stopped|destroyed`): OR within the repeated values, AND with the metadata filters. When present it fully determines state visibility — `?desiredState=destroyed` returns destroyed runtimes without `includeDestroyed`. Absent = destroyed excluded unless `includeDestroyed=true`.
    
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

**resources:** `typing.Optional[ResourceSpecInput]` 
    
</dd>
</dl>

<dl>
<dd>

**volume_id:** `typing.Optional[str]` — Attach an EXISTING standalone volume (POST /v1/volumes) at `/data` instead of auto-creating one. The volume defines the storage size — mutually exclusive with `resources.storageBytes` (400 when both are present); mount and ownership semantics are identical. Runtime destroy then DETACHES the volume (back to `available`, data intact) instead of deleting it. The volume must be `available`: attached elsewhere or mid-delete → 409 VOLUME_BUSY; unknown or another team's id → 404. Omitted = an auto-created volume that is deleted with the runtime (the default lifecycle).
    
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

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">list_runtime_execs</a>(...) -> ExecList</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Detached execs only — sync execs are request-scoped and never listed. Records are in-process: retained briefly after exit (minutes, platform policy), then gone; an engine restart also loses them (the command dies with its stream). Scoped to the runtime exactly like the poll endpoint — another runtime's execIds never appear.
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

client.runtimes.list_runtime_execs(
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

Synchronous: `timeoutMs` (default and cap 30 s) bounds output CAPTURE — a deadline cut is a 200 result with `timedOut: true` and the partial streams, never an error, and never stops the process (stop/start the runtime for a runaway). 1 MiB captured per stream (stdout/stderr each truncate with a marker); size client timeouts above 30 s. Longer commands: use POST /v1/runtimes/{id}/exec/detached, polled via GET /v1/runtimes/{id}/exec/{execId}.
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

**command:** `typing.List[str]` — argv — run directly, no shell. Per-exec working directory or env vars ride the canonical wrapper `["sh","-c","cd DIR && KEY=VAL exec CMD"]`, which requires a POSIX shell in the image. Ambient env is runtime-level: PUT /v1/runtimes/{id}/env.
    
</dd>
</dl>

<dl>
<dd>

**stdin:** `typing.Optional[str]` — Text written to the command's standard input, then closed — the process sees EOF after the last byte. UTF-8, at most 256 KiB. Binary stdin is out of scope: deliver binary data via volumes or runtime env instead.
    
</dd>
</dl>

<dl>
<dd>

**timeout_ms:** `typing.Optional[int]` — Capture deadline in milliseconds (1–30000, default 30000 — the edge's connection ceiling). Bounds output CAPTURE, never the process: past the deadline the command may still be running in the runtime; the remedy for a runaway is stop/start. Out-of-bounds values are refused (400), never clamped.
    
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

Returns 202 {execId} immediately; the command runs without the 30-second sync deadline — `timeoutMs` (default and cap 30 min) bounds output CAPTURE; a deadline cut resolves the poll with `timedOut: true` and the partial streams, never an error, and never stops the process. Poll GET /v1/runtimes/{id}/exec/{execId} for status and captured output. Same capture limits as the synchronous verb (1 MiB per stream, truncated with a marker). At most 8 in flight per runtime.
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

**command:** `typing.List[str]` — argv — run directly, no shell. Per-exec working directory or env vars ride the canonical wrapper `["sh","-c","cd DIR && KEY=VAL exec CMD"]`, which requires a POSIX shell in the image. Ambient env is runtime-level: PUT /v1/runtimes/{id}/env.
    
</dd>
</dl>

<dl>
<dd>

**stdin:** `typing.Optional[str]` — Text written to the command's standard input, then closed — the process sees EOF after the last byte. UTF-8, at most 256 KiB. Binary stdin is out of scope: deliver binary data via volumes or runtime env instead.
    
</dd>
</dl>

<dl>
<dd>

**timeout_ms:** `typing.Optional[int]` — Capture deadline in milliseconds (1–1800000, default 1800000 — the engine's capture ceiling). Bounds output CAPTURE, never the process: past the deadline the command may still be running in the runtime; the remedy for a runaway is stop/start. Out-of-bounds values are refused (400), never clamped.
    
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

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">update_runtime_metadata</a>(...) -> Runtime</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Whole-map replace, validated identically to create. Labels are NOT desired state: no `generation` bump, no engine interaction, no restart — the new map is visible immediately on reads and list filters. Allowed in every non-destroyed state.
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

client.runtimes.update_runtime_metadata(
    id="id",
    metadata={
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

**metadata:** `typing.Dict[str, str]` — Free-form correlation labels. Keys match [A-Za-z0-9._-]+ (max 64 chars), values max 256 chars, at most 32 entries. Echoed on reads; filterable on the list endpoint via `?metadata.<key>=<value>`. Never interpreted by the platform.
    
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

## Volumes
<details><summary><code>client.volumes.<a href="src/planir/volumes/client.py">list_volumes</a>() -> VolumesList</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Every volume the team owns, standalone AND runtime-managed (`deleteWithRuntime: true` rows are the auto-created `/data` volumes, named `data-<runtimeId>`) — one storage model, two lifecycles.
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

client.volumes.list_volumes()

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

<details><summary><code>client.volumes.<a href="src/planir/volumes/client.py">create_volume</a>(...) -> Volume</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Provisions the backing storage fully or leaves nothing (create saga) — a 201 means the volume exists and its size is the device-enforced hard cap. Born `available`; attach it by creating a runtime with `volumeId`. Billing accrues provisioned byte-seconds from create to delete, attached or not — so metered admission gates here exactly as on runtime create: a non-positive balance is a 402.
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

client.volumes.create_volume(
    name="name",
    size_bytes=1,
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

**name:** `str` — The human handle, unique within the team (duplicate → 409 CONFLICT). Lowercase DNS-label shape: `[a-z0-9]` with interior hyphens, 1–63 chars. Names beginning `data-` are reserved for runtime-managed `/data` volumes (400).
    
</dd>
</dl>

<dl>
<dd>

**size_bytes:** `int` — Provisioned size in bytes — a hard cap enforced by the device itself (the workload hits plain ENOSPC at the brim; deleting files frees space immediately). Fixed for the volume's life (no resize in v1). Billed as provisioned byte-seconds from create to delete, attached or not.
    
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

<details><summary><code>client.volumes.<a href="src/planir/volumes/client.py">get_volume</a>(...) -> Volume</code></summary>
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

client.volumes.get_volume(
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

<details><summary><code>client.volumes.<a href="src/planir/volumes/client.py">delete_volume</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Removes the backing storage and ends billing at this instant. Only an `available` volume can be deleted: an attached one is held for its runtime's whole life (stopped included) — destroy the runtime first. The data is unrecoverable.
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

client.volumes.delete_volume(
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

## Presets
<details><summary><code>client.presets.<a href="src/planir/presets/client.py">list_presets</a>() -> PresetsList</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Every publicly available preset, plus any private presets negotiated for the caller's own plan. Ordered public-first, then family, then cpu. Prices are integer microcents (1 USD = 100,000,000); a repriced preset never changes a billing month already in progress.
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

client.presets.list_presets()

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

## Team
<details><summary><code>client.team.<a href="src/planir/team/client.py">get_team</a>() -> Team</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

The team the credential belongs to — its identity, package summary, and current ledger balance. No path parameter: a caller can only ever read its own team.
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

client.team.get_team()

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

<details><summary><code>client.team.<a href="src/planir/team/client.py">get_team_usage</a>(...) -> TeamUsage</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Every billing window for the caller's team in one UTC calendar month (`?period=YYYY-MM`, default the current month), plus the month totals. Each window is an invoice line: the accrued quantities and the prices it carries. A malformed period is 400.
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

client.team.get_team_usage()

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

**period:** `typing.Optional[str]` — UTC calendar month `YYYY-MM`. Omitted = the current UTC month.
    
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

<details><summary><code>client.team.<a href="src/planir/team/client.py">get_team_ledger</a>(...) -> TeamLedger</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

The append-only money log for the caller's team, newest first. Pages via `?limit=` (1–100, default 20) + `?cursor=` (opaque; pass the previous page's `nextCursor` verbatim). Each row is signed integer microcents; the balance is their sum.
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

client.team.get_team_ledger()

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

**cursor:** `typing.Optional[str]` — Opaque page cursor — pass the previous page's `nextCursor` verbatim. Omitted = from the newest.
    
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

<details><summary><code>client.team.<a href="src/planir/team/client.py">list_team_keys</a>() -> ApiKeyList</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Every API key the caller's team holds, newest first — active and revoked — as display metadata only (prefix hint, last 4, name, timestamps). Never the plaintext, never the digest.
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

client.team.list_team_keys()

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

<details><summary><code>client.team.<a href="src/planir/team/client.py">mint_team_key</a>(...) -> ApiKeyMint</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a new API key for the caller's own team and returns its plaintext exactly once (the `secret` field). The plaintext is never stored, logged, or retrievable again — the server keeps only a one-way digest. A key may mint sibling keys (same privilege level). Refused with 422 when the team already holds its maximum of active keys; revoke one to free a slot.
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

client.team.mint_team_key()

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

**name:** `typing.Optional[str]` — Optional display name to recognise the key later (1–200 chars).
    
</dd>
</dl>

<dl>
<dd>

**expires_at:** `typing.Optional[datetime.datetime]` — Optional ISO-8601 expiry (GitHub-style hygiene, on request). Omitted = never expires — the machine-credential norm; expiry is never forced (scheduled key death breaks live integrations).
    
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

<details><summary><code>client.team.<a href="src/planir/team/client.py">revoke_team_key</a>(...) -> ApiKey</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Soft-revokes the key (sets `revokedAt`; the row is kept for audit) and returns its updated metadata. The revoked key fails authentication on its next request. Revoking the very credential making the request is allowed — the caller locks itself out while the team's other keys keep working. A key id that is unknown or belongs to another team is a 404, indistinguishable either way.
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

client.team.revoke_team_key(
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

<details><summary><code>client.team.<a href="src/planir/team/client.py">create_team_topup</a>(...) -> Topup</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a Stripe Checkout Session to add prepaid credit to the caller's own team balance and returns the hosted payment URL (`checkoutUrl`) to redirect the payer to. The balance is credited only after Stripe confirms the payment (server-to-server webhook), with the amount Stripe actually charged. Amount is USD integer microcents — a whole number of cents between $1 and $100,000. Responds 503 when the Stripe payment rail is not configured on this deployment.
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

client.team.create_team_topup(
    amount_microcents=1,
    success_url="successUrl",
    cancel_url="cancelUrl",
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

**amount_microcents:** `int` — Credit to add, in USD integer microcents (1 USD = 100,000,000). A whole number of US cents (a multiple of 1,000,000), between $1 (100,000,000) and $100,000 (10,000,000,000,000). The balance is credited with what Stripe actually charges, not this requested value.
    
</dd>
</dl>

<dl>
<dd>

**success_url:** `str` — Absolute URL Stripe returns the payer to after a completed payment.
    
</dd>
</dl>

<dl>
<dd>

**cancel_url:** `str` — Absolute URL Stripe returns the payer to if they abandon the payment.
    
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

<details><summary><code>client.team.<a href="src/planir/team/client.py">list_team_webhooks</a>() -> WebhooksList</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Every webhook endpoint the caller's team holds, newest first — display metadata only (the signing secret never appears on a read; `prefixHint` identifies it).
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

client.team.list_team_webhooks()

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

<details><summary><code>client.team.<a href="src/planir/team/client.py">register_team_webhook</a>(...) -> WebhookMint</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Registers a receiver URL for signed lifecycle event POSTs (at-least-once delivery; deduplicate by the `webhook-id` header / payload `id`). The response carries the signing `secret` exactly once — it is never stored retrievably or shown again. Refused with 422 when the team is at its endpoint cap; delete an endpoint to free a slot.
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

client.team.register_team_webhook(
    url="url",
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

**url:** `str` — The receiver URL. HTTPS is required (HTTP is accepted only on non-production deployments, for local development). The host must resolve to a public address: deliveries to private, link-local, or platform-internal ranges are refused at send time, re-checked on every attempt.
    
</dd>
</dl>

<dl>
<dd>

**event_types:** `typing.Optional[typing.List[WebhookEventType]]` — Event-type filter: deliver only these types. Omitted = all lifecycle types, including types added in the future.
    
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

<details><summary><code>client.team.<a href="src/planir/team/client.py">delete_team_webhook</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Removes the endpoint and its delivery log; in-flight and pending deliveries stop. An endpoint id that is unknown or belongs to another team is a 404, indistinguishable either way.
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

client.team.delete_team_webhook(
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

<details><summary><code>client.team.<a href="src/planir/team/client.py">rotate_team_webhook_secret</a>(...) -> WebhookMint</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Mints a replacement signing secret (returned exactly once, like registration). The previous secret keeps verifying for a 24-hour overlap, during which every delivery's `webhook-signature` header carries BOTH signatures space-delimited (the Standard Webhooks rotation mechanism) — roll the consumer at leisure, zero dropped verifications. After the overlap the old secret verifies nothing.
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

client.team.rotate_team_webhook_secret(
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

<details><summary><code>client.team.<a href="src/planir/team/client.py">enable_team_webhook</a>(...) -> WebhookEndpoint</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

The explicit recovery verb after an auto-disable (sustained delivery failure): flips `enabled` back on and resets the failure clock; parked pending deliveries resume. Idempotent on an already-enabled endpoint.
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

client.team.enable_team_webhook(
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

<details><summary><code>client.team.<a href="src/planir/team/client.py">list_team_webhook_deliveries</a>(...) -> WebhookDeliveriesList</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

The diagnostics lane behind one endpoint: each row is one (event, endpoint) delivery with its attempt state, schedule, and last outcome, newest first. Retention is bounded (settled rows are pruned after ~30 days) — the runtime event log is the durable record.
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

client.team.list_team_webhook_deliveries(
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

**limit:** `typing.Optional[int]` — Rows returned (newest first). Default 50, max 200.
    
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

<details><summary><code>client.team.<a href="src/planir/team/client.py">redeliver_team_webhook_delivery</a>(...) -> WebhookDelivery</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Resets the delivery to `pending` with a fresh retry schedule — the next dispatcher tick sends it. The replay carries the ORIGINAL event id (`webhook-id` header and payload `id` are unchanged), so consumer-side dedup by event id treats it as the same event. Works on any state, including `exhausted`.
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

client.team.redeliver_team_webhook_delivery(
    id="id",
    delivery_id="deliveryId",
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

**delivery_id:** `str` 
    
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


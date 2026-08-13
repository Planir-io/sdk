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

Pages in creation order via `?limit=` (1–100, default 20) + `?cursor=` (opaque; pass the previous page's `nextCursor` verbatim). Equality-filter on correlation labels with DYNAMIC query params of the form `?metadata.<key>=<value>` (multiple filters AND together), and on the home location with `?region=` (the `region` each response echoes). Destroyed runtimes are excluded unless `?includeDestroyed=true`. Returns desired-side handles only — read an individual runtime for its observed state.
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

**region:** `typing.Optional[str]` — Equality filter on the home location — the `region` every response echoes (ANDs with the other filters). A value no runtime carries returns an empty page, never an error (discovery: GET /v1/regions).
    
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
    request={"key": "value"},
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

**request:** `CreateRuntimeRequest` 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[str]` — Optional client-supplied idempotency key. Same key + same body within the 24-hour replay window → 200 with the original runtime (not a new create); same key + different body → CONFLICT. Replay is the intended recovery path for a client that loses a runtime id after a 201: re-send the identical create and read the id back. Omitted = no idempotency claim — a retried create makes a second runtime.
    
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

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">set_runtime_timeout</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Every positive success reanchors the deadline from the post-lock instant; retrying a positive request moves the deadline.
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
from planir import PlanirClient, SetRuntimeTimeoutRequestZero
from planir.environment import PlanirClientEnvironment

client = PlanirClient(
    token="<token>",
    environment=PlanirClientEnvironment.DEFAULT,
)

client.runtimes.set_runtime_timeout(
    id="id",
    request=SetRuntimeTimeoutRequestZero(
        timeout=1,
    ),
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

**request:** `SetRuntimeTimeoutRequest` 
    
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Boots the newest durable committed rootfs, else the original image — a fresh process, not a resume: a runtime parked a long time wakes with expired tokens and dead TLS sessions, exactly as a rebooted machine would. Warm where it last ran, colder elsewhere (the latency class).
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Ends the process: in-memory state, open connections, and sessions are gone — `start` is a fresh boot, never a resume. The rootfs is preserved by default (`preserveRootfs`) and start boots it back; everything outside `/data` survives via the committed image. Quiesce is a TERM→KILL ladder — flush in-flight buffers on SIGTERM. Returns immediately; the runtime shows `stopping` until the commit is durable, then `stopped`.
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

A bounce, never a commit: the workload is recreated with the same image selection as `start` and desired state is unchanged, so rootfs changes since the last commit are lost — `stop` is the lever that preserves them. `/data` is intact.
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

<details><summary><code>client.runtimes.<a href="src/planir/runtimes/client.py">rotate_runtime_key</a>(...) -> ApiKey</code></summary>
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

client.runtimes.rotate_runtime_key(
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

**config:** `str` — Opaque workload config, base64 over the wire. Never parsed. Max 1 MiB encoded. Delivery: the DECODED bytes are mounted read-only at `/etc/planir/config` inside the workload — no env-var channel exists. Handling: held server-side solely for delivery; never parsed, logged, or echoed in error bodies. Replacing config rolls the workload only when the decoded bytes change; a byte-identical replace does not restart it.
    
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

Starts backing-storage provisioning — a 201 returns the volume in `creating`; it becomes `available` after the backing storage binds. Attach it by creating a runtime with `volumeId` once available. The volume is homed for a required preset `family` at create (optional `region`, the same choice runtime create takes; the response echoes it) and stays there for life — a runtime attaching it is placed there. Billing accrues provisioned byte-seconds from `provisionedAt` to accepted deletion, attached or not — so metered admission gates here exactly as on runtime create: a non-positive balance is a 402. Durability: every live volume is backed up daily to off-site object storage — 7-day retention. Backups are crash-consistent disaster-recovery copies: a restore point is normally under 24 hours old and never silently older than 26 hours — past that the platform raises an alarm. Keep your own backups of critical data. A live volume restore is on request today and arrives as a NEW volume (self-serve restore is planned). Volumes are not live-replicated.
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
    family="co",
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

**size_bytes:** `int` — Provisioned size in bytes — a hard cap enforced by the device itself (the workload hits plain ENOSPC at the brim; deleting files frees space immediately). Fixed for the volume's life (no resize in v1). Billed as provisioned byte-seconds from `provisionedAt` to accepted deletion, attached or not. Durability: every live volume is backed up daily to off-site object storage — 7-day retention. Backups are crash-consistent disaster-recovery copies: a restore point is normally under 24 hours old and never silently older than 26 hours — past that the platform raises an alarm. Keep your own backups of critical data. A live volume restore is on request today and arrives as a NEW volume (self-serve restore is planned). Volumes are not live-replicated.
    
</dd>
</dl>

<dl>
<dd>

**family:** `CreateVolumeRequestFamily` — The preset family whose runtimes will use this volume. Required placement intent: the selected home must offer this family in the requested/default location. Discover families and live availability via GET /v1/regions.
    
</dd>
</dl>

<dl>
<dd>

**region:** `typing.Optional[str]` — The location to home the volume in — the same choice runtime create takes. Omitted: the default location. A location that does not offer `family` → 422; one with no capacity right now → 503 (nothing provisioned). See `GET /v1/regions`. The home is fixed for the volume's life: a runtime attaching this volume is placed here (data gravity — the runtime follows the volume, never the reverse).
    
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

Accepts irreversible deletion and ends billing at this instant. A `creating` or `available` volume can be deleted; an attached one is held for its runtime's whole life (stopped included) — destroy the runtime first. The volume and its backups cannot be recovered. Physical cleanup continues internally; no fixed completion deadline is promised.
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

## RegistryCredentials
<details><summary><code>client.registry_credentials.<a href="src/planir/registry_credentials/client.py">list_registry_credentials</a>() -> RegistryCredentialsList</code></summary>
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

client.registry_credentials.list_registry_credentials()

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

<details><summary><code>client.registry_credentials.<a href="src/planir/registry_credentials/client.py">create_registry_credential</a>(...) -> RegistryCredential</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

From now on, EVERY pull from this host on the team authenticates with it — auto-matched by image host, public images included, no anonymous fallback while it exists (delete restores anonymous pulls). Existing runtimes self-heal: a runtime wedged on `ImagePullBackOff` retries onto the new credential within its backoff cycle, no verbs needed. Static basic-auth registries only (Docker Hub, GHCR, GitLab, quay, GAR `_json_key`, ACR service principal); ECR is NOT supported — its 12-hour tokens need token-refresh machinery this platform does not run yet.
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

client.registry_credentials.create_registry_credential(
    host="host",
    username="username",
    password="password",
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

**host:** `str` — The registry host this credential authenticates, e.g. `ghcr.io`, `docker.io`, `myregistry.example:8443`. Normalized on write (lowercased, scheme stripped, Docker Hub aliases folded to `docker.io`); a path (`ghcr.io/org`) is refused — credentials are host-scoped. At most ONE credential per host: it is used for EVERY pull from that host, public images included (no anonymous fallback while it exists), so a wrong credential blocks that whole host until rotated or deleted.
    
</dd>
</dl>

<dl>
<dd>

**username:** `str` — Registry username — provider-specific (`_json_key` for GAR, `org+robot` for quay).
    
</dd>
</dl>

<dl>
<dd>

**password:** `str` — Registry password / token (write-only — no read ever returns it). Use a scoped, long-lived pull secret: Docker Hub PAT, GHCR PAT (`read:packages`), GitLab deploy token, quay robot token, GAR service-account JSON, ACR service-principal password.
    
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

<details><summary><code>client.registry_credentials.<a href="src/planir/registry_credentials/client.py">get_registry_credential</a>(...) -> RegistryCredential</code></summary>
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

client.registry_credentials.get_registry_credential(
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

<details><summary><code>client.registry_credentials.<a href="src/planir/registry_credentials/client.py">rotate_registry_credential</a>(...) -> RegistryCredential</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Running runtimes are untouched — pulls read credentials at pull time, so the next pull simply uses the new secret. The host cannot change: it is the credential's identity (one per host) — re-pointing to a different registry is delete + create. A WRONG rotation blocks every pull from this host (public images included) until fixed — visible as the runtime's `observed` waiting reason.
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

client.registry_credentials.rotate_registry_credential(
    id="id",
    username="username",
    password="password",
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

**username:** `str` — The replacement username (may be unchanged).
    
</dd>
</dl>

<dl>
<dd>

**password:** `str` — The replacement password / token (write-only). Running runtimes are untouched; the next pull uses it.
    
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

<details><summary><code>client.registry_credentials.<a href="src/planir/registry_credentials/client.py">delete_registry_credential</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Nothing references a credential (binding is by host match), so delete never 409s. Deletion takes effect asynchronously and running containers continue. After deletion takes effect, the next pull authenticates normally: anonymous access resumes for public images, while private images fail visibly without another valid credential. Cached content does not bypass authentication.
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

client.registry_credentials.delete_registry_credential(
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

## Regions
<details><summary><code>client.regions.<a href="src/planir/regions/client.py">list_regions</a>() -> RegionsList</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Every location on offer, with per-family `available` derived live — the picker's "can I order here now" truth. `region` values are plain strings (e.g. "brq"), never an enum: new locations appear additively; send one as `region` on create. `available` means an unpinned create using the family's smallest preset can be placed now, so a larger preset's create may still refuse 503 at the capacity margin. Unavailable means full, draining, or not ready — a create naming that location refuses 503 until it flips (re-read rather than remember; no pagination, the list is a menu).
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

client.regions.list_regions()

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

<details><summary><code>client.team.<a href="src/planir/team/client.py">patch_team</a>(...) -> Team</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

The team's self-service settings — today just `defaultRegion`, the saved location consulted when a create names no `region`. An absent field is left unchanged; `defaultRegion: null` clears it. Future creates only: changing the default never moves an existing runtime or volume, and an explicit per-call `region` always beats it.
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

client.team.patch_team()

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

**default_region:** `typing.Optional[str]` — The saved default location, consulted when a create names no `region`. Must be a location the catalog offers (see `GET /v1/regions`; anything else is 422). `null` clears it. Future creates only: changing it never moves an existing runtime or volume, and an explicit per-call `region` always beats it.
    
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


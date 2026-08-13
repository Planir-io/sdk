# Planir SDKs

Official SDKs for [planir.io](https://planir.io) — hosted, hardware-isolated microVM
runtimes with a stable public URL per runtime.

| Package | Registry | Source |
| --- | --- | --- |
| [`planir`](ts/) | [npm](https://www.npmjs.com/package/planir) | [`ts/`](ts/) |
| [`planir`](python/) | [PyPI](https://pypi.org/project/planir/) | [`python/`](python/) |

Both clients expose the same surface — class `PlanirClient` — over the public API.

## Generated, not hand-written

The lifecycle/resource clients are generated with [Fern](https://buildwithfern.com) from
[`fern/openapi.json`](fern/openapi.json). The Process clients are generated with
[Buf](https://buf.build) from [`process.proto`](proto/planir/runtime/v1/process.proto).
Do not edit generated code by hand — CI regenerates both surfaces and fails on drift.
To change the SDK surface, edit [`fern/overrides.yml`](fern/overrides.yml) and regenerate:

```sh
./scripts/regen.sh
```

The contract itself is refreshed by the `sync-contract` workflow, which opens a PR with
the spec bump and the regenerated diff together.

## Releases

Versioning and publishing are automated with release-please. Merging a release PR is the
only publish trigger; packages ship to npm and PyPI via OIDC trusted publishing (no
tokens). Prereleases are published under the `beta` channel until the first stable
release.

## License

Apache-2.0

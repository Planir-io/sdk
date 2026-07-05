# Planir SDKs

Official SDKs for [planir.io](https://planir.io) — hosted, hardware-isolated microVM
runtimes with a stable public URL per runtime.

| Package | Registry | Source |
| --- | --- | --- |
| [`planir`](ts/) | [npm](https://www.npmjs.com/package/planir) | [`ts/`](ts/) |
| [`planir`](python/) | [PyPI](https://pypi.org/project/planir/) | [`python/`](python/) |

Both clients expose the same surface — class `PlanirClient` — over the public API.

## Generated, not hand-written

The SDK source under `ts/src` and `python/src/planir` is generated with
[Fern](https://buildwithfern.com) from the published OpenAPI contract, pinned in
[`fern/openapi.json`](fern/openapi.json). Do not edit generated code by hand — a CI
drift gate regenerates from the pinned contract and fails if the committed tree differs.
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

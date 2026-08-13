#!/usr/bin/env bash
# Regenerate SDK source from the pinned OpenAPI and Process contracts.
#
# Single source of truth for generation — used by CI (drift gate + contract sync)
# and locally. Deterministic: the same vendored spec + the same pinned fern config
# produce byte-identical ts/src and python/src/planir, EXCEPT python's
# .fern/metadata.json, which stamps the origin git commit (the drift gate excludes it).
#
# Pins: the fern CLI is pinned here (matches fern/fern.config.json); the TS + Python
# generator Docker images are pinned in fern/generators.yml (3.77.0 / 5.15.2). Never
# use a floating version — a moving generator silently churns the drift gate.
set -euo pipefail

FERN_CLI_VERSION="${FERN_CLI_VERSION:-5.65.0}"
BUF_VERSION="${BUF_VERSION:-1.57.2}"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
stage_root="$(mktemp -d "${TMPDIR:-/tmp}/planir-sdk-regen.XXXXXX")"
trap 'rm -rf "$stage_root"' EXIT
mkdir -p "$stage_root/ts/src" "$stage_root/python/src/planir"
cp -R "$repo_root/fern" "$stage_root/fern"
cd "$stage_root/fern"

# --force: non-interactive overwrite (an interactive prompt would hang CI).
# The fern CLI's own process exit code is authoritative — do NOT grep stdout for
# "Finished", which it prints even when a sibling generator fails.
npx --yes "fern-api@${FERN_CLI_VERSION}" generate --local --force

cd "$repo_root"
rsync -a --delete "$stage_root/ts/src/" ts/src/
rsync -a --delete "$stage_root/python/src/planir/" python/src/planir/
docker run --rm -v "$repo_root:/workspace" -w /workspace "bufbuild/buf:${BUF_VERSION}" lint
docker run --rm -v "$repo_root:/workspace" -w /workspace "bufbuild/buf:${BUF_VERSION}" generate
cp process-overlay/ts/RuntimeHandle.ts ts/src/process/RuntimeHandle.ts
cp process-overlay/python/__init__.py python/src/planir/process/__init__.py
cp process-overlay/python/runtime.py python/src/planir/process/runtime.py
node scripts/apply-process-overlay.mjs

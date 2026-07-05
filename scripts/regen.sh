#!/usr/bin/env bash
# Regenerate the SDK source from the pinned, vendored contract (fern/openapi.json).
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

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root/fern"

# --force: non-interactive overwrite (an interactive prompt would hang CI).
# The fern CLI's own process exit code is authoritative — do NOT grep stdout for
# "Finished", which it prints even when a sibling generator fails.
npx --yes "fern-api@${FERN_CLI_VERSION}" generate --local --force

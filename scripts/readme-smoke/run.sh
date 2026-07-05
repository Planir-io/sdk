#!/usr/bin/env bash
# README smoke gate: EXECUTES both README quickstarts, copy-pasted, against a Prism mock
# of the SAME pinned contract everything else is gated on (fern/openapi.json). No
# hand-written fixtures — a hand-copied contract is a cache with no invalidation. Because
# Prism serves only what the contract defines, a quickstart calling a nonexistent
# endpoint 404s here too.
#
# The ONLY edit applied to each snippet is pointing the client at the mock (baseUrl /
# base_url injection) — asserted below, so a README refactor that breaks the injection
# fails the gate loudly instead of silently skipping execution.
#
# Constraint this imposes on ts/README.md: the quickstart must stay runnable as plain ESM
# JavaScript (no TS-only syntax) — node executes it directly, no transpile step.
set -euo pipefail

PRISM_VERSION="5.15.11"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WORK="$(mktemp -d)"
MOCK_PID=""
trap '[ -n "$MOCK_PID" ] && kill "$MOCK_PID" 2>/dev/null; rm -rf "$WORK"' EXIT

# One surgical edit to the spec Prism serves: drop RuntimesList.nextCursor. Prism emits a
# value for every schema property, so the mock would hand a cursor on EVERY page and the
# TS quickstart's auto-pagination (`for await`) would loop forever by construction.
# Deleting the property makes every list response a last page. Everything else stays
# derived from the pinned contract — no hand-written fixtures.
jq 'del(.components.schemas.RuntimesList.properties.nextCursor)' \
  "$ROOT/fern/openapi.json" > "$WORK/openapi.mock.json"
cmp -s "$WORK/openapi.mock.json" <(jq . "$ROOT/fern/openapi.json") && { echo "FAIL: nextCursor deletion matched nothing — RuntimesList schema changed shape"; exit 1; }

npx --yes "@stoplight/prism-cli@${PRISM_VERSION}" mock "$WORK/openapi.mock.json" -p 8787 &
MOCK_PID=$!
export PLANIR_BASE_URL="http://127.0.0.1:8787"
export PLANIR_TOKEN="readme-smoke-dummy"
for _ in $(seq 1 300); do
  curl -s -o /dev/null -H "Authorization: Bearer $PLANIR_TOKEN" "$PLANIR_BASE_URL/v1/runtimes" && break
  sleep 0.2
done
curl -sf -o /dev/null -H "Authorization: Bearer $PLANIR_TOKEN" "$PLANIR_BASE_URL/v1/runtimes" # fail hard if the mock never came up

extract() { # extract(readme, fence) -> first fenced code block
  awk -v fence="$2" '$0 == "```" fence {f=1; next} /^```$/ {if (f) exit} f' "$1"
}

echo "=== ts/README.md quickstart ==="
mkdir -p "$WORK/js"
extract "$ROOT/ts/README.md" ts > "$WORK/js/snippet.mjs"
[ -s "$WORK/js/snippet.mjs" ] || { echo "FAIL: no \`\`\`ts block found in ts/README.md"; exit 1; }
sed -i.orig 's/new PlanirClient({ /new PlanirClient({ baseUrl: process.env.PLANIR_BASE_URL, /' "$WORK/js/snippet.mjs"
cmp -s "$WORK/js/snippet.mjs" "$WORK/js/snippet.mjs.orig" && { echo "FAIL: baseUrl injection matched nothing — README constructor changed shape"; exit 1; }
(cd "$ROOT/ts" && npm install --no-audit --no-fund && npm run build) >/dev/null
(cd "$WORK/js" && npm init -y >/dev/null && npm install --no-audit --no-fund "$ROOT/ts" >/dev/null && node snippet.mjs)

echo "=== python/README.md quickstart ==="
extract "$ROOT/python/README.md" python > "$WORK/snippet.py"
[ -s "$WORK/snippet.py" ] || { echo "FAIL: no \`\`\`python block found in python/README.md"; exit 1; }
sed -i.orig 's/PlanirClient(token=/PlanirClient(base_url=os.environ["PLANIR_BASE_URL"], token=/' "$WORK/snippet.py"
cmp -s "$WORK/snippet.py" "$WORK/snippet.py.orig" && { echo "FAIL: base_url injection matched nothing — README constructor changed shape"; exit 1; }
python3 -m venv "$WORK/venv"
"$WORK/venv/bin/pip" install --quiet "$ROOT/python"
"$WORK/venv/bin/python" "$WORK/snippet.py"

echo "README smoke: BOTH QUICKSTARTS EXECUTED OK"

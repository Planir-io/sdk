#!/usr/bin/env bash
# README smoke gate: EXECUTES both README quickstarts, copy-pasted, against a stub server
# serving sanitized real-wire fixtures. A quickstart that doesn't run is a rejected change.
#
# The ONLY edit applied to each snippet is pointing the client at the stub (baseUrl /
# base_url injection) — asserted below, so a README refactor that breaks the injection
# fails the gate loudly instead of silently skipping execution.
#
# Constraint this imposes on ts/README.md: the quickstart must stay runnable as plain ESM
# JavaScript (no TS-only syntax) — node executes it directly, no transpile step.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WORK="$(mktemp -d)"
STUB_PID=""
trap '[ -n "$STUB_PID" ] && kill "$STUB_PID" 2>/dev/null; rm -rf "$WORK"' EXIT

node "$ROOT/scripts/readme-smoke/stub-server.mjs" &
STUB_PID=$!
export PLANIR_BASE_URL="http://127.0.0.1:8787"
export PLANIR_TOKEN="readme-smoke-dummy"
for _ in $(seq 1 50); do
  curl -sf "$PLANIR_BASE_URL/healthz" >/dev/null 2>&1 && break
  sleep 0.1
done
curl -sf "$PLANIR_BASE_URL/healthz" >/dev/null # fail hard if the stub never came up

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

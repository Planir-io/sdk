// Canned-response stub for the README smoke gate. Serves sanitized captures of REAL
// api.planir.io wire responses (fixture-*.json) so the quickstarts execute end to end
// without credentials. Deliberately tiny: only the routes the quickstarts touch.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const dir = new URL(".", import.meta.url);
const runtime = readFileSync(new URL("fixture-runtime.json", dir));
const runtimesList = readFileSync(new URL("fixture-runtimes-list.json", dir));

createServer((req, res) => {
  const { pathname } = new URL(req.url, "http://stub");
  const send = (status, body) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(body);
  };
  if (req.method === "GET" && pathname === "/healthz") return send(200, "{}");
  if (req.method === "GET" && pathname === "/v1/runtimes") return send(200, runtimesList);
  if (req.method === "POST" && pathname === "/v1/runtimes") {
    req.resume(); // drain the create body
    return req.on("end", () => send(201, runtime));
  }
  send(404, JSON.stringify({ error: { code: "NOT_FOUND", message: `readme-smoke stub: unhandled ${req.method} ${pathname}` } }));
}).listen(8787, "127.0.0.1", () => console.log("readme-smoke stub listening on 127.0.0.1:8787"));

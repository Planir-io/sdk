import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

async function replaceOnce(path, before, after) {
    const absolute = resolve(root, path);
    const source = await readFile(absolute, "utf8");
    if (!source.includes(before)) throw new Error(`Process overlay anchor missing: ${path}`);
    if (source.indexOf(before) !== source.lastIndexOf(before)) throw new Error(`Process overlay anchor repeated: ${path}`);
    await writeFile(absolute, source.replace(before, after));
}

async function replaceWithin(path, start, end, before, after) {
    const absolute = resolve(root, path);
    const source = await readFile(absolute, "utf8");
    const startIndex = source.indexOf(start);
    if (startIndex === -1 || source.indexOf(start, startIndex + 1) !== -1) throw new Error(`Process overlay region start invalid: ${path}`);
    const endIndex = source.indexOf(end, startIndex + start.length);
    if (endIndex === -1) throw new Error(`Process overlay region end missing: ${path}`);
    const region = source.slice(startIndex, endIndex);
    if (!region.includes(before) || region.indexOf(before) !== region.lastIndexOf(before)) throw new Error(`Process overlay region anchor invalid: ${path}`);
    const updated = region.replace(before, after);
    await writeFile(absolute, source.slice(0, startIndex) + updated + source.slice(endIndex));
}

async function replaceExactCount(path, before, after, expectedCount) {
    const absolute = resolve(root, path);
    const source = await readFile(absolute, "utf8");
    const count = source.split(before).length - 1;
    if (count !== expectedCount) {
        throw new Error(`Process overlay expected ${expectedCount} anchors, found ${count}: ${path}`);
    }
    await writeFile(absolute, source.split(before).join(after));
}

async function normalizeGenerated(path) {
    const absolute = resolve(root, path);
    const source = await readFile(absolute, "utf8");
    await writeFile(absolute, `${source.replace(/[ \t]+$/gm, "").trimEnd()}\n`);
}

await replaceOnce(
    "ts/src/api/resources/runtimes/client/Client.ts",
    'import * as PlanirApi from "../../../index.js";\n',
    'import * as PlanirApi from "../../../index.js";\nimport { RuntimeHandle } from "../../../../process/RuntimeHandle.js";\n',
);
await replaceOnce(
    "ts/src/api/resources/runtimes/client/Client.ts",
    "    constructor(options: RuntimesClient.Options = {}) {\n        this._options = normalizeClientOptionsWithAuth(options);\n    }\n",
    "    constructor(options: RuntimesClient.Options = {}) {\n        this._options = normalizeClientOptionsWithAuth(options);\n    }\n\n    public runtime(id: string): RuntimeHandle {\n        return new RuntimeHandle(this._options, id);\n    }\n",
);
await replaceOnce(
    "ts/src/index.ts",
    'export { PlanirClient } from "./Client.js";\n',
    'export { PlanirClient } from "./Client.js";\nexport * from "./process/RuntimeHandle.js";\n',
);
await replaceOnce(
    "ts/src/BaseClient.ts",
    'import type * as environments from "./environments.js";\n',
    'import type * as environments from "./environments.js";\nimport type { ConnectTransportOptions } from "@connectrpc/connect-node";\n',
);
await replaceOnce(
    "ts/src/BaseClient.ts",
    "    fetch?: typeof fetch;\n",
    '    fetch?: typeof fetch;\n    /** Native Connect transport options for Process calls. Required when fetch is customized. */\n    processTransportOptions?: ProcessTransportOptions;\n',
);
await replaceOnce(
    "ts/src/BaseClient.ts",
    "    | BearerAuthProvider.AuthOptions;\n",
    '    | BearerAuthProvider.AuthOptions;\n\nexport type ProcessTransportOptions = Omit<\n    Extract<ConnectTransportOptions, { httpVersion: "1.1" }>,\n    "baseUrl" | "httpVersion" | "interceptors" | "defaultTimeoutMs"\n>;\n',
);
await replaceOnce(
    "python/src/planir/runtimes/client.py",
    "from .types.list_runtimes_request_include_destroyed import ListRuntimesRequestIncludeDestroyed\n",
    "from .types.list_runtimes_request_include_destroyed import ListRuntimesRequestIncludeDestroyed\nfrom ..process.runtime import AsyncRuntimeHandle, RuntimeHandle\n",
);
await replaceOnce(
    "python/src/planir/runtimes/client.py",
    "        self._raw_client = RawRuntimesClient(client_wrapper=client_wrapper)\n",
    "        self._client_wrapper = client_wrapper\n        self._raw_client = RawRuntimesClient(client_wrapper=client_wrapper)\n\n    def runtime(self, runtime_id: str) -> RuntimeHandle:\n        return RuntimeHandle(self._client_wrapper, runtime_id)\n",
);
await replaceOnce(
    "python/src/planir/runtimes/client.py",
    "        self._raw_client = AsyncRawRuntimesClient(client_wrapper=client_wrapper)\n",
    "        self._client_wrapper = client_wrapper\n        self._raw_client = AsyncRawRuntimesClient(client_wrapper=client_wrapper)\n\n    def runtime(self, runtime_id: str) -> AsyncRuntimeHandle:\n        return AsyncRuntimeHandle(self._client_wrapper, runtime_id)\n",
);
await replaceOnce(
    "python/src/planir/runtimes/raw_client.py",
    "from ..types.runtime import Runtime\n",
    "from ..types.runtime import Runtime\nfrom ..types.runtime_create_policy_error import RuntimeCreatePolicyError\n",
);
for (const path of [
    "python/src/planir/team/raw_client.py",
    "python/src/planir/volumes/raw_client.py",
    "python/src/planir/runtimes/raw_client.py",
]) {
    await replaceOnce(
        path,
        "from ..types.invalid_request_error import InvalidRequestError\n",
        "from ..types.invalid_request_error import InvalidRequestError\nfrom ..types.policy_refused_error import PolicyRefusedError\n",
    );
}
const untypedCreatePolicy = "if _response.status_code == 422:\n                raise UnprocessableEntityError(\n                    headers=dict(_response.headers),\n                    body=typing.cast(\n                        typing.Any,\n                        parse_obj_as(\n                            type_=typing.Any,  # type: ignore";
const typedCreatePolicy = "if _response.status_code == 422:\n                raise UnprocessableEntityError(\n                    headers=dict(_response.headers),\n                    body=typing.cast(\n                        RuntimeCreatePolicyError,\n                        parse_obj_as(\n                            type_=RuntimeCreatePolicyError,  # type: ignore";
const typedPolicyRefused = "if _response.status_code == 422:\n                raise UnprocessableEntityError(\n                    headers=dict(_response.headers),\n                    body=typing.cast(\n                        PolicyRefusedError,\n                        parse_obj_as(\n                            type_=PolicyRefusedError,  # type: ignore";
await replaceWithin("python/src/planir/runtimes/raw_client.py", "\n    def create(\n", "\n    def get(\n", untypedCreatePolicy, typedCreatePolicy);
await replaceWithin("python/src/planir/runtimes/raw_client.py", "\n    async def create(\n", "\n    async def get(\n", untypedCreatePolicy, typedCreatePolicy);
await replaceExactCount("python/src/planir/team/raw_client.py", untypedCreatePolicy, typedPolicyRefused, 6);
await replaceExactCount("python/src/planir/volumes/raw_client.py", untypedCreatePolicy, typedPolicyRefused, 2);
await replaceExactCount("python/src/planir/runtimes/raw_client.py", untypedCreatePolicy, typedPolicyRefused, 2);
await replaceOnce(
    "python/src/planir/core/jsonable_encoder.py",
    "from pathlib import PurePath\n",
    "from pathlib import PurePath\nfrom urllib.parse import quote\n",
);
await replaceOnce(
    "python/src/planir/core/jsonable_encoder.py",
    '    if isinstance(obj, bool):\n        return "true" if obj else "false"\n    return str(jsonable_encoder(obj))\n',
    '    if isinstance(obj, bool):\n        return "true" if obj else "false"\n    value = str(jsonable_encoder(obj))\n    if value in {".", ".."}:\n        raise ValueError("path parameter must not be a dot path segment")\n    return quote(value, safe="")\n',
);
await replaceOnce(
    "python/src/planir/client.py",
    "import httpx\n",
    "import httpx\nfrom pyqwest import Client as PyqwestClient, SyncClient as PyqwestSyncClient\n",
);
await replaceExactCount(
    "python/src/planir/client.py",
    "        httpx_client: typing.Optional[httpx.Client] = None,\n",
    "        httpx_client: typing.Optional[httpx.Client] = None,\n        process_http_client: typing.Optional[PyqwestSyncClient] = None,\n",
    1,
);
await replaceExactCount(
    "python/src/planir/client.py",
    "        httpx_client: typing.Optional[httpx.AsyncClient] = None,\n",
    "        httpx_client: typing.Optional[httpx.AsyncClient] = None,\n        process_http_client: typing.Optional[PyqwestClient] = None,\n",
    1,
);
await replaceExactCount(
    "python/src/planir/client.py",
    "    httpx_client : typing.Optional[httpx.Client]\n        The httpx client to use for making requests, a preconfigured client is used by default, however this is useful should you want to pass in any custom httpx configuration.\n",
    "    httpx_client : typing.Optional[httpx.Client]\n        The httpx client to use for making requests, a preconfigured client is used by default, however this is useful should you want to pass in any custom httpx configuration.\n\n    process_http_client : typing.Optional[PyqwestSyncClient]\n        The native Connect HTTP client for Process calls. Required when httpx_client is customized.\n",
    1,
);
await replaceExactCount(
    "python/src/planir/client.py",
    "    httpx_client : typing.Optional[httpx.AsyncClient]\n        The httpx client to use for making requests, a preconfigured client is used by default, however this is useful should you want to pass in any custom httpx configuration.\n",
    "    httpx_client : typing.Optional[httpx.AsyncClient]\n        The httpx client to use for making requests, a preconfigured client is used by default, however this is useful should you want to pass in any custom httpx configuration.\n\n    process_http_client : typing.Optional[PyqwestClient]\n        The native Connect HTTP client for Process calls. Required when httpx_client is customized.\n",
    1,
);
await replaceExactCount(
    "python/src/planir/client.py",
    "            logging=logging,\n",
    "            logging=logging,\n            uses_custom_httpx_client=httpx_client is not None,\n            process_http_client=process_http_client,\n",
    2,
);
await replaceExactCount(
    "python/src/planir/core/client_wrapper.py",
    "        httpx_client: httpx.Client,\n",
    "        httpx_client: httpx.Client,\n        uses_custom_httpx_client: bool = False,\n        process_http_client: typing.Any = None,\n",
    1,
);
await replaceExactCount(
    "python/src/planir/core/client_wrapper.py",
    "        httpx_client: httpx.AsyncClient,\n",
    "        httpx_client: httpx.AsyncClient,\n        uses_custom_httpx_client: bool = False,\n        process_http_client: typing.Any = None,\n",
    1,
);
await replaceExactCount(
    "python/src/planir/core/client_wrapper.py",
    "            logging_config=self._logging,\n        )\n",
    "            logging_config=self._logging,\n        )\n        self._uses_custom_httpx_client = uses_custom_httpx_client\n        self._process_http_client = process_http_client\n",
    2,
);
await replaceOnce(
    "python/src/planir/process/gen/planir/runtime/v1/process_pb2.py",
    "_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'planir.runtime.v1.process_pb2', _globals)",
    "_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'planir.process.gen.planir.runtime.v1.process_pb2', _globals)",
);
await replaceOnce("python/src/planir/CONTRIBUTING.md", "- Python 3.9+", "- Python 3.10+");
await normalizeGenerated("ts/src/process/gen/planir/runtime/v1/process_pb.ts");
await normalizeGenerated("python/src/planir/process/gen/planir/runtime/v1/process_connect.py");

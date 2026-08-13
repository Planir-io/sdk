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
    'export { PlanirClient } from "./Client.js";\nexport { ProcessPlane, RuntimeHandle } from "./process/RuntimeHandle.js";\nexport * from "./process/gen/planir/runtime/v1/process_pb.js";\n',
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
await replaceOnce("python/src/planir/CONTRIBUTING.md", "- Python 3.9+", "- Python 3.10+");
await normalizeGenerated("ts/src/process/gen/planir/runtime/v1/process_pb.ts");
await normalizeGenerated("python/src/planir/process/gen/planir/runtime/v1/process_connect.py");

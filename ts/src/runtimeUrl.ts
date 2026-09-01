const RUNTIME_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function runtimeUrl(runtimeId: string, port: number): string {
    if (typeof runtimeId !== "string" || !RUNTIME_ID.test(runtimeId)) {
        throw new TypeError("runtimeId must be a lowercase canonical UUID");
    }
    if (!Number.isInteger(port) || port < 1 || port > 65535 || port === 62000) {
        throw new RangeError("port must be an integer from 1 through 65535 except 62000");
    }
    return `https://${port}-${runtimeId}.planir.dev`;
}

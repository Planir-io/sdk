import re


_RUNTIME_ID = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")


def runtime_url(runtime_id: str, port: int) -> str:
    if not isinstance(runtime_id, str) or _RUNTIME_ID.fullmatch(runtime_id) is None:
        raise ValueError("runtime_id must be a lowercase canonical UUID")
    if isinstance(port, bool) or not isinstance(port, int):
        raise TypeError("port must be an integer")
    if port < 1 or port > 65535 or port == 62000:
        raise ValueError("port must be from 1 through 65535 except 62000")
    return f"https://{port}-{runtime_id}.planir.dev"

import typing
from urllib.parse import quote

from ..core.client_wrapper import AsyncClientWrapper, SyncClientWrapper
from .gen.planir.runtime.v1.process_connect import ProcessClient, ProcessClientSync


def _address(wrapper: typing.Union[AsyncClientWrapper, SyncClientWrapper], runtime_id: str) -> str:
    if runtime_id in {".", ".."}:
        raise ValueError("runtime_id must not be a dot path segment")
    return f"{wrapper.get_base_url().rstrip('/')}/v1/runtimes/{quote(runtime_id, safe='')}"


class ProcessPlane:
    def __init__(self, wrapper: SyncClientWrapper, runtime_id: str) -> None:
        if wrapper._uses_custom_httpx_client and wrapper._process_http_client is None:
            raise ValueError("custom httpx_client does not serve Process calls; configure process_http_client")
        self._wrapper = wrapper
        self._client = ProcessClientSync(_address(wrapper, runtime_id), http_client=wrapper._process_http_client)

    def _headers(self, headers):
        return {**self._wrapper.get_headers(), **(headers or {})}

    def start(self, request, *, headers=None, timeout_ms=None):
        return self._client.start(request, headers=self._headers(headers), timeout_ms=timeout_ms)

    def connect(self, request, *, headers=None, timeout_ms=None):
        return self._client.connect(request, headers=self._headers(headers), timeout_ms=timeout_ms)

    def list(self, request, *, headers=None, timeout_ms=None):
        return self._client.list(request, headers=self._headers(headers), timeout_ms=timeout_ms)

    def stream_input(self, request, *, headers=None, timeout_ms=None):
        return self._client.stream_input(request, headers=self._headers(headers), timeout_ms=timeout_ms)

    def send_input(self, request, *, headers=None, timeout_ms=None):
        return self._client.send_input(request, headers=self._headers(headers), timeout_ms=timeout_ms)

    def close_stdin(self, request, *, headers=None, timeout_ms=None):
        return self._client.close_stdin(request, headers=self._headers(headers), timeout_ms=timeout_ms)

    def update(self, request, *, headers=None, timeout_ms=None):
        return self._client.update(request, headers=self._headers(headers), timeout_ms=timeout_ms)

    def send_signal(self, request, *, headers=None, timeout_ms=None):
        return self._client.send_signal(request, headers=self._headers(headers), timeout_ms=timeout_ms)


class RuntimeHandle:
    def __init__(self, wrapper: SyncClientWrapper, runtime_id: str) -> None:
        self.commands = self.pty = ProcessPlane(wrapper, runtime_id)


class AsyncProcessPlane:
    def __init__(self, wrapper: AsyncClientWrapper, runtime_id: str) -> None:
        if wrapper._uses_custom_httpx_client and wrapper._process_http_client is None:
            raise ValueError("custom httpx_client does not serve Process calls; configure process_http_client")
        self._wrapper = wrapper
        self._client = ProcessClient(_address(wrapper, runtime_id), http_client=wrapper._process_http_client)

    async def _headers(self, headers):
        return {**(await self._wrapper.async_get_headers()), **(headers or {})}

    async def start(self, request, *, headers=None, timeout_ms=None):
        stream = self._client.start(request, headers=await self._headers(headers), timeout_ms=timeout_ms)
        async for event in stream:
            yield event

    async def connect(self, request, *, headers=None, timeout_ms=None):
        stream = self._client.connect(request, headers=await self._headers(headers), timeout_ms=timeout_ms)
        async for event in stream:
            yield event

    async def list(self, request, *, headers=None, timeout_ms=None):
        return await self._client.list(request, headers=await self._headers(headers), timeout_ms=timeout_ms)

    async def stream_input(self, request, *, headers=None, timeout_ms=None):
        return await self._client.stream_input(request, headers=await self._headers(headers), timeout_ms=timeout_ms)

    async def send_input(self, request, *, headers=None, timeout_ms=None):
        return await self._client.send_input(request, headers=await self._headers(headers), timeout_ms=timeout_ms)

    async def close_stdin(self, request, *, headers=None, timeout_ms=None):
        return await self._client.close_stdin(request, headers=await self._headers(headers), timeout_ms=timeout_ms)

    async def update(self, request, *, headers=None, timeout_ms=None):
        return await self._client.update(request, headers=await self._headers(headers), timeout_ms=timeout_ms)

    async def send_signal(self, request, *, headers=None, timeout_ms=None):
        return await self._client.send_signal(request, headers=await self._headers(headers), timeout_ms=timeout_ms)


class AsyncRuntimeHandle:
    def __init__(self, wrapper: AsyncClientWrapper, runtime_id: str) -> None:
        self.commands = self.pty = AsyncProcessPlane(wrapper, runtime_id)

import asyncio
import inspect
from collections.abc import Awaitable, Callable, Mapping, Sequence
from dataclasses import dataclass

from .gen.planir.runtime.v1.process_pb2 import (
    CloseStdinRequest, ConnectRequest, ListRequest, ProcessConfig, ProcessInput,
    ProcessSelector, PTY, SendInputRequest, SendSignalRequest, StartRequest,
    UpdateRequest, SIGNAL_SIGKILL, SIGNAL_SIGTERM,
)

SyncCallback = Callable[[bytes], None]
AsyncCallback = Callable[[bytes], None | Awaitable[None]]


@dataclass(frozen=True)
class CommandResult:
    pid: int
    exit_code: int
    exited: bool
    status: str
    stdout: str
    stderr: str
    stdout_bytes: bytes
    stderr_bytes: bytes
    error: str | None = None


@dataclass(frozen=True)
class RunningProcess:
    pid: int
    cmd: str
    args: tuple[str, ...]
    env: dict[str, str]
    tag: str | None = None
    cwd: str | None = None


class CommandExitError(Exception):
    def __init__(self, result: CommandResult):
        super().__init__(result.error or f"Command exited with code {result.exit_code}")
        self.result = result


@dataclass(frozen=True)
class PtyResult:
    pid: int
    exit_code: int
    exited: bool
    status: str
    output: str
    output_bytes: bytes
    error: str | None = None


class PtyExitError(Exception):
    def __init__(self, result: PtyResult):
        super().__init__(result.error or f"PTY exited with code {result.exit_code}")
        self.result = result


def _selector(value: int | str) -> ProcessSelector:
    return ProcessSelector(pid=value) if isinstance(value, int) else ProcessSelector(tag=value)


def _bytes(value: str | bytes) -> bytes:
    return value.encode() if isinstance(value, str) else value


def _close(events) -> None:
    if close := getattr(events, "close", None):
        close()


async def _aclose(events) -> None:
    if close := getattr(events, "aclose", None):
        await close()


def _consume_task_result(task) -> None:
    if not task.cancelled():
        task.exception()


class _Capture:
    def __init__(self, pid: int, capture: bool):
        self.pid = pid
        self.capture = capture
        self.stdout = bytearray()
        self.stderr = bytearray()
        self.pty = bytearray()

    def feed(self, response):
        event = response.event
        kind = event.WhichOneof("event")
        if kind == "data":
            output = event.data.WhichOneof("output")
            chunk = getattr(event.data, output)
            if self.capture:
                getattr(self, output).extend(chunk)
            return output, chunk, None
        if kind != "end":
            return None, None, None
        value = event.end
        common = dict(pid=self.pid, exit_code=value.exit_code, exited=value.exited,
                      status=value.status, error=value.error if value.HasField("error") else None)
        command = CommandResult(stdout=bytes(self.stdout).decode(errors="replace"),
                                stderr=bytes(self.stderr).decode(errors="replace"),
                                stdout_bytes=bytes(self.stdout), stderr_bytes=bytes(self.stderr), **common)
        pty = PtyResult(output=bytes(self.pty).decode(errors="replace"), output_bytes=bytes(self.pty), **common)
        return None, None, (command, pty)


class _SyncHandle:
    def __init__(self, pid, plane, events, *, capture=True):
        self.pid = pid
        self._plane = plane
        self._events = events
        self._capture = _Capture(pid, capture)
        self._results = None

    def _wait(self, index, callbacks=None):
        if self._results is None:
            callbacks = callbacks or {}
            try:
                for response in self._events:
                    output, chunk, results = self._capture.feed(response)
                    if callback := callbacks.get(output):
                        callback(chunk)
                    if results:
                        self._results = results
                        break
            finally:
                _close(self._events)
        if self._results is None:
            raise RuntimeError("Process stream closed without an end event")
        return self._results[index]

    def disconnect(self) -> None:
        _close(self._events)

    def _send_input(self, field, data, request_timeout_ms):
        self._plane.send_input(SendInputRequest(process=_selector(self.pid),
                               input=ProcessInput(**{field: _bytes(data)})),
                               timeout_ms=request_timeout_ms)

    def terminate(self, *, request_timeout_ms: int | None = None) -> None:
        self._signal(SIGNAL_SIGTERM, request_timeout_ms)

    def kill(self, *, request_timeout_ms: int | None = None) -> None:
        self._signal(SIGNAL_SIGKILL, request_timeout_ms)

    def _signal(self, signal, request_timeout_ms):
        self._plane.send_signal(SendSignalRequest(process=_selector(self.pid), signal=signal),
                                timeout_ms=request_timeout_ms)


class CommandHandle(_SyncHandle):
    def wait(self, *, on_stdout: SyncCallback | None = None,
             on_stderr: SyncCallback | None = None) -> CommandResult:
        result = self._wait(0, {"stdout": on_stdout, "stderr": on_stderr})
        if result.exit_code != 0:
            raise CommandExitError(result)
        return result

    def send_input(self, data: str | bytes, *, request_timeout_ms: int | None = None) -> None:
        self._send_input("stdin", data, request_timeout_ms)

    def close_stdin(self, *, request_timeout_ms: int | None = None) -> None:
        self._plane.close_stdin(CloseStdinRequest(process=_selector(self.pid)), timeout_ms=request_timeout_ms)


def _start_request(argv, *, cwd=None, env=None, tag=None, stdin=None, timeout_ms=None, pty=None):
    if isinstance(argv, (str, bytes, bytearray, memoryview)):
        raise TypeError("argv must be a sequence of strings")
    argv = tuple(argv)
    if any(not isinstance(value, str) for value in argv):
        raise TypeError("argv must be a sequence of strings")
    if not argv or not argv[0]:
        raise ValueError("argv must contain an executable")
    if timeout_ms is not None and timeout_ms < 0:
        raise ValueError("timeout_ms must be non-negative")
    request = StartRequest(process=ProcessConfig(cmd=argv[0], args=argv[1:], envs=env or {}))
    if cwd is not None:
        request.process.cwd = cwd
    if tag is not None:
        request.tag = tag
    if stdin is not None:
        request.stdin = _bytes(stdin)
    if timeout_ms is not None:
        request.timeout_ms = timeout_ms
    if pty is not None:
        request.pty.CopyFrom(pty)
    return request


def _sync_handle(plane, events, *, capture=True):
    first = next(events)
    if first.event.WhichOneof("event") != "start":
        _close(events)
        raise RuntimeError("Process stream did not start with a PID")
    return CommandHandle(first.event.start.pid, plane, events, capture=capture)


class Commands:
    def __init__(self, plane):
        self._plane = plane

    def start(self, argv: Sequence[str], *, cwd: str | None = None,
              env: Mapping[str, str] | None = None, tag: str | None = None,
              stdin: str | bytes | None = None, timeout_ms: int | None = None,
              request_timeout_ms: int | None = None,
              capture: bool = True) -> CommandHandle:
        request = _start_request(argv, cwd=cwd, env=env, tag=tag, stdin=stdin, timeout_ms=timeout_ms)
        events = self._plane.start(request, timeout_ms=request_timeout_ms)
        return _sync_handle(self._plane, events, capture=capture)

    def run(self, argv: Sequence[str], *, cwd: str | None = None,
            env: Mapping[str, str] | None = None, tag: str | None = None,
            stdin: str | bytes | None = None, timeout_ms: int | None = None,
            request_timeout_ms: int | None = None, capture: bool = True,
            on_stdout: SyncCallback | None = None,
            on_stderr: SyncCallback | None = None) -> CommandResult:
        handle = self.start(argv, cwd=cwd, env=env, tag=tag, stdin=stdin, timeout_ms=timeout_ms,
                            request_timeout_ms=request_timeout_ms, capture=capture)
        return handle.wait(on_stdout=on_stdout, on_stderr=on_stderr)

    def connect(self, process: int | str, *, request_timeout_ms: int | None = None,
                capture: bool = True) -> CommandHandle:
        events = self._plane.connect(ConnectRequest(process=_selector(process)), timeout_ms=request_timeout_ms)
        return _sync_handle(self._plane, events, capture=capture)

    def list(self, *, request_timeout_ms: int | None = None) -> list[RunningProcess]:
        response = self._plane.list(ListRequest(), timeout_ms=request_timeout_ms)
        processes = []
        for item in response.processes:
            if not item.HasField("config"):
                raise RuntimeError(f"Process {item.pid} is missing config")
            processes.append(RunningProcess(pid=item.pid, tag=item.tag if item.HasField("tag") else None,
                             cmd=item.config.cmd, args=tuple(item.config.args), env=dict(item.config.envs),
                             cwd=item.config.cwd if item.config.HasField("cwd") else None))
        return processes


class PtyHandle(_SyncHandle):
    def wait(self, *, on_data: SyncCallback | None = None) -> PtyResult:
        result = self._wait(1, {"pty": on_data})
        if result.exit_code != 0:
            raise PtyExitError(result)
        return result

    def send_input(self, data: str | bytes, *, request_timeout_ms: int | None = None) -> None:
        self._send_input("pty", data, request_timeout_ms)

    def resize(self, cols: int, rows: int, *, request_timeout_ms: int | None = None) -> None:
        if cols <= 0 or rows <= 0:
            raise ValueError("PTY dimensions must be positive")
        self._plane.update(UpdateRequest(process=_selector(self.pid), pty=PTY(size=PTY.Size(cols=cols, rows=rows))),
                           timeout_ms=request_timeout_ms)

class Pty:
    def __init__(self, plane):
        self._plane = plane

    def create(self, argv: Sequence[str], *, cols: int, rows: int, cwd: str | None = None,
               env: Mapping[str, str] | None = None, tag: str | None = None,
               timeout_ms: int | None = None, request_timeout_ms: int | None = None,
               capture: bool = True) -> PtyHandle:
        if cols <= 0 or rows <= 0:
            raise ValueError("PTY dimensions must be positive")
        request = _start_request(argv, cwd=cwd, env=env, tag=tag, timeout_ms=timeout_ms,
                                 pty=PTY(size=PTY.Size(cols=cols, rows=rows)))
        events = self._plane.start(request, timeout_ms=request_timeout_ms)
        first = next(events)
        if first.event.WhichOneof("event") != "start":
            _close(events)
            raise RuntimeError("Process stream did not start with a PID")
        return PtyHandle(first.event.start.pid, self._plane, events, capture=capture)

    def connect(self, process: int | str, *, request_timeout_ms: int | None = None,
                capture: bool = True) -> PtyHandle:
        events = self._plane.connect(ConnectRequest(process=_selector(process)), timeout_ms=request_timeout_ms)
        first = next(events)
        if first.event.WhichOneof("event") != "start":
            _close(events)
            raise RuntimeError("Process stream did not start with a PID")
        return PtyHandle(first.event.start.pid, self._plane, events, capture=capture)


class _AsyncHandle:
    def __init__(self, pid, plane, events, *, capture=True, callbacks=None, result_index=0):
        self.pid = pid
        self._plane = plane
        self._events = events
        self._capture = _Capture(pid, capture)
        self._callbacks = callbacks or {}
        self._result_index = result_index
        self._task = asyncio.create_task(self._drain())
        self._task.add_done_callback(_consume_task_result)

    async def _drain(self):
        try:
            async for response in self._events:
                output, chunk, results = self._capture.feed(response)
                callback = self._callbacks.get(output)
                if callback:
                    called = callback(chunk)
                    if inspect.isawaitable(called):
                        await called
                if results:
                    return results[self._result_index]
            raise RuntimeError("Process stream closed without an end event")
        finally:
            await _aclose(self._events)

    async def disconnect(self) -> None:
        self._task.cancel()
        await asyncio.gather(self._task, return_exceptions=True)
        await _aclose(self._events)

    async def _send_input(self, field, data, request_timeout_ms):
        await self._plane.send_input(
            SendInputRequest(process=_selector(self.pid), input=ProcessInput(**{field: _bytes(data)})),
            timeout_ms=request_timeout_ms,
        )

    async def terminate(self, *, request_timeout_ms: int | None = None) -> None:
        await self._signal(SIGNAL_SIGTERM, request_timeout_ms)

    async def kill(self, *, request_timeout_ms: int | None = None) -> None:
        await self._signal(SIGNAL_SIGKILL, request_timeout_ms)

    async def _signal(self, signal, request_timeout_ms):
        await self._plane.send_signal(SendSignalRequest(process=_selector(self.pid), signal=signal),
                                      timeout_ms=request_timeout_ms)


class AsyncCommandHandle(_AsyncHandle):
    def __init__(self, pid, plane, events, *, capture=True, on_stdout=None, on_stderr=None):
        super().__init__(pid, plane, events, capture=capture,
                         callbacks={"stdout": on_stdout, "stderr": on_stderr})

    async def wait(self) -> CommandResult:
        result = await self._task
        if result.exit_code != 0:
            raise CommandExitError(result)
        return result

    async def send_input(self, data: str | bytes, *, request_timeout_ms: int | None = None) -> None:
        await self._send_input("stdin", data, request_timeout_ms)

    async def close_stdin(self, *, request_timeout_ms: int | None = None) -> None:
        await self._plane.close_stdin(CloseStdinRequest(process=_selector(self.pid)),
                                      timeout_ms=request_timeout_ms)


async def _async_handle(plane, events, *, capture=True, on_stdout=None, on_stderr=None):
    first = await anext(events)
    if first.event.WhichOneof("event") != "start":
        await _aclose(events)
        raise RuntimeError("Process stream did not start with a PID")
    return AsyncCommandHandle(first.event.start.pid, plane, events, capture=capture,
                              on_stdout=on_stdout, on_stderr=on_stderr)


class AsyncCommands:
    def __init__(self, plane):
        self._plane = plane

    async def start(self, argv: Sequence[str], *, cwd: str | None = None,
                    env: Mapping[str, str] | None = None, tag: str | None = None,
                    stdin: str | bytes | None = None, timeout_ms: int | None = None,
                    request_timeout_ms: int | None = None, capture: bool = True,
                    on_stdout: AsyncCallback | None = None,
                    on_stderr: AsyncCallback | None = None) -> AsyncCommandHandle:
        request = _start_request(argv, cwd=cwd, env=env, tag=tag, stdin=stdin, timeout_ms=timeout_ms)
        events = self._plane.start(request, timeout_ms=request_timeout_ms)
        return await _async_handle(self._plane, events, capture=capture,
                                   on_stdout=on_stdout, on_stderr=on_stderr)

    async def run(self, argv: Sequence[str], *, cwd: str | None = None,
                  env: Mapping[str, str] | None = None, tag: str | None = None,
                  stdin: str | bytes | None = None, timeout_ms: int | None = None,
                  request_timeout_ms: int | None = None, capture: bool = True,
                  on_stdout: AsyncCallback | None = None,
                  on_stderr: AsyncCallback | None = None) -> CommandResult:
        handle = await self.start(argv, cwd=cwd, env=env, tag=tag, stdin=stdin,
                                  timeout_ms=timeout_ms, request_timeout_ms=request_timeout_ms,
                                  capture=capture, on_stdout=on_stdout, on_stderr=on_stderr)
        return await handle.wait()

    async def connect(self, process: int | str, *, request_timeout_ms: int | None = None,
                      capture: bool = True, on_stdout: AsyncCallback | None = None,
                      on_stderr: AsyncCallback | None = None) -> AsyncCommandHandle:
        events = self._plane.connect(ConnectRequest(process=_selector(process)),
                                     timeout_ms=request_timeout_ms)
        return await _async_handle(self._plane, events, capture=capture,
                                   on_stdout=on_stdout, on_stderr=on_stderr)

    async def list(self, *, request_timeout_ms: int | None = None) -> list[RunningProcess]:
        response = await self._plane.list(ListRequest(), timeout_ms=request_timeout_ms)
        processes = []
        for item in response.processes:
            if not item.HasField("config"):
                raise RuntimeError(f"Process {item.pid} is missing config")
            processes.append(RunningProcess(pid=item.pid, tag=item.tag if item.HasField("tag") else None,
                             cmd=item.config.cmd, args=tuple(item.config.args), env=dict(item.config.envs),
                             cwd=item.config.cwd if item.config.HasField("cwd") else None))
        return processes


class AsyncPtyHandle(_AsyncHandle):
    def __init__(self, pid, plane, events, *, capture=True, on_data=None):
        super().__init__(pid, plane, events, capture=capture,
                         callbacks={"pty": on_data}, result_index=1)

    async def wait(self) -> PtyResult:
        result = await self._task
        if result.exit_code != 0:
            raise PtyExitError(result)
        return result

    async def send_input(self, data: str | bytes, *, request_timeout_ms: int | None = None) -> None:
        await self._send_input("pty", data, request_timeout_ms)

    async def resize(self, cols: int, rows: int, *, request_timeout_ms: int | None = None) -> None:
        if cols <= 0 or rows <= 0:
            raise ValueError("PTY dimensions must be positive")
        await self._plane.update(
            UpdateRequest(process=_selector(self.pid), pty=PTY(size=PTY.Size(cols=cols, rows=rows))),
            timeout_ms=request_timeout_ms,
        )

class AsyncPty:
    def __init__(self, plane):
        self._plane = plane

    async def create(self, argv: Sequence[str], *, cols: int, rows: int,
                     cwd: str | None = None, env: Mapping[str, str] | None = None,
                     tag: str | None = None, timeout_ms: int | None = None,
                     request_timeout_ms: int | None = None, capture: bool = True,
                     on_data: AsyncCallback | None = None) -> AsyncPtyHandle:
        if cols <= 0 or rows <= 0:
            raise ValueError("PTY dimensions must be positive")
        request = _start_request(argv, cwd=cwd, env=env, tag=tag, timeout_ms=timeout_ms,
                                 pty=PTY(size=PTY.Size(cols=cols, rows=rows)))
        events = self._plane.start(request, timeout_ms=request_timeout_ms)
        first = await anext(events)
        if first.event.WhichOneof("event") != "start":
            await _aclose(events)
            raise RuntimeError("Process stream did not start with a PID")
        return AsyncPtyHandle(first.event.start.pid, self._plane, events,
                              capture=capture, on_data=on_data)

    async def connect(self, process: int | str, *, request_timeout_ms: int | None = None,
                      capture: bool = True,
                      on_data: AsyncCallback | None = None) -> AsyncPtyHandle:
        events = self._plane.connect(ConnectRequest(process=_selector(process)),
                                     timeout_ms=request_timeout_ms)
        first = await anext(events)
        if first.event.WhichOneof("event") != "start":
            await _aclose(events)
            raise RuntimeError("Process stream did not start with a PID")
        return AsyncPtyHandle(first.event.start.pid, self._plane, events,
                              capture=capture, on_data=on_data)

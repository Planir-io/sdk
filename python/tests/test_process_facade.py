import asyncio
import gc
import threading
import unittest

import planir.process as process
import planir.process.runtime as runtime
from planir.process.gen.planir.runtime.v1.process_pb2 import (
    ListResponse, ProcessConfig, ProcessEvent, ProcessInfo, StartResponse,
)


def start(pid):
    return StartResponse(event=ProcessEvent(start=ProcessEvent.StartEvent(pid=pid)))


def data(**output):
    return StartResponse(event=ProcessEvent(data=ProcessEvent.DataEvent(**output)))


def end(code=0, error=None):
    value = ProcessEvent.EndEvent(exit_code=code, exited=True, status="exited")
    if error is not None:
        value.error = error
    return StartResponse(event=ProcessEvent(end=value))


class SyncPlane:
    def __init__(self):
        self.request = None
        self.calls = []

    def start(self, request, **_options):
        self.request = request
        if request.HasField("pty"):
            return iter((start(88), data(pty=b"$ "), end()))
        return iter((start(41), data(stdout=b"hi"), data(stderr=b"!"), end()))

    def connect(self, request, **_options):
        self.calls.append(("connect", request.process.WhichOneof("selector")))
        return (event for event in (start(77), end()))

    def send_input(self, request, **_options):
        self.calls.append(("input", request.input.WhichOneof("input"), bytes(getattr(request.input, request.input.WhichOneof("input")))))

    def close_stdin(self, request, **_options):
        self.calls.append(("eof", request.process.pid))

    def update(self, request, **_options):
        self.calls.append(("resize", request.pty.size.cols, request.pty.size.rows))

    def send_signal(self, request, **_options):
        self.calls.append(("signal", request.signal))

    def list(self, _request, **_options):
        return ListResponse(processes=[ProcessInfo(pid=3, tag="job", config=ProcessConfig(cmd="node", args=["a.js"]))])


class AsyncPlane:
    def __init__(self):
        self.request = None
        self.calls = []

    async def start(self, request, **_options):
        self.request = request
        output = data(pty=b"$ ") if request.HasField("pty") else data(stdout=b"async")
        for event in (start(42), output, end()):
            yield event

    async def connect(self, request, **_options):
        self.calls.append(("connect", request.process.WhichOneof("selector")))
        for event in (start(77), end()):
            yield event

    async def send_input(self, request, **_options):
        kind = request.input.WhichOneof("input")
        self.calls.append(("input", kind, bytes(getattr(request.input, kind))))

    async def close_stdin(self, request, **_options):
        self.calls.append(("eof", request.process.pid))

    async def update(self, request, **_options):
        self.calls.append(("resize", request.pty.size.cols, request.pty.size.rows))

    async def send_signal(self, request, **_options):
        self.calls.append(("signal", request.signal))

    async def list(self, _request, **_options):
        return ListResponse(processes=[ProcessInfo(pid=3, config=ProcessConfig(cmd="node"))])


class BlockingAsyncPlane(AsyncPlane):
    def __init__(self):
        super().__init__()
        self.gate = asyncio.Event()
        self.closed = asyncio.Event()

    async def connect(self, request, **_options):
        self.calls.append(("connect", request.process.WhichOneof("selector")))
        try:
            yield start(77)
            await self.gate.wait()
        finally:
            self.closed.set()


class ClosingSyncPlane(SyncPlane):
    def __init__(self):
        super().__init__()
        self.closed = False

    def start(self, request, **_options):
        self.request = request

        def events():
            try:
                yield start(41)
                yield data(stdout=b"done")
                yield end()
            finally:
                self.closed = True

        return events()


class LiveSyncPlane(SyncPlane):
    def __init__(self):
        super().__init__()
        self.release = threading.Event()

    def start(self, request, **_options):
        self.request = request
        yield start(41)
        yield data(stdout=b"live")
        self.release.wait()
        yield end()


class ClosingAsyncPlane(AsyncPlane):
    def __init__(self):
        super().__init__()
        self.closed = asyncio.Event()

    async def start(self, request, **_options):
        self.request = request
        try:
            yield start(42)
            yield end()
            await asyncio.Event().wait()
        finally:
            self.closed.set()


class CallbackFailureAsyncPlane(AsyncPlane):
    def __init__(self):
        super().__init__()
        self.closed = asyncio.Event()

    async def start(self, request, **_options):
        try:
            yield start(42)
            yield data(stdout=b"boom")
        finally:
            self.closed.set()


class ProcessFacadeTest(unittest.TestCase):
    def test_sync_callbacks_stream_while_waiting_without_capture(self):
        plane = LiveSyncPlane()
        seen = []

        def on_stdout(chunk):
            seen.append(chunk)
            plane.release.set()

        handle = runtime.Commands(plane).start(["worker"], capture=False)

        result = handle.wait(on_stdout=on_stdout)
        self.assertEqual(seen, [b"live"])
        self.assertEqual(result.stdout, "")

    def test_sync_run_sends_exact_argv_and_returns_separated_output(self):
        plane = SyncPlane()
        commands = runtime.Commands(plane)

        result = commands.run(["printf", "%s", "hi"], cwd="/work", env={"A": "b"})

        self.assertEqual(plane.request.process.cmd, "printf")
        self.assertEqual(list(plane.request.process.args), ["%s", "hi"])
        self.assertEqual(plane.request.process.cwd, "/work")
        self.assertEqual(dict(plane.request.process.envs), {"A": "b"})
        self.assertEqual(result.pid, 41)
        self.assertEqual(result.stdout, "hi")
        self.assertEqual(result.stderr, "!")
        self.assertEqual(result.stdout_bytes, b"hi")
        self.assertEqual(result.stderr_bytes, b"!")

    def test_argv_rejects_string_and_non_string_elements(self):
        commands = runtime.Commands(SyncPlane())

        for argv in ("printf", b"printf", ["printf", 1]):
            with self.subTest(argv=argv), self.assertRaises((TypeError, ValueError)):
                commands.start(argv)

    def test_nonzero_exit_raises_an_error_with_the_complete_result(self):
        class FailingPlane(SyncPlane):
            def start(self, request, **_options):
                return iter((start(41), data(stderr=b"bad"), end(7, "failed")))

        with self.assertRaises(process.CommandExitError) as caught:
            runtime.Commands(FailingPlane()).run(["false"])

        self.assertEqual(caught.exception.result.exit_code, 7)
        self.assertEqual(caught.exception.result.stderr, "bad")

    def test_sync_handles_cover_reconnect_control_and_pty(self):
        plane = SyncPlane()
        commands = runtime.Commands(plane)

        handle = commands.connect("worker")
        handle.send_input("hi")
        handle.close_stdin()
        handle.terminate()
        handle.kill()
        self.assertEqual(handle.wait().exit_code, 0)
        self.assertEqual(commands.list()[0].cmd, "node")

        terminal = runtime.Pty(plane).create(["/bin/sh"], cols=120, rows=30)
        terminal.send_input(b"ls\n")
        terminal.resize(160, 40)
        output = []
        self.assertEqual(terminal.wait(on_data=output.append).output, "$ ")
        self.assertEqual(output, [b"$ "])
        self.assertEqual(plane.calls, [
            ("connect", "tag"), ("input", "stdin", b"hi"), ("eof", 77),
            ("signal", 15), ("signal", 9), ("input", "pty", b"ls\n"),
            ("resize", 160, 40),
        ])

    def test_sync_pty_reconnect_controls_and_disconnects_without_killing(self):
        plane = SyncPlane()

        terminal = runtime.Pty(plane).connect(88)
        terminal.terminate()
        terminal.kill()
        terminal.disconnect()

        self.assertEqual(plane.calls, [
            ("connect", "pid"), ("signal", 15), ("signal", 9),
        ])

    def test_sync_wait_closes_the_attachment_after_the_end_event(self):
        plane = ClosingSyncPlane()
        handle = runtime.Commands(plane).start(["true"])

        handle.wait()

        self.assertTrue(plane.closed)

    def test_sync_callback_failure_closes_the_attachment(self):
        plane = ClosingSyncPlane()
        handle = runtime.Commands(plane).start(["worker"])

        with self.assertRaisesRegex(RuntimeError, "callback"):
            handle.wait(on_stdout=lambda _data: (_ for _ in ()).throw(RuntimeError("callback")))
        self.assertTrue(plane.closed)


class AsyncProcessFacadeTest(unittest.IsolatedAsyncioTestCase):
    async def test_abandoned_async_failure_is_not_reported_as_unretrieved(self):
        loop = asyncio.get_running_loop()
        reports = []
        previous = loop.get_exception_handler()
        loop.set_exception_handler(lambda _loop, context: reports.append(context.get("message")))
        try:
            handle = await runtime.AsyncCommands(CallbackFailureAsyncPlane()).start(
                ["worker"], on_stdout=lambda _data: (_ for _ in ()).throw(RuntimeError("callback"))
            )
            await asyncio.sleep(0)
            del handle
            gc.collect()
            await asyncio.sleep(0)
            self.assertEqual(reports, [])
        finally:
            loop.set_exception_handler(previous)

    async def test_async_callback_failure_closes_the_attachment(self):
        plane = CallbackFailureAsyncPlane()
        handle = await runtime.AsyncCommands(plane).start(
            ["worker"], on_stdout=lambda _data: (_ for _ in ()).throw(RuntimeError("callback"))
        )

        with self.assertRaisesRegex(RuntimeError, "callback"):
            await handle.wait()
        self.assertTrue(plane.closed.is_set())

    async def test_async_run_matches_the_sync_result_shape(self):
        plane = AsyncPlane()
        commands = runtime.AsyncCommands(plane)
        output = []

        result = await commands.run(["printf", "async"], capture=False, on_stdout=output.append)

        self.assertEqual(plane.request.process.cmd, "printf")
        self.assertEqual(result.pid, 42)
        self.assertEqual(result.stdout, "")
        self.assertEqual(output, [b"async"])
        self.assertEqual(result.exit_code, 0)

    async def test_async_command_handle_controls_and_reconnect_match_sync(self):
        plane = AsyncPlane()
        commands = runtime.AsyncCommands(plane)

        handle = await commands.connect("worker")
        await handle.send_input("hi")
        await handle.close_stdin()
        await handle.terminate()
        await handle.kill()

        self.assertEqual((await handle.wait()).exit_code, 0)
        self.assertEqual((await commands.list())[0].cmd, "node")
        self.assertEqual(plane.calls, [
            ("connect", "tag"), ("input", "stdin", b"hi"), ("eof", 77),
            ("signal", 15), ("signal", 9),
        ])

    async def test_async_pty_handle_owns_input_resize_and_result(self):
        plane = AsyncPlane()

        terminal = await runtime.AsyncPty(plane).create(["/bin/sh"], cols=120, rows=30)
        await terminal.send_input(b"ls\n")
        await terminal.resize(160, 40)

        self.assertEqual((await terminal.wait()).output, "$ ")
        self.assertEqual(plane.calls, [
            ("input", "pty", b"ls\n"), ("resize", 160, 40),
        ])

    async def test_async_pty_reconnect_controls_and_disconnects_without_killing(self):
        plane = AsyncPlane()

        terminal = await runtime.AsyncPty(plane).connect(88)
        await terminal.terminate()
        await terminal.kill()
        await terminal.disconnect()

        self.assertEqual(plane.calls, [
            ("connect", "pid"), ("signal", 15), ("signal", 9),
        ])

    async def test_async_disconnect_waits_for_the_attachment_task_to_stop(self):
        plane = BlockingAsyncPlane()
        handle = await runtime.AsyncCommands(plane).connect(77)
        await asyncio.sleep(0)

        await handle.disconnect()

        self.assertEqual(plane.calls, [("connect", "pid")])
        self.assertTrue(plane.closed.is_set())

    async def test_async_wait_closes_the_attachment_after_the_end_event(self):
        plane = ClosingAsyncPlane()

        await runtime.AsyncCommands(plane).run(["true"])

        self.assertTrue(plane.closed.is_set())


if __name__ == "__main__":
    unittest.main()

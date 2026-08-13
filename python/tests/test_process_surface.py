import inspect
import unittest

from planir import AsyncPlanirClient, PlanirClient
from planir.process import ConnectRequest, ProcessConfig, StartRequest


class ProcessSurfaceTest(unittest.TestCase):
    def test_process_messages_have_a_public_import(self) -> None:
        request = StartRequest(process=ProcessConfig(cmd="echo", args=["hello"]))
        self.assertEqual(request.process.cmd, "echo")

    def test_runtime_handle_exposes_commands_and_pty(self) -> None:
        runtime = PlanirClient(token="test").runtimes.runtime("rt_test")
        methods = ("start", "connect", "list", "stream_input", "send_input", "close_stdin", "update", "send_signal")
        for method in methods:
            self.assertTrue(callable(getattr(runtime.commands, method)))
            self.assertTrue(callable(getattr(runtime.pty, method)))

    def test_async_runtime_handle_exposes_commands_and_pty(self) -> None:
        runtime = AsyncPlanirClient(token="test").runtimes.runtime("rt_test")
        methods = ("start", "connect", "list", "stream_input", "send_input", "close_stdin", "update", "send_signal")
        for method in methods:
            self.assertTrue(callable(getattr(runtime.commands, method)))
            self.assertTrue(callable(getattr(runtime.pty, method)))

    def test_async_streaming_methods_return_async_iterables(self) -> None:
        commands = AsyncPlanirClient(token="test").runtimes.runtime("rt_test").commands
        streams = (commands.start(StartRequest()), commands.connect(ConnectRequest()))
        try:
            for stream in streams:
                self.assertTrue(hasattr(stream, "__aiter__"))
        finally:
            for stream in streams:
                if inspect.iscoroutine(stream):
                    stream.close()


if __name__ == "__main__":
    unittest.main()

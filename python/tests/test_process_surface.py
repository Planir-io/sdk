import inspect
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock

from planir import AsyncPlanirClient, PlanirClient
from planir.errors import UnprocessableEntityError
from planir.process import ConnectRequest, ProcessConfig, StartRequest
from planir.process.runtime import _address
from planir.runtimes.raw_client import AsyncRawRuntimesClient, RawRuntimesClient
from planir.types import RuntimeCreatePolicyError


class ProcessSurfaceTest(unittest.TestCase):
    def test_runtime_id_is_one_encoded_path_segment(self) -> None:
        wrapper = SimpleNamespace(get_base_url=lambda: "https://api.planir.io")
        self.assertEqual(
            _address(wrapper, "rt_allowed/../rt_victim?#"),
            "https://api.planir.io/v1/runtimes/rt_allowed%2F..%2Frt_victim%3F%23",
        )

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

    def test_create_policy_failure_has_a_typed_body(self) -> None:
        payload = {"error": {"code": "UNSAFE_IMAGE_HOST", "message": "refused"}}
        response = SimpleNamespace(status_code=422, headers={}, json=lambda: payload)
        http = SimpleNamespace(request=lambda *args, **kwargs: response)
        client = RawRuntimesClient(client_wrapper=SimpleNamespace(httpx_client=http))

        with self.assertRaises(UnprocessableEntityError) as caught:
            client.create(request={})

        self.assertIsInstance(caught.exception.body, RuntimeCreatePolicyError)
        self.assertEqual(caught.exception.body.error.code, "UNSAFE_IMAGE_HOST")


class AsyncPolicyErrorTest(unittest.IsolatedAsyncioTestCase):
    async def test_create_policy_failure_has_a_typed_body(self) -> None:
        payload = {"error": {"code": "UNSAFE_IMAGE_HOST", "message": "refused"}}
        response = SimpleNamespace(status_code=422, headers={}, json=lambda: payload)
        http = SimpleNamespace(request=AsyncMock(return_value=response))
        client = AsyncRawRuntimesClient(client_wrapper=SimpleNamespace(httpx_client=http))

        with self.assertRaises(UnprocessableEntityError) as caught:
            await client.create(request={})

        self.assertIsInstance(caught.exception.body, RuntimeCreatePolicyError)


if __name__ == "__main__":
    unittest.main()

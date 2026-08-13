import inspect
import pickle
import typing
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock

import httpx

from planir import AsyncPlanirClient, PlanirClient
from planir.core.jsonable_encoder import encode_path_param
from planir.errors import NotFoundError, UnprocessableEntityError
from planir.process import ConnectRequest, ProcessConfig, StartRequest
from planir.process.runtime import _address
from planir.runtimes.raw_client import AsyncRawRuntimesClient, RawRuntimesClient
from planir.team.raw_client import AsyncRawTeamClient, RawTeamClient
from planir.types import PolicyRefusedError, RuntimeCreatePolicyError
from planir.volumes.raw_client import AsyncRawVolumesClient, RawVolumesClient


class ProcessSurfaceTest(unittest.TestCase):
    def test_process_http_client_annotations_resolve(self) -> None:
        hints = typing.get_type_hints(PlanirClient.__init__)
        self.assertEqual(typing.get_args(hints["process_http_client"])[0].__name__, "SyncClient")

    def test_process_messages_pickle_round_trip(self) -> None:
        request = StartRequest(process=ProcessConfig(cmd="echo", args=["hello"]))
        restored = pickle.loads(pickle.dumps(request))
        self.assertEqual(restored, request)

    def test_runtime_paths_encode_untrusted_ids_as_one_segment(self) -> None:
        observed = []

        def capture(request: httpx.Request) -> httpx.Response:
            observed.append(request.url.raw_path)
            return httpx.Response(404, json={"error": {"code": "NOT_FOUND", "message": "missing"}})

        client = PlanirClient(
            base_url="https://api.planir.io",
            token="test",
            httpx_client=httpx.Client(transport=httpx.MockTransport(capture)),
        )
        with self.assertRaises(NotFoundError):
            client.runtimes.rotate_runtime_key("../team/keys#")

        self.assertEqual(observed, [b"/v1/runtimes/..%2Fteam%2Fkeys%23/key"])

    def test_rest_path_encoder_rejects_dot_only_segments(self) -> None:
        for value in (".", ".."):
            with self.subTest(value=value), self.assertRaises(ValueError):
                encode_path_param(value)

    def test_runtime_id_is_one_encoded_path_segment(self) -> None:
        wrapper = SimpleNamespace(get_base_url=lambda: "https://api.planir.io")
        self.assertEqual(
            _address(wrapper, "rt_allowed/../rt_victim?#"),
            "https://api.planir.io/v1/runtimes/rt_allowed%2F..%2Frt_victim%3F%23",
        )

    def test_dot_only_runtime_ids_are_rejected(self) -> None:
        wrapper = SimpleNamespace(get_base_url=lambda: "https://api.planir.io")
        for runtime_id in (".", ".."):
            with self.subTest(runtime_id=runtime_id), self.assertRaises(ValueError):
                _address(wrapper, runtime_id)

    def test_process_messages_have_a_public_import(self) -> None:
        request = StartRequest(process=ProcessConfig(cmd="echo", args=["hello"]))
        self.assertEqual(request.process.cmd, "echo")

    def test_runtime_handle_exposes_commands_and_pty(self) -> None:
        runtime = PlanirClient(token="test").runtimes.runtime("rt_test")
        methods = ("start", "connect", "list", "stream_input", "send_input", "close_stdin", "update", "send_signal")
        for method in methods:
            self.assertTrue(callable(getattr(runtime.commands, method)))
            self.assertTrue(callable(getattr(runtime.pty, method)))

    def test_custom_rest_client_requires_process_http_client(self) -> None:
        client = PlanirClient(token="test", httpx_client=httpx.Client())
        with self.assertRaisesRegex(ValueError, "process_http_client"):
            client.runtimes.runtime("rt_test")

    def test_process_http_client_is_injected(self) -> None:
        from pyqwest import SyncClient

        process_http_client = SyncClient()
        runtime = PlanirClient(
            token="test",
            httpx_client=httpx.Client(),
            process_http_client=process_http_client,
        ).runtimes.runtime("rt_test")

        self.assertIs(runtime.commands._client._http_client, process_http_client)

    def test_async_runtime_handle_exposes_commands_and_pty(self) -> None:
        runtime = AsyncPlanirClient(token="test").runtimes.runtime("rt_test")
        methods = ("start", "connect", "list", "stream_input", "send_input", "close_stdin", "update", "send_signal")
        for method in methods:
            self.assertTrue(callable(getattr(runtime.commands, method)))
            self.assertTrue(callable(getattr(runtime.pty, method)))

    def test_async_custom_rest_client_requires_process_http_client(self) -> None:
        client = AsyncPlanirClient(token="test", httpx_client=httpx.AsyncClient())
        with self.assertRaisesRegex(ValueError, "process_http_client"):
            client.runtimes.runtime("rt_test")

    def test_async_process_http_client_is_injected(self) -> None:
        from pyqwest import Client

        process_http_client = Client()
        runtime = AsyncPlanirClient(
            token="test",
            httpx_client=httpx.AsyncClient(),
            process_http_client=process_http_client,
        ).runtimes.runtime("rt_test")

        self.assertIs(runtime.commands._client._http_client, process_http_client)

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

    def test_existing_policy_failures_keep_typed_bodies(self) -> None:
        response = SimpleNamespace(
            status_code=422,
            headers={},
            json=lambda: {"error": {"code": "POLICY_REFUSED", "message": "refused"}},
        )
        wrapper = SimpleNamespace(httpx_client=SimpleNamespace(request=lambda *args, **kwargs: response))
        team = RawTeamClient(client_wrapper=wrapper)
        volumes = RawVolumesClient(client_wrapper=wrapper)
        runtimes = RawRuntimesClient(client_wrapper=wrapper)
        calls = (
            lambda: team.patch_team(default_region="brq"),
            lambda: team.mint_team_key(name="key"),
            lambda: team.register_team_webhook(url="https://example.com"),
            lambda: volumes.create_volume(name="data", size_bytes=1, family="co"),
            lambda: runtimes.update_env("runtime", env={"KEY": "value"}),
        )
        for call in calls:
            with self.assertRaises(UnprocessableEntityError) as caught:
                call()
            self.assertIsInstance(caught.exception.body, PolicyRefusedError)


class AsyncPolicyErrorTest(unittest.IsolatedAsyncioTestCase):
    async def test_create_policy_failure_has_a_typed_body(self) -> None:
        payload = {"error": {"code": "UNSAFE_IMAGE_HOST", "message": "refused"}}
        response = SimpleNamespace(status_code=422, headers={}, json=lambda: payload)
        http = SimpleNamespace(request=AsyncMock(return_value=response))
        client = AsyncRawRuntimesClient(client_wrapper=SimpleNamespace(httpx_client=http))

        with self.assertRaises(UnprocessableEntityError) as caught:
            await client.create(request={})

        self.assertIsInstance(caught.exception.body, RuntimeCreatePolicyError)

    async def test_existing_policy_failures_keep_typed_bodies(self) -> None:
        response = SimpleNamespace(
            status_code=422,
            headers={},
            json=lambda: {"error": {"code": "POLICY_REFUSED", "message": "refused"}},
        )
        wrapper = SimpleNamespace(httpx_client=SimpleNamespace(request=AsyncMock(return_value=response)))
        team = AsyncRawTeamClient(client_wrapper=wrapper)
        volumes = AsyncRawVolumesClient(client_wrapper=wrapper)
        runtimes = AsyncRawRuntimesClient(client_wrapper=wrapper)
        calls = (
            lambda: team.patch_team(default_region="brq"),
            lambda: team.mint_team_key(name="key"),
            lambda: team.register_team_webhook(url="https://example.com"),
            lambda: volumes.create_volume(name="data", size_bytes=1, family="co"),
            lambda: runtimes.update_env("runtime", env={"KEY": "value"}),
        )
        for call in calls:
            with self.assertRaises(UnprocessableEntityError) as caught:
                await call()
            self.assertIsInstance(caught.exception.body, PolicyRefusedError)


if __name__ == "__main__":
    unittest.main()

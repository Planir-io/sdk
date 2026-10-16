import json
import threading
import unittest
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import httpx

from planir.core.http_client import AsyncHttpClient, HttpClient


CASES = [
    ('"general";q=0;w=60', None, True),
    ('"general";q=5;w=60, "creations";q=0;w=60', None, True),
    ('"general";q=5;w=60, "lifecycle";q=0;w=60', None, True),
    ('"general";q=10;w=60', "1", False),
    ('"general";q=10;w=60', None, False),
    (None, None, False),
]


@contextmanager
def rate_limit_server(policy, retry_after, terminal):
    requests = []

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            requests.append(self.path)
            limited = terminal or len(requests) == 1
            body = json.dumps({"error": {"code": "RATE_LIMITED"}} if limited else {"ok": True}).encode()
            self.send_response(429 if limited else 200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            if policy is not None:
                self.send_header("RateLimit-Policy", policy)
            if retry_after is not None:
                self.send_header("Retry-After", retry_after)
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, *args):
            pass

    with ThreadingHTTPServer(("127.0.0.1", 0), Handler) as server:
        thread = threading.Thread(target=lambda: server.serve_forever(poll_interval=0.01))
        thread.start()
        try:
            yield f"http://127.0.0.1:{server.server_port}", requests
        finally:
            server.shutdown()
            thread.join()


class RateLimitRetryTest(unittest.TestCase):
    def test_sync_zero_quota_is_terminal_and_finite_limits_retry(self):
        for policy, retry_after, terminal in CASES:
            with self.subTest(policy=policy, retry_after=retry_after), rate_limit_server(policy, retry_after, terminal) as (url, requests):
                with httpx.Client(trust_env=False) as transport:
                    client = HttpClient(httpx_client=transport, base_url=lambda: url, base_timeout=lambda: 5, base_headers=lambda: {})
                    response = client.request("/", method="GET")
                self.assertEqual(len(requests), 1 if terminal else 2)
                self.assertEqual(response.status_code, 429 if terminal else 200)
                self.assertEqual(response.json(), {"error": {"code": "RATE_LIMITED"}} if terminal else {"ok": True})


class AsyncRateLimitRetryTest(unittest.IsolatedAsyncioTestCase):
    async def test_async_zero_quota_is_terminal_and_finite_limits_retry(self):
        for policy, retry_after, terminal in CASES:
            with self.subTest(policy=policy, retry_after=retry_after), rate_limit_server(policy, retry_after, terminal) as (url, requests):
                async with httpx.AsyncClient(trust_env=False) as transport:
                    client = AsyncHttpClient(httpx_client=transport, base_url=lambda: url, base_timeout=lambda: 5, base_headers=lambda: {})
                    response = await client.request("/", method="GET")
                self.assertEqual(len(requests), 1 if terminal else 2)
                self.assertEqual(response.status_code, 429 if terminal else 200)
                self.assertEqual(response.json(), {"error": {"code": "RATE_LIMITED"}} if terminal else {"ok": True})

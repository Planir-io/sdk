import unittest

import planir
from planir import PlanirClient
from planir.runtime_url import runtime_url


RUNTIME_ID = "01900000-0000-7000-8000-000000000001"


class RuntimeUrlTest(unittest.TestCase):
    def test_derives_canonical_public_urls(self) -> None:
        self.assertEqual(runtime_url(RUNTIME_ID, 1), f"https://1-{RUNTIME_ID}.planir.dev")
        self.assertEqual(runtime_url(RUNTIME_ID, 3000), f"https://3000-{RUNTIME_ID}.planir.dev")
        self.assertEqual(runtime_url(RUNTIME_ID, 65535), f"https://65535-{RUNTIME_ID}.planir.dev")

    def test_rejects_noncanonical_runtime_ids_and_invalid_ports(self) -> None:
        for runtime_id in ("not-a-uuid", "01900000-0000-7000-8000-00000000000A", f"{RUNTIME_ID}0"):
            with self.subTest(runtime_id=runtime_id), self.assertRaisesRegex(ValueError, "runtime_id"):
                runtime_url(runtime_id, 3000)
        for port in (0, 62000, 65536, 1.5, "3000", True):
            with self.subTest(port=port), self.assertRaisesRegex((TypeError, ValueError), "port"):
                runtime_url(RUNTIME_ID, port)  # type: ignore[arg-type]

    def test_generated_client_exposes_neither_deleted_reach_nor_root_helper_alias(self) -> None:
        self.assertFalse(hasattr(PlanirClient(token="test").runtimes, "reach"))
        self.assertFalse(callable(getattr(planir, "runtime_url", None)))


if __name__ == "__main__":
    unittest.main()

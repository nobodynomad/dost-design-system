from contextlib import closing
from http.client import HTTPConnection
from pathlib import Path
import sqlite3
from tempfile import TemporaryDirectory
from threading import Thread
import unittest
from urllib.parse import urlencode

from preview import create_server


class CallbackTest(unittest.TestCase):
    def test_callback_validation_storage_and_retry(self):
        with TemporaryDirectory() as folder:
            database = Path(folder) / "callbacks.sqlite3"
            with create_server(("127.0.0.1", 0), database) as server:
                thread = Thread(target=server.serve_forever, daemon=True)
                thread.start()
                try:
                    for name, phone, expected in (
                        ("  Тестовая заявка  ", "+998 (00) 000-00-00", 201),
                        ("Тестовая заявка", "+998000000000", 201),
                        ("Тестовая заявка", "телефон", 422),
                        (" ", "+998000000000", 422),
                    ):
                        with closing(HTTPConnection(*server.server_address, timeout=3)) as client:
                            client.request("POST", "/api/callback", urlencode({"name": name, "phone": phone}),
                                           {"Content-Type": "application/x-www-form-urlencoded"})
                            self.assertEqual(client.getresponse().status, expected)
                finally:
                    server.shutdown()
                    thread.join()
            with closing(sqlite3.connect(database)) as db:
                self.assertEqual(db.execute("SELECT name, phone FROM callbacks").fetchall(),
                                 [("Тестовая заявка", "+998000000000")])

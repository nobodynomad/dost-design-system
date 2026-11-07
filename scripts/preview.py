"""Serve the local DOST pages and collect callback requests."""

import argparse
from contextlib import closing
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
from pathlib import Path
import re
import sqlite3
from urllib.parse import parse_qsl, urlsplit


ROOT = Path(__file__).resolve().parents[1]
DATABASE = Path.home() / ".local" / "share" / "dost-model" / "callbacks.sqlite3"
PUBLIC_FILES = {
    ROOT / name for name in (
        "dost-model.html", "dost-model.css", "dost-navigation.js", "dost-feedback.js",
        "design-system.html", "design-system.css", "typography.html", "typography.css", "typography.mjs",
    )
}
ASSET_DIRS = (ROOT / "model-assets", ROOT / "www/themes/morph/assets", ROOT / "www/themes/morph/src/images/brand")


class PreviewHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        if urlsplit(self.path).path == "/":
            self.path = "/dost-model.html"
        file = Path(self.translate_path(self.path)).resolve()
        if file not in PUBLIC_FILES and not (file.is_file() and any(d in file.parents for d in ASSET_DIRS)):
            self.send_error(404)
            return None
        return super().send_head()

    def reply(self, status, message):
        body = message.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/api/callback":
            return self.send_error(404)
        host = self.headers.get("Host")
        if self.headers.get("Origin") not in (None, f"http://{host}", f"https://{host}") or self.headers.get("Sec-Fetch-Site") == "cross-site":
            return self.send_error(403)
        if self.headers.get_content_type() != "application/x-www-form-urlencoded":
            return self.send_error(415)
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 4096:
                return self.send_error(413)
            body = self.rfile.read(length).decode("utf-8")
            fields = dict(parse_qsl(body, strict_parsing=True, errors="strict", max_num_fields=2))
            name = fields["name"].strip()
            phone = re.sub(r"[\s().-]", "", fields["phone"])
            if (not name or len(name) > 100 or re.search(r"[\x00-\x1f\x7f]", name)
                    or len(fields["phone"]) > 32 or not re.fullmatch(r"\+?[0-9]{7,15}", phone)):
                raise ValueError
        except (KeyError, ValueError):
            return self.reply(422, "Проверьте имя и номер телефона и попробуйте ещё раз.")

        try:
            with closing(sqlite3.connect(self.server.database)) as db, db:
                # A retry after a lost response should not create a second callback.
                db.execute("""
                    INSERT INTO callbacks (name, phone)
                    SELECT :name, :phone WHERE NOT EXISTS (
                        SELECT 1 FROM callbacks WHERE name = :name AND phone = :phone
                        AND received_at >= datetime('now', '-5 minutes')
                    )
                """, {"name": name, "phone": phone})
        except sqlite3.Error:
            return self.reply(503, "Не удалось сохранить заявку. Попробуйте ещё раз.")
        self.reply(201, "Заявка принята. Специалист перезвонит вам.")


def create_server(address, database):
    database.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    with closing(sqlite3.connect(database)) as db:
        db.execute("""CREATE TABLE IF NOT EXISTS callbacks (
            id INTEGER PRIMARY KEY, received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            name TEXT NOT NULL, phone TEXT NOT NULL
        )""")
    server = ThreadingHTTPServer(address, partial(PreviewHandler, directory=ROOT))
    server.database = database
    return server


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bind", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=4173)
    parser.add_argument("--database", type=Path, default=DATABASE)
    args = parser.parse_args()
    os.umask(0o077)
    with create_server((args.bind, args.port), args.database) as server:
        print(f"http://{args.bind}:{server.server_port}/dost-model.html", flush=True)
        server.serve_forever()

#!/usr/bin/env python3
"""Serve The Celia Project prototype on the canonical local preview port."""

from __future__ import annotations

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


PORT = 8788
SITE_DIR = Path(__file__).resolve().parent


def main() -> None:
    handler = partial(SimpleHTTPRequestHandler, directory=str(SITE_DIR))
    server = ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    print(f"The Celia Project site is running at http://127.0.0.1:{PORT}/")
    print(f"Serving: {SITE_DIR}")
    server.serve_forever()


if __name__ == "__main__":
    main()

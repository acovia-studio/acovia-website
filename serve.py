#!/usr/bin/env python3
"""Tiny preview server with clean-URL support for dist/."""
from __future__ import annotations

import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def translate_path(self, path: str) -> str:
        target = super().translate_path(path)
        if os.path.isdir(target):
            index = os.path.join(target, "index.html")
            return index if os.path.exists(index) else target
        if not os.path.exists(target) and not os.path.splitext(target)[1]:
            html = target + ".html"
            if os.path.exists(html):
                return html
        return target


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    print(f"Acovia preview: http://127.0.0.1:{port}/")
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()

#!/usr/bin/env python3
"""Build or verify the standalone Becoming HTML from the source files."""

from argparse import ArgumentParser
from pathlib import Path
import sys


PACKAGE = Path(__file__).resolve().parent.parent
SOURCE = PACKAGE / "site"
DEFAULT_OUTPUT = PACKAGE / "becoming.html"


def build() -> str:
    html = (SOURCE / "index.html").read_text(encoding="utf-8")
    html = html.replace(
        "<!doctype html>\n",
        "<!doctype html>\n<!-- Generated from site/index.html, site/puzzle.js, and site/app.js. -->\n",
        1,
    )
    scripts = (
        ("  <script src=\"puzzle.js?v=three\"></script>", SOURCE / "puzzle.js"),
        ("  <script src=\"app.js?v=three\"></script>", SOURCE / "app.js"),
    )
    for tag, script in scripts:
        code = script.read_text(encoding="utf-8").rstrip()
        if "</script" in code.lower():
            raise ValueError(f"Cannot inline {script.name}: contains a closing script tag")
        replacement = f"  <script>\n{code}\n  </script>"
        if html.count(tag) != 1:
            raise ValueError(f"Expected one script tag for {script.name}")
        html = html.replace(tag, replacement)
    return html.rstrip() + "\n"


def main() -> int:
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    expected = build()
    output = args.output.expanduser().resolve()

    if args.check:
        if not output.is_file() or output.read_text(encoding="utf-8") != expected:
            print(f"Standalone HTML is out of date: {output}", file=sys.stderr)
            return 1
        print(f"Standalone HTML is current: {output}")
        return 0

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(expected, encoding="utf-8")
    print(f"Built standalone HTML: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

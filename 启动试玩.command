#!/bin/zsh
set -e
TASK_PACKAGE_DIR="${0:A:h}"
cd -- "$TASK_PACKAGE_DIR"
exec python3 tools/serve.py --open


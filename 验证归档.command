#!/bin/zsh
set -e
TASK_PACKAGE_DIR="${0:A:h}"
cd -- "$TASK_PACKAGE_DIR"
node tools/check-rules.cjs
node tools/check-controller.cjs
python3 tools/check-integrity.py
printf '\n全部检查完成。\n'


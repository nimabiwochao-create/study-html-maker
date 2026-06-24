#!/usr/bin/env bash
set -euo pipefail

PYTHON_BIN="${PYTHON_BIN:-/Users/mac/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3}"

if [ ! -x "$PYTHON_BIN" ]; then
  PYTHON_BIN="python3"
fi

"$PYTHON_BIN" app.py "${1:-5177}"

#!/usr/bin/env bash
# Hook PostToolUse: corre linter tras editar archivos TS/JS/Python.
# Feedback no bloqueante — reporta pero no falla el tool call.

set -uo pipefail

INPUT=$(cat)
TOOL=$(echo "$INPUT" | grep -o '"tool":"[^"]*"' | head -1 | cut -d'"' -f4 2>/dev/null || true)

if [[ "$TOOL" != "Write" && "$TOOL" != "Edit" && "$TOOL" != "str_replace_editor" ]]; then
  exit 0
fi

FILE=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('file_path','') or d.get('path',''))" 2>/dev/null || true)

if [ -z "$FILE" ]; then exit 0; fi

if [[ "$FILE" =~ \.(ts|tsx|js|jsx|mjs|cjs)$ ]]; then
  if command -v npx &>/dev/null && [ -f "package.json" ]; then
    echo "→ Linting $FILE ..."
    npx eslint "$FILE" --max-warnings 0 2>&1 || echo "⚠️  Lint warnings en $FILE (no bloqueante)"
  fi
fi

if [[ "$FILE" =~ \.py$ ]]; then
  if command -v ruff &>/dev/null; then
    echo "→ Linting $FILE ..."
    ruff check "$FILE" 2>&1 || echo "⚠️  Ruff warnings en $FILE (no bloqueante)"
  fi
fi

exit 0

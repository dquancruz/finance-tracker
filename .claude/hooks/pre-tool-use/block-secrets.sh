#!/usr/bin/env bash
# Hook PreToolUse: bloquea escrituras que contengan patrones de secretos.
# Se ejecuta antes de Write/Edit/Create en Claude Code.
# Input: JSON del tool call via stdin (Claude Code lo provee).

set -euo pipefail

INPUT=$(cat)

TOOL=$(echo "$INPUT" | grep -o '"tool":"[^"]*"' | head -1 | cut -d'"' -f4 2>/dev/null || true)
if [[ "$TOOL" != "Write" && "$TOOL" != "Edit" && "$TOOL" != "str_replace_editor" ]]; then
  exit 0
fi

CONTENT=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('content','') or d.get('new_string',''))" 2>/dev/null || true)

PATTERNS=(
  'GITHUB_TOKEN=[^$"`{][^"\n]{10,}'
  'JIRA_TOKEN=[^$"`{][^"\n]{10,}'
  'API_KEY=[^$"`{][^"\n]{10,}'
  'PASSWORD=[^$"`{][^"\n]{6,}'
  'SECRET=[^$"`{][^"\n]{10,}'
  'mongodb\+srv://[^"\n$]*:[^@"\n$]+@'
  'mongodb://[^"\n$]*:[^@"\n$]+@'
  'sk-[a-zA-Z0-9]{20,}'
)

for PATTERN in "${PATTERNS[@]}"; do
  if echo "$CONTENT" | grep -qP "$PATTERN" 2>/dev/null; then
    echo "❌ BLOCK: Posible secreto detectado (patrón: $PATTERN). Usa variables de entorno en .env.local." >&2
    exit 1
  fi
done

exit 0

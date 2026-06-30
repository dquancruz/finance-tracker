#!/usr/bin/env bash
# Genera los symlinks que apuntan al SSOT (AGENTS.md).
# Ejecutar desde la raíz del repo destino donde ya existe AGENTS.md.
set -euo pipefail

[ -f AGENTS.md ] || { echo "❌ Falta AGENTS.md (el SSOT). Créalo primero desde el template."; exit 1; }

# Claude Code
ln -sf AGENTS.md CLAUDE.md
# Gemini CLI
ln -sf AGENTS.md GEMINI.md
# GitHub Copilot
mkdir -p .github
ln -sf ../AGENTS.md .github/copilot-instructions.md
# Cursor (lee AGENTS.md nativo + symlink de mcp)
mkdir -p .cursor
ln -sf ../.mcp.json .cursor/mcp.json 2>/dev/null || true

echo "✅ Symlinks creados:"
echo "   CLAUDE.md → AGENTS.md"
echo "   GEMINI.md → AGENTS.md"
echo "   .github/copilot-instructions.md → ../AGENTS.md"
echo "   .cursor/mcp.json → ../.mcp.json"
echo ""
echo "ℹ️  Cursor y Codex leen AGENTS.md directamente (sin symlink de instrucciones)."

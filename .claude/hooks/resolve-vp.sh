#!/usr/bin/env bash
# Prints the path of a usable `vp`: PATH first, then the global install, then the project-local bin.
# Hooks run in non-interactive shells where ~/.bashrc (and so the Vite+ PATH entry) is not loaded.
for candidate in "$(command -v vp 2>/dev/null)" "$HOME/.local/share/vite-plus/bin/vp" "${CLAUDE_PROJECT_DIR:-.}/node_modules/.bin/vp"; do
  if [ -n "$candidate" ] && [ -x "$candidate" ]; then
    printf '%s\n' "$candidate"
    exit 0
  fi
done
exit 1

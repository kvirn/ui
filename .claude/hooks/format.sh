#!/usr/bin/env bash
# PostToolUse: format the edited file with Oxfmt via Vite+. Never blocks.
set -u
input="$(cat)"
file="$(printf '%s' "$input" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s).tool_input?.file_path??"")}catch{}})' 2>/dev/null)"
[ -z "$file" ] && exit 0
vp="$(bash "$(dirname "$0")/resolve-vp.sh")" || exit 0
case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.json|*.css|*.md|*.mdx) "$vp" fmt "$file" >/dev/null 2>&1 || true ;;
esac
exit 0

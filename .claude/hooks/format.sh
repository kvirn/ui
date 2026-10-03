#!/usr/bin/env bash
# PostToolUse: format the edited file with Oxfmt via Vite+, and record code edits for the
# Stop hook (verify.sh gates only sessions that touched code). Never blocks.
set -u
input="$(cat)"
fields="$(printf '%s' "$input" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);process.stdout.write((j.session_id??"")+"\t"+(j.tool_input?.file_path??""))}catch{}})' 2>/dev/null)"
session="${fields%%$'\t'*}"
file="${fields#*$'\t'}"
[ -z "$file" ] && exit 0
project="${CLAUDE_PROJECT_DIR:-.}"
if [ -n "$session" ]; then
  case "${file#"$project"/}" in
    packages/*|apps/*|tooling/*|*.ts|package.json|pnpm-workspace.yaml|pnpm-lock.yaml)
      touched="$(git -C "$project" rev-parse --path-format=absolute --git-path "kvirn-touched-$session" 2>/dev/null)"
      [ -n "$touched" ] && printf '%s\n' "$file" >>"$touched" ;;
  esac
fi
vp="$(bash "$(dirname "$0")/resolve-vp.sh")" || exit 0
case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.json|*.css|*.md|*.mdx) "$vp" fmt "$file" >/dev/null 2>&1 || true ;;
esac
exit 0

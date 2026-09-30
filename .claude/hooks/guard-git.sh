#!/usr/bin/env bash
# PreToolUse (Bash): block attempts to bypass git hooks, such as the Conventional Commits check (ADR-0012).
# Only real git/vp invocations are checked, so text that merely mentions a flag isn't blocked.
# Exit 2 = block and feed stderr back to Claude.
set -u
input="$(cat)"
command="$(printf '%s' "$input" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s).tool_input?.command??"")}catch{}})' 2>/dev/null)"
[ -z "$command" ] && exit 0

block() {
  echo "Blocked: $1 Git hooks enforce Conventional Commits (ADR-0012). Fix the commit message instead of bypassing the hook." >&2
  exit 2
}

# Drop quoted text (commit messages, strings), then split into single commands.
segments="$(printf '%s' "$command" | sed -E "s/\"[^\"]*\"//g; s/'[^']*'//g" | tr ';&|' '\n\n\n')"

while IFS= read -r segment; do
  segment="$(printf '%s' "$segment" | sed -E 's/^[[:space:]]+//')"
  # Leading VAR=value assignments, then git or vp.
  printf '%s' "$segment" | grep -qE '^([A-Za-z_][A-Za-z0-9_]*=[^ ]* +)*(git|vp)( |$)' || continue

  printf '%s' "$segment" | grep -qE '(^| )(HUSKY|VP_GIT_HOOKS|VITE_GIT_HOOKS)=0 ' &&
    block "That variable disables git hooks."
  printf '%s' "$segment" | grep -qE -- '(^| )--no-verify( |$)' && block "--no-verify skips git hooks."
  printf '%s' "$segment" | grep -qE 'core\.hooksPath' &&
    block "Changing core.hooksPath disables the hook dispatcher."
  printf '%s' "$segment" | grep -qE '(^| )vp +hooks +disable' && block "vp hooks disable turns the hooks off."
  # -n is short for --no-verify on git commit, including in clusters such as -an.
  printf '%s' "$segment" | grep -qE '(^| )git( +-c +[^ ]+)* +commit( .*)? -[a-zA-Z]*n[a-zA-Z]*( |$)' &&
    block "git commit -n skips git hooks."
done <<<"$segments"
exit 0

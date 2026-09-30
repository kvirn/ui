#!/usr/bin/env bash
# Stop hook: block finishing while vp check or changed tests fail.
# Exit 2 = block and feed stderr back to Claude. No-ops until the repo is bootstrapped.
set -u
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -f package.json ] || exit 0

# Only gate when code or config changed (docs-only sessions pass through).
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  changed="$(git status --porcelain -- packages apps tooling '*.ts' package.json pnpm-workspace.yaml pnpm-lock.yaml 2>/dev/null)"
  [ -z "$changed" ] && exit 0
fi

# A missing toolchain must block, never silently pass the gate.
if ! vp="$(bash "$(dirname "$0")/resolve-vp.sh")"; then
  echo "Quality gate cannot run: vp not found. Install Vite+ (https://viteplus.dev/guide/) or run 'pnpm install'." >&2
  exit 2
fi

log="$(mktemp)"
if ! "$vp" check >"$log" 2>&1; then
  { echo "Quality gate failed: vp check. Fix the root cause (do not weaken the gate):"; tail -n 60 "$log"; } >&2
  exit 2
fi
# --changed needs a commit to compare against; before the first commit, run everything.
test_scope="--changed"
git rev-parse --verify HEAD >/dev/null 2>&1 || test_scope=""
if ! "$vp" test run $test_scope >"$log" 2>&1; then
  { echo "Quality gate failed: vp test run $test_scope. Fix the root cause (do not skip or disable tests/axe rules):"; tail -n 80 "$log"; } >&2
  exit 2
fi
exit 0

#!/usr/bin/env bash
# Stop hook: block finishing while lint, types or tests fail on the working tree.
# Formatting never blocks (ADR-0048): the edit hook formats, and format drift is fixed before commit.
# Exit 2 = block and feed stderr back to Claude. No-ops until the repo is bootstrapped.
#
# One working tree per feature (a git worktree each), so every change in the tree is this session's.
set -u
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -f package.json ] || exit 0

# The code and config paths the hook gates on. Docs-only changes pass through.
code_paths=(packages apps tooling '*.ts' package.json pnpm-workspace.yaml pnpm-lock.yaml)

fingerprint_file=""
fingerprint=""
has_head=0
git rev-parse --verify HEAD >/dev/null 2>&1 && has_head=1

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  changed="$(git status --porcelain -- "${code_paths[@]}" 2>/dev/null)"
  [ -z "$changed" ] && exit 0
  # The hook fires on every turn: skip if the code is byte-identical to the last green run.
  fingerprint="$(
    {
      git rev-parse HEAD 2>/dev/null
      git diff HEAD --binary -- "${code_paths[@]}" 2>/dev/null
      git ls-files --others --exclude-standard -z -- "${code_paths[@]}" | xargs -0 -r sha256sum
    } | sha256sum | cut -d' ' -f1
  )"
  fingerprint_file="$(git rev-parse --git-path kvirn-verify-last-green)"
  [ -f "$fingerprint_file" ] && [ "$(cat "$fingerprint_file")" = "$fingerprint" ] && exit 0
fi

# A missing toolchain must block, never silently pass the gate.
if ! vp="$(bash "$(dirname "$0")/resolve-vp.sh")"; then
  echo "Quality gate cannot run: vp not found. Install Vite+ (https://viteplus.dev/guide/) or run 'pnpm install'." >&2
  exit 2
fi

# --changed needs a commit to compare against; before the first commit, run everything.
if [ "$has_head" = 1 ]; then test_command=("$vp" test run --changed); else test_command=("$vp" test run); fi

log="$(mktemp)"
if ! "$vp" check --no-fmt >"$log" 2>&1; then
  { echo "Quality gate failed: vp check (lint and types). Fix the root cause (do not weaken the gate):"; tail -n 60 "$log"; } >&2
  exit 2
fi
if ! "${test_command[@]}" >"$log" 2>&1; then
  { echo "Quality gate failed: vp test. Fix the root cause (do not skip or disable tests/axe rules):"; tail -n 80 "$log"; } >&2
  exit 2
fi

# Record the green state so an unchanged tree isn't re-tested on the next turn.
[ -n "$fingerprint_file" ] && printf '%s\n' "$fingerprint" >"$fingerprint_file"
exit 0

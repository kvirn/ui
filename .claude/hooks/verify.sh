#!/usr/bin/env bash
# Stop hook: block finishing while vp check or tests fail on this session's own changes (ADR-0043).
# Exit 2 = block and feed stderr back to Claude. No-ops until the repo is bootstrapped.
#
# This session's changes are the changed or new files in the working tree whose content differs
# from the snapshot session-start.sh took (session-scope.sh), so work that was already in progress,
# such as another agent's files, doesn't block this one. Without a snapshot, or before the first
# commit, it checks the whole tree as before.
set -u
input="$(cat)"
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -f package.json ] || exit 0
# shellcheck source=session-scope.sh
. "$(dirname "$0")/session-scope.sh"

fingerprint_file=""
fingerprint=""
scoped=()
has_head=0
git rev-parse --verify HEAD >/dev/null 2>&1 && has_head=1

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  id="$(session_id_of "$input")"
  base="$(scope_directory)/${id}.base"
  if [ "$has_head" = 1 ] && [ -n "$id" ] && [ -f "$base" ]; then
    mine="$(comm -13 <(sort "$base") <(dirty_files | sort))"
    # Only gate when code or config changed (docs-only sessions pass through).
    [ -z "$mine" ] && exit 0
    while IFS= read -r line; do scoped+=("${line#* }"); done <<<"$mine"
    fingerprint="$({ git rev-parse HEAD; printf '%s\n' "$mine"; } | sha256sum | cut -d' ' -f1)"
  else
    changed="$(git status --porcelain -- "${code_paths[@]}" 2>/dev/null)"
    [ -z "$changed" ] && exit 0
    fingerprint="$(
      {
        git rev-parse HEAD 2>/dev/null
        git diff HEAD --binary -- "${code_paths[@]}" 2>/dev/null
        git ls-files --others --exclude-standard -z -- "${code_paths[@]}" | xargs -0 -r sha256sum
      } | sha256sum | cut -d' ' -f1
    )"
  fi
  # The hook fires on every turn: skip if the code is byte-identical to the last green run.
  fingerprint_file="$(git rev-parse --git-path "kvirn-verify-last-green${id:+-$id}")"
  [ -f "$fingerprint_file" ] && [ "$(cat "$fingerprint_file")" = "$fingerprint" ] && exit 0
fi

# A missing toolchain must block, never silently pass the gate.
if ! vp="$(bash "$(dirname "$0")/resolve-vp.sh")"; then
  echo "Quality gate cannot run: vp not found. Install Vite+ (https://viteplus.dev/guide/) or run 'pnpm install'." >&2
  exit 2
fi

log="$(mktemp)"
if [ "${#scoped[@]}" -gt 0 ]; then
  scope_note="on this session's ${#scoped[@]} changed file(s). Failures in other files aren't yours: don't fix them, report them (ADR-0043)"
  check_command=("$vp" check --no-error-on-unmatched-pattern "${scoped[@]}")
  test_command=("$vp" test related --run --passWithNoTests "${scoped[@]}")
else
  scope_note="on the whole tree"
  check_command=("$vp" check)
  # --changed needs a commit to compare against; before the first commit, run everything.
  if [ "$has_head" = 1 ]; then test_command=("$vp" test run --changed); else test_command=("$vp" test run); fi
fi

if ! "${check_command[@]}" >"$log" 2>&1; then
  { echo "Quality gate failed: vp check, $scope_note. Fix the root cause (do not weaken the gate):"; tail -n 60 "$log"; } >&2
  exit 2
fi
if ! "${test_command[@]}" >"$log" 2>&1; then
  { echo "Quality gate failed: vp test, $scope_note. Fix the root cause (do not skip or disable tests/axe rules):"; tail -n 80 "$log"; } >&2
  exit 2
fi

# Record the green state so an unchanged tree isn't re-tested on the next turn.
[ -n "$fingerprint_file" ] && printf '%s\n' "$fingerprint" >"$fingerprint_file"
exit 0

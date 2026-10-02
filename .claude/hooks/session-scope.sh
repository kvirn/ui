#!/usr/bin/env bash
# Shared by session-start.sh and verify.sh (ADR-0043). Source it, don't run it.
# A session's own changes are the files in the git working tree whose content differs from a
# snapshot taken when the session started. Git alone lists everyone's changes, so the snapshot
# is what leaves out work that was already in progress, such as another agent's files.

# The code and config paths the Stop hook gates on.
code_paths=(packages apps tooling '*.ts' package.json pnpm-workspace.yaml pnpm-lock.yaml)

# The session id from a hook's JSON on stdin (empty if there isn't one).
session_id_of() {
  printf '%s' "$1" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(String(JSON.parse(s).session_id??"").replace(/[^A-Za-z0-9_-]/g,""))}catch{}})' 2>/dev/null
}

scope_directory() { git rev-parse --git-path kvirn-session; }

# One "<content hash> <path>" line for every changed or new file that still exists, in the code
# paths, sorted by path. Paths with newlines aren't supported.
dirty_files() {
  {
    git diff HEAD --name-only --diff-filter=d -- "${code_paths[@]}" 2>/dev/null
    git ls-files --others --exclude-standard -- "${code_paths[@]}" 2>/dev/null
  } | sort -u | while IFS= read -r path; do
    [ -f "$path" ] && printf '%s %s\n' "$(git hash-object -- "$path")" "$path"
  done
}

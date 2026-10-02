#!/usr/bin/env bash
# SessionStart: snapshot the files that are already changed, so the Stop hook can tell this
# session's changes from work that was in progress before it (ADR-0043). Never blocks.
# A resumed or compacted session keeps its first snapshot.
set -u
input="$(cat)"
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
# shellcheck source=session-scope.sh
. "$(dirname "$0")/session-scope.sh"
id="$(session_id_of "$input")"
[ -z "$id" ] && exit 0
directory="$(scope_directory)"
mkdir -p "$directory" 2>/dev/null || exit 0
[ -f "$directory/$id.base" ] || dirty_files >"$directory/$id.base" 2>/dev/null
# Snapshots of old sessions are noise: keep a week.
find "$directory" -name '*.base' -mtime +7 -delete 2>/dev/null
exit 0

#!/usr/bin/env bash
# PreToolUse (Bash): subagents never run checks, tests, e2e or builds. The main session (orchestrator) runs
# them once, after every subagent has reported done, so parallel agents don't exhaust CPU and memory.
# Subagent calls carry an agent_id in the hook input; main-session calls don't.
# Two exceptions go through guard-test-runner.mjs, which allows scoped, sequential, foreground runs only:
#   test-runner        one scoped gate for triage, only when the tree is quiet (no run going, no recent edits)
#   component-engineer `vp check` and `vp test run` on its own files; its own edits are what it tests, so
#                      the quiet window is 0 and only the no-concurrent-run check applies
# Exit 2 = block and feed stderr back to Claude.
set -u
input="$(cat)"
read -r agent_id agent_type command < <(printf '%s' "$input" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);process.stdout.write((j.agent_id||"-")+" "+(j.agent_type||"-")+" "+String(j.tool_input?.command??"").replace(/\n/g," "))}catch{process.stdout.write("- - ")}})' 2>/dev/null)
[ "${agent_id:--}" = "-" ] && exit 0
[ -z "${command:-}" ] && exit 0
case "${agent_type:--}" in
  test-runner)
    printf '%s' "$input" | node "$(dirname "$0")/guard-test-runner.mjs"
    exit $?
    ;;
  component-engineer)
    printf '%s' "$input" | KVIRN_TEST_QUIET_SECONDS=0 node "$(dirname "$0")/guard-test-runner.mjs"
    exit $?
    ;;
esac

segments="$(printf '%s' "$command" | sed -E "s/\"[^\"]*\"//g; s/'[^']*'//g" | tr ';&|' '\n\n\n')"
while IFS= read -r segment; do
  segment="$(printf '%s' "$segment" | sed -E 's/^[[:space:]]+//')"
  if printf '%s' "$segment" | grep -qE '^([A-Za-z_][A-Za-z0-9_]*=[^ ]* +)*(vp +(check|test|lint|fmt|build|run)|pnpm +(exec +)?(vitest|playwright|tsc|storybook)|npx +(vitest|playwright|tsc))( |$)'; then
    echo "Blocked: subagents don't run checks, tests, e2e or builds. Finish your work and report the files changed; the orchestrator runs every gate once, after all subagents are done." >&2
    exit 2
  fi
done <<<"$segments"
exit 0

#!/usr/bin/env bash
# PreToolUse (Bash): subagents never run checks, tests, e2e or builds. The main session (orchestrator) runs
# them once, after every subagent has reported done, so parallel agents don't exhaust CPU and memory.
# Subagent calls carry an agent_id in the hook input; main-session calls don't.
# The one exception is the test-runner subagent: guard-test-runner.mjs lets it run scoped,
# sequential tests when the tree is quiet, and blocks everything else.
# Exit 2 = block and feed stderr back to Claude.
set -u
input="$(cat)"
read -r agent_id agent_type command < <(printf '%s' "$input" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);process.stdout.write((j.agent_id||"-")+" "+(j.agent_type||"-")+" "+String(j.tool_input?.command??"").replace(/\n/g," "))}catch{process.stdout.write("- - ")}})' 2>/dev/null)
[ "${agent_id:--}" = "-" ] && exit 0
[ -z "${command:-}" ] && exit 0
if [ "${agent_type:--}" = "test-runner" ]; then
  printf '%s' "$input" | node "$(dirname "$0")/guard-test-runner.mjs"
  exit $?
fi

segments="$(printf '%s' "$command" | sed -E "s/\"[^\"]*\"//g; s/'[^']*'//g" | tr ';&|' '\n\n\n')"
while IFS= read -r segment; do
  segment="$(printf '%s' "$segment" | sed -E 's/^[[:space:]]+//')"
  if printf '%s' "$segment" | grep -qE '^([A-Za-z_][A-Za-z0-9_]*=[^ ]* +)*(vp +(check|test|lint|fmt|build|run)|pnpm +(exec +)?(vitest|playwright|tsc|storybook)|npx +(vitest|playwright|tsc))( |$)'; then
    echo "Blocked: subagents don't run checks, tests, e2e or builds. Finish your work and report the files changed; the orchestrator runs every gate once, after all subagents are done." >&2
    exit 2
  fi
done <<<"$segments"
exit 0

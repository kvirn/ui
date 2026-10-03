#!/usr/bin/env bash
# PreToolUse (Bash): an e2e run must name the spec it exercises (AGENTS.md, hard rule 12). A path-less `vp run e2e`
# runs every spec and takes a lot of CPU, memory and time; the full run belongs to CI and the WCAG
# sweep specialist. Applies to the main session and to subagents.
# Exit 2 = block and feed stderr back to Claude.
set -u
input="$(cat)"
printf '%s' "$input" | node -e '
let s = "";
process.stdin.on("data", (d) => (s += d)).on("end", () => {
  let command = "";
  try { command = String(JSON.parse(s).tool_input?.command ?? ""); } catch { process.exit(0); }
  // Drop quoted text, then split into single commands.
  const segments = command.replace(/"[^"]*"/g, "").replace(/\x27[^\x27]*\x27/g, "").split(/[;&|\n]+/);
  // Flags whose next token is a value, not a spec.
  const valueFlags = new Set(["--project", "-p", "--grep", "-g", "--grep-invert", "--workers", "-j", "--reporter", "--retries", "--repeat-each", "--timeout", "--shard", "--max-failures", "-x", "--config", "-c", "--output", "--tsconfig", "--trace", "--ui-host", "--ui-port"]);
  // A filter this broad still matches every spec.
  const broad = new Set([".", "./", "e2e", ".e2e", ".e2e.ts", "e2e.ts", "ts", "apps", "src", "storybook", "components", "apps/storybook", "apps/storybook/src", "apps/storybook/src/components"]);
  for (const raw of segments) {
    const tokens = raw.trim().split(/\s+/).filter(Boolean);
    while (tokens.length > 0 && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[0])) tokens.shift();
    const [first, second, third] = tokens;
    let rest = null;
    if (first === "vp" && second === "run" && third === "e2e") rest = tokens.slice(3);
    else if (first === "pnpm" && (second === "e2e" || (second === "run" && third === "e2e"))) rest = tokens.slice(second === "e2e" ? 2 : 3);
    else if (first === "pnpm" && second === "exec" && third === "playwright") rest = tokens.slice(3);
    else if (first === "pnpm" && second === "playwright") rest = tokens.slice(2);
    else if (first === "npx" && second === "playwright") rest = tokens.slice(2);
    else if (first === "playwright") rest = tokens.slice(1);
    if (rest === null) continue;
    if (rest[0] === "test") rest.shift();
    else if (rest[0] !== undefined && !rest[0].startsWith("-") && /^(install|show-report|codegen|merge-reports|show-trace|--version)$/.test(rest[0])) continue;
    const specs = [];
    for (let i = 0; i < rest.length; i++) {
      const token = rest[i];
      if (/^\d*>/.test(token) || token === "--") continue;
      if (token.startsWith("-")) {
        if (valueFlags.has(token)) i++;
        continue;
      }
      specs.push(token);
    }
    if (specs.some((spec) => !broad.has(spec.replace(/\/+$/, "")))) continue;
    console.error("Blocked: name the e2e spec you are working on, e.g. `vp run e2e apps/storybook/src/components/<name>/<name>.e2e.ts --project chromium`. A path-less (or directory-wide) run executes every spec and costs a lot of CPU, memory and time. Test only what you changed. The full run belongs to CI and the WCAG sweep specialist (AGENTS.md, hard rule 12).");
    process.exit(2);
  }
});
'

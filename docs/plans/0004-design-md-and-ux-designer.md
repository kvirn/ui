# Plan 0004: DESIGN.md, design skill and ux-designer agent

- **Status:** Done
- **Owner:** Maintainer
- **Created:** 2026-09-30 · **Target:** M0
- **Related:** ADR-0011, ADR-0004, ADR-0006

## Goal

Humans and agents design against one written visual language that fits Nordic municipalities, and blocks, flows and visual changes get a design spec before they are planned.

## Non-goals

- Implementing the tokens in `packages/theme/src/tokens.ts`. That's a follow-up plan.
- A brand. The default is neutral and rebrandable.
- Changing headless packages (they ship zero CSS).

## Design

- Root `DESIGN.md` in the DESIGN.md format: front matter tokens for the light theme, and prose sections for four themes, typography, layout and density, elevation and motion, shapes, components, content and do's and don'ts.
- `.claude/skills/design/` with `SKILL.md` and three references: service patterns, spec template and review checklist.
- `.claude/agents/ux-designer.md`: design and review modes, writes only to `docs/design/`, draft ADRs and `DESIGN.md`.
- `docs/design/README.md` as the spec index.

## Tasks

- [x] `DESIGN.md`, with every colour pair measured via `packages/theme/src/contrast.ts`
- [x] `design` skill and references
- [x] `ux-designer` agent
- [x] `AGENTS.md`, `CLAUDE.md` and `docs/README.md` updated (repo map, workflow table, skills, agents, conventions)
- [x] ADR-0011 (Proposed)

## Risks & open questions

- `DESIGN.md` and `tokens.ts` can drift until the tokens are implemented.
- The accent colour is a proposal. The maintainer may want a different hue.

## Done when

- [x] `vp check` clean
- [ ] Follow-up plan for implementing the tokens in `packages/theme`

---
name: design
description: UX and visual design procedure for KvirnUI — framing a problem, user flows, content, layout, states and handoff specs for blocks, the default theme, stories and the docs site, following DESIGN.md. Use when designing or reviewing anything users see: a new block or flow, a visual or token change, a component's default-theme styling, or a design critique of a story or page.
when_to_use: new block, e-service flow, form design, page layout, design spec, wireframe, DESIGN.md or token change, rebrand/theming guidance, design review, visual critique, UX copy for a flow, usability test plan
---

# Design (UX and visual)

Design for the resident who uses the service once, on a phone, under stress, in their second language, with a screen reader or a tremor. If it works for them, it works for everyone. `DESIGN.md` is the visual source of truth, and `.claude/skills/accessibility/` is the behaviour source of truth. This skill is how you get from a problem to a spec an engineer can build without guessing.

**You design; you don't implement.** Output is a spec in `docs/design/<slug>.md` (from [spec-template.md](references/spec-template.md)), linked from the plan. Code belongs to `component-engineer`.

## Procedure: designing something new

1. **Frame the problem.** Fill in the brief at the top of the spec:
   - Who: residents, staff or both (see [service-patterns.md](references/service-patterns.md#who-we-design-for)). Name the hardest-case user.
   - The job: what they are trying to get done, in their words, and what happens before and after.
   - Context: device, frequency (once a year or fifty times a day), time pressure, stress.
   - Constraints: law (WAD, accessibility statement, GDPR, use the `regulations` skill), data, integrations (BankID, Suomi.fi, ID-porten).
   - Success: how we'd know it works (task completion, errors, time, support calls).
   - **Never invent research.** If there is no evidence, write the claim as an _assumption_ and add a research question. Ask the user for real findings.
2. **Look before you draw.** Reuse beats invention.
   - `DESIGN.md`, `docs/design/`, the roadmap and the existing components and blocks.
   - The APG pattern (`accessibility` skill) for anything interactive.
   - Public-sector prior art: GOV.UK Design System, Designsystemet (NO), the Suomi.fi design system. Cite what you borrow and why it fits.
3. **Flow first, pixels last.** Map the task as numbered steps (Mermaid or a list), including every unhappy path: validation errors, empty and loading states, no results, session timeout (2.2.1), save and return later, going back, a failed integration and the "I don't qualify" exit. Apply the one-thing-per-page pattern for residents.
4. **Write the content before the layout.** Real headings, labels, hints, errors and button text in plain language, in `en` and `sv`, with the longest `fi` string where length matters. Every string becomes an i18n key (AGENTS.md hard rule 4). Use `design:ux-copy` if it's available for a second opinion.
5. **Structure.** A text wireframe per breakpoint (320px, 40rem, 64rem): landmarks, heading outline (h1 to h3), reading order equal to focus order, and where the primary action sits. Keep it low fidelity: boxes and words, not colours.
6. **Specify.** For each part: which DESIGN.md tokens and component styles it uses, a state matrix (default, hover, focus-visible, active, disabled, invalid, loading, selected, open, empty), density, all four themes plus forced colours, RTL, motion and reduced motion, and the accessibility annotations (names, roles, Tab stops and keys per the `keyboard` skill, focus moves, announcements). The annotations are the draft of the plan's accessibility contract, not a replacement for it.
   - Use only semantic tokens. If you need a new token or a changed value, propose it in the spec, check contrast with `vp run theme:check` or `packages/theme/src/contrast.ts`, and draft an ADR.
7. **Validate before handoff.** Walk the spec through [review-checklist.md](references/review-checklist.md) and fix every blocker. Add a usability test plan (tasks, participants including assistive-technology users and people with low digital confidence). Mark it `pending`: you can plan research, but never claim it happened.
8. **Hand off.** Link the spec from the plan (`docs/plans/NNNN-*.md` → Design section), list open questions for the user, and add the spec to `docs/design/README.md`.

## Procedure: design review

Review a story, block, page or screenshot against `DESIGN.md` and [review-checklist.md](references/review-checklist.md).

1. Read the spec, the plan and `DESIGN.md`. Read the code only for classes, tokens and `data-*` styling.
2. If there's a running Storybook (`vp run storybook`, port 6006), take screenshots into a temp directory, never into the repo, and look at them with Read:
   `pnpm exec playwright screenshot --viewport-size=320,800 --full-page "http://localhost:6006/iframe.html?id=<story-id>&viewMode=story" /tmp/kv-<story>-320.png`
   Repeat at 1280 wide and with `--color-scheme=dark`. The forced-colours check comes from the e2e project `chromium-forced-colors`.
3. Report findings as `location — issue — DESIGN.md rule or WCAG SC — who it affects — fix`, grouped by severity:
   - **Blocker:** fails WCAG 2.2 AA, breaks a DESIGN.md rule that protects accessibility, or stops a user completing the task.
   - **Major:** users will likely struggle, make errors or lose trust.
   - **Minor:** inconsistent with DESIGN.md, but users can cope.
   - **Polish:** alignment, rhythm, optical tweaks.
4. Say what works, too, so it doesn't get "fixed" away.

## Common mistakes (reject)

- Designing the happy path only. Errors, empty and timeout states are the job.
- Lorem ipsum or English-only mock-ups. Finnish and Sámi will break the layout you didn't test.
- Low-contrast "elegant" secondary text, hairline control borders or placeholder-as-label.
- Colour as the only signal for status, selection, errors or required fields.
- Hover-only affordances, tooltips holding essential information, or icon-only buttons for anything that isn't universal.
- Several primary buttons, or the primary action in a different place on each step.
- Dense staff-tool layouts reused for resident services.
- Inventing a component or pattern when APG, an existing KvirnUI part or a public-sector design system already solves it.
- A modal for something that should be a page, especially on mobile.
- Hard-coded copy in the design with no i18n key, or copy that blames the user.
- Claiming a design "is compliant" or "was tested with users" without evidence.

## References

- `DESIGN.md`: tokens, themes, typography, layout, components, do's and don'ts
- [references/service-patterns.md](references/service-patterns.md): who we design for, public-sector service patterns and heuristics
- [references/spec-template.md](references/spec-template.md): the design spec template (`docs/design/<slug>.md`)
- [references/review-checklist.md](references/review-checklist.md): design review and self-check
- `.claude/skills/accessibility/`: behaviour, ARIA and the `*.a11y.md` contract
- `.claude/skills/keyboard/`: Tab stops, keys per APG pattern and the APG keyboard practice (ADR-0039)
- `.claude/skills/regulations/`: accessibility statement, feedback and consent blocks, and any claim

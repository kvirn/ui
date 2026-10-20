# Plan 0143: A coloured testing status badge on component pages

- **Status:** In progress (look in a browser pending)
- **Owner:** lead → component-engineer
- **Created:** 2026-10-18 · **Target:** docs site
- **Related:** Plan 0139 (derived status), `docs/accessibility.md` §Derived status, `apps/docs/lib/contract-parser.ts` (`deriveStatus`), `design`, `theme-css` skills

## Goal

A reader sees at a glance, from a colour and a word, how far a component's testing has got. The status is the one already derived from the AT test record. Nothing is stated by hand.

## Non-goals

- No new status words, no change to `deriveStatus`, no change to the AT matrix rules.
- No new token, Badge variant or `theme.css` change.
- No docs-site tests (`AGENTS.md`: `apps/docs` has none). Checked by `vp check`, `theme:check` and looking at the page.

## Background

Component pages show a Testing fact (`apps/docs/components/component-page.tsx:169-220`): the word plus tier counts, as plain text. `Badge` from `@kvirn-ui/react` has `danger`, `warning` and `success` variants, each with contrast pairs on its own subtle background in all four themes (Badge text is `text` and `heading` on the subtle backgrounds, `packages/theme/src/contrast-requirements.ts:73-75`).

## Design

The word is always shown as text in the badge, and the counts stay beside it, so colour never carries the meaning alone (WCAG 1.4.1).

| Derived status                        | Badge text       | Variant   |
| ------------------------------------- | ---------------- | --------- |
| no word (Automated tier not all done) | Not yet verified | `danger`  |
| `Automated`                           | Automated        | `warning` |
| `Agent-verified`                      | Agent-verified   | `warning` |
| `AT-verified`                         | AT-verified      | `success` |
| `Release-tested`                      | Release-tested   | `success` |

- A maintainer override (`Planning`, `Alpha`, `Beta`, `Stable`) replaces the word: see Plan 0146 for the words and variants.
- The badge text comes from `apps/docs/messages` (all docs locales that exist), not a literal in the component.
- The mapping is one small pure function next to `testingSummary`, not in the library.
- The counts sentence stays as the Fact's text after the badge: `Automated 5 of 5, Core 2 of 2, Release n/a`.

## Tasks

- [x] Map status word → badge text and variant; render `<Badge variant>` in the Testing fact, counts after it
- [x] Message keys for the badge texts in the docs messages
- [x] `docs/accessibility.md` §Derived status: one sentence that the page shows the status as a coloured badge, with the mapping
- [ ] `vp check` and `theme:check` green; looking at a page in light, dark, contrast themes, forced colours and 320px is pending (a person)
- [x] `accessibility-reviewer` (APPROVE after the hidden separator fix) on the diff
- [x] Parser: `fail` is an allowed cell value and never done (`doneResult`/`doneAgent` unchanged)
- [x] AT test record only: Result `pass` renders a `success` Badge, `fail` a `danger` Badge, word kept
- [x] `docs/accessibility.md` §Cell vocabulary: one sentence on `fail` and the Result badges

## Decisions

- Reuse the existing Badge variants. The maintainer wanted red (none), yellow (Automated), light green (Core), green (Release); the library has one green, so AT-verified and Release-tested share `success` and differ by word (maintainer chose this, 2026-10-18). No token change.
- `Agent-verified` is yellow: an agent check alone is not a person on a real AT (lead recommendation, the maintainer's mapping did not name it).
- "None" is red and reads "Not yet verified", so a new component looks unfinished until its Automated tier is done.
- No `ux-designer` spec: the change maps existing variants onto an existing fact and adds no layout.

- The status and counts need a text boundary for screen readers, not only the pill: a hidden ". " separator from the docs messages (reviewer finding, fixed).
- The Result badges are an opt-in `resultBadges` prop of `Blocks`, set only by `ContractTesting`, matching the column named `Result`; other tables are untouched.

## Risks & open questions

- A reader may take red as "broken". The text says "Not yet verified".
- Divider's Core rows have a Human `pass` with no versions; the reviewer blocked that. The badge shows what the table computes, so fix the table first (separate from this plan).

## Rollout

Docs site only.

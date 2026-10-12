# Plan NNNN: <Title>

<!-- Under 250 lines: a Sonnet agent reads this at every spawn. Link prior art, don't paste it. The contract table is the spec. -->

- **Status:** Draft <!-- Draft | Approved | In progress | Done | Abandoned -->
- **Owner:** <name / agent>
- **Created:** YYYY-MM-DD · **Target:** <milestone>
- **Related:** plans, skills, issue #NN

## Goal

One or two sentences on the outcome, stated from the user's point of view.

## Non-goals

- …

## Background

Context, links to APG patterns, WCAG SCs, prior art (Headless UI, Radix, React Aria, GOV.UK) and user research.

## Design

### API sketch

```tsx
// hook + compound component usage
```

### Accessibility contract (draft)

Keyboard per the `keyboard` skill: focus strategy, selection follows focus, arrows wrap, shortcuts, then the keys.

| Key       | Action |
| --------- | ------ |
| Tab       |        |
| Shift+Tab |        |

- Roles / ARIA:
- Focus management:
- Announcements:
- WCAG SCs:

### i18n strings

| Key | en  | sv  |
| --- | --- | --- |

### Theming surface

`data-*` attributes and tokens exposed.

## Tasks

- [ ] Core machine + unit tests
- [ ] React hook + component
- [ ] i18n strings (all locales)
- [ ] Stories (all states, RTL, forced-colors, a `Keyboard` story, `parameters.a11yContract`)
- [ ] Vitest browser tests: every keyboard row, ARIA state and axe
- [ ] AT matrix run + `*.a11y.md`
- [ ] Docs page
- [ ] Changeset

## Decisions

The options weighed and the one chosen, then each decision taken during implementation. Anything that needs the maintainer's approval (a new dependency, a gate change, an APG deviation, a token change) is marked. When a decision changes a rule, the owning skill or doc changes in the same PR.

- …

## Risks & open questions

- …

## Testing strategy

Anything beyond the standard pyramid in `docs/engineering.md`.

## Rollout

Version, flags, migration or codemod if needed.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated

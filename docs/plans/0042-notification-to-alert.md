# Plan 0042: Rename Notification to Alert?

- **Status:** Draft (blocked on a maintainer decision that overturns `docs/design/notification.md` §3.1)
- **Owner:** orchestrator → component-engineer
- **Created:** 2026-10-04 · **Target:** M2
- **Related:** [0020](0020-notification.md), `docs/design/notification.md`, `DESIGN.md`, `accessibility`, `api-conventions` skills

## Goal

The status box component has the name most libraries and adopters expect.

## Non-goals

- No behaviour change: the root keeps no `role`, `aria-live` or `aria-atomic`, and `announce` still goes through the Announcer.
- `AlertDialog` (planned, M2) is a separate component and is not touched.

## Background

The maintainer finds `Alert` more common in other libraries (Designsystemet and Aksel, the plan 0020 prior art, both say Alert). `docs/design/notification.md` §3.1 chose `Notification` for three reasons, repeated in `DESIGN.md:463`:

1. `alert` is an assertive ARIA role, and the component is not assertive by default.
2. It collides with `AlertDialog`.
3. It invites `role="alert"` on everything.

Assessment: (2) is weak, since `Alert` and `AlertDialog` are different words in every library that has both (Chakra, Radix). (1) and (3) are real but already handled: `use-notification.ts:219-225` warns on `role="alert"`, `role="status"` and `aria-live`, and the docs say so. The one lasting cost is that the Announcer's assertive region is a `<div role="alert">`, so `getByRole('alert')` keeps meaning only that region.

## Design

### Rename map

| Before                                                                                                     | After                                                                |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `Notification.Root/Info/Success/Warning/Danger/Title/Body/Actions`, `useNotification`                      | `Alert.*`, `useAlert`                                                |
| `packages/react/src/notification/`, `apps/storybook/src/components/notification/`                          | `…/alert/`                                                           |
| i18n namespace `notification` (`infoPrefix` …, six locales)                                                | `alert`                                                              |
| `kv-notification*`, `--kv-notification-*`, `notificationBackgrounds`                                       | `kv-alert*`, `--kv-alert-*`, `alertBackgrounds` (public theming API) |
| `docs/design/notification.md`, `DESIGN.md` (27 lines), roadmap, skills, tooling `component-naming.test.ts` | follow                                                               |

About 1,300 lines across `react`, `i18n`, `theme`, `storybook` and docs. Unrelated hits stay: `notifications` in `core` tests, `disableWhatsNewNotifications`, and the word in `table.md` and `overlays-and-lists`.

## Tasks

- [ ] Maintainer decision: rename (recommended) or keep, then edit §3.1 of the design doc and `DESIGN.md:463` in the same PR
- [ ] `naming.test.tsx` and `component-naming.test.ts` first, then rename code, i18n, theme, stories, e2e
- [ ] Docs, contracts (`.a11y.md` row 4.1.3 wording), skills, roadmap, changeset (breaking)

## Decisions

- **Recommendation: rename,** keeping every behaviour, and rewrite §3.1 to say the name `Alert` is the component and `role="alert"` stays an Announcer detail. **Needs the maintainer's approval** (it reverses a recorded decision, and renames public classes and tokens).
- Do it after 0041 (HelpText) lands, or in a separate worktree, to limit rebase conflicts.

## Risks & open questions

- Adopters will read `Alert` as `role="alert"`. The docs page needs a one-line "this is not assertive" note at the top.

## Rollout

Breaking in 0.x, no alias, rename map in the changeset.

## Done when

- [ ] All quality gates in AGENTS.md pass, including `i18n:check` and `theme:check`
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated

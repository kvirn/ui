# Plan 0042: Rename Notification to Alert?

- **Status:** Done (maintainer approved 2026-10-04; gates green 2026-10-05), manual AT `pending`
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

- [x] Maintainer decision: rename (accepted, 2026-10-04). §3.1 of the design doc (now `docs/design/alert.md`) and `DESIGN.md` Components are rewritten in the same change
- [x] `naming.test.tsx` and `component-naming.test.ts` first, then rename code, i18n, theme, stories, e2e
- [x] Docs, contracts (`.a11y.md` row 4.1.3 wording), skills, roadmap, changeset (breaking)

## Decisions

- **Decided (maintainer, 2026-10-04): rename,** keeping every behaviour, and §3.1 now says the name `Alert` is the component and `role="alert"` stays an Announcer detail. It reverses a recorded decision and renames public classes and tokens.
- **Hard rename, no alias.** Breaking in 0.x (minor), with the rename map in `.changeset/notification-becomes-alert.md`. The older `.changeset/notification.md` (unreleased) is left as written: the new changeset supersedes its names.
- **The "not assertive" note** is the first paragraph of `alert.md` (kept by `usageGuide`, so it opens the Docs page), and is recorded in the design spec §4.3.
- **Historical documents keep their old names:** plans 0020, 0038, 0040 and the changeset above still say Notification. Plan 0020 has a note and its design-doc links point to `alert.md`. The GOV.UK "notification banner" stays under its own name in the prior-art table.
- **Renamed in the table docs too.** `packages/react/src/table/table.md` and `docs/design/table.md` name `Notification.Info` and `Notification.Danger` as components, so they now say `Alert.Info` and `Alert.Danger`. Unrelated hits are untouched: `notifications` in core tests and `create-table.ts`, `disableWhatsNewNotifications`, and `overlays-and-lists/SKILL.md`.
- Done on the main tree while other agents were editing (Navigation and Link, HelpText and DateInput renames), with targeted replacements.

## Risks & open questions

- Adopters will read `Alert` as `role="alert"`. The docs page needs a one-line "this is not assertive" note at the top.

## Rollout

Breaking in 0.x, no alias, rename map in the changeset.

## Done when

- [x] All quality gates in AGENTS.md pass, including `i18n:check` and `theme:check` (2026-10-05: `vp check`, `vp test run`, every `vp run e2e` spec on chromium, `i18n:check`, `theme:check` green)
- [x] Plan tasks ticked, `docs/roadmap.md` status updated

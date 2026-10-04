# Plan 0020: Notification

- **Status:** Done (alpha. Manual AT pending before beta. The decision is still to be accepted by the maintainer)
- **Owner:** Maintainer / component-engineer
- **Created:** 2026-10-02 · **Target:** M1
- **Related:** design spec [notification.md](../design/notification.md)

## Goal

Adopters show a status message (info, success, warning or danger) with one component that carries the icon, the status word and the colours, and that announces itself correctly. Status is no longer a variant of Section or Card, and the docs use one vocabulary: Surface is a token, Section a region, Card one entity, Notification a status message.

## Non-goals

- Toast (transient, M3), `Field.ErrorMessage`, inset text and the error summary block (M4, built on a danger Notification). The spec §3.2 and §3.3 say how each relates.
- Dismissing. Not in v1 (spec §7.5).
- A live region of its own. Announcing goes through `useAnnouncer()`.

## Background

- WCAG: 1.4.1 (status never by colour alone), 1.4.3 and 1.4.11 (pairs on the `-subtle` backgrounds), 1.3.1 and 2.4.6 (the heading level is the consumer's), 4.1.3 (status messages), 2.4.11 and 2.4.13 (focus ring).
- Prior art: GOV.UK notification banner, warning text and error summary; Designsystemet Alert; Aksel LocalAlert and GlobalAlert.

## Design

Design spec: [docs/design/notification.md](../design/notification.md) (ux-designer, Draft). Name `Notification`. Decisions (2026-10-02, maintainer): choices are classes (the classes-not-props rule holds, no exception), so the look is CSS on `kv-notification--info|success|warning|danger` and easy to drop or restyle. A plain `Notification.Root` (`kv-notification` only), plus four ready-made roots `Notification.Info|Success|Warning|Danger` (named exports `NotificationInfo`, …) that add the class, the icon and the status word from one table, so colour, icon and word cannot disagree. Parts Title (required, `h2` by default), Body, Actions, and `useNotification({ variant })`. No `variant` prop on Root in v1 (the only allowed name if one is added later). Four i18n keys `notification.infoPrefix|successPrefix|warningPrefix|dangerPrefix` (visually hidden status word, first inside the Title). No role, `aria-live` or `aria-atomic` on the box. An `announce="polite|assertive"` prop on any root makes one `useAnnouncer()` call on mount. Look: `-subtle` background, 4px inline-start bar, a status icon, radius `sm`, through two tokens. No new colour tokens and no new contrast pairs. Every file to change is in spec §9, and the stories and tests are in §7.

### API sketch

```tsx
<Notification.Warning announce="polite">
  <Notification.Title>Ditt parkeringstillstånd går ut den 12 november 2026</Notification.Title>
  <Notification.Body>
    <p>Förnya det senast den 5 november.</p>
  </Notification.Body>
  <Notification.Actions>
    <Button>Förnya tillståndet</Button>
  </Notification.Actions>
</Notification.Warning>

// Your own look: the plain Root, with your icon, word and class
<Notification.Root className="my-notice">…</Notification.Root>
```

Exports: `Notification` (`Root`, `Info`, `Success`, `Warning`, `Danger`, `Title`, `Body`, `Actions`), the named parts, `useNotification`. Types: `NotificationVariant`, `UseNotificationOptions`, `UseNotificationResult`, `NotificationRootProps`, `NotificationStatusRootProps`, `NotificationTitleProps`, `NotificationBodyProps`, `NotificationActionsProps` (spec §6.1).

### Accessibility contract (draft)

Spec §7 is the draft input for `notification.a11y.md`. In short: no role on the box, a decorative icon, the status word in the Title, the heading level chosen by the consumer, announcement only through the Announcer and never on content present at load, and never announced and focused at once. No focusable parts of its own, so no Keyboard story.

### i18n strings

`notification.infoPrefix`, `successPrefix`, `warningPrefix`, `dangerPrefix` in sv, fi, nb, nn, se, en (spec §4.1). The `se` values are Northern Sámi (`Dieđut:`, `Gárvvis:`, `Váruhus:`, `Boasttuvuohta:`).

### Theming surface

Classes `kv-notification`, `kv-notification--info|success|warning|danger`, and the part classes. Two new component tokens, `--kv-notification-background` and `--kv-notification-accent`, aliases of the existing status scales (spec §6.2).

## Tasks

- [x] Design spec `docs/design/notification.md` (ux-designer)
- [x] The maintainer's answers recorded in the spec (§11), and the decision drafted
- [ ] The Notification decision accepted by the maintainer
- [x] i18n keys in all six locales (`i18n:check` pending, the orchestrator runs it)
- [x] `notification.a11y.md` from spec §7, then tests first (`notification.test.tsx`, written, not yet run)
- [x] `useNotification` and `Notification.*` in `packages/react/src/notification/`, with `notification.md`, exported from `index.ts`
- [x] Notification styles in `theme.css`, and the tinted button-edge check extended to the four `-subtle` backgrounds (spec §6.6), with tests (`theme:check` pending)
- [x] Stories (`Components/Notification`, spec §7.7) and e2e (written, not yet run)
- [x] The decision table (spec §9.1) moved to one Foundation page, `apps/storybook/src/foundation/containers.mdx` (Containers and status). The Section, Card and Notification Docs pages, the package docs, Borders and elevation and DESIGN.md link to it instead of copying it. 'Panel', 'banner' and 'callout' retired
- [x] Changeset, roadmap row (in progress), theme README
- [x] accessibility-reviewer APPROVE (after one round of fixes: Retry focus, focus on load, and documentation notes)
- [x] `vp check`, `vp test run`, `vp run e2e`, `theme:check`, `i18n:check` green, run on the Notification, Section and Card files

## Risks & open questions

- Open in spec §11: which cases need dismissible notifications later, and whether `useNotification` takes `variant` in v1 (the spec's call, to confirm).
- Known 4.1.3 risk: the box has no role, and the message reaches screen readers through the Announcer. Needs manual AT confirmation (`pending`).
- Contrast: the lowest pairs are 3.13:1 and 3.32:1 in dark on `primary-subtle`. A rebrand of `--kv-primary-*` can break them first.

## Testing strategy

Standard pyramid. No core machine: the status is a class and a component choice, and the announcement is one call to the existing Announcer.

## Rollout

Alpha in the next 0.x. New public API only.

## Done when

- [x] All quality gates in AGENTS.md pass (manual AT `pending`)
- [x] Plan tasks ticked, `docs/roadmap.md` status updated

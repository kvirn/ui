# Plan 0020: Notification

- **Status:** Draft (waiting for the maintainer's answers to the design spec's open questions)
- **Owner:** Maintainer / component-engineer
- **Created:** 2026-10-02 · **Target:** M1
- **Related:** ADR to draft (likely ADR-0046, _Proposed_), ADR-0007, ADR-0013, ADR-0020, ADR-0040, ADR-0044, design spec [notification.md](../design/notification.md)

## Goal

Adopters show a status message (info, success, warning or danger) with one component that carries the icon, the status word and the colours, and that announces itself correctly. Status is no longer a variant of Section or Card, and the docs use one vocabulary: Surface is a token, Section a region, Card one entity, Notification a status message.

## Non-goals

- Toast (transient, M3), `Field.ErrorMessage`, inset text and the error summary block (M4, built on a danger Notification). The spec §3.2 and §3.3 say how each relates.
- Dismissing. Not in v1 (spec §7.5).
- A live region of its own. Announcing goes through `useAnnouncer()` (ADR-0040).

## Background

- WCAG: 1.4.1 (status never by colour alone), 1.4.3 and 1.4.11 (pairs on the `-subtle` backgrounds), 1.3.1 and 2.4.6 (the heading level is the consumer's), 4.1.3 (status messages), 2.4.11 and 2.4.13 (focus ring).
- Prior art: GOV.UK notification banner, warning text and error summary; Designsystemet Alert; Aksel LocalAlert and GlobalAlert.

## Design

Design spec: [docs/design/notification.md](../design/notification.md) (ux-designer, Draft). Name `Notification`. Parts Root, Title (required, `h2` by default), Body, Actions, and `useNotification()`. `status` is a typed prop (`info` default, `success`, `warning`, `danger`) and the Root renders its `kv-notification--<status>` class itself: a deliberate exception to ADR-0013 (spec §6.2), because the status picks colour, icon and spoken word. Four new i18n keys `notification.infoPrefix|successPrefix|warningPrefix|dangerPrefix` for the status word (visually hidden, first inside the Title). No role, `aria-live` or `aria-atomic` on the box. An `announce="polite|assertive"` prop makes one `useAnnouncer()` call on mount. Look: `-subtle` background, 4px inline-start bar, a status icon, radius `sm`. No new colour tokens and no new contrast pairs. Every file to change is in spec §9, and the stories and tests are in §7.

### API sketch

```tsx
<Notification.Root status="warning" announce="polite">
  <Notification.Title>Ditt parkeringstillstånd går ut den 12 november 2026</Notification.Title>
  <Notification.Body>
    <p>Förnya det senast den 5 november.</p>
  </Notification.Body>
  <Notification.Actions>
    <Button>Förnya tillståndet</Button>
  </Notification.Actions>
</Notification.Root>
```

Exports: `Notification` (`Root`, `Title`, `Body`, `Actions`), the named parts, `useNotification`. Types: `NotificationStatus`, `UseNotificationOptions`, `UseNotificationResult`, `NotificationRootProps`, `NotificationTitleProps`, `NotificationBodyProps`, `NotificationActionsProps`.

### Accessibility contract (draft)

Spec §7 is the draft input for `notification.a11y.md`. In short: no role on the box, a decorative icon, the status word in the Title, the heading level chosen by the consumer, announcement only through the Announcer and never on content present at load, and never announced and focused at once. No focusable parts of its own, so no Keyboard story.

### i18n strings

`notification.infoPrefix`, `successPrefix`, `warningPrefix`, `dangerPrefix` in sv, fi, nb, nn, se, en (spec §4.1). The `se` values are English placeholders, which blocks beta.

### Theming surface

Classes `kv-notification`, `kv-notification--info|success|warning|danger`, and the part classes. Tokens only from the existing ones (`--kv-indicator-width` and the status scales).

## Tasks

- [x] Design spec `docs/design/notification.md` (ux-designer)
- [ ] The maintainer answers the spec's open questions (§11), and an ADR is drafted
- [ ] i18n keys in all six locales, and `i18n:check` green
- [ ] `notification.a11y.md` from spec §7, then tests first (`notification.test.tsx`)
- [ ] `useNotification` and `Notification.*` in `packages/react/src/notification/`, with `notification.md`, exported from `index.ts`
- [ ] Notification styles in `theme.css`, and extend the tinted button-edge check to the four `-subtle` backgrounds (spec §6.6), then `theme:check`
- [ ] Stories (`Components/Notification`: only the gaps, spec §7.7) and e2e
- [ ] The decision table row and title (spec §9.1) in `section.md`, `card.md`, the Docs pages, Foundation/Borders and elevation and DESIGN.md. Retire "panel", "banner" and "callout" in the docs
- [ ] Changeset, roadmap row, theme README
- [ ] accessibility-reviewer APPROVE
- [ ] `vp check`, `vp test run`, `vp run e2e`, `theme:check`, `i18n:check` green

## Risks & open questions

- Open questions for the maintainer are in spec §11: `status` as a prop (the ADR-0013 exception), the prop name (`status` or `tone`), a hidden or visible status word, the error summary's look, the radius, the title font, and whether info uses the accent or a neutral.
- Known 4.1.3 risk: the box has no role, and the message reaches screen readers through the Announcer. Needs manual AT confirmation (`pending`).
- Contrast: the lowest pairs are 3.13:1 and 3.32:1 in dark on `primary-subtle`. A rebrand of `--kv-primary-*` can break them first.

## Testing strategy

Standard pyramid. No core machine: the status is a prop, and the announcement is one call to the existing Announcer.

## Rollout

Alpha in the next 0.x. New public API only.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated

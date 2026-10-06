# Plan 0059: Badge

- **Status:** Approved
- **Owner:** component-engineer (agent)
- **Created:** 2026-10-06 · **Target:** alpha candidate
- **Related:** Plan 0053, `docs/design/docs-site-components.md` §5 G6, `docs/design/municipality-reference-site.md` (B9, B26, P10, P11), DESIGN.md "Badges and tags", [kbd.a11y.md](../../packages/react/src/kbd/kbd.a11y.md) (the flat reference)

## Goal

A resident or a case worker sees a short status or category next to a title (a case's status, a news item's category, the docs' "Pre-alpha"), always in words, in a look that is not interactive.

## Non-goals

- Interactive tags, filter chips, removable tags (a Button or a Toggle). A badge never takes focus.
- A count or notification dot, a status icon, a hidden status word. The visible text is the status.
- A new token or colour pair.
- Docs pages (`apps/docs`): a later step.

## Background

Reference municipality site: B9 teaser category, B26 case card, P10 case list, P11 case detail. Docs site G6: "A static `<span class="kv-badge">`, never interactive; choices by role; always with words; `radius-full`, `body-small`; forced colours: a `CanvasText` edge." docs-site.md §6 measured `link` on `primary-subtle` (4.68 / 5.44 / 8.72 / 8.33). WCAG 1.4.1 (colour is never the only cue), 1.4.3, 1.4.4, 1.4.11.

## Design

### API sketch

```tsx
<Badge>Utkast</Badge>
<Badge variant="success">Beviljad</Badge>
// hook, for your own element
const badge = useBadge({ variant: 'warning' })
<span {...badge.rootProps}>Väntar på komplettering</span>
```

One flat part, `Badge`, and `useBadge`. `variant`: `'neutral'` (default) | `'primary'` | `'info'` | `'success'` | `'warning'` | `'danger'`, a prop because the consumer's words carry the meaning (an Alert's status word and icon are a component's, so there the component picks). `<span class="kv-badge kv-badge--<variant>">`; the bare `kv-badge` is neutral.

### Accessibility contract (draft)

Badge is inline text: no focusable part, no keys. The full contract is `packages/react/src/badge/badge.a11y.md`.

| Key | Context | Action                                     |
| --- | ------- | ------------------------------------------ |
| –   | Badge   | Not a Tab stop: no `tabindex`, no handlers |

- Roles / ARIA: none. `<span>` has no role; no `role="status"`, no `aria-live`.
- Focus management: never moved, never a stop.
- Announcements: none. A badge that changes later is announced by the consumer's own live region, not by Badge.
- WCAG SCs: 1.3.1, 1.4.1, 1.4.3, 1.4.4, 1.4.11 (not required: the text carries it), 3.1.2 (consumer `lang`).

### i18n strings

None: Badge renders no text of its own, so no namespace in `KvirnMessages` and nothing in sv, fi, nb, nn, se or en. The words are the consumer's children, translated by the consumer.

### Theming surface

Classes: `kv-badge`, `kv-badge--primary|info|success|warning|danger` (the neutral look is the bare class). No `data-*`: Badge has no state. Pairs (all already measured, no new pair): neutral `text` on `surface`; primary `link` on `primary-subtle`; info `text` on `primary-subtle`; success, warning, danger `text` on their `-subtle`. Radius `full`, `body-small`, padding `space-1` by `space-2`, 1px edge, `white-space: nowrap`. Forced colours: `CanvasText` edge.

## Tasks

- [x] Contract `badge.a11y.md`, then tests
- [x] React hook + component (`use-badge.ts`, `badge.tsx`), exports
- [x] i18n: none needed (decision below)
- [x] Theme: section 9e, `kv-badge`, forced colours, DESIGN.md "Badges and tags"
- [x] Stories (every variant, RTL, forced-colors, 320px, `parameters.a11yContract`; no Keyboard story: nothing focusable)
- [x] Vitest browser tests: the no-keys row, ARIA state and axe
- [ ] AT matrix run (`pending`)
- [ ] Docs page (a later step, Plan 0057)
- [x] Changeset

## Decisions

- Flat single element with a `variant` prop, not `Badge.Info` roots: no icon or hidden word to keep in sync, so one table of classes is enough.
- `info` and `primary` differ by text colour (`text` vs `link`) on the same `primary-subtle`; both are measured pairs. The words, not the hue, tell them apart (1.4.1).
- No i18n: no hidden "Status:" prefix, since the badge's own text is the status. The consumer puts the context in the surrounding label (a case's "Status" term).
- Bare `kv-badge` is neutral with a `border-control` edge; coloured variants use a `transparent` 1px edge, so forced colours draw `CanvasText` on all.
- Zero specificity (`:where`) like Kbd, so consumer CSS wins.
- DESIGN.md addition is marked "Maintainer review (Plan 0059)".

## Risks & open questions

- A badge in an Alert, Card or Prose: Prose styles none of it (a `span`); no change to the not-prose list needed.

## Testing strategy

Component test (browser): element, class, `variant` classes, passthrough, `render`, not a Tab stop, axe in every variant. No CSS tests (rule 13). Stories run axe in every theme.

## Rollout

Minor changeset for `@kvirn-ui/react` and `@kvirn-ui/theme`. Roadmap: alpha candidate.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [x] Plan tasks ticked, `docs/roadmap.md` status updated

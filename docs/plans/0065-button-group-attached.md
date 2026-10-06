# Plan 0065: ButtonGroup `layout="attached"`

- **Status:** In progress
- **Owner:** component-engineer
- **Created:** 2026-10-06 · **Target:** alpha
- **Related:** Plan 0035 (Toolbar, ButtonGroup), `packages/react/src/button-group/button-group.a11y.md`

## Goal

A ButtonGroup can join its buttons into one connected strip, like a segmented control or the Figma toolbar: the buttons touch, share borders, and only the outer corners are rounded. A pressed toggle is the filled segment. `Toolbar.Group` uses it.

## Non-goals

- A new role, key, ARIA attribute or string. A segmented control with radio semantics (that is a RadioGroup or ToggleGroup).
- A vertical attached group, or a per-button override of the radius.

## Background

Spaced buttons waste width in a toolbar and make a group of toggles read as unrelated tiles. A joined strip says "one set" visually. The semantics are unchanged: the named `role="group"` already says it for assistive technology.

## Design

### Options weighed

1. **A prop `layout?: 'spaced' | 'attached'` on ButtonGroup and `useButtonGroup`**, adding the class `kv-button-group--attached`. Chosen: a class is for a choice (`data-*` is only state), it follows Alert and Stack, and the default keeps today's look.
2. A separate `ButtonGroup.Attached` or `SegmentedControl` part. Rejected: a second part for one styling choice, and it would split `Toolbar.Group`.
3. Make attached the only look in a toolbar through CSS (`.kv-toolbar .kv-button-group`). Rejected: a caller could not opt out, and the headless hook would not say it.

### API sketch

```tsx
<ButtonGroup aria-label="Textstil" layout="attached">
  <Button>Fet</Button>
  <Button>Kursiv</Button>
</ButtonGroup>

const group = useButtonGroup({ isNamed: true, layout: 'attached' })
<Toolbar.Group aria-label="Textstil" layout="spaced" /> // opt out
```

Exports `ButtonGroupLayout`. `ButtonGroupState` is `{ isNamed, layout }`. Results are frozen constants, like `useStack`.

### Accessibility contract (draft)

No new keys, ARIA or strings. The Keyboard section of `button-group.a11y.md` is unchanged: Tab and Shift+Tab move through the buttons, one stop each. In a Toolbar the roving keys are the toolbar's, across an attached group too.

| Key       | Action                                              |
| --------- | --------------------------------------------------- |
| Tab       | Unchanged: each button is a Tab stop, in DOM order  |
| Shift+Tab | Unchanged: previous button, and on out of the group |

- Roles / ARIA: unchanged. `role="group"` only with a name.
- Focus management: unchanged. The focus ring of a button is raised above its neighbours so they never clip it (2.4.7, 2.4.11).
- Announcements: none.
- WCAG SCs: 1.4.11 (the shared edge stays 3:1: the buttons' own edges), 1.4.10 (a toolbar's attached group never overflows), 2.5.8 (target size is the button's own: borders overlap, no gap is needed).

### i18n strings

None.

### Theming surface

Class `kv-button-group--attached`. No new tokens. Gap 0, one border width of negative inline-start margin on the following buttons, radii zeroed on inner edges with logical properties (RTL), hover, pressed and focused buttons raised with `z-index`. It never stacks below 40rem. In a toolbar the hairline between groups stays.

## Tasks

- [x] Plan
- [x] Hook + component + `Toolbar.Group` default
- [x] Theme CSS
- [x] Tests (class, default, Toolbar.Group default and override, role unchanged). Roving across an attached group is the existing `toolbar.test.tsx` arrow-key tests: no duplicate
- [x] Stories (Attached, RTL, ForcedColors; attached in the toolbar story)
- [x] `button-group.md`, `button-group.a11y.md`, `toolbar.md`
- [x] Changeset

## Decisions

- Chosen: option 1 above (decided before implementation).
- `Toolbar.Group` passes `layout={props.layout ?? 'attached'}`, so an explicit `undefined` still gives attached and `"spaced"` opts out.
- An attached group does not wrap (`flex-wrap: nowrap`) and never stacks. So a long label cannot widen the row past the viewport, its buttons may shrink and wrap their own text (`min-inline-size: 0`), as Finnish labels need (1.4.10).
- No new `ForcedColors` story on ButtonGroup beyond one for the attached strip: the shared edges are the buttons' own `ButtonText`.

- Review fixes: a page-colour halo (`box-shadow` with the focus offset) on the focused attached button, and `outline-color: CanvasText` in forced colours (shadows are not drawn there), so the ring never sits on a neighbouring pressed fill; the icon-only minimum size is restored in attached groups; two pressed buttons in a row get an `on-primary` (`HighlightText`) divider; an unknown runtime `layout` falls back to `spaced`.
- **The `@kvirn-ui/rich-text` toolbar changes look:** it uses `Toolbar.Group`, so its groups become joined strips. No API change there.

## Risks & open questions

- A visual check in a real browser (the forced-colours sweep, Plan 0051) is not part of this change.

## Testing strategy

The standard pyramid: component tests for the class, the default, the override and roving; stories run axe in every theme.

## Rollout

Minor for `@kvirn-ui/react` and `@kvirn-ui/theme`. The default is unchanged. `Toolbar.Group` changes look only.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT `pending`)
- [x] Plan tasks ticked, `docs/roadmap.md` has no line to change

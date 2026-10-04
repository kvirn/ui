# Plan 0035: Toggle, Toolbar and ButtonGroup

- **Status:** Approved (the maintainer, 2026-10-04)
- **Owner:** orchestrator → component-engineer
- **Created:** 2026-10-04 · **Target:** M1 (Toggle), M2 (Toolbar, ButtonGroup)
- **Related:** [0003](0003-button-and-link.md), [0028](0028-compound-naming-and-part-aliases.md), [0036](0036-rich-text-editor.md) (the first user), [design spec](../design/rich-text-editor.md), `api-conventions`, `accessibility`, `keyboard`, `testing`, `storybook-docs`, `theme-css` and `overlays-and-lists` skills

## Goal

A team can build a formatting bar, or any row of related actions, that a keyboard user reaches with one Tab and moves through with the arrow keys. Each on/off button says whether it is on, and the groups have names a screen reader user hears. The same ButtonGroup also groups ordinary buttons outside a toolbar, such as a Card footer.

## Non-goals

- No overflow ("More") menu. Menu and MenuButton are planned for M2. A toolbar that doesn't fit wraps (the design spec decides, against WCAG 1.4.10).
- No ToggleGroup with single selection (`radiogroup` semantics, as for alignment). A group of Toggles with independent state is enough for the editor. A single-choice group is its own plan.
- No Tooltip here. It's [Plan 0037](0037-tooltip.md), and Toolbar items accept one through composition. Icon-only buttons get their accessible name from `aria-label`.
- No vertical toolbar in the default theme. The hook supports `orientation="vertical"` (Up and Down keys), and the theme ships horizontal only.

## Background

- **APG Toolbar** (<https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/>): `role="toolbar"` with a name. It is one Tab stop and uses a roving `tabindex`. Left and Right move between controls (Up and Down when vertical), Home and End go to the ends, and wrapping is optional. Focus returns to the control that last had it. A disabled control stays focusable. APG's own example holds toggle buttons, a radio group, a menu button, a spin button and a checkbox.
- **APG Button** with `aria-pressed` (toggle button). The name must not change when the state changes.
- **Key tables:** the `keyboard` skill's Toolbar row ("ArrowLeft / ArrowRight: previous and next control, flips in RTL. Home / End to the ends").
- **The repo has no roving focus code yet.** `docs/architecture.md` says core has "utilities for roving tabindex, typeahead, focus trap", but none are built. RadioGroup uses native radios, and Listbox uses `aria-activedescendant`. This plan builds the first roving-focus helper.
- **`kv-button-group` already exists** as a CSS-only class (a flex row that stacks at full width below 40rem). Card footers use it.
- Prior art: Base UI Toolbar (Root, Button, Link, Input, Group, Separator), React Aria `useToolbar`, Radix Toolbar and Toggle, and Designsystemet ToggleGroup.

## Design

### API sketch

```tsx
<Toolbar.Root aria-label="Formatering" aria-controls={editorId}>
  <Toolbar.Group aria-label="Ångra">
    <Toolbar.Button aria-label="Ångra" onClick={undo} disabled={!canUndo}>
      <Icon name="undo" />
    </Toolbar.Button>
  </Toolbar.Group>
  <Toolbar.Group aria-label="Textstil">
    <Toolbar.Toggle aria-label="Fetstil" pressed={isBold} onPressedChange={toggleBold}>
      <Icon name="bold" />
    </Toolbar.Toggle>
  </Toolbar.Group>
  {/* Any focusable control joins with Toolbar.Item and a render prop */}
  <Toolbar.Item render={<Listbox.Trigger />} />
  <Toolbar.Item render={<Popover.Trigger />}>Länk</Toolbar.Item>
</Toolbar.Root>

<Toggle pressed={isOn} onPressedChange={setIsOn}>Visa bara olästa</Toggle>

<ButtonGroup aria-label="Ärendet">
  <Button>Spara utkast</Button>
  <Button>Skicka</Button>
</ButtonGroup>
```

**Toggle** (`packages/react/src/toggle/`)

- `useToggle({ pressed, defaultPressed, onPressedChange(pressed, { event }), disabled, focusableWhenDisabled })` returns `{ toggleProps, isPressed, isDisabled, isFocusVisible }`. It composes `useButton`, adds `aria-pressed` and `data-pressed`, and handles the `pressed`, `defaultPressed` and `onPressedChange` props the way `usePopover` handles `open`.
- `Toggle` renders a `<button type="button">` with the classes from the design spec (`kv-button kv-toggle`). Dev warnings: a missing accessible name, as Button warns. The name never changes with the state.

**Toolbar** (`packages/core/src/roving-focus/` and `packages/react/src/toolbar/`)

- **Core, pure:** `getRovingTarget({ key, currentIndex, count, orientation, direction, loop })` returns the next index or `null` for a key it doesn't own. It knows ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Home and End, flips in RTL for the horizontal axis, and wraps when `loop` is set. It has unit tests for every key, both directions, both orientations and the ends. Toolbar is its first user. Tabs, Menu and RadioGroup-like composites reuse it later.
- **React:** `useToolbar({ orientation = 'horizontal', loop = true })` returns `{ toolbarProps, getItemProps }`. `toolbarProps` has `role="toolbar"`, `aria-orientation` (only when vertical) and `onKeyDown`. Items register themselves (a small registry in context, in DOM order via `compareDocumentPosition`).
  - Exactly one item has `tabIndex={0}`. It is the last focused item, or the first one before anything has had focus. All other items have `-1`. If the active item unmounts, the next item takes over.
  - `onKeyDown` ignores an event that was `defaultPrevented` and an event from a text-entry element (`input` of a text type, `textarea`, `contenteditable`), so a control that owns arrow keys keeps them.
  - The direction comes from `getComputedStyle(toolbar).direction` at key time, as `use-popup.ts` reads it, so a `dir` set on a container works without a provider.
- **Parts:**
  - `Toolbar.Root` renders a `<div>`.
  - `Toolbar.Button` renders a Button item, and `Toolbar.Toggle` renders a Toggle item.
  - `Toolbar.Item` makes any focusable control an item, with `render` (Listbox trigger, Popover trigger, Link). Its roving `tabIndex` wins over the rendered element's own `tabIndex` (`mergeProps` order, with a test using `Listbox.Trigger`).
  - `Toolbar.Group` is ButtonGroup, a compound alias.
  - No separator part. The theme draws a hairline between groups (design spec §6.5.1), so there is no `role="separator"` to announce. The named groups carry the structure.
- **Disabled items stay focusable** in a toolbar (keyboard skill). `Toolbar.Button` and `Toolbar.Toggle` default to `focusableWhenDisabled`, so they get `aria-disabled="true"`, and a press does nothing.
- **Dev warnings:** a toolbar without a name, a toolbar with fewer than three controls (APG: "use only with three or more controls"), and `Toolbar.Item` rendering a non-focusable element.

**ButtonGroup** (`packages/react/src/button-group/`)

- `ButtonGroup` renders a `<div class="kv-button-group">`, flat, one element. It has `role="group"` when it has a name (`aria-label` or `aria-labelledby`), and no role without one, so an unnamed Card footer adds no empty group to the accessibility tree.
- A name is required inside a Toolbar (dev warning) and optional elsewhere.
- The existing `kv-button-group` class keeps its stacking behaviour outside a toolbar. Inside `kv-toolbar`, the group doesn't stack (the design spec covers this).

### Accessibility contract (draft)

`toggle.a11y.md`

| Key             | Context                        | Action                                           | Test                                                                  |
| --------------- | ------------------------------ | ------------------------------------------------ | --------------------------------------------------------------------- |
| Tab / Shift+Tab | Toggle                         | Moves focus to and from it                       | `toggle.e2e.ts › Tab moves to and from the toggle`                    |
| Enter / Space   | Toggle                         | Switches `aria-pressed`. The name doesn't change | `toggle.e2e.ts › Enter and Space switch pressed, name is kept`        |
| Enter / Space   | Toggle, disabled and focusable | Nothing happens                                  | `toggle.e2e.ts › a focusable disabled toggle ignores Enter and Space` |

`toolbar.a11y.md`: the focus strategy is a roving tabindex, selection follows focus is n/a, arrows wrap (stated, `loop` defaults to true, as in APG's example), and there are no shortcuts.

| Key                    | Context                              | Action                                                                                                                                              | Test                                                                                            |
| ---------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab        | Toolbar                              | Enters at the control that last had focus (the first, the first time), and leaves the toolbar                                                       | `toolbar.e2e.ts › Tab enters at the last focused control and leaves the toolbar`                |
| ArrowRight / ArrowLeft | Toolbar, horizontal                  | Next and previous control, wraps. Flips in RTL                                                                                                      | `toolbar.e2e.ts › ArrowRight and ArrowLeft move and wrap`, `… › right to left: the arrows flip` |
| ArrowDown / ArrowUp    | Toolbar, vertical                    | Next and previous control, wraps                                                                                                                    | `toolbar.e2e.ts › vertical: ArrowDown and ArrowUp move`                                         |
| Home / End             | Toolbar                              | First and last control                                                                                                                              | `toolbar.e2e.ts › Home and End go to the ends`                                                  |
| Enter / Space          | Toolbar.Button / Toggle              | Activates it (Toggle switches `aria-pressed`). Focus stays                                                                                          | `toolbar.e2e.ts › Enter and Space activate and focus stays`                                     |
| (any)                  | Disabled control                     | It is focusable with arrows and announced as dimmed. Activating it does nothing                                                                     | `toolbar.e2e.ts › a disabled control is reachable and inert`                                    |
| (keys the item owns)   | Toolbar.Item, e.g. a Listbox trigger | The item's own keys win (ArrowDown opens the Listbox, and Home and End on a closed Listbox open it as its contract says). Left and Right still move | `toolbar.e2e.ts › an item's own keys win, and Left and Right still move`                        |

- **Roles:** `toolbar` with a name, and `aria-orientation` only when vertical. `group` with a name for each ButtonGroup. Toggle is `button` with `aria-pressed`.
- **Focus:** a roving tabindex, so DOM focus is on the control (not `aria-activedescendant`), because APG's toolbar and a Listbox trigger inside it need real focus.
- **Announcements:** none. The state is in `aria-pressed` and `aria-disabled`.
- **WCAG SCs:** 1.3.1, 1.4.1 and 1.4.11 (pressed is not shown by colour only), 2.1.1, 2.1.2, 2.4.3, 2.4.7, 2.5.3 (the visible label is in the name), 2.5.8, 4.1.2.

`button-group.a11y.md`: a `group` with a name, no keys of its own, and Tab moves through its buttons natively (outside a toolbar).

### i18n strings

None. Every name is the consumer's (`aria-label`), as for Button.

### Theming surface

- `kv-toggle` with `data-pressed`. **Pressed is a solid `primary` fill** with the on-primary text and icon colour, flat inside a toolbar (the maintainer, 2026-10-04; design spec §6.4). The fill against the unpressed button and its surroundings must meet 1.4.11 (3:1), and the icon on the fill 4.5:1 or 3:1 for a graphic. Both pairs are measured by `theme:check`, and any missing pair is added there. Forced colours: `Highlight` fill with `HighlightText`.
- `kv-toolbar`, with a hairline between groups, and `kv-button-group` inside `kv-toolbar` (no stacking, wraps group by group).
- Density follows the surroundings (design spec §6.5.3): 44px by default, and 32px only inside `kv-compact` from 64rem.

## Tasks

- [ ] Core `getRovingTarget`, with unit tests first
- [ ] Toggle: hook and component, tests first (controlled and uncontrolled, `aria-pressed`, focusable when disabled, `render`, the name warning, axe)
- [ ] ButtonGroup: component, tests, and the name warning inside a Toolbar
- [ ] Toolbar: hook, registry, parts, tests first (roving `tabIndex`, last focused, an unmounted active item, ignoring prevented and text-entry events, Item with `Listbox.Trigger` and `Popover.Trigger`, dev warnings)
- [ ] Contracts: `toggle.a11y.md`, `toolbar.a11y.md` and `button-group.a11y.md`. Package docs: `toggle.md`, `toolbar.md` and `button-group.md`
- [ ] Exports, and the naming tooling (`naming.test.tsx`, `tooling/component-naming`) for the `Toolbar` namespace and the `Toolbar.Group` alias
- [ ] `theme.css`: `kv-toggle`, `kv-toolbar`, the group hairline, and groups in a toolbar. Then `vp run theme:check`
- [ ] Stories (storybook-docs template): Toggle, Toolbar (text formatting, with a Listbox and a Popover item, a disabled control, wrapping at 320px, RTL, ForcedColors, Keyboard) and ButtonGroup (a Card footer, in a toolbar)
- [ ] e2e: `toggle.e2e.ts` and `toolbar.e2e.ts`, every row (RTL included), and axe on every story
- [ ] Update the `keyboard` skill's Toolbar row (wraps, disabled controls reachable, and an item's own keys win) and `docs/architecture.md` (roving focus is built, and where it lives)
- [ ] Changesets: `@kvirn-ui/core`, `@kvirn-ui/react` and `@kvirn-ui/theme` minor
- [ ] Gates, then accessibility-reviewer. Roadmap: Toggle `alpha`, and a new Toolbar and ButtonGroup row

## Decisions

- **Toolbar, ButtonGroup and Toggle as three primitives, not ButtonGroup only** (the maintainer, 2026-10-04). ButtonGroup alone would make an editor about 20 Tab stops long and deviate from APG.
- **A roving tabindex, not `aria-activedescendant`.** A toolbar holds real widgets (a Listbox trigger, a Popover trigger) that need DOM focus.
- **Arrows wrap by default,** as in APG's example. `loop={false}` turns it off.
- **Items opt in** (`Toolbar.Button`, `Toolbar.Toggle`, `Toolbar.Item`) instead of the toolbar querying every focusable descendant. A Popover's form inside the toolbar's DOM must not become toolbar items.
- **The roving helper is in core** (pure index maths), so it's tested without a DOM and reused by Tabs and Menu.

- **A Listbox trigger in a toolbar keeps its own Home and End** (the maintainer, 2026-10-04): on a closed Listbox they open it, as its contract says. APG makes both optional.
- **DESIGN.md** gets the solid-fill pressed toggle and the toolbar density wording (the maintainer, 2026-10-04, design spec §6.10).

## Risks & open questions

- **A Listbox trigger in a toolbar:** Home and End open a closed Listbox (its contract), so they don't jump to the toolbar's ends while the Listbox trigger has focus. APG makes both optional. The contract states it. If the accessibility reviewer prefers the toolbar's meaning, the Listbox gets a `homeEndOpens` option instead.
- **A Popover in a toolbar:** the popup is rendered right after its trigger (Popover's rule), so it sits inside `Toolbar.Root`'s DOM. The keydown handler must ignore events from inside an open popup (they come from a form, or from text entry, which are both excluded). A test covers it.

## Testing strategy

The core maths is unit tested. The registry and `tabIndex` are component tests. Every keyboard row is e2e, with RTL.

## Rollout

Minor releases of core, react and theme. No migration. `kv-button-group` is unchanged outside toolbars.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated

# Plan 0058: Disclosure and Accordion

- **Status:** Approved
- **Owner:** component-engineer agent (Claude)
- **Created:** 2026-10-06 · **Target:** alpha (roadmap milestone 1)
- **Related:** Plan 0053 (the docs as a municipality site), `docs/design/docs-site-components.md` §5 G3, `docs/design/municipality-reference-site.md` (B12 FAQ, G3 amended), Plans 0022 (Popover, the open-state pattern), 0048 (Tabs, the theme pattern); `keyboard`, `api-conventions`, `theme-css` skills

## Goal

A resident can open one answer at a time, or several, on a page of questions (an Accordion), and a page can hide a help text or the opening hours behind one button (a Disclosure), with the state in words and shape and never in colour alone. Disclosure comes first, and Accordion is built on it.

## Non-goals

- A panel shown from a breakpoint and expanded without JavaScript (decision 1).
- "Only one open", "Show all", animation of the height, and a Disclosure Navigation (`NavigationMenu`, roadmap M4).
- The docs pages and the docs site's menu and display settings (a later step; `DocsDisclosure` stays interim).

## Background

- APG [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) and [Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/): a `<button aria-expanded aria-controls>`, a panel, Enter and Space. Accordion adds a heading around each button and optional arrow keys, Home and End, and `region` panels "when there are about six or fewer".
- Prior art: GOV.UK Accordion (always `h2` and "Show all sections"), Radix and React Aria (`type="single"`), Headless UI (`Disclosure`). We keep the native button and the heading and drop the rest.
- `hidden="until-found"` (Chromium): find-in-page and fragment navigation reveal the content and fire `beforematch`.

## Design

### API sketch

```tsx
<Disclosure.Root hiddenUntilFound onOpenChange={(open, { reason }) => …}>
  <Disclosure.Trigger>Öppettider</Disclosure.Trigger>
  <Disclosure.Panel>Måndag till fredag 10–19.</Disclosure.Panel>
</Disclosure.Root>

<Accordion.Root hiddenUntilFound>
  <Accordion.Item defaultOpen>
    <Accordion.Heading level={3}>
      <Accordion.Trigger>Hur ansöker jag?</Accordion.Trigger>
    </Accordion.Heading>
    <Accordion.Panel region>Du ansöker på Mina sidor.</Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
```

`useDisclosure(options)` returns `triggerProps`, `panelProps`, `isOpen`, `isDisabled`, `isFocusVisible`, `triggerId` and `panelId`. `useAccordion()` returns frozen `rootProps`, `itemProps` and `headingProps` (classes). The Accordion parts reuse the Disclosure's: `Accordion.Item` is a `div` around a `Disclosure.Root`, and `Accordion.Trigger` and `Accordion.Panel` are the Disclosure's with the accordion's class added.

### Accessibility contract (draft)

Full contracts: `disclosure.a11y.md` and `accordion.a11y.md`. Focus strategy native, no selection, no wrapping, no shortcuts.

| Key                              | Action                                                                                       |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| Tab                              | Reaches the trigger (every trigger in an accordion is its own stop). Into an open panel next |
| Shift+Tab                        | Previous focusable element                                                                   |
| Enter / Space                    | Toggles the panel. Focus stays on the trigger                                                |
| ArrowDown / ArrowUp / Home / End | Not handled in an Accordion (decision 3)                                                     |

- Roles / ARIA: native `<button type="button">` with `aria-expanded` and `aria-controls`; the panel is `hidden` while closed (`until-found` with the option) and has no role. Accordion adds a heading of the consumer's `level`, and an opt-in `role="region"` named by its trigger.
- Focus management: never moved by opening or closing. The panel follows the trigger in the DOM, so its content is the next Tab stop while open.
- Announcements: none. The change of `aria-expanded` on the focused trigger is read by the screen reader.
- WCAG SCs: 1.3.1, 1.4.1, 1.4.10, 1.4.12, 2.1.1, 2.1.2, 2.4.3, 2.4.6, 2.4.7, 2.4.11, 2.5.8, 3.2.1, 3.2.2, 4.1.2.

### i18n strings

There are none: the trigger's text and the panel are the consumer's, in the page's language, and the chevron is decorative (`aria-hidden`). No namespace is added to `KvirnMessages`, so no catalog changes (the six locales sv, fi, nb, nn, se and en are unaffected). "Show all" would add `accordion.showAll` and `accordion.hideAll` later.

| Key  | en   | sv   |
| ---- | ---- | ---- |
| none | none | none |

### Theming surface

Classes `kv-disclosure-trigger`, `kv-disclosure-panel`, `kv-disclosure-icon`, `kv-accordion`, `kv-accordion-item`, `kv-accordion-heading`, `kv-accordion-trigger`, `kv-accordion-panel`. State `aria-expanded` and `data-open` (trigger, panel, item), `data-disabled`. Section 8c of `theme.css`; reuses `--kv-control-min-block-size`, the space and focus tokens and `border-subtle`. No new token or colour pair. DESIGN.md gets a "Disclosure and Accordion" subsection marked for maintainer review.

## Tasks

- [x] Contracts `disclosure.a11y.md` and `accordion.a11y.md`, then tests
- [x] `useDisclosure`, `Disclosure.*`, `useAccordion`, `Accordion.*`, exports and `naming.test.tsx`
- [x] i18n: none needed (decision 6)
- [x] Theme section 8c, the not-prose list, DESIGN.md subsection and class contract
- [x] Stories (every state, RTL, forced colours, 320px Finnish, compact, `Keyboard`, `a11yContract`)
- [x] Component tests: every keyboard row, ARIA state, axe, find-in-page, SSR
- [ ] AT matrix run (`pending`: never claimed by an agent)
- [ ] Docs pages (a later step, Plan 0057)
- [x] Package guides `disclosure.md` and `accordion.md`, dev-warnings entries, changeset, roadmap row

## Decisions

Options weighed, then the one chosen.

1. **The responsive case (a panel shown from a breakpoint, expanded without JavaScript): left out.** Options: (a) a prop or class that makes the panel visible from a width, (b) leave it to `NavigationMenu` and to the consumer's CSS. Chosen (b). A visible panel under a trigger that says `aria-expanded="false"` is wrong state, and fixing it needs the trigger out of the accessibility tree at that width, which is layout the headless component can't own and the theme can't test. The contract tells a consumer how (an author rule on `.kv-disclosure-panel[hidden]` and `display: none` on the trigger) and says nothing in the library supports it. The docs site's menu stays `DocsDisclosure` until `NavigationMenu`.
2. **`hidden="until-found"`: supported, opt-in** (`hiddenUntilFound` on `Disclosure.Root` and `Accordion.Item`, with a default on `Accordion.Root`). Options: on by default, opt-in, not at all. Opt-in, because browser support differs (Chromium reveals the panel; a browser without it treats the value as `hidden`, so nothing breaks but a match is missed), and a FAQ page is the one place a consumer will want it, so one prop on the root turns it on for all items. The browser's reveal fires `beforematch`, which the hook turns into `onOpenChange(true, { reason: 'find-in-page' })`, so controlled state follows. React 19.3 renders `hidden` as a boolean attribute and drops the string, so the hook writes `until-found` in an effect after each render and the server markup says plain `hidden`. The `hidden` prop is typed `true`.
3. **Accordion keyboard: Enter and Space only, no arrows, Home or End.** APG lists ArrowDown, ArrowUp, Home and End as optional. The `keyboard` skill says native first and no keys beyond the pattern's table without need. Adopting them would add a second way to move that the page's own scrolling already owns (ArrowDown, Home and End scroll), and make `preventDefault` necessary on keys users rely on, while a Tab stop per header is what GOV.UK and most municipality pages do. Not an APG deviation (optional keys). Revisit with the AT matrix; the contract and `key-tables.md` say so, and a test proves the keys are not prevented.
4. **The open look (DESIGN.md, maintainer review):** chevron down while closed, chevron up while open, at the inline end, never colour alone, plus `aria-expanded`. The trigger text never changes with the state. No rotation animation. `Disclosure.Trigger` appends an `Icon` (so a registered icon set still applies); a different icon or none is the hook or the `render` function form.
5. **Parts:** `Disclosure` is `Root`, `Trigger`, `Panel` (a namespace of its own parts, like Popover). `Accordion` is `Root`, `Item`, `Heading`, `Trigger`, `Panel`, and its `Trigger` and `Panel` are wrappers with their own display names. `Heading` requires `level` (like Heading): the library can't know the outline. The panel is no `region` by default (APG advises it for six or fewer): `region` is an opt-in prop on `Accordion.Panel`. `Disclosure.Panel` has no role.
6. **No i18n namespace:** nothing the library says. No catalog, locale header or `i18n:check` change.
7. **Disabled** follows the Button: native `disabled` leaves the Tab order, `focusableWhenDisabled` gives `aria-disabled`. A render element's and the consumer's `onClick` on the trigger are gated by the part, so a disabled trigger runs no handler.
8. **Prose:** `kv-disclosure-trigger` and `kv-accordion-heading` are in the not-prose list, so prose does not style a trigger or an accordion heading. Panel content stays prose.
9. **Accordion is one disclosure per item** (independent state), with no `type="single"`. A single-open mode is a later option with its own contract rows.

## Risks & open questions

- No manual AT run: whether screen readers announce a revealed `until-found` panel, and how a long FAQ feels with a Tab stop per header, are `pending`.
- Safari and Firefox support for `until-found` is not tested here. The Chromium baseline is green.
- The theme has no height animation by design. A later request would need reduced-motion handling.
- Maintainer review: the DESIGN.md subsection "Disclosure and Accordion" (marked Plan 0058).

## Testing strategy

Standard pyramid. Component tests (`disclosure.test.tsx`, `accordion.test.tsx`) in Chromium: wiring, the keyboard rows, disabled, controlled, find-in-page through a dispatched `beforematch`, SSR, axe, `render` and refs. Every story runs in four themes with a play function.

## Rollout

Minor changeset for `@kvirn-ui/react` and `@kvirn-ui/theme`. Status alpha candidate in `docs/roadmap.md`.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [x] Plan tasks ticked, `docs/roadmap.md` status updated

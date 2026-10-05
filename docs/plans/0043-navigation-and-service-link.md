# Plan 0043: Navigation as its own component, and a service link

- **Status:** Accepted (the maintainer accepted the plan, 2026-10-04). Implemented; gates pending, manual AT `pending`
- **Owner:** orchestrator → ux-designer → component-engineer → accessibility-reviewer
- **Created:** 2026-10-04 · **Target:** M2
- **Related:** [0003](0003-button-and-link.md), `DESIGN.md`, `design`, `theme-css`, `accessibility`, `keyboard` skills

## Goal

`Link` is only a link. A list of page links with a current page is `Navigation`, a component like Tabs or Breadcrumb. And a link can look like the "Länk till e-tjänst" of Stockholm's webbmanual (a filled icon block and an outlined label, in our colours) and still be a real `<a>` with router support, the new-tab notice and `current`.

## Non-goals

- NavigationMenu (disclosure navigation, M4), Tabs, Breadcrumb and Pagination stay separate roadmap rows.
- No new colours: primary, `on-primary` and the existing tokens.

## Background

`kv-nav` is a CSS context class on a consumer's `<ul>` (`theme.css:905-1017`), described in `link.md:11`, shown in four `link.stories.tsx` stories, and used in `prose.stories.tsx`, `overview.mdx:44`, `apps/docs/components/site-navigation.tsx`, `DESIGN.md:508,517`, `theme/README.md:35` and the `theme-css` skill. No component writes the `<nav aria-label>`. `.kv-link` has no variants, and `className="kv-button …"` on a Link fights `.kv-link`'s underline and colour (the cascade order), so the service look needs its own modifier. `Button` warns on a non-`<button>` element, so a button-looking link is a Link.

## Design

### API sketch

```tsx
<Navigation.Root label="Huvudmeny">
  <Navigation.List>
    <Navigation.Item><Link.Root href="/start" current>Start</Link.Root></Navigation.Item>
    <Navigation.Item><Link.Root href="/om">Om oss</Link.Root></Navigation.Item>
  </Navigation.List>
</Navigation.Root>

<Link.Root href="https://…" className="kv-link--service">
  <Link.Icon><Icon name="arrow-forward" size={6} /></Link.Icon>
  Ansök om bygglov
</Link.Root>
```

- `Navigation.Root` renders `<nav>` and requires `label` (dev warning without it). `List` is a `<ul>`, `Item` an `<li>`. Nesting is another `Navigation.List` inside an `Item`. `current` stays on `Link` (`aria-current="page"`).
- Classes: `kv-navigation`, with the rules moved from `.kv-nav` (the prose boundary and forced-colours rules go with them). `kv-nav` is removed, with no alias (alpha).
- Service link: choice class `kv-link--service` and a part class `kv-link-icon`, **class only, with no `variant` prop** (the design spec wins, as Button exposes `primary` and `danger`). Look: transparent background, 1px primary border, `link` text (not `primary`: 4.44:1 on the dark canvas), no underline, and a primary-filled square block at the inline start with an `on-primary` icon. Hover, focus ring, `current` and forced colours follow the spec. **No disabled state:** Link has none, and an unavailable e-service is text, not a dimmed link.

### Accessibility contract (draft)

| Key   | Action                               |
| ----- | ------------------------------------ |
| Tab   | Moves through the links in DOM order |
| Enter | Follows the link                     |

- `<nav aria-label>` landmark, `aria-current="page"`, the service link's icon block is decorative (`aria-hidden`), the 24px target size and focus-visible are asserted as thresholds, and the link text carries the name. Contrast: `on-primary` on primary and primary on the surface, both in `theme:check`.
- WCAG SCs: 1.3.1, 2.4.1, 2.4.4, 2.4.8, 1.4.11, 2.5.8.

### i18n strings

None new. The new-tab notice is Link's.

## Tasks

- [x] `ux-designer`: design spec in `docs/design/navigation.md` (nested lists, current item, the service link in all four themes and forced colours)
- [x] Failing tests, then `Navigation` in `packages/react/src/navigation/` (hook + compound parts + `.md` + `.a11y.md`) and `Link.Icon` (no `variant`: the service look is a class)
- [x] `theme.css`: `.kv-navigation`, `.kv-link--service`, `.kv-link-icon`, the not-prose lists, contrast pairs, `theme:check`
- [x] Remove `kv-nav` from `link.md`, the Link stories, prose stories, `overview.mdx`, the docs site navigation, `DESIGN.md`, `theme/README.md`, `theme-css` skill; fix the stale `kv-nav-list` mentions in the older design docs only where they claim to be current
- [x] Stories: `Components/Navigation` (Docs page template, Keyboard story) and a Link `Service` story
- [x] `roadmap.md` rows, changeset (breaking for `kv-nav`, minor for the additions)

## Decisions

- **Navigation is a component (`Navigation.Root/List/Item`),** not a class on a list, so the landmark and its label are not the consumer's job.
- **The service link is a Link look,** not a Button, because it navigates. It is the class `kv-link--service`, not a `variant` prop (design spec §8): headless Link ships no CSS, as Button exposes `primary`.
- Both needed the maintainer's approval of the design spec before code (a visual change): given with the plan, 2026-10-04.
- **Navigation has no callable root.** It is a plain namespace object (`Navigation.Root`, `List`, `Item`), like `Card`, so there is no `<Navigation>` to ban.
- **`label` is optional in the type,** and a development warning fires without a name (and `aria-labelledby` is accepted instead). A union type would force a cast in the warning test and gains little: a JavaScript user gets the warning either way.
- **The name warnings read the DOM.** `Navigation.Root` checks its rendered `<nav>` in an effect: no `aria-label` and no `aria-labelledby` text is `navigation-without-name`, and another `<nav>` or `role="navigation"` with the same name is `navigation-duplicate-name:<name>`, so a plain `<nav>` counts too.
- **`Link.Icon` can't turn `aria-hidden` off.** It is merged last. A `render` element's own `aria-hidden` still wins, as for every part.
- **The docs site sidebar** (`apps/docs/components/site-navigation.tsx`) uses `Navigation.*`, so its nested group list is now indented 16px (the spec's nested rule). The group label stays a `span` of the site's own.
- **Keyboard contract has focus lines and a `Keyboard` story,** although the links own Enter, because Navigation contains focusable parts (a wrapper whose focus parts belong to another component says so and links the contract, `keyboard` skill). Its rows: Tab, Shift+Tab, Enter and one for the arrows (not handled), all in `navigation.e2e.ts`.
- **The e-service-closed Alert** that the spec mentions as a Notification is written as an `Alert` in `link.md`, because Plan 0042 renamed it.

## Risks & open questions

- Two landmarks with the same label: dev warning, as for other landmarks.
- Name: `Navigation` vs `NavList`. `Navigation` matches the roadmap's NavigationMenu family.

## Done when

- [x] All quality gates in AGENTS.md pass (manual AT may be `pending`) (2026-10-05: `vp check`, `vp test run`, every `vp run e2e` spec on chromium, `i18n:check`, `theme:check` green)
- [ ] accessibility-reviewer APPROVE
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated

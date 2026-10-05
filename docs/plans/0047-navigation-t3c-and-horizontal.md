# Plan 0047: Navigation, the T3 C look and a horizontal bar

- **Status:** Accepted (the maintainer accepted the plan, 2026-10-05). The visual spec needs the maintainer's approval before any `theme.css` work
- **Owner:** orchestrator → ux-designer → component-engineer → accessibility-reviewer
- **Created:** 2026-10-05 · **Target:** M2
- **Related:** [0043](0043-navigation-and-service-link.md), [design spec](../design/navigation-link-options.md) (§12 the chosen look, §13 horizontal), [0048](0048-tabs.md), [0049](0049-table-of-contents.md), `DESIGN.md`, `design`, `theme-css`, `accessibility`, `keyboard`, `api-conventions`, `testing` skills

## Goal

A resident or an editor sees where they are in a navigation. The current page is a solid fill, its ancestors are a quiet bold trail above it, and the same navigation works as a vertical list or a horizontal bar. Navigation's stories live only under Components/Navigation.

## Non-goals

- Flyouts and collapsing groups: those are NavigationMenu (M4). No `Navigation.Group`.
- A `data-trail` prop, announcing the trail, Breadcrumb.
- New tokens or contrast pairs, and an `orientation` prop.

## Background

The maintainer disliked the navigation links. The 4px `border-inline-start` on a rounded item curves into a crescent, every label looks equally heavy (500 at rest, 600 current), and the hover fill (`surface-raised`) is 1.00:1 on the light canvas. The ux-designer drew four options and three trail treatments ([navigation-link-options.md](../design/navigation-link-options.md)). The maintainer chose **T3 with C**, and asked for horizontal and vertical navigation.

Navigation stays `Root`, `List` and `Item` (Plan 0043). Orientation is a class, not a prop: links are plain Tab stops, so Navigation has no key axis, and `architecture.md` says options are `kv-<part>--<option>` classes. Tabs and Toolbar take an `orientation` prop because it changes their keys.

Today's rules are in `theme.css` §8 (lines 1113-1286). Navigation's stories are partly in the Link story: six stories in `link.stories.tsx` use `Navigation`, and the `RoutedNavigation` fixture is in `link.fixture.tsx`.

## Design

### API sketch

No code change except one dev warning. `useNavigation` and `NavigationRootPartProps` are unchanged.

```tsx
{
  /* vertical, the default: ancestors are the trail, aria-current only on the current page */
}
;<Navigation.Root label="Handläggare">
  <Navigation.List>
    <Navigation.Item>
      <Link.Root href="/start">Start</Link.Root>
    </Navigation.Item>
    <Navigation.Item>
      <Link.Root href="/bygga">Bygga och bo</Link.Root>
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="/bygga/bygglov" current="page">
            Bygglov
          </Link.Root>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Item>
  </Navigation.List>
</Navigation.Root>

{
  /* a horizontal bar: one class, no prop */
}
;<Navigation.Root label="Huvudmeny" className="kv-navigation--horizontal">
  …
</Navigation.Root>

{
  /* a collapsed group is rendered with hidden, never unmounted */
}
;<Navigation.List hidden>…</Navigation.List>
```

### The look (spec §12 and §13)

- **Rest:** weight `--kv-font-body-weight` (400), no `border-inline-start`, padding 16px start and 12px end. **Hover and press:** the 2px link underline (`--kv-link-underline-thickness-hover`) in the `text` colour, no fill.
- **Current page (C):** a solid `primary` fill, an `on-primary` label, weight 600.
- **Trail (T3):** every ancestor gets the quiet fill (`primary-subtle`) and weight 600. It is found by CSS `:has()` on `.kv-navigation-item:has(> .kv-navigation-list <the current link>) > .kv-link`, with no API change (`theme.css` already uses `:has()` 141 times).
- **Forced colours:** a straight `LinkText` `::before` bar on the current item (`forced-color-adjust: none`), ancestors weight only, and the transparent-border rules at `theme.css:1251-1264` go.
- **`[hidden]`:** `.kv-navigation-list[hidden] { display: none }` beside the list rule. Today a collapsed group shows again without `reset.css`, because the list's own `display: flex` beats the user agent's `[hidden]`. The `theme-css` skill gets the rule "a part the theme gives a `display` restates `[hidden]`".
- **Horizontal:** `.kv-navigation--horizontal > .kv-navigation-list { flex-direction: row; flex-wrap: wrap }` with content-sized items (`min-inline-size: 0; max-inline-size: 100%`). Long Finnish words wrap through the existing `overflow-wrap: anywhere`. One level only: a nested list stays stacked and indented as today. Whether the trail branch should show as a second row is Q-N1 in the spec; nothing is built until the maintainer answers.
- No new token or pair, and no prose-list change (`kv-navigation` is already a boundary). `theme:check` proves it. The choice class is listed in the `theme.css` header comment (lines 9-11).

### Accessibility contract (delta to `navigation.a11y.md`)

The four keyboard rows stay (Tab, Shift+Tab, Enter, arrows not handled). One row is added:

| Key | Context                        | Action                                | Test                                              |
| --- | ------------------------------ | ------------------------------------- | ------------------------------------------------- |
| Tab | a group rendered with `hidden` | Skips it: its links are not Tab stops | `navigation.e2e.ts › Tab skips a collapsed group` |

- **`aria-current`:** one per navigation. `"page"` when the page is listed, else `true` on the deepest item shown, never on ancestors (ARIA allows one current item per set). The trail is visual only and is not announced; list nesting carries the hierarchy for assistive technology.
- **Collapsed groups** use `hidden`, never unmount, so the current link is still in the DOM for `:has()`.
- **Warning:** `navigation-multiple-current:<name>`.
- Rewrite line 6 ("Gates 1–5 pending", stale), Visual/modes (lines 80-84), Known issues (line 119), and the "no orientation prop" lines (`navigation.a11y.md:84`, `navigation.md:11`, `navigation.tsx:142`).
- WCAG SCs: 1.3.1, 1.4.1, 1.4.3, 1.4.10, 1.4.11, 1.4.12, 2.4.1, 2.4.3, 2.4.4, 2.4.7, 2.5.8, 4.1.2.

### i18n strings

None.

### Theming surface

The choice class `kv-navigation--horizontal`. `kv-compact` still sets the density. State stays `data-current` and `aria-current`.

### Design docs and DESIGN.md

- `navigation-link-options.md` becomes Approved (C with T3, `:has()`), with `Plan: 0047` and a new §13 Horizontal.
- `docs/design/navigation.md` §5, §6.2, §6.3 and §6.5 say "replaced by navigation-link-options.md §12". §8 "Vertical only, no orientation prop" becomes "vertical by default, `kv-navigation--horizontal` on the root, no prop", and §5's "a horizontal header bar is NavigationMenu" becomes "a bar of plain links is Navigation; flyouts and collapsing are NavigationMenu".
- `DESIGN.md`, wording from the spec's "DESIGN.md changes" section: front matter `nav-item` (line 186, 44px and `body` type, today it says 32px and `label-compact`), `nav-item-current` (line 193, `primary` and `on-primary`), a new `nav-item-trail`. Token rows `surface-raised` (line 298, drop "hovered navigation items"), `primary` (306), `primary-subtle` (309). The Colors rule (337), Weights (357), `label-compact` (366), Lines (471, the 4px bar no longer marks navigation), Components (522) and the choices list (549).

### Storybook

- `.kv-story-surface` (`apps/storybook/.storybook/preview.css:85-92`) becomes square with a `surface` fill and one inline-end hairline like `.docs-sidebar`, keeping the 15rem cap. A new `.kv-story-surface--wide` has no cap, for horizontal stories.
- Stories in `components/navigation/`: Default (two levels; `className` is a select: none, `kv-navigation--horizontal`, `kv-compact`), Keyboard, Horizontal, ActiveTrail (four levels, a staff tree), CollapsedGroups (`hidden`, and a collapsed trail branch), PageNotInTheMenu (`current={true}` on the deepest item shown), LabelledByHeading, TwoNavigations, WithServiceLink, CompactDensity (both orientations), LongFinnishText plus a 320px horizontal one, FocusVisible, RouterLink, RTL, ForcedColors (trail and horizontal). A new `navigation.fixture.tsx` holds `RoutedNavigation` and the staff tree.

The six Link stories (`link.stories.tsx`):

| Story                  | Action                                                                                                                                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CurrentPage :230       | Deleted. Default and ActiveTrail carry its asserts. Drop `current-page` from `link.e2e.ts` (:133-147, :164).                                                                                                                |
| RouterLink :380        | Stays in Link as `RoutedLinks` (a `<ul>`, no Navigation), because its Enter row is Link's contract. Navigation gets its own `RouterLink` from `navigation.fixture.tsx#RoutedNavigation` (moved from `link.fixture.tsx:34`). |
| FocusVisible :429      | Link keeps the running-text half. Navigation gets `FocusVisible` (Tab onto the current link).                                                                                                                               |
| CompactNavigation :498 | Deleted. `CompactDensity` covers it.                                                                                                                                                                                        |
| RTL :533               | Link keeps the text and notice links. Navigation's RTL shows both orientations.                                                                                                                                             |
| ForcedColors :566      | Link keeps the text, new-tab and service links. Navigation has its own.                                                                                                                                                     |

Also fix the header comment `link.stories.tsx:19-21`, the `Navigation` import (:8), the `forced-colors` axe name in `link.e2e.ts:172` (it uses the navigation's "Ansök" link) and `link.a11y.md:85-86` (it cites "Compact navigation" and "Current Page"; the Router row is :42). Keep the story title `Components/Navigation` and the `kv-navigation*` class names, so story ids (`navigation.e2e.ts:10`, `dev-warnings.mdx:72-73`) and consumers (`apps/docs/components/site-navigation.tsx`, `prose.fixture.tsx:291-331`) do not break.

## Tasks

- [ ] `ux-designer`: §13 Horizontal, the DESIGN.md wording, the `.kv-story-surface` answer and the usability plan in `navigation-link-options.md`. The maintainer approves the visual spec (one round with Plans 0048 and 0049)
- [ ] Failing tests first: `navigation.test.tsx` (the warning, the type test), `navigation.e2e.ts` (the Tab row, 320px horizontal Finnish)
- [ ] `navigation.tsx`: the `navigation-multiple-current:<name>` warning; fix the "no orientation prop" comment
- [ ] `theme.css` §8 (C, T3, hover underline, weights, `[hidden]`, horizontal, forced colours), the header comment, `packages/theme/README.md:35`, the `contrast-requirements.ts:98` wording; `theme:check`
- [ ] `DESIGN.md` and `docs/design/navigation.md` as above; check `docs/design/section.md:395`
- [ ] Storybook: `.kv-story-surface`, move the six stories and `RoutedNavigation`, the new stories, `navigation.fixture.tsx`, `navigation.e2e.ts`, the `link.e2e.ts` and `link.a11y.md` fixes, a `dev-warnings.mdx` row
- [ ] Docs and skills: `navigation.md`, `navigation.a11y.md`, `api-conventions/SKILL.md:58`, `api-conventions/references/dev-warnings.md`, `theme-css/SKILL.md`
- [ ] Changeset `.changeset/navigation-t3c.md` (theme minor, react patch; says the look changes), roadmap row (`docs/roadmap.md:30`), `docs/plans/README.md` (fix the 0043 row, add 0047 to 0049), `docs/design/README.md`
- [ ] Orchestrator: the gates, then the display-mode sweep once (`E2E_BROWSERS=sweep` on `navigation.e2e.ts`: the forced-colours block is rewritten), then `accessibility-reviewer`

## Decisions

- **T3 with C, `:has()`, weight 400 at rest and 600 current, the hover underline instead of a fill.** The maintainer's choice ("t3 c design"). It rewrites DESIGN.md's navigation rules (a token and rule change, approved with the design).
- **Orientation is the class `kv-navigation--horizontal`, not a prop.** Links are plain Tab stops, so it is a look, not behaviour (`architecture.md`: options are classes). This replaces "vertical only, no orientation prop" in the 0043 spec.
- **Scope is orientation and the trail.** Root, List and Item stay. Flyouts and collapsing stay NavigationMenu (M4); the maintainer chose this over collapsible groups and the full menu.
- **Horizontal builds one level.** Hiding the nested lists of items off the trail with `display: none` would strand keyboard and screen-reader users from those links, and a second row needs `display: contents` or grid tricks that break the `:has()` trail and the focus ring. A nested list in a horizontal navigation stacks under its parent, indented, as today; a section's sub-links are a second `Navigation` with its own name. Q-N1 asks the maintainer whether a second row is wanted.
- **The trail is `:has()`, not a `data-trail` prop.** No API change, no state the consumer must set. Fallback if `:has()` is slow on huge CMS trees: a `Navigation.Item` prop that renders `data-trail` (its own plan, needs approval).
- **`navigation-multiple-current:<name>`.** One effect-time query of `[aria-current]:not([aria-current="false"])` in `Navigation.Root`, once per name. It guards the rule the look relies on (one current item, never on ancestors).
- **Link keeps `RoutedLinks`.** Link's Router row and its Enter test are Link's contract, so Link keeps a Navigation-free router story, and Navigation gets its own.
- **A collapsed group is `hidden`, not unmounted.** The current link must stay in the DOM for `:has()`. A CMS that unmounts collapsed groups marks the deepest item shown `current={true}` (GOV.UK's "active" pattern).
- **No automated check for the forced-colours 1.4.1 cue.** It would read the computed weight, which rule 13 forbids. It is checked by eye in the ForcedColors story and the sweep.

## Risks & open questions

- C's solid fill may be read as keyboard focus (the Listbox's active option and a pressed Toggle are solid too). The usability test is `pending`; the fallback is B (quiet fill) with T1 (the connector line), which is a new plan. `on-primary` on `primary` is 4.70:1, the lowest text pair, at 14px and weight 600 in compact: it passes with no margin.
- `:has()` cost on very large CMS trees: measure once in `ActiveTrail` with 500 items.
- The docs sidebar (`apps/docs/components/site-navigation.tsx`; its group labels are spans, so they get no trail mark) and `prose.fixture.tsx:291-331` change look. Check them in Storybook in four themes, forced colours and 320px.
- Q-N1 (a second row for the trail branch) is open.
- Plan 0043's accessibility-reviewer APPROVE is unchecked, so the reviewer reads the whole `navigation.a11y.md`, not only the diff.

## Testing strategy

Rule 13: no CSS values in tests.

- `navigation.test.tsx`: the warning fires once with two current links; it does not fire for one, for `aria-current="false"`, or for two navigations with one each; a current link in a nested list counts; a type test shows `NavigationRootProps` has no `orientation`.
- E2E: the Tab row above; `no horizontal scrolling at 320px with the horizontal Finnish text (1.4.10)`; the new stories in the axe loop (four themes).
- Story plays: ActiveTrail has exactly one `aria-current="page"` and none on ancestors; Horizontal links are at least 24px.

## Rollout

`.changeset/navigation-t3c.md`: `@kvirn-ui/theme` minor (the look changes: weights, the current fill, hover) and `@kvirn-ui/react` patch (the warning). 0.x, so no codemod.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT and the usability test may be `pending`)
- [ ] accessibility-reviewer APPROVE (for the whole `navigation.a11y.md`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated

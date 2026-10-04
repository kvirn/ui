---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

Add `Navigation` and the service link (Plan 0043). `Link` is only a link: a list of page links with a current page is now its own component.

- `@kvirn-ui/react`: `Navigation.Root`, `Navigation.List` and `Navigation.Item` (also `NavigationRoot`, `NavigationList` and `NavigationItem`, and the `useNavigation` hook). `Navigation.Root` renders a `<nav class="kv-navigation">` named by `label` (`aria-label`) or your own `aria-labelledby`, `List` a `<ul class="kv-navigation-list">` and `Item` an `<li class="kv-navigation-item">`. A sub-navigation is another `Navigation.List` inside an `Item`. The current page stays `current="page"` on its `Link`. A development warning fires when a navigation has no name, and when two navigation landmarks share a name (WCAG 2.4.1, 2.4.6). Types `NavigationRootProps`, `NavigationListProps`, `NavigationItemProps`, `NavigationElementProps`, `NavigationState`, `UseNavigationOptions`, `UseNavigationResult` and the part prop types.
- `@kvirn-ui/react`: `Link.Icon` (also `LinkIcon`), a decorative `<span class="kv-link-icon" aria-hidden="true">` first in a link, so the icon is never part of the link's name.
- `@kvirn-ui/theme`: `className="kv-link--service"` on a `Link` styles the one link that starts an e-service: an outlined label in the `link` colour, and with a `Link.Icon` first a `primary` block holding an `on-primary` icon. It is flat (no button depth), has no disabled state and keeps its edge and icon divider in forced colours. No new colour or contrast pair.

**Breaking in 0.x: `kv-nav` is removed, with no alias.** The context class on a consumer's `<ul>` is replaced by the component. Migration: wrap the list in `<Navigation.Root label="Huvudmeny">`, render the `<ul>` as `<Navigation.List>` and each `<li>` as `<Navigation.Item>`, and delete `class="kv-nav"` and your own `<nav aria-label>`. A link's selector changes from `.kv-nav .kv-link` to `.kv-navigation-item > .kv-link`, and prose now leaves `kv-navigation` alone instead of `kv-nav`. A nested list is now indented 16px.

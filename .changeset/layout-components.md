---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

Add the layout components `Container` (`size`: `page`, `reading`, `form`), `Stack` (`gap`), `Columns` (`minColumnWidth`, `gap`) and `SidebarLayout` (`Root`, `Sidebar`, `Content`; `sidebarWidth`), with the hooks `useContainer`, `useStack`, `useColumns` and `useSidebarLayout`. They add no role, landmark or state, keep DOM order as the visual order, and reflow at 320px. `theme.css` styles `kv-container`, `kv-stack`, `kv-columns` and `kv-sidebar-layout` from the existing `space` tokens.

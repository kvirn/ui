---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

Add `itemToLang` to `Listbox.Root` and `useListbox`: it puts `lang` on each native `<option>`, each popup option and the trigger's value, so a language switcher reads each name in its own language (WCAG 3.1.2). Add `Navigation.Label` (also `NavigationLabel`, with `labelProps` from `useNavigation`): a group's name in a `Navigation.Item`, which names the nested `Navigation.List` with `aria-labelledby`. `@kvirn-ui/theme` styles `kv-navigation-label`.

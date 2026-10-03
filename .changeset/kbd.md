---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

Kbd (Plan 0024).

- `Kbd` and `useKbd()`: a key in running text, as `<kbd class="kv-kbd">`. One key per `Kbd`, and a `Kbd` around keys groups them (`<Kbd><Kbd>Ctrl</Kbd>+<Kbd>C</Kbd></Kbd>`). No role, ARIA, text or strings: key names are not translated, so set `lang="en"` on a key in other-language text. Attributes and the ref reach the element, a `className` joins `kv-kbd`, and `render` changes the element. Types: `KbdProps`, `KbdState`, `KbdElementProps`, `KbdPartProps`, `UseKbdResult`.
- `@kvirn-ui/theme`: `kv-kbd` draws a key like prose's `kbd`, in prose and outside it.

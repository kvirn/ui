---
'@kvirn-ui/theme': minor
---

`kv-prose` now covers everything Tailwind's typography plugin does, and there is an optional `reset.css`.

- Sizes: `kv-prose--small` (14px, for notes and metadata, not essential text), `kv-prose--xl` and `kv-prose--2xl`, next to `--large`. `--xl` and `--2xl` step down below 40rem. `kv-prose--full` lifts the 70ch measure, like `max-w-none`.
- Colour roles, named like the plugin's `--tw-prose-*`: `--kv-prose-color-body`, `-headings`, `-lead`, `-links`, `-links-hover`, `-bold`, `-counters`, `-bullets`, `-hr`, `-quotes`, `-quote-borders`, `-captions`, `-code`, `-pre-code`, `-pre-bg`, `-th-borders` and `-td-borders`. They are declared on `.kv-prose`, so each theme resolves its own, and default to the semantic tokens. The colours don't change unless you set one.
- New rules (small visible changes: list items gain start padding, the first and last table column lose their inline padding, the last body row has no rule under it, `th` and `dt` take the heading colour, and ordered-list numbers are weight 400): bold in a heading is a step heavier, bold and code in a link, quote or table head follow the part, `li` has start padding, the first and last table column are flush, `thead` and `tfoot` have their own rules, and `th` and `dt` use the heading colour. `.kv-lead` works on any element, not only `p.kv-lead`.
- `@kvirn-ui/theme/reset.css`: Tailwind's Preflight in plain CSS (MIT, notice in the file), in `@layer kv-reset` below the theme, which now declares `@layer kv-reset, kv;`. Lists keep their markers and `kv-icon` stays inline. It is not imported by `theme.css`.

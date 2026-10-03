# ADR-0054: Prose is the description of a Field or Fieldset

- **Status:** Accepted
- **Date:** 2026-10-03
- **Deciders:** Magnus Vike (asked for Prose instead of Description), proposed with Plan 0025
- **Tags:** api, a11y, breaking

## Context

`Field.Description` (and `Fieldset.Description`, the same component) is a `<p>` that registers its id so the control gets `aria-describedby` (ADR-0029, ADR-0031). It is a second way to write text set for reading, next to `Prose` (ADR-0052), with its own class and its own copy of the body-text rules.

## Decision drivers

- One way to write text set for reading.
- Keep the association mechanism (ids in DOM order, then the error).
- No silent change for a Prose outside a form.

## Decision

1. **`Prose` inside a `Field.Root` or `Fieldset.Root` is the description.** It registers with the host like `Field.Description` did, gets the id from it, and is listed in `aria-describedby` in DOM order. Registration is automatic: a Prose in a Field that isn't a hint goes outside the Field (`kv-not-prose` is CSS only, and a Prose registers at any depth).
2. **`Field.Description`, `Fieldset.Description` and their types are removed** (breaking, pre-1.0, no deprecation). `useField` and `useFieldset` keep `descriptionProps` and `getDescriptionProps`, and their class is `kv-prose`.
3. **`Field.Prose` and `Fieldset.Prose` are aliases of `Prose`** (the same component, like `Prose.Root`), so the hint reads as part of the Field. They add nothing: a `Prose` in a Field registers either way.
4. **The registration is one internal hook** shared by Prose and `FileUpload.Limits`, which stays.
5. **Outside a Field or Fieldset, Prose is unchanged** and does not warn.
6. **Theme:** `.kv-field-description` is removed. A `kv-prose` inside a field or fieldset is prose again (the nearest boundary wins, as for cards). A hint above the control stays the body size, and a hint under it is `body-small` (14px), both in the text colour in every density and never muted. This changes DESIGN.md's "hints are never `body-small`" (Magnus Vike, 2026-10-03).

## Typography plugin parity

`Prose` is `@tailwindcss/typography` (MIT, Tailwind Labs) for KvirnUI: the same elements, roles and sizes, written in our tokens and our standard (logical properties, `:where()` zero specificity, no Tailwind). The plugin's source (`src/styles.js`, `src/index.js`) was compared rule by rule. Nothing is imported or copied, so there is no dependency (hard rule 6).

| Plugin                                                                                                                                                                                                                                 | Prose                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `h1` to `h4`, `p`, `a`, `strong`, `em`, `ol` (all `type`s), `ul`, `li`, markers, `dl`, `dt`, `dd`, `hr`, `blockquote`, `figure`, `figcaption`, `img`, `picture`, `video`, `table` with `thead`, `tbody`, `tfoot`, `code`, `pre`, `kbd` | Styled. `h5` and `h6` too, plus `abbr`, `small`, `sub`, `sup` and `mark`. `kbd` is the [Kbd](0053-kbd.md) look                                                                                                               |
| `h1 strong`, `a strong`, `blockquote strong`, `thead th strong`, `code` in headings, links, quotes and table heads                                                                                                                     | Added: bold in a heading is a step heavier, and bold or code in a link, quote or table head follows the part                                                                                                                 |
| `[class~="lead"]`                                                                                                                                                                                                                      | `.kv-lead` on any element (it was `p.kv-lead`)                                                                                                                                                                               |
| `li` start padding, first and last table column flush, `thead` rule, `tfoot` rule, `thead th` bottom aligned                                                                                                                           | Added                                                                                                                                                                                                                        |
| `--tw-prose-*` colour roles (body, headings, lead, links, bold, counters, bullets, hr, quotes, quote-borders, captions, kbd, code, pre-code, pre-bg, th-borders, td-borders)                                                           | `--kv-prose-color-<role>`, declared on `.kv-prose` (so each theme resolves its own), defaulting to the semantic tokens. Not on `:root`. `kbd` roles belong to Kbd                                                            |
| Sizes `prose-sm`, `base`, `lg`, `xl`, `2xl`                                                                                                                                                                                            | `kv-prose--small`, default, `--large`, `--xl`, `--2xl`: token swaps. `--small` is 14px for notes and metadata, never for essential text. `--xl` and `--2xl` step down below 40rem (ADR-0028). Headings keep their type roles |
| `max-w-none`                                                                                                                                                                                                                           | `kv-prose--full`                                                                                                                                                                                                             |
| `not-prose`                                                                                                                                                                                                                            | `kv-not-prose`, and the card, notification, field and fieldset boundaries                                                                                                                                                    |
| Element modifiers (`prose-headings:`, `prose-a:`, …)                                                                                                                                                                                   | Not needed. Every rule has zero specificity, so plain CSS on the element wins, and a role variable recolours a part                                                                                                          |
| Colour themes (`gray`, `slate`, …, link-only colours) and `prose-invert`                                                                                                                                                               | Not carried. The four themes and the role variables do it, and `theme:check` measures the contrast of the result                                                                                                             |

Deliberate differences, all for accessibility or the design language: no generated backticks around inline `code` and no generated quote marks on `blockquote` (generated content is read inconsistently, and the chip and the bar already carry the meaning), `blockquote` and `kbd` are not italic or shadowed, `dd` has no indent (320px), `pre` wraps instead of scrolling (no keyboard-unreachable scroller), and heading sizes are the type roles, not em multiples.

## Consequences

- Positive: one text component, one set of rules, a hint can have several paragraphs.
- Positive: less API and less CSS.
- Negative: breaking. Every `Field.Description` becomes `<Prose><p>…</p></Prose>`, which is more to type for the common one-line hint.
- Negative: an accessible description is plain text, so a heading, list or link inside the hint loses its structure. The contract says to keep a hint short.
- Negative: a Prose that isn't a hint can't sit directly in a Field.

## Validation

Tests for id registration, DOM order, several hints, and no registration outside a host. axe in every story state. `theme:check`. The manual AT matrix stays `pending`.

## References

- Plan 0025, ADR-0029, ADR-0031, ADR-0052

# Accessibility contract: Prose

- **APG pattern:** none. Prose is a styling container, not a widget (ADR-0052).
- **Deviations:** none. Decisions: ADR-0052 (Prose) and ADR-0054 (a Prose in a Field or Fieldset is its description).
- **Native elements used:** `<div>` by default. The consumer picks `<article>` or `<section>` with `render`, and the element's own semantics apply.
- **Status:** alpha candidate (Plan 0023). Gates pending. Manual AT is `pending`.
- **Tests:** `prose.test.tsx` next to this file. `prose.stories.tsx` in `apps/storybook/src/components/prose/`.

Prose is the `kv-prose` class as a component: a container whose headings, paragraphs, lists, links and tables the theme sets for reading. It adds no role, ARIA, text, `tabindex` or behaviour of its own, with one exception: inside a `Field.Root` or `Fieldset.Root` it is the description of the control or the group (below). The stories on this component's Docs page show the typography on a full article.

## Roles, states, properties

| Part       | Element / role             | ARIA                                     | Notes                                                                                                                                                                       |
| ---------- | -------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prose.Root | `<div>` → `generic`        | none                                     | `class="kv-prose"`. `Prose`, `Prose.Root` and `ProseRoot` are the same component. `render={<article />}` or `<section aria-labelledby>` change the element                  |
| Prose.Root | attributes                 | passed through                           | The class is its own: a `className` prop and a `render` element's own `className` join it, never replace it. Add `kv-prose--large` for the larger size                      |
| Prose.Root | never                      | no `role`, `aria-*`, `tabindex`, `inert` | No handler, no heading, no live region, no text                                                                                                                             |
| Prose.Root | inside a Field or Fieldset | `id`, `data-invalid`, `data-disabled`    | It is the description: see below. The host lists its id in `aria-describedby`. `data-invalid` and `data-disabled` follow the host. Outside a host: none of this, no warning |

`useProse()` gives the same `rootProps` (only `className`) for your own element.

## A Prose in a Field or Fieldset is its description (ADR-0054)

A `Prose` inside a `Field.Root` or a `Fieldset.Root` registers itself with the nearest one, like `Field.ErrorMessage` does, and is the hint of that control or group. There is no `Field.Description` or `Fieldset.Description`.

- **Registration is automatic** and has no opt-out. The control's (or group's) `aria-describedby` lists every registered Prose in DOM order, each with its own id, then the error. The id is listed only while the Prose is rendered (`prose.test.tsx › a Prose in a Field registers its id and the control’s aria-describedby lists it`, `prose.test.tsx › two Proses are listed in DOM order, then the error`, `prose.test.tsx › a Prose in a Fieldset describes the group`).
- **The nearest host wins.** A Prose in a Field that is inside a Fieldset describes that Field's control, not the group (`prose.test.tsx › a Prose in a Field inside a Fieldset describes the Field’s control, not the group`).
- **The description is the Prose's text content.** A heading, list, table or link inside it is read as plain text, without its role or structure, and a link in it can't be followed from the description (`prose.test.tsx › the description is its text content: a heading, list and link inside lose their structure`). So keep a hint to plain text and a few short paragraphs.
- **A Prose that isn't a hint goes outside the Field or Fieldset.** Every Prose inside a host registers.
- **State and props.** The host's `data-invalid` and `data-disabled` are on the Prose, and `render` gets the host's state as its second argument (`isInvalid`, `isRequired`, `isDisabled`). The consumer's `ref`, `className` and other props are kept. The `id` is the host's: an `id` of your own gives a dev warning from `mergeProps` and the host's wins (`prose.test.tsx › invalid and disabled: …`, `prose.test.tsx › keeps the consumer’s ref and className next to the registration`).
- **Outside a host** a Prose has no id, no `data-*` and no warning (`prose.test.tsx › a Prose outside a Field or Fieldset has no id and does not warn`).
- **Element.** A `<div>` by default, so a hint can hold several paragraphs. `render={<p />}` makes a one-line hint a paragraph.

## Keyboard

This component has no focusable parts and handles no keys.

| Key | Context    | Action                                               | Test                                                                                   |
| --- | ---------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| –   | Prose.Root | No `tabindex` is rendered, so Prose never gets focus | `prose.test.tsx › renders one <div> with its class, no role or ARIA, and its children` |

## Focus management

- Initial focus: not moved. Prose never moves focus.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: Prose renders no overlay and sets no `overflow`, so a link's focus ring inside it is never clipped (2.4.11).

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Prose renders no text, so it has no message keys.

## Consumer responsibilities

- **The content's semantics.** Real headings in order, real lists, links that say where they go, tables with headers (1.3.1, 2.4.4). Prose styles what is there. It doesn't add structure.
- **Content from a CMS or Markdown** needs the same checks before it is rendered.
- **A hint in a Field or Fieldset is short plain text.** Don't put a heading, list, table or link in it: the accessible description keeps only the text. Put such a Prose outside the Field.
- **Language.** `lang` on prose in another language (3.1.2).

## Visual / modes

Headless: Prose ships no CSS. With `@kvirn-ui/theme/theme.css` the `kv-prose` rules apply (design spec `docs/design/foundations-and-prose.md`): a 70ch measure, the body and heading type roles, link underline and focus ring, and reflow without fixed sizes. Contrast of text, links and code on `canvas` and `surface` is measured by `theme:check` (1.4.3, 1.4.11). Forced colours, reduced motion, 320px reflow and text spacing are covered by the Prose stories (`Components/Prose`) (1.4.10, 1.4.12).

## WCAG SCs covered

- 1.3.1 Info and Relationships: no role of its own, so the consumer's content decides the semantics (`prose.test.tsx`). In a Field or Fieldset the hint is in the accessible description of the control or group (`prose.test.tsx`, axe in both).
- 3.3.2 Labels or Instructions: a hint in a Field is linked to its control.
- 1.4.3, 1.4.10, 1.4.12: the `kv-prose` theme rules, as tested in the Prose stories.

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta, ADR-0004)**   |         |        |        |       |
| NVDA + Firefox + Windows                 | pending |        |        |       |
| VoiceOver + Safari + macOS               | pending |        |        |       |
| VoiceOver + Safari + iOS                 | pending |        |        |       |
| TalkBack + Chrome + Android              | pending |        |        |       |
| Windows Contrast Themes + Edge           | pending |        |        |       |
| Keyboard only / 400% zoom / 320px reflow | pending |        |        |       |
| **Release (before 1.0 and each minor)**  |         |        |        |       |
| JAWS + Chrome + Windows                  | pending |        |        |       |
| NVDA + Chrome + Windows                  | pending |        |        |       |
| Narrator + Edge + Windows                | pending |        |        |       |
| Dragon / Voice Control                   | pending |        |        |       |

## Known issues

None.

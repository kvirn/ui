# Accessibility contract: Prose

- **APG pattern:** none. Prose is a styling container, not a widget.
- **Deviations:** none. A Prose in a Field or Fieldset is its description (forms skill).
- **Native elements used:** `<div>` by default. The consumer picks `<article>` or `<section>` with `render`, and the element's own semantics apply.
- **Status:** alpha candidate (Plan 0023). Gates pending. Manual AT is `pending`.
- **Tests:** `prose.test.tsx` next to this file. `prose.stories.tsx` in `apps/storybook/src/components/prose/`.

Prose is the `kv-prose` class as a component: a container whose headings, paragraphs, lists, links and tables the theme sets for reading. It adds no role, ARIA, text, `tabindex` or behaviour of its own, with one exception: inside a `Field` or `Fieldset` it is the description of the control or the group (below). The stories on this component's Docs page show the typography on a full article.

## Roles, states, properties

| Part  | Element / role             | ARIA                                     | Notes                                                                                                                                                                             |
| ----- | -------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prose | `<div>` → `generic`        | none                                     | `class="kv-prose"`. `Prose` and `ProseRoot` are the same component (`Prose.Root` is a deprecated alias). `render={<article />}` or `<section aria-labelledby>` change the element |
| Prose | attributes                 | passed through                           | The class is its own: a `className` prop and a `render` element's own `className` join it, never replace it. Add `kv-prose--large` for the larger size                            |
| Prose | never                      | no `role`, `aria-*`, `tabindex`, `inert` | No handler, no heading, no live region, no text                                                                                                                                   |
| Prose | inside a Field or Fieldset | `id`, `data-invalid`, `data-disabled`    | It is the description: see below. The host lists its id in `aria-describedby`. `data-invalid` and `data-disabled` follow the host. Outside a host: none of this, no warning       |

`useProse()` gives the same `rootProps` (only `className`) for your own element.

## A Prose in a Field or Fieldset is its description

A `Prose` inside a `Field.Root` or a `Fieldset.Root` registers itself with the nearest one, like `Field.ErrorMessage` does, and is the description of that control or group (above the control). The help text is a different part, `Field.HelpText`, under the control; `field.a11y.md` owns it. Inside a host it is written `Field.Prose` or `Fieldset.Prose` (the same behaviour under the host's name; `CheckboxGroup.Prose` and `RadioGroup.Prose` are the group forms). There is no `Field.Description` or `Fieldset.Description`.

- **Registration is automatic** and has no opt-out. The control's (or group's) `aria-describedby` lists every registered Prose in DOM order, each with its own id, then the error. The id is listed only while the Prose is rendered (`prose.test.tsx › a Prose in a Field registers its id and the control’s aria-describedby lists it`, `prose.test.tsx › two Proses are listed in DOM order, then the error`, `prose.test.tsx › a Prose in a Fieldset describes the group`).
- **The nearest host wins.** A Prose in a Field that is inside a Fieldset describes that Field's control, not the group (`prose.test.tsx › a Prose in a Field inside a Fieldset describes the Field’s control, not the group`).
- **The description is the Prose's text content.** A heading, list, table or link inside it is read as plain text, without its role or structure, and a link in it can't be followed from the description (`prose.test.tsx › the description is its text content: a heading, list and link inside lose their structure`). So keep a description to plain text and a few short paragraphs.
- **A Prose that isn't a description goes outside the Field or Fieldset.** Every Prose inside a host registers.
- **State and props.** The host's `data-invalid` and `data-disabled` are on the Prose, and `render` gets the host's state as its second argument (`isInvalid`, `isRequired`, `isDisabled`). The consumer's `ref`, `className` and other props are kept. The `id` is the host's: an `id` of your own gives a dev warning from `mergeProps` and the host's wins (`prose.test.tsx › invalid and disabled: …`, `prose.test.tsx › keeps the consumer’s ref next to the registration`).
- **Outside a host** a Prose has no id, no `data-*` and no warning (`prose.test.tsx › a Prose outside a Field or Fieldset has no id and does not warn`).
- **Element.** A `<div>` by default, so a description can hold several paragraphs. `render={<p />}` makes a one-line description a paragraph.

## Content classes: inset, steps, figure, video and audio

Two theme classes for CMS content. Neither is a component, adds a role, or needs a string. Neither is a focusable part, so the Keyboard section below is unchanged.

- `kv-inset`: any block, usually `<div>`; no role, no ARIA, not a live region. Not `aside` (a landmark), not `role="note"`, not `role="status"`: it is static article content, never announced (4.1.3 does not apply). Test: `prose.test.tsx › kv-inset adds no role, no live region and no tab stop, and its text stays in the reading order`.
- `kv-steps`: native `<ol>`. Keeps the `list` role with n `listitem`s (Chromium); the WebKit list role and the marker being read are not proven by a test: AT verification `pending`. The number is the native `::marker`, never `list-style: none`, so WebKit keeps the list too. No `aria-current`, no `tabindex`. Test: `prose.test.tsx › ol.kv-steps keeps the list role with one listitem per step, and no ARIA of its own`.
- `figure`: native `figure`, named by `figcaption`. No class: prose already styles it. Test: `prose.test.tsx › an article with an inset, steps and a figure with alt text has no axe violations`.

Consumer responsibilities for these (nothing enforces them):

- **Inset.** Start it with a word that says why it is set apart ("Viktigt:", "Tänk på:") or a heading that states the point, never a bare "Viktigt" heading. The bar and the fill are not read aloud, and colour is never the only cue (1.3.1, 1.4.1). A heading inside keeps the page's heading order (2.4.6). The fill matches a `surface` Section there: the bar and the leading word carry it.
- **Inset, Alert or blockquote.** Content that is part of the article and must not be missed (a condition, an exception, a tip) is `kv-inset`. A legal or money consequence, or a deadline you lose rights by missing ("Ansök senast 30 april, annars behandlas ansökan inte"), is a static `Alert.Warning`. The state of something (saved, failed) is an Alert, announced only when it appears after an action. A quotation is a `blockquote`.
- **Steps or Stepper.** `kv-steps` is content: all the steps of a process, about 3 to 8, each a heading plus text (every step has a heading or none; headings start with a verb and do not repeat the number). The Stepper (Plan 0053) is a caption above a form question with the user's current step. They share no markup, class or string. Do not use `kv-steps` as a progress indicator. A short list of one-line instructions stays a plain prose `ol`.
- **Alt text** (1.1.1, 1.4.5). Informative photo: what it shows that matters here, about 150 characters at most; credit and source in the `figcaption`. Map, chart or plan: a short `alt` (what and where), and the facts in the body text or a table right after it, never only in `title`. Image of text: avoid, else all the text in `alt` and in HTML. Decorative: `alt=""`, no `figure`, no caption. Linked image: the link's destination. `alt` and `figcaption` are both read, so they never repeat each other. Text in another language gets `lang` (3.1.2).
- **Video and audio: guidance only, no component** (design §8.1). Native `<video controls preload="metadata" playsinline>`, self-hosted, with a `<track kind="captions" srclang default>` per language and a `poster` (1.2.2). Never `autoplay` (1.4.2, 2.2.2). No YouTube, Vimeo or other iframe (no third-party network calls). Information that is only visual is spoken in the narration, or an audio-described version or a transcript with the descriptions sits next to the video (1.2.3, 1.2.5). `<audio controls>` gets a transcript (1.2.1). Keyboard support of native media controls differs per browser: AT verification `pending`.
- **Not styled.** Native `details` and `summary` are not styled in prose. Closed `details` content does not print: do not put the only copy of a fact there.

## Keyboard

This component has no focusable parts and handles no keys.

| Key | Context | Action                                               | Test                                                                                              |
| --- | ------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| –   | Prose   | No `tabindex` is rendered, so Prose never gets focus | `prose.test.tsx › renders one element with the kv-prose class, no role or ARIA, and its children` |

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
- **A description in a Field or Fieldset is short plain text.** Don't put a heading, list, table or link in it: the accessible description keeps only the text. Put such a Prose outside the Field.
- **Language.** `lang` on prose in another language (3.1.2).
- **Size and colour choices.** `kv-prose--small` only for notes and metadata, and the contrast of any `--kv-prose-color-*` you override (see Sizes, width and colour roles).

## Visual / modes

Headless: Prose ships no CSS. With `@kvirn-ui/theme/theme.css` the `kv-prose` rules apply (design spec `docs/design/foundations-and-prose.md`): a 70ch measure, the body and heading type roles (`h1` to `h6` have their own roles, and `h4` to `h6` stay at 16px in every prose size), link underline on hover and focus ring, and reflow without fixed sizes. Contrast of text, links and code on `canvas` and `surface` is measured by `theme:check` (1.4.3, 1.4.11). Text spacing is reviewed in the `Text spacing` story (1.4.12). Reduced motion: Prose animates only a link's colour, and only when motion is allowed.

## Sizes, width and colour roles

With the theme, `kv-prose--small` (14px), the default (16px), `kv-prose--large` (18px), `kv-prose--xl` (20px) and `kv-prose--2xl` (24px) are token swaps, and `kv-prose--xl` and `--2xl` step down to the large size below 40rem. `kv-prose--full` removes the 70ch measure. The text stays in rem and the line height has no fixed height, so it resizes to 200% (1.4.4) and the text-spacing overrides fit (1.4.12). The `--kv-prose-color-*` roles recolour one part and default to the theme's tokens, so each theme and the high-contrast and forced-colours themes still apply.

- **`kv-prose--small` is for notes and metadata only.** DESIGN.md keeps essential content at 16px or more, so a resident's instructions are never `--small`. Nothing enforces this: it is a consumer responsibility.
- **Headings keep their roles in every size.** `h1` to `h6` use `heading-1` to `heading-6` whatever the prose size. `h4` to `h6` are 16px (never below, because essential content is never smaller) and are told apart by weight and tracking, so in `--large`, `--xl` and `--2xl` they are smaller than the body text. Stop at `h3` in resident-facing text. Nothing enforces this: it is a consumer responsibility.
- **A colour you set is yours to check.** `theme:check` measures the default tokens, not an override: text and links 4.5:1, a quote bar or rule 3:1 against the surface it sits on, in every theme you ship (1.4.3, 1.4.11).
- **Not carried from the typography plugin:** generated backticks and quote marks (generated content is read inconsistently), italics on a quote, and a scrolling `pre` (a scroller a keyboard user can't reach).

## WCAG SCs covered

- 1.3.1 Info and Relationships: no role of its own, so the consumer's content decides the semantics (`prose.test.tsx`). In a Field or Fieldset the description is in the accessible description of the control or group (`prose.test.tsx`, axe in both).
- 3.3.2 Labels or Instructions: a description in a Field is linked to its control.
- 1.4.3, 1.4.10, 1.4.12: the `kv-prose` theme rules, as tested in the Prose stories. The sizes and the width option are checked in the `Sizes` and `Full width and colour roles` stories; the colour roles are held by `theme:check`.
- 1.4.4 Resize Text: the sizes are in rem.
- 1.1.1, 1.2.1 to 1.2.5, 1.4.1, 1.4.5: the figure, video and audio guidance and the inset's leading word, which are consumer responsibilities above. 1.3.1: `kv-steps` is a native list.

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta)**             |         |        |        |       |
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

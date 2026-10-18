# Accessibility contract: Prose

- **APG pattern:** none. Prose is a styling container, not a widget.
- **Deviations:** none. A Prose in a Field or Fieldset is its description (see below).
- **Native elements used:** `<div>` by default. The consumer picks `<article>` or `<section>` with `as` (allowed elements below), and the element's own semantics apply.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `prose.test.tsx` next to this file. `prose.stories.tsx` in `apps/storybook/src/components/prose/`.

Prose is the `kv-prose` class as a component: a container whose headings, paragraphs, lists, links and tables the theme sets for reading. It adds no role, ARIA, text, `tabindex` or behaviour of its own, with one exception: inside a `Field` or `Fieldset` it is the description of the control or the group (below).

## Roles, states, properties

| Part  | Element / role             | ARIA                                     | Notes                                                                                                                                                                                                                                             |
| ----- | -------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prose | `<div>` → `generic`        | none                                     | `class="kv-prose"`. `Prose` and `ProseRoot` are the same component (`Prose.Root` is a deprecated alias). `as="article"` or `as="section"` with `aria-labelledby` change the element                                                               |
| Prose | attributes                 | passed through                           | The class is its own: a `className` prop joins it, never replaces it. `as` is a string; a value outside the list is a type error and, in JavaScript, warns once in development and renders the `<div>`. Add `kv-prose--large` for the larger size |
| Prose | never                      | no `role`, `aria-*`, `tabindex`, `inert` | No handler, no heading, no live region, no text                                                                                                                                                                                                   |
| Prose | inside a Field or Fieldset | `id`, `data-invalid`, `data-disabled`    | It is the description: see below. The host lists its id in `aria-describedby`. `data-invalid` and `data-disabled` follow the host. Outside a host: none of this, no warning                                                                       |

`useProse()` gives the same `rootProps` (only `className`) for your own element.

## A Prose in a Field or Fieldset is its description

A `Prose` inside a `Field.Root` or a `Fieldset.Root` registers itself with the nearest one, like `Field.ErrorMessage` does, and is the description of that control or group (above the control). The help text is a different part, `Field.HelpText`, under the control; `field.a11y.md` owns it. Inside a host it is written `Field.Prose` or `Fieldset.Prose` (the same behaviour under the host's name; `CheckboxGroup.Prose` and `RadioGroup.Prose` are the group forms). There is no `Field.Description` or `Fieldset.Description`.

- **Registration is automatic** and has no opt-out. The control's (or group's) `aria-describedby` lists every registered Prose in DOM order, each with its own id, then the error. The id is listed only while the Prose is rendered (`prose.test.tsx › a Prose in a Field registers its id and the control’s aria-describedby lists it`, `prose.test.tsx › two Proses are listed in DOM order, then the error`, `prose.test.tsx › a Prose in a Fieldset describes the group`).
- **The nearest host wins.** A Prose in a Field that is inside a Fieldset describes that Field's control, not the group (`prose.test.tsx › a Prose in a Field inside a Fieldset describes the Field’s control, not the group`).
- **The description is the Prose's text content.** A heading, list, table or link inside it is read as plain text, without its role or structure, and a link in it can't be followed from the description (`prose.test.tsx › the description is its text content: a heading, list and link inside lose their structure`). So keep a description to plain text and a few short paragraphs.
- **A Prose that isn't a description goes outside the Field or Fieldset.** Every Prose inside a host registers.
- **State and props.** The host's `data-invalid` and `data-disabled` are on the Prose. The consumer's `ref`, `className` and other props are kept. The `id` is the host's: an `id` of your own gives a dev warning from `mergeProps` and the host's wins (`prose.test.tsx › invalid and disabled: …`, `prose.test.tsx › keeps the consumer’s ref next to the registration`).
- **Outside a host** a Prose has no id, no `data-*` and no warning (`prose.test.tsx › a Prose outside a Field or Fieldset has no id and does not warn`).
- **Element.** A `<div>` by default, so a description can hold several paragraphs. A `<p>` is not allowed, because Prose holds block content: for a one-line description, write the `<p>` inside the Prose.

## Content classes: inset, steps, figure, video and audio

Two theme classes for CMS content. Neither is a component, adds a role, or needs a string. Neither is a focusable part, so the Keyboard section below is unchanged.

- `kv-inset`: any block, usually `<div>`; no role, no ARIA, not a live region. Not `aside` (a landmark), not `role="note"`, not `role="status"`: it is static article content, never announced (4.1.3 does not apply). Test: `prose.test.tsx › kv-inset adds no role, no live region and no tab stop, and its text stays in the reading order`.
- `kv-steps`: native `<ol>`. Keeps the `list` role with n `listitem`s (Chromium); the WebKit list role and the marker being read are not proven by a test: test it with your own assistive technology. The number is the native `::marker`, never `list-style: none`, so WebKit keeps the list too. No `aria-current`, no `tabindex`. Test: `prose.test.tsx › ol.kv-steps keeps the list role with one listitem per step, and no ARIA of its own`.
- `figure`: native `figure`, named by `figcaption`. No class: prose already styles it. Test: `prose.test.tsx › an article with an inset, steps and a figure with alt text has no axe violations`.

Consumer responsibilities for these (nothing enforces them):

- **Inset.** Start it with a word that says why it is set apart ("Important:", "Note:") or a heading that states the point, never a bare "Important" heading. The bar and the fill are not read aloud, and colour is never the only cue (1.3.1 Info and Relationships (A), 1.4.1 Use of Color (A)). A heading inside keeps the page's heading order (2.4.6 Headings and Labels (AA)). On a Section with the same background colour as the inset's fill, only the bar and the leading word set it apart.
- **Inset, Alert or blockquote.** Content that is part of the article and must not be missed (a condition, an exception, a tip) is `kv-inset`. A legal or money consequence, or a deadline you lose rights by missing ("Apply by 30 April, or the application will not be processed"), is a static `Alert.Warning`. The state of something (saved, failed) is an Alert, announced only when it appears after an action. A quotation is a `blockquote`.
- **Steps or Stepper.** `kv-steps` is content: all the steps of a process, about 3 to 8, each a heading plus text (every step has a heading or none; headings start with a verb and do not repeat the number). The Stepper is a caption above a form question with the user's current step. They share no markup, class or string. Do not use `kv-steps` as a progress indicator. A short list of one-line instructions stays a plain prose `ol`.
- **Alt text** (1.1.1 Non-text Content (A), 1.4.5 Images of Text (AA)). Informative photo: what it shows that matters here, about 150 characters at most; credit and source in the `figcaption`. Map, chart or plan: a short `alt` (what and where), and the facts in the body text or a table right after it, never only in `title`. Image of text: avoid, else all the text in `alt` and in HTML. Decorative: `alt=""`, no `figure`, no caption. Linked image: the link's destination. `alt` and `figcaption` are both read, so they never repeat each other. Text in another language gets `lang` (3.1.2 Language of Parts (AA)).
- **Video and audio: guidance only, no component.** Native `<video controls preload="metadata" playsinline>`, self-hosted, with a `<track kind="captions" srclang default>` per language and a `poster` (1.2.2 Captions (Prerecorded) (A)). Never `autoplay` (1.4.2 Audio Control (A), 2.2.2 Pause, Stop, Hide (A)). No YouTube, Vimeo or other iframe (no third-party network calls). Information that is only visual is spoken in the narration, or an audio-described version or a transcript with the descriptions sits next to the video (1.2.3 Audio Description or Media Alternative (Prerecorded) (A), 1.2.5 Audio Description (Prerecorded) (AA)). `<audio controls>` gets a transcript (1.2.1 Audio-only and Video-only (Prerecorded) (A)). Keyboard support of native media controls differs per browser: test the controls with your own assistive technology.
- **Not styled.** Native `details` and `summary` are not styled in prose. Closed `details` content does not print: do not put the only copy of a fact there.

## Allowed elements

A tag outside the list changes the page's outline or semantics (1.3.1 Info and Relationships (A), 4.1.2 Name, Role, Value (A)). `as` is a string, so it works from a Server Component.

| Part  | `as`                                  | Why                                                                                                                                                                              |
| ----- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prose | `div` (default), `article`, `section` | A self-contained piece or a named region around text. No `p` (Prose holds headings, lists and tables, which a paragraph can't contain), no landmark other than a named `section` |

## Keyboard

This component has no focusable parts and handles no keys.

| Key | Context | Action                                               | Test                                                                                              |
| --- | ------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| –   | Prose   | No `tabindex` is rendered, so Prose never gets focus | `prose.test.tsx › renders one element with the kv-prose class, no role or ARIA, and its children` |

## Focus management

- Initial focus: not moved. Prose never moves focus.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: Prose renders no overlay and sets no `overflow`, so a link's focus ring inside it is never clipped (2.4.11 Focus Not Obscured (Minimum) (AA)).

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Prose renders no text, so it has no message keys.

## Consumer responsibilities

- **The content's semantics.** Real headings in order, real lists, links that say where they go, tables with headers (1.3.1 Info and Relationships (A), 2.4.4 Link Purpose (In Context) (A)). Prose styles what is there. It doesn't add structure.
- **Content from a CMS or Markdown** needs the same checks before it is rendered.
- **A description in a Field or Fieldset is short plain text.** Don't put a heading, list, table or link in it: the accessible description keeps only the text. Put such a Prose outside the Field.
- **Language.** Text in another language goes in a nested `KvirnProvider`, with `useLocale().localeProps` on your own element (3.1.2 Language of Parts (AA)).
- **Size and colour choices.** `kv-prose--small` only for notes and metadata, and the contrast of any `--kv-prose-color-*` colour you override (see Sizes, width and colour roles).

## Visual / modes

Headless: Prose ships no CSS. With the default theme the `kv-prose` rules apply:

- **Line length and type.** A 70-character line length, and the body and heading type styles. `h1` to `h6` each have their own style, and `h4` to `h6` stay at 16px in every prose size.
- **Links.** A link has an underline on hover and a focus ring.
- **Contrast.** Text, links and code on the page and section backgrounds are checked automatically (1.4.3 Contrast (Minimum) (AA), 1.4.11 Non-text Contrast (AA)).
- **Reflow.** Nothing has a fixed size, so text reflows (reviewed in the stories, not automated (1.4.10 Reflow, AA)).
- **Text spacing.** Reviewed by hand in a Storybook story (1.4.12 Text Spacing (AA)).
- **Reduced motion.** Prose animates only a link's colour, and only when motion is allowed.

## Sizes, width and colour roles

With the theme, `kv-prose--small` (14px), the default (16px), `kv-prose--large` (18px), `kv-prose--xl` (20px) and `kv-prose--2xl` (24px) are token swaps, and `kv-prose--xl` and `--2xl` step down to the large size below 40rem. `kv-prose--full` removes the 70ch measure. The text stays in rem and the line height has no fixed height, so it resizes to 200% (1.4.4 Resize Text (AA)) and the text-spacing overrides fit (1.4.12 Text Spacing (AA)). The `--kv-prose-color-*` roles recolour one part and default to the theme's tokens, so each theme, the high-contrast themes and forced colours still apply.

- **`kv-prose--small` is for notes and metadata only.** The design system keeps essential content at 16px or more, so a resident's instructions are never `--small`. Nothing enforces this: it is a consumer responsibility.
- **Headings keep their roles in every size.** `h1` to `h6` keep their own heading styles whatever the prose size. `h4` to `h6` are 16px (never below, because essential content is never smaller) and are told apart by weight and tracking, so in `--large`, `--xl` and `--2xl` they are smaller than the body text. Stop at `h3` in resident-facing text. Nothing enforces this: it is a consumer responsibility.
- **A colour you set is yours to check.** The automatic contrast check measures the default colours, not an override: text and links 4.5:1, a quote bar or rule 3:1 against the surface it sits on, in every theme you ship (1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast).
- **Not carried from the typography plugin:** generated backticks and quote marks (generated content is read inconsistently), italics on a quote, and a scrolling `pre` (a scroller a keyboard user can't reach).

## WCAG SCs covered

- 1.3.1 Info and Relationships (A): Prose has no role of its own, so the content you write decides the semantics (`prose.test.tsx`). In a Field or Fieldset the description is part of the accessible description of the control or group (`prose.test.tsx`, axe in both). `kv-steps` is a native list.
- 3.3.2 Labels or Instructions (A): a description in a Field is linked to its control.
- 1.4.3 Contrast (Minimum) (AA), 1.4.10 Reflow (AA) and 1.4.12 Text Spacing (AA): the `kv-prose` theme rules, as checked in the Storybook stories. The sizes and the width option are checked in the `Sizes` and `Full width and colour roles` stories, and the default colours by the automatic contrast check.
- 1.4.4 Resize Text (AA): the sizes are in rem.
- 1.1.1 Non-text Content (A), 1.2.1, 1.2.2 and 1.2.3 (A), 1.2.5 (AA), 1.4.1 Use of Color (A) and 1.4.5 Images of Text (AA): the figure, video and audio guidance and the inset's leading word. These are consumer responsibilities (see What you need to do).

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                                   |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                         |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | prose.stories.tsx, every story, 4 themes                                                                                |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | prose.test.tsx › renders one element with the kv-prose class, no role or ARIA, and its children; expectNoA11yViolations |
| Keyboard contract rows (Vitest browser)                                    | n/a         | n/a         | n/a     | no focusable or operable part; prose renders no tabindex                                                                |
| Focus order and management                                                 | n/a         | n/a         | n/a     | nothing focusable: the component never takes or moves focus                                                             |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pending     | n/a         | pending | not swept: the sweeps cover Button and SkipPanel                                                                        |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                         |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                         |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                                         |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                         |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                         |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                                         |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                                         |

## Known issues

None.

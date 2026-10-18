# Accessibility contract: Section

- **APG pattern:** none. A section is not a widget, so there is no APG pattern.
- **Deviations:** none
- **Native elements used:** `<div>` by default. The consumer picks another with `as` (allowed elements below), and the element's own semantics apply.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `section.test.tsx` next to this file. `section.stories.tsx` in `apps/storybook/src/components/section/`.

Section is a plain container for a region of the page, such as a sidebar or a band of content. It adds no role, no ARIA, no text, no `tabindex` and no behaviour. Everything a user perceives inside a section comes from the consumer's children, which keep their own semantics and focus order. A section is not the `Section` part of Disclosure or Tabs: those are parts of another component.

## Roles, states, properties

| Part    | Element / role      | ARIA                                                    | Notes                                                                                                                                                                                                   |
| ------- | ------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Section | `<div>` → `generic` | none. The consumer adds it with the element             | `as="aside"`, `"section"` or `"nav"` with `aria-labelledby` give it a landmark role, and `"li"` a list item. `Section.Root` is a deprecated alias of the same component. Also exported as `SectionRoot` |
| Section | `as`                | the chosen element's own                                | One element, chosen with a string. A value outside the list is a type error and, in JS, warns once in development and renders the `<div>`. `className` joins, `style` and refs pass                     |
| Section | attributes          | passed through                                          | `aria-*`, `id`, `data-*` and every other attribute reach the element unchanged. The part's class is its own: a `className` prop joins it, never replaces it                                             |
| Section | never               | no `role`, `aria-*`, `tabindex`, `inert`, `aria-hidden` | No click handler, no heading, no live region, no text                                                                                                                                                   |

`useSection()` gives the same `rootProps` (only `className`) for your own element.

## Keyboard

This component has no focusable parts and handles no keys.

Section is never a Tab stop and never changes the Tab order. Its children handle their own keys. These rows prove Tab passes over the section.

| Key       | Context                         | Action                                                          | Test                                                                                             |
| --------- | ------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Tab       | Section with focusable children | Moves through the children in DOM order. The section is skipped | `section.test.tsx › the section is skipped by Tab: focus goes through its children in DOM order` |
| Shift+Tab | Section with focusable children | Moves back through the children in reverse DOM order            | `section.test.tsx › the section is skipped by Tab: focus goes through its children in DOM order` |
| –         | Root                            | No `tabindex` is rendered, so the section never receives focus  | `section.test.tsx › rendering › adds no role, ARIA or tabindex`                                  |

Enter, Space, Escape, arrow keys and Home / End are not handled. Children handle their own keys.

## Focus management

- Initial focus: not moved. Section never moves focus.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: Section renders no overlay. The default theme never sets `overflow` on a section, so a child's focus ring is never clipped (2.4.11 Focus Not Obscured (Minimum), AA).

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Section renders no text, so it has no message keys.

## Allowed elements

A tag outside the list changes the page's outline or semantics (1.3.1 Info and Relationships, A; 4.1.2 Name, Role, Value, A). `as` is a string, so it works from a Server Component.

| Part    | `as`                                                                            | Why                                                                                                                                |
| ------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Section | `div` (default), `section`, `aside`, `nav`, `footer`, `header`, `article`, `li` | The landmark or sectioning elements a region can be, and `li` for a list of sections. No `main` (Container), no `form`, no heading |

## Consumer responsibilities

- **Headings.** Put a heading at the top of the section, at the level the page outline needs: `h2` for a sidebar or a band under the page's `h1`. Section can't know it (2.4.6 Headings and Labels, AA; 1.3.1 Info and Relationships, A).
- **Landmarks are opt-in, and named.** The default `<div>` is not a landmark. `as="aside"` with `aria-labelledby={headingId}` is complementary content, `as="section"` with it is a region worth jumping to, and `as="nav"` with it is a sidebar of navigation. A `<section>` without a name is `generic` (HTML-AAM), so it is useless as a landmark. Keep landmarks few: never make every band a landmark. A top-level `<header>` or `<footer>` becomes `banner` or `contentinfo`, so only one of each.
- **Reading and focus order.** The children's DOM order. A sidebar that sits on the inline end at `64rem` comes after the main content in the DOM. Never reorder with `order` or grid placement against the DOM (1.3.2 Meaningful Sequence, A; 2.4.3 Focus Order, A).
- **Lists.** A list of sections is a `<ul>` with each section rendered as `<li>` (`as="li"`). The default theme draws no marker, and Safari can then expose the `<ul>` as a plain group: `role="list"` on the `<ul>` keeps it a list there. This is the same Safari problem as for a list of cards (see Card's Known issues). Check it with VoiceOver in Safari in your own service.
- **Nesting.** A Card on a Section, yes. A Section inside a Card, no (a region inside a thing). A Section inside a Section only to switch between `surface` and `canvas`.
- **Scrolling.** Never `overflow` on the Section. A sidebar that scrolls on its own goes in a named scroll region that is a Tab stop (a ScrollArea does both). A sticky sidebar needs `scroll-padding` (2.4.11 Focus Not Obscured (Minimum), AA).
- **Not empty.** Don't render a Section with no content: it still has padding and a surface.
- **Language.** Text in another language goes in a nested `KvirnProvider`, with `useLocale().localeProps` on your own element (3.1.2 Language of Parts, AA).

## Visual / modes

Headless: Section ships no CSS. With the default theme (`@kvirn-ui/theme/theme.css`):

- Focus indicator: none of its own (a section is never focused). Children keep their own rings, never clipped.
- Target size: not applicable. Section has no controls of its own (2.5.8 Target Size (Minimum), AA).
- Contrast: text, links, muted text, control edges and focus rings are held to their minimums on the `surface` and `canvas` looks by the theme's contrast check (1.4.3 Contrast (Minimum), AA; 1.4.11 Non-text Contrast, AA). The section's own boundary is decorative (1.06–1.10:1 from the page): the region is identified by its position, its heading and, where it is worth it, its landmark.
- forced-colors behaviour: `surface` and `canvas` both use the system's page background colour, and the section's thin border uses the system's text colour on all four sides.
- reduced-motion behaviour: no motion. No hover, transition or pointer style.
- Reflow and text spacing: no fixed sizes, no `overflow`, `overflow-wrap: break-word`, and the section can shrink in a grid (reviewed in the Section stories, not by a CSS test). Media directly in the section never get wider than it. Two stories check that nothing scrolls sideways in a 320 CSS px column, one with Finnish text and one with a wide image (1.4.10 Reflow, AA). The section sets no fixed height, so with the text-spacing overrides it grows and nothing is clipped (1.4.12 Text Spacing, AA).
- The no-padding option, with a focusable child flush to a viewport edge, would push the outer part of its focus ring off-screen: use it for frames whose children pad themselves, and for media.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A): no role of its own, so the consumer's element and children decide the semantics (`section.test.tsx`).
- 1.3.2 Meaningful Sequence (A), 2.4.3 Focus Order (A): DOM order equals reading and focus order (the Tab rows above).
- 1.4.3 Contrast (Minimum) (AA), 1.4.11 Non-text Contrast (AA): the theme's contrast check covers the pairs on the `surface` and `canvas` looks. 1.4.6 Contrast (Enhanced) is AAA and not counted toward AA.
- 1.4.10 Reflow (AA): the Finnish text story and the wide image story at 320 CSS px.
- 1.4.12 Text Spacing (AA): no fixed sizes or heights, so nothing is clipped (reviewed in the stories).
- 2.4.1 Bypass Blocks (A): a named landmark helps screen-reader users skip to it, where the consumer opts in.
- 2.4.11 Focus Not Obscured (Minimum) (AA): no clipping (reviewed in the stories). 2.4.13 Focus Appearance is AAA and not counted toward AA.
- 4.1.2 Name, Role, Value (A): no role or name of its own to get wrong. A landmark's name is the consumer's.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                                                                                                           |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                                                                                                 |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | section.stories.tsx, every story, 4 themes                                                                                                                                                      |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | section.test.tsx › adds no role, ARIA or tabindex; expectNoA11yViolations                                                                                                                       |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | section.test.tsx › the section is skipped by Tab: focus goes through its children in DOM order                                                                                                  |
| Focus order and management                                                 | n/a         | n/a         | n/a     | nothing focusable: the component never takes or moves focus                                                                                                                                     |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pending     | n/a         | pending | not swept: the sweeps cover Button and SkipPanel                                                                                                                                                |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                                                                                                 |
| NVDA + Chrome + Windows                                                    | n/a         | n/a         | n/a     | native `<div>`, or the landmark element the consumer picks, with its own semantics; landmark semantics are the element's own native mapping; Section adds none; no state, focus or key handling |
| VoiceOver + Safari + iOS                                                   | n/a         | n/a         | n/a     | native `<div>`, or the landmark element the consumer picks, with its own semantics; landmark semantics are the element's own native mapping; Section adds none; no state, focus or key handling |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                                                                                                 |
| JAWS + Chrome + Windows                                                    | n/a         | n/a         | n/a     | native `<div>`, or the landmark element the consumer picks, with its own semantics; landmark semantics are the element's own native mapping; Section adds none; no state, focus or key handling |
| TalkBack + Chrome + Android                                                | n/a         | n/a         | n/a     | native `<div>`, or the landmark element the consumer picks, with its own semantics; landmark semantics are the element's own native mapping; Section adds none; no state, focus or key handling |
| VoiceOver + Safari + macOS                                                 | n/a         | n/a         | n/a     | native `<div>`, or the landmark element the consumer picks, with its own semantics; landmark semantics are the element's own native mapping; Section adds none; no state, focus or key handling |

## Known issues

- **No visible region edge in the high-contrast themes.** The `surface` look on the `canvas` look is 1.06:1 in light high-contrast and 1.10:1 in dark high-contrast, the same as the standard themes. A sidebar there has no visible edge unless you colour one with a border colour of your own. This is decorative for WCAG, but a usability question. Users have not tested it yet.
- **Keyboard tests run in Chromium only.** The keyboard rows run in Vitest browser mode on Chromium, not in WebKit. Test in Safari with your own assistive technology.

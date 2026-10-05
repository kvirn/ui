# Accessibility contract: Card

- **APG pattern:** none. A card is not a widget, so there is no APG pattern.
- **Deviations:** none
- **Native elements used:** `<div>` for every part by default. The consumer picks `<article>`, `<section>`, `<aside>` or `<li>` with `render`, and the element's own semantics apply.
- **Status:** alpha candidate (Plan 0007). Gates 1–5 pass, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `card.test.tsx` next to this file. `card.stories.tsx` in `apps/storybook/src/components/card/`.

Card is a plain container for content on a surface. It adds no role, no ARIA, no text, no `tabindex` and no behaviour. Everything a user perceives inside a card comes from the consumer's children, which keep their own semantics and focus order.

## Roles, states, properties

| Part        | Element / role               | ARIA                                                    | Notes                                                                                                                                                                                                                                                       |
| ----------- | ---------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Card.Root   | `<div>` → `generic`          | none. The consumer adds it with the element             | `class="kv-card"`. `render={<article />}`, `<section aria-labelledby>`, `<aside aria-labelledby>` or `<li>` give it a role. Also exported as `CardRoot`                                                                                                     |
| Card.Header | `<div>` → `generic`          | none                                                    | `class="kv-card-header"`. **Never `<header>`**: at the top level it would be a `banner` landmark. Also exported as `CardHeader`                                                                                                                             |
| Card.Body   | `<div>` → `generic`          | none                                                    | `class="kv-card-body"`. Also exported as `CardBody`                                                                                                                                                                                                         |
| Card.Footer | `<div>` → `generic`          | none                                                    | `class="kv-card-footer"`. **Never `<footer>`**: at the top level it would be a `contentinfo` landmark. Also exported as `CardFooter`                                                                                                                        |
| every part  | `render` (element, function) | the rendered element's own                              | One element per part. An element keeps its own props, and the part's are merged in: `className` joins, `style` merges, refs merge                                                                                                                           |
| every part  | attributes                   | passed through                                          | `aria-*`, `id`, `lang`, `data-*` and every other attribute reach the element unchanged. The part's class is its own: a `className` prop and a `render` element's own `className` join it, never replace it. In the `render` function form, keep `className` |
| every part  | never                        | no `role`, `aria-*`, `tabindex`, `inert`, `aria-hidden` | No click handler, no heading, no live region, no text                                                                                                                                                                                                       |

`useCard()` gives the same `rootProps`, `headerProps`, `bodyProps` and `footerProps` (only `className`) for your own elements.

## Keyboard

This component has no focusable parts and handles no keys.

Card is never a Tab stop and never changes the Tab order. Its children handle their own keys. These rows prove Tab passes over the card.

| Key       | Context                      | Action                                                                                                 | Test                                                                                       |
| --------- | ---------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Tab       | Card with focusable children | Moves through the children in DOM order (a heading link, then the footer buttons). The card is skipped | `card.test.tsx › the card is skipped by Tab: focus goes through its children in DOM order` |
| Shift+Tab | Card with focusable children | Moves back through the children in reverse DOM order. The card is skipped                              | `card.test.tsx › Shift+Tab moves back through the children`                                |
| –         | Every part                   | No `tabindex` is rendered, so a part never receives focus                                              | `card.test.tsx › rendering › adds no role, ARIA or tabindex`                               |

Enter, Space, Escape, arrow keys and Home / End are not handled. Children handle their own keys.

## Focus management

- Initial focus: not moved. Card never moves focus.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: Card renders no overlay. The default theme never sets `overflow` on a card, so a child's focus ring (2px, 2px offset) is never clipped (2.4.11, 2.4.13). Media that touch a rounded corner get the corner's radius themselves instead.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Card renders no text, so it has no message keys.

## Consumer responsibilities

- **Heading level.** Put a heading at the top of `Card.Body` (or the Root), at the level the page outline needs: `h2` for a card on My pages, `h3` for cards under an `h2` list heading. Card can't know it (2.4.6, 1.3.1).
- **Alt text.** `alt=""` for a decorative image, which most card images are when the heading names the topic. Real alt text for an informative one. No text in images. The image comes first in the DOM, as it does visually (1.3.2, 1.1.1).
- **Links.** One link per card, in the heading, with text that makes sense on its own (2.4.4). No "Read more", and no second link on the image.
- **Buttons.** Verbs, one primary per view. Navigation is a Link, not a Button.
- **Landmarks.** `render={<section aria-labelledby={headingId} />}` or `<aside aria-labelledby>` only for a region a user would want to jump to. A `section` without a name isn't a landmark. Never make every card in a list a landmark. `<article>` is for a self-contained item such as a news story.
- **Lists.** A list of cards is a `<ul>` with each card rendered as `<li>` (`render={<li />}`), so screen readers announce the number of items. The default theme draws no marker on a card, and Safari can then expose a `<ul>` without visible markers as a plain group. `role="list"` on the `<ul>` keeps it a list there (see Known issues).
- **Card or Section.** A card is one identifiable thing. A region of the page (a sidebar, a band, a group of controls) is a [Section](../section/section.a11y.md), and a form section is a heading or a `<fieldset>`. A Card on a Section is fine. Don't put a Section inside a Card.
- **Language.** `lang` on any card text in another language (3.1.2).
- **Parts are direct children of the Root.** The default theme's padding model relies on it. Don't render an empty part.

## Visual / modes

Headless: Card ships no CSS. With `@kvirn-ui/theme/theme.css` (design spec `docs/design/card.md`):

- Focus indicator: none of its own (a card is never focused). Children keep their own rings, never clipped.
- Target size: not applicable. Footer buttons keep their own sizes (2.5.8).
- Contrast: text, links, muted text and button edges are held to their minimums on `surface-raised`, the card's own surface, and on the surfaces a card sits on (`surface`, `canvas`) by `theme:check` (1.4.3, 1.4.11). The card's own edge is decorative (1.15–1.36:1 in the standard themes): grouping comes from structure and spacing.
- forced-colors behaviour: every card keeps a 1px solid border in `CanvasText`, so its boundary and dividers survive.
- reduced-motion behaviour: no motion. No hover, transition or pointer style.
- Reflow and text spacing: no fixed sizes, no `overflow`, `overflow-wrap: break-word`, and the card can shrink in a grid (reviewed in the Card stories, not by a CSS test). Media directly in a part or the Root never get wider than it. No horizontal scrolling at 320 CSS px with the Finnish fixture (1.4.10), and with the 1.4.12 text-spacing overrides the card grows and nothing is clipped: both are checked in the reflow sweep.

## WCAG SCs covered

- 1.3.1 Info and Relationships: no role of its own, so the consumer's element and children decide the semantics. Header and Footer are never landmarks (`card.test.tsx`).
- 1.3.2 Meaningful Sequence, 2.4.3 Focus Order: DOM order equals reading and focus order (the Tab rows above).
- 1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast: `theme:check` pairs on every card surface.
- 1.4.10 Reflow: the reflow sweep, the Finnish fixture story, and a wide image in a padded body at 320px.
- 1.4.12 Text Spacing: the sweep with the text-spacing overrides at 320px on the service card, the list of cards and the Finnish fixture.
- 2.4.11 Focus Not Obscured (Minimum), 2.4.13 Focus Appearance: no clipping (reviewed in the stories).
- 4.1.2 Name, Role, Value: no role or name of its own to get wrong.

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

- **WebKit not run locally.** The `webkit` and `mobile-safari` Playwright projects need system libraries that aren't installed on the development machine. CI runs them.
- **`role="list"` and lint.** The design spec's list of cards uses `<ul role="list">` for Safari, but the repository's jsx-a11y `no-redundant-roles` rule rejects it, so the stories use a plain `<ul>`. The docs (`card.md`, the JSDoc example) show `<ul role="list">`, which isn't linted. Open question in Plan 0007. Check the list in VoiceOver + Safari in the manual AT run.
- **Prose and nested cards.** Prose turned on inside a card (`kv-prose`) stops at a nested card, for two levels of nesting. Deeper nesting isn't supported by the default theme's selectors.

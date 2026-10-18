# Accessibility contract: Card

- **APG pattern:** none. A card is not a widget, so there is no APG pattern.
- **Deviations:** none
- **Native elements used:** `<div>` for every part by default. `Card.Root` takes `as` (allowed elements below), and the element's own semantics apply.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `card.test.tsx` next to this file. `card.stories.tsx` in `apps/storybook/src/components/card/`.

Card is a plain container for content on a surface. It adds no role, no ARIA, no text, no `tabindex` and no behaviour. Everything a user perceives inside a card comes from the consumer's children, which keep their own semantics and focus order.

## Roles, states, properties

| Part        | Element / role      | ARIA                                                    | Notes                                                                                                                                                                                                                                                        |
| ----------- | ------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Card.Root   | `<div>` → `generic` | none. The consumer adds it with the element             | `class="kv-card"`. `as="article"`, `"section"` with `aria-labelledby`, `"figure"` or `"li"` give it a role. Also exported as `CardRoot`                                                                                                                      |
| Card.Header | `<div>` → `generic` | none                                                    | `class="kv-card-header"`. **Never `<header>`**: at the top level it would be a `banner` landmark. Also exported as `CardHeader`                                                                                                                              |
| Card.Body   | `<div>` → `generic` | none                                                    | `class="kv-card-body"`. Also exported as `CardBody`                                                                                                                                                                                                          |
| Card.Footer | `<div>` → `generic` | none                                                    | `class="kv-card-footer"`. **Never `<footer>`**: at the top level it would be a `contentinfo` landmark. Also exported as `CardFooter`                                                                                                                         |
| Card.Root   | `as`                | the chosen element's own                                | One element, chosen with a string. A tag outside the list is a type error. In plain JavaScript it warns once in development and renders a `<div>`. Header, Body and Footer have no `as`: they are always a `<div>`. `className` joins, `style` and refs pass |
| every part  | attributes          | passed through                                          | `aria-*`, `id`, `data-*` and every other attribute reach the element unchanged. The part's class is its own: a `className` prop joins it, never replaces it                                                                                                  |
| every part  | never               | no `role`, `aria-*`, `tabindex`, `inert`, `aria-hidden` | No click handler, no heading, no live region, no text                                                                                                                                                                                                        |

`useCard()` gives the same `rootProps`, `headerProps`, `bodyProps` and `footerProps` (only `className`) for your own elements.

## Allowed elements

A tag outside the list changes the page's outline or semantics (1.3.1, 4.1.2). `as` is a string, so it works from a Server Component.

| Part                 | `as`                                                  | Why                                                                                                                                   |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Card.Root            | `div` (default), `li`, `article`, `figure`, `section` | A list item, a self-contained item, media with a caption, or a named region. No `aside` (a card is an object, not tangential content) |
| Header, Body, Footer | none                                                  | Always a `<div>`: a `<header>` or `<footer>` would become a landmark                                                                  |

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
- Never hidden by: Card draws nothing over its content. The default theme never crops a card, so a child's focus ring is not clipped (2.4.11 Focus Not Obscured (Minimum), AA). Media that touch a rounded corner get the corner's radius themselves instead.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Card renders no text, so it has no message keys.

## Consumer responsibilities

- **Heading level.** Put a heading at the top of `Card.Body` (or the Root), at the level the page outline needs: `h2` for a card on My pages, `h3` for cards under an `h2` list heading. Card can't know it (2.4.6 Headings and Labels, 1.3.1 Info and Relationships).
- **Alt text.** Use `alt=""` for a decorative image, which most card images are when the heading names the topic. Give an informative image real alt text. Don't put text in images. The image comes first in the page's order, as it does on screen (1.1.1 Non-text Content, 1.3.2 Meaningful Sequence).
- **Links.** One link per card, in the heading, with text that makes sense on its own (2.4.4 Link Purpose (In Context)). No "Read more", and no second link on the image.
- **Buttons.** Write them as verbs, and use one primary button per view. Going to another page is a Link, not a Button.
- **Landmarks.** Use `as="section"` with `aria-labelledby={headingId}` only for a region a user would want to jump to. A `section` without a name isn't a landmark. Never make every card in a list a landmark. `<article>` is for a self-contained item such as a news story.
- **Lists.** A list of cards is a `<ul>` with each card rendered as `<li>` (`as="li"`), so screen readers say how many items there are. The default theme draws no marker on a card, and Safari can then treat a `<ul>` without visible markers as a plain group. Put `role="list"` on a hand-written `<ul>` to keep it a list there (see Known issues). Stack and Grid add it themselves.
- **Card or Section.** A card is one identifiable thing. A region of the page (a sidebar, a band, a group of controls) is a Section, and a form section is a heading or a `<fieldset>`. A Card on a Section is fine. Don't put a Section inside a Card.
- **Language.** Text in another language goes in a nested `KvirnProvider`, with `useLocale().localeProps` on your own element (3.1.2 Language of Parts).
- **Parts are direct children of the Root.** The default theme's padding relies on it. Don't render an empty part.

## Visual / modes

Headless: Card ships no CSS. With `@kvirn-ui/theme/theme.css`:

- Focus indicator: none of its own, because a card is never focused. Children keep their own rings, and the card doesn't clip them.
- Target size: not applicable. Footer buttons keep their own sizes (2.5.8 Target Size (Minimum), AA).
- Contrast: the default theme checks that text, links, muted text and button edges meet their minimum contrast on the card's surface and on the surfaces a card sits on (1.4.3 Contrast (Minimum), AA; 1.4.11 Non-text Contrast, AA). The card's own edge is decorative and low in contrast on purpose: the heading and the spacing group the content, not the edge.
- Forced colours: the card keeps a visible border in the system's text colour, so its boundary and dividers stay.
- Reduced motion: nothing moves. There is no hover effect, transition or pointer style.
- Reflow and text spacing: no fixed sizes, no clipping, long words break, and the card can shrink in a grid. The stories show it at narrow widths and with a Finnish text, by eye. No automated check covers 320px and text spacing (1.4.10 Reflow, 1.4.12 Text Spacing). Media directly in a part or the Root never get wider than it.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A): the card has no role of its own, so your element and children decide the meaning. Header and Footer are never landmarks.
- 1.3.2 Meaningful Sequence (A) and 2.4.3 Focus Order (A): the order in the page is the reading order and the focus order. The Tab rows prove the card is skipped.
- 1.4.3 Contrast (Minimum) (AA) and 1.4.11 Non-text Contrast (AA): the default theme's colour pairs on every card surface are checked automatically.
- 1.4.10 Reflow (AA) and 1.4.12 Text Spacing (AA): the card doesn't crop or fix its size. This is reviewed in the stories, not by an automated check.
- 2.4.11 Focus Not Obscured (Minimum) (AA): the card doesn't clip a child's focus ring (reviewed in the stories). 2.4.13 Focus Appearance (AAA) is not counted toward AA.
- 4.1.2 Name, Role, Value (A): the card has no role or name of its own to get wrong.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                         |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                               |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | card.stories.tsx, every story, 4 themes                                                                       |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | `card.test.tsx` (axe and role, name and state): `adds no role, ARIA or tabindex`                              |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | 3 rows, each names a test in `card.test.tsx`                                                                  |
| Focus order and management                                                 | pass        | n/a         | pass    | `card.test.tsx`: `the card is skipped by Tab: focus goes through its children in DOM order`                   |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass    | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI |
| **Core (required for beta)**                                               |             |             |         |                                                                                                               |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                               |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                               |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                               |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                               |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                               |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                               |

## Known issues

- **WebKit is not automated.** Keyboard rows run in Vitest browser mode on Chromium. WebKit is not covered by the automated tests, so check Safari with your own users and assistive technology.
- **A list of cards can lose its list role in Safari.** Safari with VoiceOver drops the list role when `list-style: none` removes the markers, which the default theme does. Write `role="list"` on a hand-written `<ul>`, or use Stack or Grid as the list: they add it themselves. If your linter calls `role="list"` redundant, relax that rule for `ul` only. Check it with VoiceOver in Safari.
- **Prose and nested cards.** Prose turned on inside a card (`kv-prose`) stops at a nested card, for two levels of nesting. The default theme doesn't support deeper nesting.

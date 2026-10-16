# Accessibility contract: SkipLink

- **APG pattern:** none. WCAG technique G1 (a link at the top to skip to the main content) with C7 (hide it until it has focus).
- **Deviations:** none. Activating the link moves focus to the target. That is what the link is for.
- **Native elements used:** `<a href="#id">`, never `Link.Root`: a hash on the same page is not a route.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `skip-link.test.tsx` next to this file. `skip-link.stories.tsx` in `apps/storybook/src/components/skip-link/`, where `theme.css` is loaded and the visible state is proved.

SkipLink is a native link with a class. It is the first Tab stop in the body, hidden until it has focus, and it moves focus to the main content.

## Roles, states, properties

| Part     | Element / role         | ARIA                | Notes                                                                                                                                                                                                       |
| -------- | ---------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SkipLink | `<a href>` → `link`    | none                | `class="kv-skip-link"`. The name is the rendered text, the message `skipLink.label` or your children: text and not `aria-label`, so it is translated and found. `href` is required and is a same-page `#id` |
| Target   | the consumer's element | none                | Not focusable by itself: the link adds `tabindex="-1"` on activation and removes it when focus leaves. A target that is already focusable (`tabindex` 0 or -1, a control) is left alone                     |
| SkipLink | `as`                   | the component's own | A component that renders an `<a href>` and forwards its ref. It gets the other props, the ref and the part's class (`className` joins, handlers chain, refs merge)                                          |

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Native tab order. No key is intercepted.

| Key       | Context            | Action                                                                                           | Test                                                                                                           |
| --------- | ------------------ | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Tab       | page load or start | Focuses the skip link. It becomes visible at the top of the page                                 | `skip-link.test.tsx › SkipLink keyboard › the first Tab stop is the skip link`                                 |
| Tab       | on the skip link   | Moves to the next focusable element, and the skip link hides again                               | `skip-link.test.tsx › SkipLink keyboard › Tab leaves the skip link for the next stop`                          |
| Shift+Tab | on the skip link   | Leaves the page content backwards (browser UI)                                                   | `skip-link.test.tsx › SkipLink keyboard › Shift+Tab from the skip link leaves the document`                    |
| Enter     | on the skip link   | Focuses the target (`tabindex="-1"` added if it was not focusable); the next Tab continues in it | `skip-link.test.tsx › SkipLink keyboard › Enter moves focus to the target and the next Tab continues after it` |
| Space     | on the skip link   | Not handled (a link; the page scrolls natively)                                                  | `skip-link.test.tsx › SkipLink keyboard › Space is not handled`                                                |

The visible state is proved in a story test that loads the default theme: hidden before Tab, shown in the page flow while focused, hidden after Tab.

## Focus management

- Initial focus: not moved. The link is a Tab stop and nothing else.
- On activation: focus moves to the target element. The click handler does not call `preventDefault`, so the browser still makes its own jump to the target. The code shows this; no test checks it.
- A target made focusable has `tabindex="-1"` until it loses focus (`SkipLink target › a target without tabindex gets tabindex -1 until it loses focus, then it is removed`). A target already focusable is left alone (`a target that is already focusable is left alone`, `a target with its own tabindex -1 keeps it after blur`).
- Trap: no. Restore to: not applicable.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Moving focus to the target reads its name or content. The only string is the link's label, `skipLink.label`.

## Consumer responsibilities

- **Put it first in the body,** before the header and any other link, and give the main content the id (`<main id="main">`).
- **A missing target warns** in development: `skip-link-target-missing:<id>`.
- **Language.** A custom label is your own text. When it is in another language than the page, mark it: put it in a nested `KvirnProvider` and spread `useLocale().localeProps` on your own element (3.1.2 Language of Parts, AA).
- **Do not hide the target's focus ring.** The default theme draws the focus ring on the target, only when focus came from the keyboard (`:focus-visible`): don't set `outline: none` on `[tabindex="-1"]`.
- **Do not put it in a sticky layer that covers other content** (2.4.11 Focus Not Obscured (Minimum), AA): it stays in the flow.

## Visual / modes

Headless: no CSS. With the default theme the link is hidden visually, but not removed from the page, until it has focus. Nothing is hidden with `display: none`, which would also remove it from the Tab order. When it has focus it appears in the normal flow of the page, with:

- link-coloured text that has enough contrast on the page background (1.4.3 Contrast (Minimum), AA), measured by an automated contrast check;
- an underline, so colour is not the only cue (1.4.1 Use of Color, A);
- a focus ring with at least 3:1 contrast (2.4.7 Focus Visible, AA);
- space around it and a target of at least 24 by 24 CSS pixels (2.5.8 Target Size (Minimum), AA).

It reflows with the page (reviewed in the stories, not yet automated (1.4.10 Reflow, AA)). In forced colours (a Windows contrast mode) it uses the system's link and background colours and a highlight-coloured ring, with no reliance on a background fill. If you restyle it, keep the contrast, the underline, the ring and the target size.

## WCAG SCs covered

- 2.4.1 Bypass Blocks (A): the link jumps to the main content (`SkipLink keyboard › Enter moves focus to the target and the next Tab continues after it`).
- 2.4.3 Focus Order (A): first stop; the next Tab continues in the target.
- 2.4.7 Focus Visible (AA), 2.4.11 Focus Not Obscured (Minimum) (AA): visible and in the page flow while focused (the story test with the theme loaded).
- 1.4.1 Use of Color (A): the link is underlined, so colour is not the only cue (a theme property, not a test).
- 3.1.2 Language of Parts (AA): a custom label in another language is marked by the consumer (see Consumer responsibilities).
- 2.5.8 Target Size (Minimum) (AA), 1.4.10 Reflow (AA), 1.4.3 Contrast (Minimum) (AA) and 1.4.11 Non-text Contrast (AA): the default theme; the contrast is measured by an automated check.
- 4.1.2 Name, Role, Value (A): `link` named by its text (`SkipLink name and attributes › the name is the default label, rendered as text with no ARIA added`, and the axe tests).

## AT test record

| AT + browser + OS                        | Agent check | Human check | Result  | Notes |
| ---------------------------------------- | ----------- | ----------- | ------- | ----- |
| **Core (required for beta)**             |             |             |         |       |
| Windows Contrast Themes + Edge           | pending     | pending     | pending |       |
| Keyboard only / 400% zoom / 320px reflow | pending     | pending     | pending |       |
| VoiceOver + Safari + macOS               | pending     | pending     | pending |       |
| VoiceOver + Safari + iOS                 | pending     | pending     | pending |       |
| TalkBack + Chrome + Android              | pending     | pending     | pending |       |
| NVDA + Chrome + Windows                  | pending     | pending     | pending |       |
| NVDA + Firefox + Windows                 | pending     | pending     | pending |       |
| Narrator + Edge + Windows                | pending     | pending     | pending |       |
| **Release (before 1.0 and each minor)**  |             |             |         |       |
| JAWS + Chrome + Windows                  | pending     | pending     | pending |       |
| Dragon / Voice Control                   | pending     | pending     | pending |       |

## Known issues

- The Finnish, Norwegian Bokmål and Norwegian Nynorsk texts are drafts. A native speaker still has to review them. <!-- kv-lang-ok: the language name Bokmål -->
- Safari (WebKit): it isn't yet known whether the focus ring shows on the target after someone presses Enter on the link. This is not automated, and the manual check is `pending`. In Safari, Tab only reaches links when "Press Tab to highlight each item" is on (or with Option+Tab), so test with that setting on. Don't hide the ring on `[tabindex="-1"]`.

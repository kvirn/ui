# Accessibility contract: Video

- **Scope:** A self-hosted video with captions, a transcript and links to other versions. A recipe: a native `video` and a Disclosure.
- **APG pattern:** none: native `video` controls, with a [Disclosure](../../../../react/src/disclosure/disclosure.a11y.md) for the transcript.
- **Deviations:** none
- **Native elements used:** `<video controls preload="none" poster>`, `<track kind="captions" srclang>`, `<h2>`, `<button type="button">`, `<ul>`, `<li>`, `<a href>`.
- **Status:** in progress (plan 0095 T5). Reviewer and manual AT are `pending`.
- **Tests:** a recipe has no package code and adds no behaviour of its own, so its Keyboard rows name no test. Axe runs on every story in `video.stories.tsx` (`apps/storybook/src/patterns/content-and-media/`).

## Roles, states, properties

| Part                 | Element / role                            | ARIA / state                     | Notes                                                                 |
| -------------------- | ----------------------------------------- | -------------------------------- | --------------------------------------------------------------------- |
| `Heading`            | `<h1>`–`<h6>`                             | none                             | Level chosen for the page outline; no skipped level                   |
| `video`              | `<video controls>`                        | none                             | No `autoplay`, `loop` or `muted`; self-hosted, never an iframe        |
| `track`              | `<track kind="captions" srclang default>` | none                             | One per language                                                      |
| `Disclosure.Trigger` | `<button>`                                | `aria-expanded`, `aria-controls` | Opens the transcript                                                  |
| `Disclosure.Panel`   | `<div>`                                   | none                             | The transcript, so the words and the visual facts can be read instead |
| Other versions       | `<a href>` in a `<ul>`                    | none                             | Audio-described or sign-language version (`WithOtherVersions`)        |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key           | Context            | Action                                                                 | Test                                 |
| ------------- | ------------------ | ---------------------------------------------------------------------- | ------------------------------------ |
| Tab           | in the video block | The video controls, the transcript trigger, then any link in DOM order | Native; the shipped part's own tests |
| Shift+Tab     | in the video block | The reverse order                                                      | Native; the shipped part's own tests |
| Enter / Space | transcript trigger | Opens or closes the transcript; focus stays on the trigger             | Native; the shipped part's own tests |

The keys inside the native video controls are the browser's and differ per browser. The story has no video file, so only the poster, the captions track and the transcript are shown.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

`aria-expanded` carries the transcript state; nothing is announced otherwise.

## Consumer responsibilities

- Provide a captions track per language and a transcript for every video.
- Link an audio-described or sign-language version when one exists.
- No autoplay, no loop, no third-party player.

## Visual / modes

- Focus indicator: the token ring on every focusable part.
- forced-colors behaviour: the `ForcedColors` story; nothing depends on colour alone.
- reduced-motion behaviour: nothing in the recipe animates.
- RTL: the `RTL` story; logical properties.
- 320px / 400% zoom: the `Narrow` story asserts no sideways scroll.

## WCAG SCs covered

- 1.2.1 Audio-only and Video-only (Prerecorded) (A)
- 1.2.2 Captions (Prerecorded) (A)
- 1.2.3 Audio Description or Media Alternative (Prerecorded) (A)
- 1.2.5 Audio Description (Prerecorded) (AA)
- 1.4.2 Audio Control (A)
- 2.1.1 Keyboard (A)
- 2.2.2 Pause, Stop, Hide (A)
- 4.1.2 Name, Role, Value (A)

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

- The native control keys differ per browser, and the story plays no file: how a screen reader reads the controls is not verified (AT `pending`).

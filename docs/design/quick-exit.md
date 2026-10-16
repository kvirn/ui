# Design spec: QuickExit

- **Status:** Approved (maintainer, 2026-10-15). Amended 2026-10-16: visible shortcut hint (§9.8)
- **Designer:** ux-designer agent · **Date:** 2026-10-15
- **Plan:** [0122](plans/0122-quick-exit.md)
- **Type:** component default styling + behaviour

## 1. Brief

- **Users:** residents. Hardest case: a person reading how to report domestic violence on a shared phone, with the abuser in the room, who must make the page disappear in under a second, possibly with a screen reader, a tremor or 400% zoom, in their second language.
- **Job:** When someone may see my screen, I want the page gone at once, so they don't see what I was reading.
- **Context:** rare visits, high stress, any device; the moment of use is sudden and lasts one press.
- **Constraints:** no third-party call from the library (AGENTS.md rule 7): the consumer supplies the destination, the library names no URL. No telemetry, nothing stored (no cookie, no storage flag: a flag would itself be a trace).
- **Success:** activation in one press or Shift×3 from anywhere on the page; nothing of the page visible after the press; no accidental activation reported in testing.
- **Evidence:** GOV.UK's Exit this page was researched with people with lived experience of domestic abuse and with accessibility needs (source below). We have no research of our own.
- **Assumptions and research questions:**
  - Assumption: "Leave this page" is understood faster than "Exit this page" by second-language readers → RQ: first-click and comprehension test, en/sv/fi.
  - Assumption: a calm `secondary` fill is found as quickly as GOV.UK's red → RQ: time to find, on a real content page.
  - Assumption: Shift×3 rarely fires by accident with NVDA (Shift pauses speech) → RQ: AT session with NVDA and JAWS users.
  - Assumption: "Or press Shift 3 times" beside the link reads as a second way to the same action, not a second control, and doesn't confuse touch-only users → RQ: comprehension in the same session.

## 2. Prior art

| Source                                                                                                                                                                                 | What we reuse                                                                                                                                                                                               | What we change and why                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [GOV.UK Exit this page](https://design-system.service.gov.uk/components/exit-this-page/) and [Exit a page quickly](https://design-system.service.gov.uk/patterns/exit-a-page-quickly/) | Top-of-page placement, sticky, Shift×3 within 5 s, a Shift counted only when pressed alone, polite count announcements, page blanked at once, "doesn't erase history" honesty, non-personalised destination | `location.replace` (GOV.UK uses `location.href`, which keeps a Back entry); no "Loading." alert and no overlay text; no visually hidden "Emergency" prefix (alarming, and the visible label is enough); calm role colour instead of the warning red; a visible hint (GOV.UK announces only), because our keyboard rule 7 requires one |
| KvirnUI service link (`kv-link--service`)                                                                                                                                              | A link with its own strong, flat look, because it navigates                                                                                                                                                 | A solid fill instead of an edge, so it is found at a glance                                                                                                                                                                                                                                                                           |
| KvirnUI skip link, Announcer, top bar `secondary` fill, `Field.HelpText`                                                                                                               | First-in-body placement, the shared polite Announcer, the measured `on-secondary` on `secondary` pair, help-text type (`body-small` in `text`) for the hint                                                 | –                                                                                                                                                                                                                                                                                                                                     |
| APG                                                                                                                                                                                    | Link pattern (native `<a href>`)                                                                                                                                                                            | No APG pattern for the shortcut: Shift is a modifier, so 2.1.4 doesn't apply; it is an extra, never the only way                                                                                                                                                                                                                      |

## 3. Flow

1. Page loads: the link is the 2nd Tab stop (after the skip link), visible at the top, with the hint beside it (≥ 40rem) or under it.
2. Press (pointer, Enter, speech "click Leave this page") → `<body hidden>` and `document.title` emptied in the same task → `location.replace(href)`. Nothing animates, no spinner, nothing is announced.
3. Shift×3, anywhere, text fields included. A Shift counts on release, only if no other key and no pointer press came between its keydown and keyup, and not on key repeat: Shift+Tab, capitals and Shift+click never count. The 1st counted Shift starts a 5 s window and announces 2 remaining; the 2nd announces 1; the 3rd exits as in step 2. Another key, a pointer press, or 5 s after the last counted Shift resets silently. The hint never changes.
4. After exit: nothing. No storage, no flag, no return banner.

Unhappy paths:

| Case                                    | Behaviour                                                                                                                                                |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JS not loaded yet or failed             | The native `href` navigates (a normal history entry, Back returns). Shortcut unavailable, but the hint is server-rendered and visible: documented limit. |
| `shortcut={false}`                      | No hint rendered, no `aria-describedby`: the page never promises a key that does nothing.                                                                |
| No `KvirnProvider`                      | Exit works; the count isn't announced (the hook warns once). The hint still shows (default `en` messages).                                               |
| Destination slow or offline             | The page stays blank; the browser shows its own error for the destination. Never the sensitive page again.                                               |
| Ctrl/Cmd/Shift/middle click             | Treated as a plain press: replace in the same tab. A new tab would leave the page open.                                                                  |
| "Open in new tab" from the context menu | Can't be prevented; documented.                                                                                                                          |
| Accidental press                        | The page is gone and Back skips it; the user finds it through history or search. Unsaved form data is lost: the consumer's safety page says so.          |

## 4. Content

| i18n key                      | en                                                                                                               | sv                                                                     | fi (length check)                                                                   | Notes                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `quickExit.label`             | Leave this page                                                                                                  | Lämna sidan                                                            | Poistu sivulta                                                                      | Visible text = accessible name (2.5.3). A verb, calm, no "emergency", no "quick" <!-- kv-lang-ok: locale table: the Swedish and Finnish strings are the subject -->                                                                                                                                                                                 |
| `quickExit.hint`              | Or press Shift 3 times.                                                                                          | Eller tryck på Skift 3 gånger.                                         | Tai paina vaihtonäppäintä 3 kertaa. (35 ch, the longest)                            | Visible, and the link's description. A plain string; the digit, not a word, for second-language readers. nb: "Eller trykk Skift 3 ganger." nn: "Eller trykk Skift 3 gonger." Same key name as the announcement in each locale. fi, nb, nn: native-speaker review <!-- kv-lang-ok: locale table: the Swedish and Finnish strings are the subject --> |
| `quickExit.shortcutRemaining` | `({ remaining })` → "Press Shift 2 more times to leave this page" / "Press Shift 1 more time to leave this page" | "Tryck på Skift 2 gånger till för att lämna sidan" / "… 1 gång till …" | "Paina vaihtonäppäintä vielä 2 kertaa poistuaksesi sivulta" (57 ch, announced only) | Polite, via the Announcer. Number through `format.number` <!-- kv-lang-ok: locale table: the Swedish and Finnish strings are the subject -->                                                                                                                                                                                                        |

"Or" ties the hint to the link next to it and keeps it short, so it reads as a second way, not a second button. No message on timeout, on reset or on exit: each would be noise, and speech on exit can be overheard.

**Docs sentence (what it does and doesn't):** "Leave this page swaps this page for the site you choose, so the Back button doesn't lead straight back to it, but it doesn't clear the browser history, where the page can still be found."

**It must never claim** to be safe, private, untraceable, to hide the visit, or to clear history, cookies or the session.

## 5. Structure

```
<body>
  skip link (Tab 1, hidden until focus, in flow)
  [kv-quick-exit row: sticky, canvas, hairline under]       ← direct child of body
     < 40rem:  [ Leave this page          ] (Tab 2)          ← full width
               Or press Shift 3 times.                        ← kv-quick-exit-hint, start-aligned
     ≥ 40rem:              [Leave this page]  Or press Shift 3 times.   ← group at inline-end
  [header: banner] …  [main] …  [footer]
```

| Width                                                          | Row                                                                                    | Link                                      | Hint                                                                                                               |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 320px – 40rem                                                  | Column, `space-2` gap, padding `space-1` block, `space-4` inline                       | Full width, 44px tall: the largest target | Under the link, start-aligned, wraps (1 line at 320px in every locale, 2 with 1.4.12 spacing in fi)                |
| ≥ 40rem, 64rem                                                 | Row, items centred, `space-3` gap, at inline-end; inline padding `space-6`, `space-10` | Auto width                                | After the link (DOM = visual order), one line; may shrink and wrap to 2, which is still shorter than the 44px link |
| Viewport height < 30rem (400% zoom ≈ 320×200, phone landscape) | **Static**, at the top, scrolls away                                                   | Unchanged. Shift×3 still works            | Unchanged                                                                                                          |
| Print                                                          | `display: none` (hint with it)                                                         | –                                         | –                                                                                                                  |

- DOM order: link, then hint. A screen reader in browse mode meets the action first; "Or …" read before the link would make no sense.
- Sticky only under `(min-height: 30rem)`: at 400% zoom a sticky row would take a quarter of the view. The media query is in `rem`, so with 200% browser text it needs 960px of height: enlarged text on a phone always gets the static row.
- **Scroll padding (2.4.11)**, inside the same media query, on `html:has(.kv-quick-exit)`. It must be at least the tallest row the sticky case can render, plus `space-4`; too much only scrolls a focused element a little further down, too little hides it. All in `rem`/tokens so it grows with text:
  - < 40rem: `2.75rem + space-2 + 3 × body-small size × body-small line-height + 2 × space-1 + border-width + space-4` (≈ 8.7rem; the row is ≈ 5.1rem with a one-line hint). Three hint lines cover fi with text spacing at 320px plus a line of margin.
  - ≥ 40rem: unchanged, `2.75rem + 2 × space-1 + border-width + space-4`, because a hint of up to 2 lines (2.625rem) is shorter than the link.
  - A consumer hint override longer than 3 lines (< 40rem) or 2 (≥ 40rem) breaks the budget: documented on the docs page.
- Never put it in a menu, disclosure, drawer, footer only or a dialog: it must be one press from anywhere. Never on a `secondary`-filled top bar (it would vanish into it); place the row above the header instead.
- Every page of a sensitive service gets it, not just the first.

## 6. Visual specification

| Part                      | Tokens / style                                                                                                                                                                       | Density                                      | Notes                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Row `kv-quick-exit`       | `canvas` background, `border-subtle` hairline at block-end, `space-1` block padding, above page content in stacking order, below popups and dialogs                                  | –                                            | Opaque, so text scrolls under it, never through it                                                              |
| Link `kv-quick-exit-link` | `secondary` fill, `on-secondary` text, `label` type at weight 600, `--kv-radius-md`, `space-4` inline padding, min height 44px, flat (no depth: it navigates, like the service link) | Comfortable always, also inside `kv-compact` | Text wraps, never truncates or fixed width                                                                      |
| Hint `kv-quick-exit-hint` | `<p>`, no margin. `body-small` type, weight 400, `text` on `canvas` (measured pair). No fill, edge, radius, depth, underline or `link` colour; default cursor. Hyphenates            | `body-small` at every density                | Quiet by size and weight, never by colour: it is an instruction, so not `text-muted` (DESIGN.md help-text rule) |

Why `secondary` and not an existing Button variant: `primary` would compete with the page's one primary action and reads as "next step"; `danger` means error or destruction and alarms the person and anyone watching; the base button's outline is too quiet among other buttons. A solid neutral block at the top is distinct, calm and rebrandable (a brand gives `--kv-secondary-*` a hue).

### States

| Part | default                    | hover                                                                                                                       | focus-visible                                                                                                                        | active   | disabled, loading, selected                                                            | empty                                |
| ---- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------- | ------------------------------------ |
| Link | Fill + label, no underline | Label underlined (link hover thickness), fill unchanged (no `secondary-hover` token, and no lighter fill behind white text) | `focus-ring`, `--kv-focus-ring-width`, offset over the row's `canvas`; the `space-2`/`space-3` gap keeps the ring (4px) off the hint | As hover | None exist. No busy state: the page blanks instead                                     | –                                    |
| Hint | Static text                | None (not interactive)                                                                                                      | Never focused                                                                                                                        | –        | Unchanged when armed: it stays after the first Shift, the announcements carry progress | Not rendered with `shortcut={false}` |
| Row  | –                          | –                                                                                                                           | –                                                                                                                                    | –        | –                                                                                      | –                                    |

### Modes

- **Dark, contrast themes:** the same tokens; `on-secondary` on `secondary` is already held to 4.5:1 / 7:1, `secondary` to 3:1 on `canvas`, and `text` on `canvas` to 4.5:1 / 7:1.
- **Forced colours:** link fill becomes `Canvas`, text `LinkText`, a 1px `LinkText` border carries the boundary; hover underlines; focus `Highlight` ring. Row gets a 1px `CanvasText` block-end border. Hint `CanvasText` (inherited), no border, so it never looks like a button.
- **RTL:** logical properties; the group sits at the left, the hint to the left of the link (≥ 40rem) or right-aligned under it (< 40rem). "Shift" stays in each locale's own word. No icon, nothing to mirror.
- **Motion:** none in any mode. No transition, no fade on exit, no spinner. Reduced motion is identical.
- **320px, 400% zoom, text spacing:** one column, no horizontal scroll (1.4.10); static below 30rem height; label and hint wrap and the row grows under 1.4.12, within the §5 budget.
- **Print:** the row, link and hint are not printed.

### New or changed tokens

None. Pairs used are already measured by `theme:check`: `on-secondary`/`secondary`, `secondary` on `canvas`/`surface`/`surface-raised`, `focus-ring` on `canvas`, `text` on `canvas`. **DESIGN.md change needed (approval):** a named exception under Links for a filled link, as the service link is one (§9).

## 7. Accessibility annotations

- **Name:** "Leave this page" from the visible label; no `aria-label`, no hidden prefix (2.5.3, speech users say what they see).
- **Description:** the link has `aria-describedby` → the hint's `id`, only while the shortcut is on: "Leave this page, link, Or press Shift 3 times."
- **Role:** native `<a href={destination}>`, link role: it goes to another site and works before hydration. `rel="noreferrer"`, `referrerpolicy="no-referrer"`, never `target`. The press handler `preventDefault`s and calls `location.replace`. The hint is a plain `<p>`, not `aria-hidden` (low-vision screen reader users see it too).
- **Focus order:** skip link (1), Leave this page (2), then the header. The hint is no Tab stop. Reading order = DOM order = visual order.
- **Keys:** Enter on the link (native). Shift×3 anywhere in the document, text fields included, counting a Shift only when released alone (§3); `event.repeat` ignored; another key or a pointer press resets. No `aria-keyshortcuts`: its syntax can't express a triple press, and `Shift` would claim one press leaves; the hint plus `aria-describedby` is the exposure keyboard rule 7 asks for.
- **Focus moves:** none; the page is replaced.
- **Announcements:** `quickExit.shortcutRemaining` on counted presses 1 and 2, polite, via the shared Announcer. Nothing else.
- **State:** `data-state="idle|armed|leaving"` on Root (`armed` after one or two counted Shifts, `leaving` once the page is hidden). State only; the default theme draws nothing for it, and there is no count attribute.
- **WCAG of note:** 2.4.3, 2.4.11 (scroll padding budget, static at short heights), 2.5.3, 2.5.8 and 2.5.5 (44px), 1.4.10, 1.4.11, 1.4.12, 4.1.3, 3.3.2 (the hint), 2.1.4 (N/A: modifier key, and the link is always there), 2.2.1 (the 5 s window is for an optional shortcut; the link has no time limit).

## 8. Validation

- [x] Self-review against `review-checklist.md`: no open blocker; one DESIGN.md amendment pending approval
- [x] No new colour pair (orchestrator: confirm with `vp run theme:check` after the theme change)
- [x] Usability test plan written. Result: `pending`

### Usability test plan

- **Participants:** 8–10, including people with lived experience of domestic abuse (through a support organisation, with its safeguarding protocol), NVDA, JAWS and VoiceOver users, a magnifier user, a voice-control user, people with low digital confidence and second-language sv and fi readers.
- **Tasks:** read a support page on a phone; at an interruption cue, make the page go away (pointer, keyboard, voice, Shift×3); afterwards say what you think Back would show, and what the hint means.
- **Measure:** time to activation, first-try success, accidental activations, comprehension of the label, the hint and the history limit.
- **Status:** `pending`. Manual AT check: `pending`.

## 9. Decisions (maintainer, 2026-10-15)

1. Label: "Leave this page" / "Lämna sidan". <!-- kv-lang-ok: national hide-a-page phrases are the subject -->
2. The filled `secondary` link is approved as a named exception under Links in DESIGN.md, next to the service link.
3. Tab stop 2, after the skip link.
4. Shift×3 on by default with an opt-out; the docs and a11y contract name the NVDA risk.
5. The hint and the announcement use each locale's own key name; fi, nb, nn need native-speaker review.
6. No visual count (no three dots): progress is announced only.
7. The docs page includes a short recipe for the consumer's own endpoint that clears the session, then redirects.
8. A visible hint, `quickExit.hint`, tied to the link with `aria-describedby` (keyboard rule 7); this replaces "announcement only, no hint". It stays visible while armed.

# Design spec: Status patterns (Progress, Button busy, EmptyState, page-level states)

- **Status:** Draft
- **Designer:** ux-designer agent · **Date:** 2026-10-06
- **Plan:** 0073 (to be written; task split in §10)
- **Superseded in part (Plan 0080):** D2 ("no spinner, no indeterminate bar") and the motion rules (§6.4, "nothing moves", "busy = cursor only", "no new token") by [loading-indicators.md](loading-indicators.md). The text-first rules, the announcements and the 1000 ms and 10 s timings stand.
- **Type:** component default styling (`kv-progress`, `kv-empty-state`) + behaviour rules + a page-level pattern table
- **Aligns with, does not re-specify:** Table `isLoading` / `Table.Empty` (`table.a11y.md`), Combobox `isLoading` / `.Empty` (`combobox.a11y.md`), `FileUpload.Status` and `.Progress` (`file-upload.a11y.md`), Alert and its announcement rules ([alert.md](alert.md) §7.2), Toast ([toast.md](toast.md)), `useRouteFocus`, Dialog's busy question ([dialog.md](dialog.md) Q2, [toast.md](toast.md) Q4: answered in §6.3)

## 1. Brief

- **Users:** both. **Hardest case:** an NVDA user reading Swedish as a second language, on a phone on a slow connection, who presses "Skicka ansökan", hears nothing, and presses it again (a double submission). Then: a magnifier user at 400% who can't see a status that appears far from the button; a staff user who refreshes a case table fifty times a day and must not hear the same "Loading" every time.
- **Job:** _When I've asked the service to do something, I want to know it's working and roughly how long it takes, so I don't give up, reload or press again._ And: _When there's nothing to show, I want to know why and what to do next._
- **Context:** residents once, under stress, often mobile. Staff many times a day, compact density.
- **Constraints:** 4.1.3 (status messages), 2.2.2 (moving content), 2.4.3 (focus order), 1.4.1 (colour), 2.5.3 (label in name), 3.2.2 (no change of context on input). No new dependency.
- **Success:** no double submissions in the test tasks; participants say what the service is doing while it waits; a screen-reader participant hears one start and one result per action.
- **Evidence:** none of our own. Everything below is an assumption.
- **Assumptions and research questions:**
  - A 1 s show delay hides flashes without making a wait feel unanswered → Do participants notice the gap between press and status?
  - 10 s is when people start to doubt a wait (Nielsen's response-time limits) → When do participants reload?
  - Text without a moving spinner is enough to show "still working" → Do sighted participants think a static page is frozen before the slow message appears? (Superseded: a spinner now ships, see loading-indicators.md.)

## 2. Prior art

| Source                                                                                   | What we reuse                                                                                                       | What we change and why                                                                                                                  |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| KvirnUI FileUpload (`kv-file-upload-progress`)                                           | Native `<progress>`, 8px bar, `border-control` track edge, `primary` value, percent in text, forced-colours mapping | Generalised to `kv-progress-bar`. Indeterminate gets a decorative `kv-progress-track` (Plan 0080); FileUpload's hatch is its rest shape |
| KvirnUI Table, Combobox                                                                  | Text in place of the content ("Loading rows."), `aria-busy` only on the table being replaced, debounced count       | Not changed. Progress is for everything else                                                                                            |
| KvirnUI Alert (§7.2), CopyButton                                                         | Announce through the Announcer once, never a live region on the box; status text beside the button                  | Same rules, applied to waiting                                                                                                          |
| [ARIA `progressbar`](https://www.w3.org/TR/wai-aria-1.2/#progressbar), HTML `<progress>` | Native element, implicit role, `value`/`max`                                                                        | No APG pattern exists: not a widget, no keys                                                                                            |
| [Designsystemet Spinner](https://designsystemet.no/no/components/docs/spinner/overview)  | Use only past ~1 s; pair with explanatory text                                                                      | Superseded (Plan 0080): a decorative spinner ships beside the text and loops under `no-preference` (2.2.2 is the app's duty)            |
| [Aksel ProgressBar](https://aksel.nav.no/komponenter/core/progressbar)                   | A name is required; "taking longer than expected" text                                                              | Our slow message is automatic, timed, announced once                                                                                    |
| GOV.UK Frontend Button `preventDoubleClick`                                              | Block the second press                                                                                              | We block every press while busy, and keep focus                                                                                         |

## 3. Decisions

| #   | Question                            | Decision                                                                                                                                  | Why                                                                                                                                                                                                                                             |
| --- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | New component, or class + guidance? | **One small compound, `Progress` (Root, Label, Bar) + `useProgress`**, and **classes only** for EmptyState                                | Waiting has behaviour every app gets wrong (show delay, slow message, announce once, no spam); one tested place beats guidance. An empty state has no behaviour, role or string of its own: a class contract, like Section                      |
| D2  | Spinner?                            | **Superseded by Plan 0080: a decorative spinner and `kv-progress-track`.** Text first; a native `<progress>` only when the value is known | The maintainer rejected "no spinner". The words still carry the meaning; the indicators are `aria-hidden` and loop under `no-preference` (2.2.2 is the app's duty). A `<progress>` without a value stays out: AT would hear a bar with no value |
| D3  | Announce?                           | **Yes, by default, once when shown, once when slow, polite**; `announce={false}` opts out                                                 | It appears because something started after a delay, so it is never a first-render message (unlike Alert, which is opt-in)                                                                                                                       |
| D4  | Button busy?                        | **Yes: `busy` on Button and `useButton`**, rendered as `aria-disabled="true"`, never native `disabled`                                    | Native `disabled` on the focused button drops focus to `body` (2.4.3) and the SR user loses their place. `aria-disabled` keeps focus and blocks every press, reusing `focusableWhenDisabled`                                                    |
| D5  | Percent announcements               | **Never**; the percent is visible text and the bar's value                                                                                | Every percent step would flood the polite region (4.1.3 intent, Announcer rules)                                                                                                                                                                |
| D6  | Page-level states                   | A pattern table (§8) pointing at existing parts. No new component                                                                         | Alert, ErrorSummary, Dialog, `useRouteFocus` already cover error, offline and timeout                                                                                                                                                           |

## 4. Flow

1. User acts (presses Send, changes a filter, opens a route). Button gets `busy`; `Progress` mounts with its label.
2. Done in under 1 s: nothing shown, nothing said. The result speaks for itself (§8).
3. Over 1 s: Label text shown where the result will appear (or beside the busy button); polite announcement once.
4. Over 10 s: the slow sentence is added to the Label; announced once.
5. Determinate: the bar fills and the Label shows the percent; no announcements.
6. Ends: Progress unmounts silently. Success → the result's own announcement or focus move (§8). Failure → `Alert.Danger` near the button with `announce="polite"`, Button `busy` off, focus stays on the button.

Unhappy paths: failure (6), offline mid-wait (§8 offline), cancel (the consumer's secondary button, never inside Progress), user navigates away (Progress unmounts, nothing announced), double press (blocked by D4).

## 5. Content

Library keys (all six locales; `se` flagged for native review, as `toast.regionLabel`):

| i18n key             | en                                                                      | Notes                                                                                                               |
| -------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `progress.loading`   | `Loading.`                                                              | Fallback label only; a dev warning asks for a specific one                                                          |
| `progress.slow`      | `This is taking longer than usual. Keep this page open.`                | Appended to the Label after `slowAfterMilliseconds`                                                                 |
| `progress.valueText` | `({ label, percent }) => "{label}, {percent}"` → `Exporting cases, 45%` | `format.number(percent / 100, { style: 'percent' })`, as `fileUpload.statusUploadingPercent`. Word order per locale |

Story and docs fixtures (not library keys; consumer copy): `Loading your cases.` · `Sending your application.` · `You have no cases yet` / `When you apply for something, it shows up here.` · `No results for "parkering"` / `Check the spelling or use fewer words.` · `We couldn't load your cases.` / `Try again`.

**Wording rules (all locales; for the docs page and the content guide):**

1. Name the thing and the action: "Loading your cases.", never "Loading…" or "Please wait".
2. End with a full stop, no ellipsis: some speech settings read "…" as "dot dot dot", and it isn't a sentence. (Combobox's `Loading results` has no stop: open question 3.)
3. sv, nb, nn: present tense, verb first, no subject ("Hämtar dina ärenden."). fi: passive, no "me" ("Haetaan …"). se: native-speaker review. en: present participle.
4. No tech words (server, request, fetch, error code), no apology chains, no blame.
5. Numbers and percent through `format.number`, so `45 %` with a no-break space in sv, fi, nb, nn.
6. Empty: say what isn't there and what to do next, in that order. Never "No data".
7. Label up to ~60 characters in en; allow +40% for fi. It wraps; it is never truncated.

## 6. Visual specification

### 6.1 Parts and look

| Part               | Class                  | Tokens / style                                                                                                                                      | Notes                                                                                                           |
| ------------------ | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Progress.Root      | `kv-progress`          | Block, `gap: --kv-space-2`, no border, no background                                                                                                | Sits on `canvas`, `surface` or `surface-raised` only, never inside an alert's `-subtle` fill (unmeasured pairs) |
| Progress.Label     | `kv-progress-label`    | `body` role, `text` colour (never `text-muted`: users need it)                                                                                      | Wraps; hyphenates                                                                                               |
| Progress.Bar       | `kv-progress-bar`      | FileUpload's bar: `block-size: --kv-space-2`, `border-width` `border-control` edge, `surface` track, `primary` value, `radius-sm`, full inline size | Renders only with a numeric `value`                                                                             |
| Button busy        | `kv-button[data-busy]` | Unchanged look and depth, `cursor: progress`, plus a `kv-spinner` after 1000 ms (Plan 0080). **Not** the dashed disabled edge                       | Busy isn't "unavailable until you fix something"; the text beside it says what's happening                      |
| EmptyState         | `kv-empty-state`       | Block, `padding-block: --kv-space-6` (as `--kv-table-empty-padding-block`), start-aligned, no border, no background, no illustration                | Never centred: start alignment holds at 400% and in RTL                                                         |
| EmptyState title   | `kv-empty-state-title` | On the consumer's `Heading` at the right level; `heading` colour                                                                                    | Level from context, not the class                                                                               |
| EmptyState body    | `kv-empty-state-body`  | `body`, `text`, line length as Prose (~70 characters)                                                                                               | Instructions, so never muted                                                                                    |
| EmptyState actions | `kv-button-group`      | Existing                                                                                                                                            | At most one primary                                                                                             |

### 6.2 States

| Part       | default | busy (< delay)               | busy (shown) | slow                  | determinate              | done      | forced colours                                                                              |
| ---------- | ------- | ---------------------------- | ------------ | --------------------- | ------------------------ | --------- | ------------------------------------------------------------------------------------------- |
| Progress   | –       | not rendered                 | Label        | Label + slow sentence | Label + `valueText`, Bar | unmounted | Text `CanvasText`; Bar edge `CanvasText`, track `Canvas`, value `Highlight` (as FileUpload) |
| Button     | normal  | `data-busy`, `aria-disabled` | same         | same                  | same                     | normal    | Unchanged; the Progress text carries it                                                     |
| EmptyState | static  | –                            | –            | –                     | –                        | –         | Text and heading only; nothing to map                                                       |

### 6.3 Placement

- **In place of the content** being loaded (a results list, a section's body), so a magnifier user looking there sees it. Never in a corner, never a Toast, never a modal.
- **Beside a busy button:** directly after it in the same `kv-button-group` row, wrapping below at 320px, so it stays in the magnified viewport. This answers dialog.md Q2 and toast.md Q4: label kept, `aria-disabled`, a Progress beside it.
- **Never** cover the page with an overlay or skeleton that hides the user's answers.

### 6.4 Modes

- **Themes:** all four via existing tokens. No new pairs.
- **Forced colours:** §6.2. State is never in background or shadow alone: it is the text.
- **RTL:** the native bar fills from the inline start of the page direction; logical properties throughout.
- **Motion (superseded by Plan 0080):** the spinner and bars loop for as long as the wait lasts, only under `prefers-reduced-motion: no-preference`; under `reduce` they show the rest shape. They move for more than 5 s, so WCAG 2.2.2 applies and the app must offer a way to stop them: the library honours the OS setting but ships no control, by decision (loading-indicators.md, "Consumer duty for 2.2.2"). The determinate fill still eases with `--kv-duration-fast` only under `no-preference`.
- **320px / 400% / 1.4.12:** Label wraps, Bar is full width, the busy text wraps under the button. No fixed heights on text.

### 6.5 Tokens

No new tokens. Every pair is already measured by `theme:check`: `text` on the three surfaces, `border-control` and `primary` (as a marker) on `canvas`, `surface`, `surface-raised`. The orchestrator runs `vp run theme:check` once `theme.css` changes.

## 7. Accessibility annotations (draft contract)

### 7.1 Progress

| Part          | Element / role                                  | ARIA / state                                                                                                             |
| ------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Root          | `<div>`, no role                                | `data-state="busy" \| "slow"`, `data-determinate`. Not rendered before `delayMilliseconds` (default 1000)                |
| Label         | `<p>` with a `<span id>` holding the label only | none. Never a live region                                                                                                |
| Bar           | `<progress>` (implicit `progressbar`)           | `aria-labelledby` the label span (not the percent or slow text: the value already says it); `value`, `max` (default 100) |
| `useProgress` | the same, for your own markup                   | `isShown`, `isSlow`, `rootProps`, `labelProps`, `barProps`                                                               |

- **Name:** the visible label. Without one, `progress.loading` and a dev warning.
- **No `aria-busy`** from Progress. `aria-busy` goes only on the element whose content is replaced, while it is replaced (Table does this), never on `main` or `body`, and never as the only signal.
- **Keyboard:** no focusable parts, no keys. Tab and Shift+Tab pass over it (tested as the Announcer's rows are).
- **Focus:** never moved, on show, slow or unmount.

| Event                                             | Message key                                        | Politeness                      |
| ------------------------------------------------- | -------------------------------------------------- | ------------------------------- |
| Shown after the delay (unless `announce={false}`) | the label (consumer's text, or `progress.loading`) | polite, `key` = the Progress id |
| Becomes slow                                      | `progress.slow`                                    | polite, same `key`              |
| Value changes, unmount                            | nothing                                            | –                               |

`announce={false}` when focus already reads the state or another part announces (a Table with `isLoading`). Inside a Dialog the Dialog's own Announcer is used.

### 7.2 Button busy

| State           | Element     | ARIA / state                                                                               |
| --------------- | ----------- | ------------------------------------------------------------------------------------------ |
| busy            | `<button>`  | `aria-disabled="true"`, no `disabled`, `data-busy`. Name unchanged (2.5.3). No `aria-busy` |
| busy + disabled | as disabled | `disabled` wins                                                                            |

| Key          | Context                                 | Action                                      |
| ------------ | --------------------------------------- | ------------------------------------------- |
| Tab          | busy button                             | Focus lands on it; read as unavailable      |
| Enter, Space | busy, focused                           | Blocked; focus stays; no handler, no submit |
| –            | pointer click, implicit form submission | Blocked                                     |
| –            | `busy` turns on while focused           | Focus stays on the button                   |

The Button announces nothing; the docs pair it with a Progress beside it.

### 7.3 EmptyState

No role, no live region, no strings, no focus. A filter that empties a list announces through the component that filtered (Table's row count, a search's result count). A page that is empty on arrival is read in reading order.

**SCs of note:** 1.3.1, 1.4.1, 1.4.11, 2.2.2, 2.4.3, 2.5.3, 3.2.2, 4.1.2, 4.1.3.

## 8. Page-level states

| State                              | Show                                                             | Parts                                                         | Focus                                     | Announce                                                                                       |
| ---------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Loading a page (client route)      | `h1` at once, Progress in place of the content                   | `useRouteFocus`, Progress                                     | `h1` (route focus)                        | Route focus reads the title; Progress after 1 s                                                |
| Loading a region (filter, refresh) | Progress in place of the region, or the component's own state    | Progress; Table `isLoading`; Combobox `isLoading`             | stays                                     | Progress once; then the result count from the component                                        |
| Busy after an action               | Button `busy` + Progress beside it                               | Button, Progress                                              | stays on the button                       | Progress once; result per alert.md §7.2                                                        |
| Empty, nothing yet                 | EmptyState: what will appear, how to start, one action           | `kv-empty-state`, Heading, Button/Link                        | –                                         | none (content)                                                                                 |
| No results                         | EmptyState in place of the list; what was searched, how to widen | `kv-empty-state`; `Table.Empty`, `Listbox.Empty` inside those | stays in the search field                 | The search's count ("No results")                                                              |
| Error loading                      | `Alert.Danger` in place of the content, with "Try again"         | Alert, Button                                                 | stays; after retry fails, stays           | none on page load; `announce="polite"` when it replaces a Progress                             |
| Error after an action              | `Alert.Danger` beside the action; validation uses ErrorSummary   | Alert, ErrorSummary                                           | ErrorSummary takes focus; otherwise stays | Alert `polite`; ErrorSummary none                                                              |
| Offline                            | `Alert.Warning` at the top of `main`                             | Alert                                                         | stays                                     | `polite` when it appears after load; `assertive` only if typing now loses work (alert.md §7.2) |
| Back online                        | Remove the warning                                               | –                                                             | stays (move it first if it was inside)    | polite, the consumer's text, once                                                              |
| Session timeout                    | Dialog                                                           | dialog.md                                                     | dialog                                    | dialog.md                                                                                      |

Never: a Toast for an error. A job in progress may be a Toast with `busy` (a spinner in its icon slot, no timer), and the result replaces it by `id`. Never a spinner alone, a disabled form while loading the user's own answers.

## 9. Validation

- [x] Self-review against the review checklist: no open blockers (text first, no colour-only cue, no new pairs, every string keyed). "No motion" and "no new pairs" are superseded by Plan 0080
- [x] No new colour pair (§6.5)
- [x] Usability test plan written. Result: `pending`

### Usability test plan (`pending`)

- **Participants:** 6–8 residents, including NVDA or TalkBack users, a magnifier user, a person with a cognitive disability, a second-language Swedish speaker, low digital confidence; 3 staff who use a case table daily.
- **Tasks:** send an application on a throttled connection (10–15 s); filter a case list to zero results and recover; open "Mina ärenden" with no cases; lose the connection mid-form.
- **Measure:** double presses, reloads, time to first doubt, whether they can say what's happening, extra or missing announcements (logged per AT).

## 10. Task split for Plan 0073

1. `i18n`: `progress.loading`, `progress.slow`, `progress.valueText` in six locales (`se` flagged).
2. `core`: a pure timing store for show-delay and slow (fake-timer node tests).
3. `react`: `useProgress` + `Progress.Root/Label/Bar`, `progress.a11y.md`, `progress.md`, `progress.test.tsx` (delay, slow, announce once, no percent announcements, `announce={false}`, name wiring).
4. `react`: `busy` on Button and `useButton`; rows in `button.a11y.md` and `button.test.tsx` (§7.2). Changeset.
5. `theme`: `kv-progress*`, `kv-empty-state*`, `kv-button[data-busy]` cursor; forced colours; reduced motion.
6. `DESIGN.md` (maintainer approval): Words rows (Progress, Empty state, Busy); Buttons bullet (busy); Content and status bullets for Progress and EmptyState; spec index row.
7. Storybook: Progress (every state, slow, determinate, RTL, forced colours), Button busy, EmptyState; page-state examples (§8) where a Patterns section can host them (question 4).
8. `accessibility-reviewer` once; AT matrix `pending`.

## 11. Open questions for the maintainer

1. ~~Approve D2 (no spinner, no indeterminate bar)~~ (rejected: Plan 0080) and D4 (`busy` = `aria-disabled`, unchanged look plus `cursor: progress`)?
2. Defaults: 1000 ms show delay and 10 000 ms slow; both options. Agree?
3. Align Combobox `combobox.loading` ("Loading results") with the full-stop rule? A one-string fix, out of this scope.
4. Where do page-state examples live: a new `Patterns/` Storybook section now, or the Progress and Alert docs pages until S1?
5. Should FileUpload later reuse `kv-progress-bar` (and drop its hatch)? Not in this plan (rule 10).

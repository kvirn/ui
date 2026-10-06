# WCAG 2.2 A/AA component review checklist

All 55 Level A and AA success criteria (31 A, 24 AA; 4.1.1 is obsolete and excluded). Any Fail is blocking. Answer every row Pass | Fail | N/A | pending with a one-line reason; a bare N/A is not accepted. A row proved only by `manual AT`, or whose proving layer has no evidence, is reported `pending`, never Pass; a row with another layer too is Pass when that layer proves it. `manual review` is a human judgement of content or wording, closed by the reviewer's reading in the PR and reported Pass or Fail, never claimed from tests. When another component's contract owns the focusable or contrast-relevant part (Field around TextInput, 2.4.7), the row is Pass or N/A and cites that contract. `consumer` means the consumer's content or page decides it: say what the component or block must expose, and check that.

## Perceivable

- [ ] 1.1.1 Non-text content (A): icons have a text alternative or are `aria-hidden` next to a visible label — proved by: axe
- [ ] 1.2.1 Audio-only and Video-only (Prerecorded) (A): a media part exposes a slot for a transcript or description — proved by: consumer
- [ ] 1.2.2 Captions (Prerecorded) (A): a media part can carry a captions track — proved by: consumer
- [ ] 1.2.3 Audio Description or Media Alternative (Prerecorded) (A): a media part can carry a description track or alternative — proved by: consumer
- [ ] 1.2.4 Captions (Live) (AA): live media is never built in; a block that embeds it exposes captions — proved by: consumer
- [ ] 1.2.5 Audio Description (Prerecorded) (AA): a media part can carry an audio description track — proved by: consumer
- [ ] 1.3.1 Info and Relationships (A): semantics and ARIA convey the structure, and labels are associated programmatically — proved by: axe | test
- [ ] 1.3.2 Meaningful Sequence (A): DOM order matches visual order, portals included — proved by: test | story
- [ ] 1.3.3 Sensory Characteristics (A): instructions and labels don't rely on shape, position or colour alone — proved by: manual review
- [ ] 1.3.4 Orientation (AA): nothing locks the view to one orientation — proved by: story
- [ ] 1.3.5 Identify Input Purpose (AA): correct `autocomplete` on user-data inputs — proved by: axe | test
- [ ] 1.4.1 Use of Color (A): state isn't conveyed by colour alone — proved by: story | manual AT
- [ ] 1.4.2 Audio Control (A): nothing plays audio automatically, or it can be paused or stopped — proved by: consumer
- [ ] 1.4.3 Contrast (Minimum) (AA): text is at least 4.5:1 (3:1 large) in the default theme — proved by: theme:check | axe
- [ ] 1.4.4 Resize Text (AA): works at 200% text with no loss of content or function — proved by: story
- [ ] 1.4.5 Images of Text (AA): text is real text, not an image — proved by: story
- [ ] 1.4.10 Reflow (AA): works at 320px width with no two-dimensional scroll — proved by: story
- [ ] 1.4.11 Non-text Contrast (AA): UI boundaries, states and focus indicators are at least 3:1 — proved by: theme:check
- [ ] 1.4.12 Text Spacing (AA): no clipping or overlap with the spacing overrides applied — proved by: story
- [ ] 1.4.13 Content on Hover or Focus (AA): dismissible (Escape), hoverable, persistent — proved by: test

## Operable

- [ ] 2.1.1 Keyboard (A): every function works from the keyboard, one test per contract row — proved by: test
- [ ] 2.1.2 No Keyboard Trap (A): focus can always leave, except a modal, which Escape closes — proved by: test
- [ ] 2.1.4 Character Key Shortcuts (A): none, or they can be remapped or turned off (opt-in only) — proved by: test
- [ ] 2.2.1 Timing Adjustable (A): time limits, such as toast auto-dismiss, can be turned off, adjusted or extended — proved by: test
- [ ] 2.2.2 Pause, Stop, Hide (A): moving or auto-updating content can be paused (toasts, carousels); essential exceptions are loading and progress indicators, which may auto-update — proved by: test
- [ ] 2.3.1 Three Flashes or Below Threshold (A): nothing flashes more than three times a second — proved by: story
- [ ] 2.4.1 Bypass Blocks (A): a block or page part exposes a skip link or landmarks; the page-level bypass is the consumer's — proved by: consumer
- [ ] 2.4.2 Page Titled (A): the page needs a descriptive title; a page-level block exposes one — proved by: consumer
- [ ] 2.4.3 Focus Order (A): focus order is logical, and focus is restored after overlays close — proved by: test
- [ ] 2.4.4 Link Purpose (In Context) (A): link text, or its context, says where it goes — proved by: axe | test
- [ ] 2.4.5 Multiple Ways (AA): a site offers more than one way to find a page; navigation blocks must support it — proved by: consumer
- [ ] 2.4.6 Headings and Labels (AA): headings and labels are descriptive — proved by: manual review
- [ ] 2.4.7 Focus Visible (AA): focus is visible in every theme, forced-colors included — proved by: story
- [ ] 2.4.11 Focus Not Obscured (Minimum) (AA): sticky or floating layers don't fully cover the focused element — proved by: story
- [ ] 2.5.1 Pointer Gestures (A): multipoint or path gestures have a single-pointer alternative — proved by: test
- [ ] 2.5.2 Pointer Cancellation (A): activation on the up-event, and it can be aborted — proved by: test
- [ ] 2.5.3 Label in Name (A): the accessible name contains the visible label — proved by: test | axe
- [ ] 2.5.4 Motion Actuation (A): no function needs device motion, or it has a control and can be disabled — proved by: test
- [ ] 2.5.7 Dragging Movements (AA): every drag has a single-pointer alternative — proved by: test
- [ ] 2.5.8 Target Size (Minimum) (AA): targets are at least 24×24 CSS px, or meet the spacing exception — proved by: story

## Understandable

- [ ] 3.1.1 Language of Page (A): the page language is set; a page-level block must not override it — proved by: consumer
- [ ] 3.1.2 Language of Parts (AA): `lang` is set on text in another language (language switcher) — proved by: test | axe
- [ ] 3.2.1 On Focus (A): focus never changes context — proved by: test
- [ ] 3.2.2 On Input (A): input never changes context without warning — proved by: test
- [ ] 3.2.3 Consistent Navigation (AA): repeated navigation keeps its relative order across pages; a block keeps its own order — proved by: consumer
- [ ] 3.2.4 Consistent Identification (AA): the same function gets the same name and icon everywhere — proved by: manual review
- [ ] 3.2.6 Consistent Help (A): help is in the same relative place across pages (blocks) — proved by: consumer
- [ ] 3.3.1 Error Identification (A): errors are identified in text and tied to the field — proved by: test | axe
- [ ] 3.3.2 Labels or Instructions (A): labels or instructions are present — proved by: axe | test
- [ ] 3.3.3 Error Suggestion (AA): errors say how to fix them where known — proved by: test
- [ ] 3.3.4 Error Prevention (Legal, Financial, Data) (AA): a submit flow offers review, confirm or undo — proved by: consumer
- [ ] 3.3.7 Redundant Entry (A): previously entered data is carried forward or selectable — proved by: test
- [ ] 3.3.8 Accessible Authentication (Minimum) (AA): no cognitive test, and paste and autofill are allowed — proved by: test

## Robust

- [ ] 4.1.2 Name, Role, Value (A): correct in the accessibility tree (check with `toMatchAriaSnapshot`) — proved by: axe | test
- [ ] 4.1.3 Status Messages (AA): status messages are announced via a live region without moving focus — proved by: test | manual AT

## Beyond WCAG (KvirnUI policy)

- [ ] forced-colors mode works
- [ ] Reduced motion is respected
- [ ] No hard-coded strings, and all 6 locales are present
- [ ] RTL arrow keys flip

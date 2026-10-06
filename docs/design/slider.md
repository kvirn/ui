# Design spec: Slider

- **Status:** In review (maintainer decisions of 2026-10-06 applied: no fill, a 44px thumb on coarse pointers, no `Slider.Value`; §9)
- **Designer:** ux-designer agent · **Date:** 2026-10-06
- **Plan:** [0072](../plans/0072-slider.md) (§Design, §Risks: the track fill)
- **Type:** component default styling

`Slider` is a native `<input type="range">` in a `Field.Root`, styled by the theme as `kv-slider`. The track and thumb are the input's own pseudo-elements (no extra DOM, no custom thumb), and the track has no fill. It reuses the field layout (label, description, control, help text, error) of [form-fields.md](form-fields.md) §6.2, and Switch's tokens, focus ring and forced-colours rules ([switch.md](switch.md)).

## 1. Brief

- **Users:** both. Residents narrow a search once ("preschools within 5 km"); staff use a filter or a zoom daily.
- **Hardest-case user:** a resident with a tremor on a phone, who must land on "15 km" and can't hold a 24px thumb still. Second: a screen-reader user in their second language who needs to hear the value with its unit, not "0.3".
- **Job to be done:** When I roughly know how much I want, I want to drag to about that much and see the result, so I don't have to think in exact numbers.
- **Context:** any device; often updates results on the same page; inside a form or a filter panel.
- **Constraints:** native semantics first (AGENTS.md rule 2); no strings of its own; DESIGN.md tokens only; headless ships zero CSS (rule 5).
- **Success:** the value the user meant, first time; nobody stuck because they can't drag; no "what did I pick?" doubt.
- **Assumptions (no research yet):** residents who need an exact number type it rather than drag → RQ: in Pattern A (§3), which control do they use first, and does anyone miss the number box? Thumb position plus the number box is enough without tick marks → RQ: can low-vision users say the value at 400% zoom?

## 2. Prior art

| Source                                                                          | What we reuse                                                                                                                     | What we change and why                                                                                                                                                  |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APG [Slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)          | Keys, `aria-valuetext` for a value with a unit, one Tab stop                                                                      | Native `<input type="range">`, so roles, values and keys come from the browser                                                                                          |
| USWDS [Range slider](https://designsystem.digital.gov/components/range-slider/) | Use when the relative value matters more than precision; use a text input for exact values; a coarse `step`                       | USWDS shows no value beside the slider. We pair it with a NumberInput wherever the number matters (§3)                                                                  |
| GOV.UK Design System                                                            | Publishes no slider: exact answers are text inputs                                                                                | We ship one for approximate values, and the docs say a submitted exact answer is a NumberInput                                                                          |
| KvirnUI Switch and Checkbox (`theme.css`, switch.md)                            | `primary` as the chosen value, the `text` hover edge, the focus ring, the disabled look, rule-local sizes from `--kv-choice-size` | A thin pill track with a round thumb, in the field layout (label above), not the choice row. The thumb never turns `primary-hover` (it has no edge to keep 3:1 in dark) |

## 3. When to use a slider, and the flow

| Use a **Slider**                                                                              | Use a **NumberInput** (alone)                                                          |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| An approximate value where "about this much" is the answer: a search radius, a zoom, a volume | An exact value: an amount, an age, a number of children, a percentage on a declaration |
| A small range with a coarse step (10 to 20 steps from end to end, as USWDS advises)           | A wide range, or a step of 1 over more than about 20 values                            |
| Seeing where the value sits in the range helps the decision                                   | Anything sent with a submitted e-service form where the number has legal effect        |

**Rule:** a slider is never the only way to enter a value whose exact number matters. Two patterns:

- **Pattern A, Slider + NumberInput (default for residents):** one label, the slider, and a `NumberInput` (`kv-input--width-4`, in an `InputGroup` with the unit addon) directly under it, both bound to one value. The number box shows the value and takes exact typing. Only the number box has `name`, so the form sends the value once.
- **Pattern B, Slider alone:** only where the number itself means nothing to the user (zoom, volume, brightness). The help text states the ends in words. The value is spoken through `aria-valuetext`; nothing visible changes but the thumb.

**Slider renders no visible value of its own** (no `<output>`, no part; decided, §9). Reasons: in Pattern A the number box is the visible value; a second text would say the same twice; and an `<output>` is a live region that would announce each step on top of the browser's own value announcement.

Flow, Pattern A (search radius on "Find a preschool"):

1. Resident sees the label, the slider at the default (10 km) and the number box "10".
2. **Drags or presses an arrow key:** the thumb moves, the number box follows on every step, AT speaks "15 km" from the slider.
3. **Types in the number box:** the slider follows when the text is a whole number in range. While the text is incomplete or out of range the slider stays put; the error appears on blur or submit, never while typing.
4. **Types a value between steps** (17 with step 5): the number box keeps 17, which is what is sent; the slider shows the nearest step. Prefer `step` 1 in Pattern A unless the domain has steps, and then the number box validates them too.
5. **Error** (60 when the maximum is 50): the number box gets the heavy `danger` edge and the error under the field; the slider is not marked invalid (it can't hold the value). The error summary links to the number box.
6. **Results update live:** the consumer debounces and announces the result count once through the `Announcer`, never per step. Focus never moves and nothing navigates (3.2.2).
7. **Not available** (no address on file): both disabled, with the reason in the help text, never in a tooltip.
8. **Touch:** on a coarse pointer the thumb's hit box is 44px (§6.1), because iOS Safari starts a drag only on the thumb. The number box is still the precise way in.

## 4. Content

`Slider` has **no strings of its own**: the label, help text, error and the `valueText` format are the consumer's. Story fixtures go in `apps/storybook/src/components/slider/slider.fixture.tsx`, all six locales.

| Key                           | en                                           | sv                                              | longest: fi (draft)                                   | Element                                 |
| ----------------------------- | -------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------- | --------------------------------------- |
| `search.distanceLabel`        | Distance from your address, in kilometres    | Avstånd från din adress i kilometer             | Etäisyys osoitteestasi kilometreinä                   | Label naming both controls (Pattern A)  |
| `search.distanceHint`         | From 0 to 50 km. You can also type a number. | Från 0 till 50 km. Du kan också skriva ett tal. | 0–50 km. Voit myös kirjoittaa luvun.                  | Help text, both controls                |
| `search.distanceUnit`         | km                                           | km                                              | km                                                    | InputGroup addon (hidden from AT)       |
| `search.distanceValueText`    | {value} km                                   | {value} km                                      | {value} km                                            | `valueText`, spoken as `aria-valuetext` |
| `search.distanceTooFar`       | Enter a distance of 50 km or less            | Ange ett avstånd på högst 50 km                 | Anna enintään 50 kilometrin etäisyys                  | Error message (number box)              |
| `search.distanceNotNumber`    | Enter the distance as a number, like 15      | Ange avståndet som ett tal, till exempel 15     | Anna etäisyys numerona, esimerkiksi 15                | Error message (number box)              |
| `search.distanceDisabledHint` | Add your address to search by distance.      | Lägg till din adress för att söka på avstånd.   | Lisää osoitteesi, jotta voit hakea etäisyyden mukaan. | Help text of a disabled slider          |
| `player.volumeLabel`          | Volume                                       | Volym                                           | Äänenvoimakkuus                                       | Label (Pattern B)                       |
| `player.volumeHint`           | From silent to loudest.                      | Från tyst till högst.                           | Hiljaisesta kovimpaan.                                | Help text (Pattern B)                   |
| `player.volumeValueText`      | {percent} percent                            | {percent} procent                               | {percent} prosenttia                                  | `valueText` (Pattern B)                 |

**Rules (sv and en):** the label names the quantity and its unit ("i kilometer"), since the addon is hidden from AT. The label never changes with the value. `valueText` always carries the unit or the word ("15 km", "40 percent"); a bare number is only right when it has no unit. The help text states the ends of the range in words. Never "Drag the slider" as the only instruction: say what the value is, not how to move it.

## 5. Structure

The text field's layout, one column, the same at 320px, 40rem and 64rem. No new layout class.

```
Pattern A                                                    Pattern B
[field]                                                      [field]
  Distance from your address, in kilometres  ← label           Volume                    ← label
  [──────────●─────────────────────]          ← slider 100%     [───────────●───────]      ← slider
  [ 15 | km ]                                 ← number box      From silent to loudest.   ← help text
  From 0 to 50 km. You can also type a number. ← help text
  ⚠ Enter a distance of 50 km or less.        ← error, last
```

Gaps are `--kv-field-gap`. Reading and focus order = DOM order: slider, then number box. In RTL the slider starts on the right (minimum on the right) and the number box sits at the start, on the right.

## 6. Visual specification

### 6.1 Parts

Three rule-local sizes, set on `.kv-slider` and changed under `@media (pointer: coarse)`. All derive from `--kv-choice-size` (24px), so no global token:

| Local value              | Fine pointer (default)                 | Coarse pointer                                                                     |
| ------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------- |
| `--kv-slider-thumb-box`  | `var(--kv-choice-size)`: 24px          | `calc(var(--kv-choice-size) * 11 / 6)`: 44px (the switch's track width expression) |
| `--kv-slider-thumb-size` | `var(--kv-choice-size)`: 24px (drawn)  | `calc(var(--kv-choice-size) * 4 / 3)`: 32px (drawn)                                |
| `--kv-slider-track-size` | `calc(var(--kv-choice-size) / 3)`: 8px | `calc(var(--kv-choice-size) / 2)`: 12px                                            |

| Part        | Look (DESIGN.md tokens)                                                                                                                                                                                                                                                                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input (box) | `appearance: none`, transparent, `inline-size: 100%`, `min-inline-size: 0`, margin 0, `--kv-radius-md` (for the ring). `block-size: max(var(--kv-control-min-block-size), var(--kv-slider-thumb-box))`: 44px, 32px compact, 44px on a coarse pointer in any density, so the thumb never sticks out of the box (a thumb outside the box isn't hit-tested). Flat    |
| Track       | Pill, `--kv-slider-track-size` tall, `--kv-radius-full`, `--kv-slider-edge-width` `border-control` edge, `canvas` inside, vertically centred. **No fill:** the thumb's position is the value                                                                                                                                                                      |
| Thumb       | A `--kv-slider-thumb-box` square, `--kv-radius-full`, `border: 0`, `padding: calc((var(--kv-slider-thumb-box) - var(--kv-slider-thumb-size)) / 2)` (0, or 6px on coarse), `background-color: primary` with `background-clip: content-box`: a solid `primary` disc of `--kv-slider-thumb-size` drawn inside a larger hit box. No edge, no shadow, no grow on press |
| Label       | `Field.Label`, `label` type (`label-compact`), weight 500 like any field label, above the box; wraps and hyphenates                                                                                                                                                                                                                                               |
| Help, error | `Field.HelpText` `body-small` `text` under the control(s); `Field.ErrorMessage` last, with the icon and hidden "Error:" prefix                                                                                                                                                                                                                                    |
| Target      | Fine pointer: the whole box, at least 44px tall (32px compact), full width; a press anywhere on it moves the thumb there. Coarse pointer: the thumb's hit box is 44×44 (2.5.5, DESIGN.md comfortable), which matters on iOS Safari, where a drag starts only on the thumb                                                                                         |

- The thumb has no edge, so its boundary is the `primary` disc against the page (§6.4), and it doesn't change colour on hover: `primary-hover` is 2.98:1 in dark and would need an edge to fall back on.
- On a coarse pointer the drawn disc stops 6px short of each end of the box at min and max (the hit box's centre stops 22px in). Accepted: the track runs to the ends, so the extent stays visible.

### 6.2 States

| State         | Track edge / inside                                                                                                                                                                                                                                                  | Thumb                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Default       | 1px `border-control` / `canvas`                                                                                                                                                                                                                                      | `primary`                                      |
| Hover (box)   | 1px `text` / `canvas`                                                                                                                                                                                                                                                | unchanged                                      |
| Active (drag) | As hover                                                                                                                                                                                                                                                             | unchanged                                      |
| Focus-visible | Adds a `focus-ring` outline on the **input box**, `--kv-focus-ring-width`, offset `--kv-focus-ring-offset`, `--kv-radius-md`. Keyboard only (`:focus-visible`, `[data-focus-visible]`). Not on the thumb: a thumb ring needs `box-shadow`, which forced colours drop | unchanged                                      |
| Invalid       | 2px `danger` (`--kv-control-border-width-invalid`) / `canvas`; plus the error message                                                                                                                                                                                | unchanged                                      |
| Disabled      | 1px **dashed** `border-control` / `surface`                                                                                                                                                                                                                          | `text-muted`; `cursor: not-allowed` on the box |

- Invalid on the slider is from `[data-invalid]` or `[aria-invalid='true']` (Pattern B; in Pattern A it's the number box). Invalid beats hover, as for inputs.
- **Read-only:** none; a native range ignores `readonly`. Show the value as text in a Summary list instead.
- Disabled label: muted as for a disabled TextInput's field.

### 6.3 Cross-browser pseudo-elements

| Part  | Chromium and Safari                                                                                                                                                                                                                                                                                    | Firefox                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Track | `::-webkit-slider-runnable-track`                                                                                                                                                                                                                                                                      | `::-moz-range-track`                                                                     |
| Thumb | `::-webkit-slider-thumb`, `appearance: none`, `margin-block-start: calc((var(--kv-slider-track-size) - var(--kv-slider-thumb-box)) / 2 - var(--kv-slider-edge-width))`: −9px fine, −17px coarse (−10px / −18px with the 2px invalid edge). WebKit puts the thumb at the top of the track's content box | `::-moz-range-thumb`, `border: 0` (reset the default). Centred by the browser: no offset |
| Fill  | none                                                                                                                                                                                                                                                                                                   | `::-moz-range-progress` left unstyled; verify it draws nothing                           |

- **Never put a `-webkit-` and a `-moz-` pseudo in one selector list:** an unknown pseudo drops the whole rule. One rule per engine, side by side in one `theme.css` block.
- State selectors go on the input: `.kv-slider:hover::-webkit-slider-runnable-track`, `.kv-slider:disabled::-moz-range-thumb`.
- `--kv-slider-edge-width` is rule-local (`--kv-border-width`, `--kv-control-border-width-invalid` when invalid), so the WebKit offset follows it and the thumb doesn't move when the edge thickens.
- Verify in each engine that padding plus `background-clip: content-box` draws the disc on the thumb pseudo-element, in forced colours too.
- Add `.kv-slider` beside `.kv-switch` in the not-prose list and in the reduced-motion and forced-colours blocks.
- The hook sets no `style`: state is `data-invalid`, `data-disabled` and `data-focus-visible` only.

### 6.4 Contrast (existing measured pairs only)

From form-fields.md §6.10 and switch.md §6.3 (`contrast.ts` against `theme.css`, 2026-10-02), lowest of `canvas` / `surface` / `surface-raised`. **No new pair:** every one is already in `theme:check`.

| Pair (1.4.11, 3:1)           | light | dark  | light-contrast | dark-contrast | Use                             |
| ---------------------------- | ----- | ----- | -------------- | ------------- | ------------------------------- |
| `border-control` on the page | 4.68  | 3.54  | 10.21          | 12.05         | Track edge (the range's extent) |
| `primary` on the page        | 4.42  | 3.75  | 9.29           | 9.40          | Thumb (the value)               |
| `text` on the page           | 17.90 | 16.55 | 19.61          | 17.61         | Hover track edge                |
| `danger` on the page         | 6.02  | 7.84  | 7.73           | 10.42         | Invalid track edge              |
| `focus-ring` on the page     | 4.42  | 6.14  | 9.29           | 9.40          | Focus ring                      |

On panels: `primary` lowest 3.32 and `border-control` 3.13 (dark, `primary-subtle`). The thumb is three times the track's height or more, so its outline is against the page. Disabled pairs are exempt. The orchestrator runs `theme:check` once implemented.

### 6.5 Modes

- **Dark:** the track inside stays `canvas` (black), a groove in a `surface-raised` card, like the switch's track.
- **Contrast themes:** tokens only; every edge ≥ 9.29:1.
- **Forced colours:** set explicitly. Track `Field` inside, 1px `ButtonBorder` edge (2px `CanvasText` invalid, dashed `GrayText` disabled); thumb `Highlight` (`GrayText` disabled); focus `Highlight` outline. Hover changes nothing.
- **RTL:** the browser reverses the range (minimum on the right); nothing in the theme depends on direction. Verify in the RTL story in each engine, Safari included. Arrow keys flip (`keyboard` skill).
- **Motion:** track `border-color` transitions over `--kv-duration-fast`, `--kv-easing-standard`, only under `prefers-reduced-motion: no-preference`. The thumb never animates its position (it's native).
- **320px, 400% zoom, 1.4.12:** full width, `min-inline-size: 0`, sizes in rem; no text inside the control, so text spacing only affects the label and messages, which wrap. The number box is `kv-input--width-4`, so Pattern A fits at 320px without a row.
- **Compact:** the box is 32px on a fine pointer; the thumb and track don't shrink. On a coarse pointer the coarse sizes win over compact.

## 7. Accessibility annotations

Draft for `packages/react/src/slider/slider.a11y.md`.

- **Role and value:** native `input[type=range]` (implicit `slider`, native `aria-valuemin/max/now`). `aria-valuetext` from `valueText`, always with the unit (§4). Native `disabled`.
- **Name and description:** `Field.Label`; help texts then the error in `aria-describedby`. Pattern A: §9.2.
- **Keyboard** (`keyboard` skill, Slider): one Tab stop; Right/Up +step, Left/Down −step (Left/Right flip in RTL); Home/End min/max; PageUp/PageDown the browser's larger step. All native.
- **Pointer:** dragging has single-pointer alternatives: a press on the track (2.5.7), the keys, and the number box in Pattern A.
- **Announcements:** none from the component; AT speaks the value natively. No `<output>`, no live region. Result counts are the consumer's, debounced.
- **SCs of note:** 1.3.1, 1.4.1, 1.4.11, 2.1.1, 2.4.7/2.4.13, 2.5.3, 2.5.7, 2.5.8 (2.5.5 for the box, and for the thumb on a coarse pointer), 3.2.2, 3.3.1, 4.1.2.
- **Stories:** default, Pattern A with NumberInput, Pattern B, hover, focus (Keyboard story), min and max, disabled with reason, invalid with error, long Finnish label, compact, coarse pointer (emulated), RTL, forced colours.

## 8. Validation

- [x] Self-review against `review-checklist.md`, no open blockers. No new colour pair (§6.4); `theme:check` by the orchestrator after implementation.
- Manual AT matrix: `pending`. Risks: VoiceOver iOS uses swipe up/down on a slider (native, but check `aria-valuetext` is spoken); TalkBack's step size; Safari RTL range direction.
- **Usability test plan (`pending`).** Participants: 6–8 residents incl. NVDA, VoiceOver iOS, TalkBack, 400% magnification, a Windows contrast theme, a tremor or limited dexterity, low digital confidence, second-language sv/fi speakers. Tasks: set the search radius to 15 km (Pattern A); say what the current distance is; fix "60" after the error; set volume to about half (Pattern B). Measure: exact value reached, which control used first, errors, time, whether anyone gives up dragging on a phone.

## 9. Decisions

Decided by the maintainer, 2026-10-06:

1. **No fill** (option b). The track is plain; the thumb's position is the value. The hook sets no inline style and there is no `--kv-slider-fill`. DESIGN.md "Class contract" gains: **Slider:** `kv-slider`. State `data-invalid`, `aria-invalid="true"`, `data-disabled`, `data-focus-visible`.
2. **Coarse pointer:** the thumb's hit box is 44px, with a 32px disc and a 12px track (§6.1), from rule-local values. No global token.
3. **No `Slider.Value` in v1.** Pattern A's number box is the visible value.

Recommended to the engineer (designer's call, within the plan):

4. **Pattern A wiring.** The NumberInput owns the `Field.Root`: its id, the label's `for`, `aria-describedby` (help text, then error) and `invalid`, so a label click and the error summary land on the precise control. The Slider sits in the same Field, before the InputGroup, and does **not** claim the Field: no id from it, no `name`, never invalid, with `aria-labelledby` = the label's id and `aria-describedby` = the help text's id (not the error's). If `useSlider` registers with the nearest Field by default, explicit `aria-labelledby` opts it out, the way the existing Field controls handle a consumer's own wiring (engineer to match). The "no name" dev warning accepts `aria-labelledby`. The `With NumberInput` story proves: a label click focuses the number box; the slider's name is the label text; both are described by the help text; the error is on the number box only; moving the slider updates the box and typing a valid number moves the slider.
5. **No new token.** Track, thumb and hit-box sizes are rule-local `calc`s of `--kv-choice-size`, like the switch's.

## 10. Open questions

None blocking. Later, if consumers ask: a visible value part, tick marks with labels, two thumbs (plan non-goals).

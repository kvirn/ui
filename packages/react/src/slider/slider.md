# Slider

> The accessibility contract is [slider.a11y.md](slider.a11y.md) and the design spec is [docs/design/slider.md](../../../../docs/design/slider.md).

**KvirnUI holds no form state; bring your own form logic.** Slider is a native `<input type="range">`. It shows the `value` you give it and reports changes through `onValueChange`. It never copies the number into state of its own beyond what `aria-valuetext` needs, and it doesn't validate.

A Slider is for an approximate value, where "about this much" is the answer: a search radius, a volume.

| Use a                                          | When                                                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Slider**                                     | An approximate value over a small range with a coarse step, where seeing the position helps            |
| [NumberInput](../number-input/number-input.md) | An exact value: an amount, an age, anything with legal effect, or a wide range with a step of 1        |
| **Slider + NumberInput**                       | A value that is approximate to most but must be exact for some: the slider beside a number box (below) |

- A native range: the browser supplies the keys (arrows, Home, End, PageUp, PageDown), the drag, a press on the track, form submission, `form.reset()` and `disabled`.
- It sits in a [Field](../field/field.md), after the `Field.Label`. The Field gives it its `id`, `aria-describedby`, `aria-invalid` and `disabled`.
- **Say the unit.** `aria-valuetext` is always set: `valueText(value)`, or the number in the provider's locale. Give `valueText` the unit (`15 km`), since a screen reader would otherwise say "0.3".
- **Controlled:** pass `value` (a number) and `onValueChange(value, { reason: 'input', event })`. **Uncontrolled:** pass `defaultValue` and `name`. A submit sends `name=value`.
- **Not required.** `required` is not a prop: a range always has a value.
- Headless: no CSS. It renders `kv-slider`, and your `className` joins it. With `@kvirn-ui/theme/theme.css` imported it is styled (a plain track and a `primary` thumb, a 44px thumb on touch screens).

## API

Slider is a single part, `<Slider>`. `type` is fixed. There are no sub-parts: the label, help text and error are the [Field's](../field/field.md).

| Prop              | Type                                          | Meaning                                                                                                                      |
| ----------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `value`           | `number`                                      | Controlled: the number from your logic. Pair it with `onValueChange`                                                         |
| `defaultValue`    | `number`                                      | Uncontrolled: the browser keeps the number, and a form submit sends it                                                       |
| `min`, `max`      | `number`                                      | The ends. `0` and `100` by default                                                                                           |
| `step`            | `number`                                      | The distance between values. `1` by default                                                                                  |
| `name`            | `string`                                      | The name a form submit uses                                                                                                  |
| `disabled`        | `boolean`                                     | Native `disabled`: skipped by Tab. A disabled Field disables it too. Sets `data-disabled`                                    |
| `valueText`       | `(value: number) => string`                   | What `aria-valuetext` says. Default: the number formatted with the provider's locale                                         |
| `onValueChange`   | `(value, { reason: 'input', event }) => void` | Called on every change with the new number. It only reports. `onChange` still works too                                      |
| `aria-labelledby` | `string`                                      | Names the slider by another element and opts it out of the Field (Pattern A, below)                                          |
| `render`          | `(props, state) => ReactElement`              | Another element. It must still be an `<input type="range">`. `state` is `isInvalid`, `isDisabled`, `isFocusVisible`, `value` |

| State attribute      | When                              |
| -------------------- | --------------------------------- |
| `data-invalid`       | The Field is `invalid`            |
| `data-disabled`      | The Field or the prop disables it |
| `data-focus-visible` | Focus came from the keyboard      |

- **ARIA it sets:** `aria-valuetext`, `aria-invalid="true"` from the Field, and `aria-describedby` with the help text, then the error, followed by your own ids. The value, min and max are native (`aria-valuenow` is not written).
- **Class:** `kv-slider`, always. Your `className` joins it.
- **Dev warnings (once):** a Slider in a Field with no `Field.Label`; a Slider outside a Field with no accessible name (`aria-label` and `aria-labelledby` count); an `id` inside a Field; `min >= max`; a `value` or `defaultValue` outside the range.
- **No message keys.** Slider has no strings of its own.

## Component

```tsx
import { Field, Slider } from '@kvirn-ui/react'

;<Field.Root>
  <Field.Label marker="none">Avstånd från din adress i kilometer</Field.Label>
  <Slider name="distance" max={50} step={5} defaultValue={15} valueText={(km) => `${km} km`} />
  <Field.HelpText>Från 0 till 50 km.</Field.HelpText>
</Field.Root>
```

Your part:

- **Name the quantity and its unit in the label**, and state the ends of the range in the help text. Never "Drag the slider" as the only instruction.
- **A slider is never the only way in for an exact number.** Pair it with a NumberInput (Pattern A), or use a NumberInput alone.
- **Pattern A.** The NumberInput owns the `Field.Root`: the label's `for`, the error and the id. Give the Slider `aria-labelledby` and `aria-describedby` instead, which opts it out of the Field. The Field's label and help text take no `id`, so put a `<span id>` inside each and point at it. Only the NumberInput has a `name`.
- **Updating results as the value moves** is fine, but announce the result once, debounced, through the `Announcer`, and never move focus or navigate (3.2.2).
- **A slider that isn't available** is `disabled`, with the reason in the help text.

## Hook

```tsx
import { useSlider } from '@kvirn-ui/react'

function Volume({ volume, setVolume }: { volume: number; setVolume: (value: number) => void }) {
  const control = useSlider({
    value: volume,
    onValueChange: setVolume,
    valueText: (percent) => `${percent} procent`,
  })
  return <input {...control.inputProps} name="volume" aria-label="Volym" />
}
```

`useSlider` takes `value`, `defaultValue`, `min`, `max`, `step`, `name`, `disabled`, `onValueChange`, `valueText` and `aria-labelledby`, and returns `inputProps`, `isInvalid`, `isDisabled`, `isFocusVisible`, `value` and `valueText`. Spread `inputProps` on your own `<input>`. It reads the nearest Field.

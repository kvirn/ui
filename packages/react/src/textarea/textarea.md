# Textarea

> **Draft** (Plan 0034). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [textarea.a11y.md](textarea.a11y.md), the design spec is [docs/design/rich-text-editor.md](../../../../docs/design/rich-text-editor.md) (Textarea and Character count), and the decisions are in the forms skill.

**KvirnUI holds no form state; bring your own form logic.** Textarea is the multi-line text box of a [Field](../field/field.md): a native `<textarea>` for a longer answer, such as "Beskriv din situation", a message to a caseworker or a reason for an appeal. It renders the `value` you give it, reports changes up through `onValueChange`, never copies the value into state of its own, and doesn't validate. Use it with TanStack Form, React Hook Form, your own `useState`, or a plain `<form>`.

For a short answer on one line, use [TextInput](../text-input/text-input.md). For text with headings, lists and links, use the rich text editor (Plan 0036). Don't use a Textarea to collect a code, a number or a date: those are a TextInput with a mask, a [NumberInput](../number-input/number-input.md) and a [DateInput](../date-input/date-input.md).

- A native `<textarea>`. The browser supplies the role (`textbox`, multi-line), the keyboard, selection, spellcheck, paste, undo and autofill. Enter is a line break, and Tab leaves the box.
- Inside a Field it takes its `id`, `aria-describedby`, `aria-invalid`, `aria-required` and `disabled` from it. Outside a Field it needs `aria-label` or `aria-labelledby`: a dev warning says so.
- `rows` is 5 unless you set it. The box grows with its text where the browser supports `field-sizing: content`, and `rows` is its minimum. Nothing is written in JavaScript.
- **Controlled:** pass `value` and `onValueChange(value, { reason: 'input', event })`. **Uncontrolled:** pass `defaultValue` and `name`, and the browser keeps the value until a form submit reads it. `onChange` and every other native prop, `name` and `ref` pass through.
- **A count of the characters left:** `characterCount` with `maxLength` shows "Du har 120 tecken kvar." right under the box, announces it politely when it matters, and never cuts a pasted text.
- Headless: no CSS. It renders `kv-textarea`, and your `className` joins it. With `@kvirn-ui/theme/theme.css` imported it is styled like a TextInput, full width, with vertical resize only.

## API

Textarea is one element, so it has no `.Root`. The props are the controls above, and every other native `<textarea>` prop passes through. `useTextarea` returns the same props for your own `<textarea>`.

| Part           | Renders      | Takes                                                                                                                                                                                                                       |
| -------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Textarea       | `<textarea>` | `value`, `defaultValue`, `onValueChange`, `rows`, `maxLength`, `characterCount`, `countCharacters`, `messages`, `render`, `ref`, and the native props. With `characterCount` it also renders a `CharacterCount` after it    |
| CharacterCount | `<p>`        | `value`, `limit`, `countCharacters`, `announceFrom`, `announcementDebounceMilliseconds`, `announceChanges`, `messages`, `render`, `ref`, and the native `<p>` props. For your own markup, with `useTextarea` or a TextInput |

`render` receives `(textareaProps, state)`, where `state` is `{ isInvalid, isRequired, isDisabled, isFocusVisible, isOverLimit }`. It must still render a `<textarea>`: spread the props, because they hold the Field's wiring and the class. `CharacterCount`'s `render` gets `{ length, limit, remaining, excess, isEmpty, isOver, isNear }` and must still render an element with the props it is given.

| State attribute      | On                       | When                                                                                               |
| -------------------- | ------------------------ | -------------------------------------------------------------------------------------------------- |
| `data-invalid`       | Textarea                 | The Field is invalid (also `aria-invalid="true"`)                                                  |
| `data-required`      | Textarea                 | The Field is required (also `aria-required="true"`)                                                |
| `data-disabled`      | Textarea                 | The box or its Field is disabled (also native `disabled`)                                          |
| `data-focused`       | Textarea                 | It has focus, however it got it                                                                    |
| `data-focus-visible` | Textarea                 | It has focus and the focus came from the keyboard (browsers match `:focus-visible` on a click too) |
| `data-over`          | Textarea, CharacterCount | `characterCount` is on and the text is longer than the limit. A warning, never `aria-invalid`      |
| `data-near`          | CharacterCount           | The text has reached 80% of the limit (or `announceFrom`), and while it is over                    |

| Class                | On             | Sets                                                                                                                          |
| -------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `kv-textarea`        | Textarea       | The part class. The theme styles the box, its edge, its ring and its states, as for `kv-input`, with block padding and `rows` |
| `kv-field-help-text` | CharacterCount | The help text's own class: 14px, the text colour. Never changed by the field's state                                          |
| `kv-character-count` | CharacterCount | Adds only the over-the-limit look: weight 600 and the `warning` icon (`data-over`)                                            |

There is no width class: a Textarea is the full width of its field, so the box never grows wider than a 320px screen. The height is `rows`. It is 44px at the least, the value text stays 16px in compact density, and an invalid box has a 2px `danger` edge, drawn from `data-invalid` or `aria-invalid="true"`, never from `:invalid`.

| Message key (`messages`)   | Says by default (en)                                                          |
| -------------------------- | ----------------------------------------------------------------------------- |
| `characterCount.limit`     | "You can enter up to 500 characters." (shown while the box is empty)          |
| `characterCount.remaining` | "You have 120 characters remaining." (one: "You have 1 character remaining.") |
| `characterCount.over`      | "You have 12 characters too many." (one: "You have 1 character too many.")    |

A Textarea without `characterCount` announces nothing. The strings are in all six locales (`se` is English until a native speaker writes it).

What Textarea does on its own: it takes the control's `id` and `aria-describedby` from the Field (and ignores an `id` of its own inside one, with a dev warning, so the label stays linked); it keeps your own `aria-describedby` ids after the Field's; it sets `rows` to 5; it moves no focus and handles no keys. With `characterCount` it also leaves `maxlength` off the element, renders the count after the box, registers the count as one of the control's descriptions (so it is read when the box gets focus, between the description above and the help text and error below), keeps the count's text up to date, and announces it through the Announcer.

## Component

```tsx
import { Field, Textarea } from '@kvirn-ui/react'

// Controlled by your own state. The value lives in your useState, not in Textarea.
const [situation, setSituation] = useState('')

<Field.Root required>
  <Field.Label>Beskriv din situation</Field.Label>
  <Field.Prose>
    <p>Berätta vad som har hänt och vad du behöver hjälp med.</p>
  </Field.Prose>
  <Textarea name="situation" value={situation} onValueChange={setSituation} />
</Field.Root>
```

### With TanStack Form

TanStack Form owns the value, the validity and the errors. Textarea and Field show them:

```tsx
<form.Field name="situation">
  {(field) => (
    <Field.Root invalid={!field.state.meta.isValid} required>
      <Field.Label>Beskriv din situation</Field.Label>
      <Textarea
        name={field.name}
        value={field.state.value}
        onValueChange={field.handleChange}
        onBlur={field.handleBlur}
        maxLength={1000}
        characterCount
      />
      <Field.ErrorMessage>{field.state.meta.errors.join(', ')}</Field.ErrorMessage>
    </Field.Root>
  )}
</form.Field>
```

Validate on submit, so the error doesn't appear and move the content while the user types. React Hook Form's `register('situation')` spreads onto Textarea the same way (`name`, `ref`, `onChange` and `onBlur` reach the native box). With `characterCount`, pass `value` (React Hook Form's `watch`) when you set the text from code.

### In a plain form

No `value`, no handlers: the Textarea is uncontrolled, and the form's `FormData` has what was typed, by `name`. Enter inside it is a line break, never a submit.

```tsx
<form
  noValidate
  onSubmit={(event) => {
    event.preventDefault()
    save(new FormData(event.currentTarget).get('situation'))
  }}
>
  <Field.Root required>
    <Field.Label>Beskriv din situation</Field.Label>
    <Textarea name="situation" />
  </Field.Root>
  <Button type="submit">Skicka</Button>
</form>
```

### HelpTexts and errors: the order

The default order is label, description, box, count, help text, then the error ([Field](../field/field.md#the-default-order)). Put what the user must read before answering in a description above the box, and a short instruction in a help text under it. The count is placed for you, directly under the box:

```tsx
<Field.Root invalid={invalid} required>
  <Field.Label>Beskriv din situation</Field.Label>
  <Field.Prose>
    <p>Berätta vad som har hänt och vad du behöver hjälp med.</p>
  </Field.Prose>
  <Textarea name="situation" maxLength={1000} characterCount />
  <Field.HelpText>Du kan svara på svenska, finska eller engelska.</Field.HelpText>
  <Field.ErrorMessage>{error}</Field.ErrorMessage>
</Field.Root>
```

### A character count

Use a count when the limit is real (a form field with a size in the register, an SMS) and the user can plausibly reach it. If it isn't, raise the limit instead: a count under every box is noise. Don't use a `maxLength` with no count: the browser silently stops the typing, and a pasted text is cut without a word.

```tsx
<Textarea name="situation" maxLength={1000} characterCount />
```

- **`maxLength` is the count's limit and is not written to the element.** A pasted text of any length is kept whole (3.3.8), and the count says how many characters are over, so the user can shorten it. The native attribute would cut it silently.
- **Over the limit is a warning, not an error.** The count gets `data-over`, weight 600 and the `warning` icon, and the box gets `data-over`. Nothing is `aria-invalid`: your form decides on submit, and writes an error that names the fix ("Beskrivningen kan vara högst 1 000 tecken. Ta bort 12 tecken."). `onValueChange` gets `details.length`, `details.limit` and `details.isOverLimit` to help.
- **It counts what the user sees:** grapheme clusters (`Intl.Segmenter`), so `å` typed as `a` plus a combining ring, and an emoji, count as one, and a line break counts as one. When your server counts differently (UTF-16 `value.length`, bytes, or `\r\n` as two), pass your rule as `countCharacters={(value) => number}` and **count the same way on both sides**, or a text the user was told fits is refused on submit.
- **Said politely, when it matters.** The count is read with the box when it gets focus (it is in `aria-describedby`). While typing it is announced through the Announcer, only from 80% of the limit and only when typing pauses (500 ms), and at once when the text crosses the limit, so a screen reader user is never interrupted on every key. Only what the user types is announced: a text set from code (a restored draft) changes the count and says nothing. It needs the `KvirnProvider`: without one the count still shows and nothing is announced.
- **`characterCount` without `maxLength`** warns once in development and renders nothing.
- **An uncontrolled box** keeps its value in the element. With `characterCount` it reads that value on mount and on `pageshow` (the browser restores a form without an input event), and after a form reset. For any other change from code, pass `value`.
- **In a Fieldset without a Field,** the count still describes the box, not the `<fieldset>`: the Textarea gives it its own id and lists it in its own `aria-describedby`. A `CharacterCount` of your own directly in a Fieldset works the same way: pass it an `id` and list that id in your control's `aria-describedby`.
- **Your own markup:** `useTextarea` for the box and `CharacterCount` for the count. Inside a Field the count registers with the Field like a help text, so nothing more is needed:

```tsx
const { textareaProps, isFocused } = useTextarea({ onValueChange: setValue })

<Field.Root>
  <Field.Label>Beskriv din situation</Field.Label>
  <textarea {...textareaProps} name="situation" value={value} />
  <CharacterCount value={value} limit={1000} announceChanges={isFocused} />
</Field.Root>
```

Outside a Field, nothing links the count to the box: pass the count an `id` and list it in your control's `aria-describedby` (`<textarea aria-describedby="count" …>` with `<CharacterCount id="count" … />`), or a screen reader won't read it with the box (1.3.1, 4.1.2). `announceChanges` is optional (default `true`): pass whether your box has focus (`useTextarea`'s `isFocused`) to announce only what the user types.

### Your part

- **A visible label** in a Field. The placeholder is not the label: put examples in the description or the help text (3.3.2).
- **`autoComplete`** where a token exists for the question (1.3.5), and never block paste (3.3.8).
- **Read-only and disabled** are for staff tools. In a resident form, explain on submit instead.
- **A session that doesn't expire under a long answer** (2.2.1): warn and let the user extend it, and save drafts in staff tools.
- **The direction** is the page's, from the provider: the Textarea has no `dir` prop and never sets `dir="auto"`. Set the provider's `dir` (or its RTL `locale`) and put `useLocale().localeProps` where the language is set, on `<html>` or a wrapper, and the text starts at the right in a right-to-left page.
- **The `KvirnProvider`** around the app, so the count is announced.
- **Don't pass `id`** to a Textarea inside a Field: the Field's id wins. Set `controlId` on `Field.Root`.

## Hook

```tsx
import { useTextarea } from '@kvirn-ui/react'

function StoryBox() {
  const { textareaProps } = useTextarea({
    rows: 8,
    onValueChange: (value) => form.setValue('story', value),
  })
  return <textarea {...textareaProps} name="story" />
}
```

`useTextarea` reads the nearest Field, and returns `textareaProps` with the Field's wiring, `kv-textarea`, `rows` (5 unless you set it) and the change and focus handlers, plus `isInvalid`, `isRequired`, `isDisabled`, `isFocused` and `isFocusVisible`. Spread your form library's props next to it. `useCharacterCount({ value, limit })` is the hook behind `CharacterCount`: it returns `countProps`, `count` and `text` for your own element.

### `render`

```tsx
<Textarea render={(textareaProps) => <MyTextarea {...textareaProps} />} />
```

The element must still be a `<textarea>`. Spread the props: they hold the Field's wiring and the class.

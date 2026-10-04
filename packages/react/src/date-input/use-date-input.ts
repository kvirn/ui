import { dateInputOrder } from '@kvirn-ui/core'
import type { DateInputPart } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useMemo, useRef } from 'react'
import type { ChangeEvent, ChangeEventHandler, RefCallback } from 'react'
import { useLocale } from '../provider/use-locale.ts'
import { useMessages } from '../provider/use-messages.ts'

export type { DateInputPart } from '@kvirn-ui/core'

/** The date as the three boxes show it: strings, exactly as typed. Never parsed. */
export interface DateInputValue {
  year: string
  month: string
  day: string
}

/** The second argument of `onValueChange`. */
export interface DateInputChangeDetails {
  reason: 'input'
  /** The box the user typed in. */
  part: DateInputPart
  event: ChangeEvent<HTMLInputElement>
}

export interface UseDateInputOptions {
  /**
   * A prefix for the three inputs' `name`: `birth` gives `birth-day`, `birth-month` and
   * `birth-year`. Without it the inputs have no name, and a form submit doesn't send them.
   */
  name?: string | undefined
  /** Controlled: the date from your form state. All three are strings; use `''` for a box with nothing in it. */
  value?: DateInputValue | undefined
  /** Uncontrolled: the text each box starts with. The native inputs keep it after that. */
  defaultValue?: Partial<DateInputValue> | undefined
  /**
   * Called with the whole date after every change in any box. It only reports: the value lives
   * in your form state, or in the native inputs when you don't pass `value`.
   */
  onValueChange?: ((value: DateInputValue, details: DateInputChangeDetails) => void) | undefined
  /** `'bday'` for a date of birth: the boxes get `bday-day`, `bday-month` and `bday-year` (1.3.5). */
  autoComplete?: 'bday' | undefined
  /** Replaces the locale's order. Default: from `Intl` for the provider's locale. */
  order?: readonly DateInputPart[] | undefined
  /** Native `readOnly` on the three inputs. */
  readOnly?: boolean | undefined
  /**
   * Focus moves to the next box, with its text selected, when the user's typing fills a box
   * (two digits for day and month, four for year). Never from the last box, and never on paste,
   * drop, autofill, deletion, a change of `value`, or an edit of a box that was already full.
   * Default: `true`. Render `autoAdvanceHint` under the boxes and in the group's description
   * while it is on (WCAG 3.2.2). `false` is the stricter reading: typing never moves focus.
   */
  autoAdvance?: boolean | undefined
  /** Per-instance overrides for the three box labels and the auto-advance hint. */
  messages?: Partial<KvirnMessages['dateInput']> | undefined
}

/** Spread on the row that holds the three boxes. */
export interface DateInputRootPartProps {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-date-input`. Add your own
   * class next to it with `mergeProps`: class names join.
   */
  className: 'kv-date-input'
}

/**
 * Spread on the `Field.Root` of one box, next to its own `kv-field`: the class the theme sizes
 * the box by, whatever order the boxes are rendered in.
 */
export interface DateInputBoxPartProps<Part extends DateInputPart = DateInputPart> {
  className: `kv-date-input-${Part}`
}

/** Spread on the `<input>` of one box, next to the Field's `controlProps`. */
export interface DateInputInputPartProps {
  /** From `name`: `<name>-day`, `<name>-month` or `<name>-year`. */
  name?: string
  inputMode: 'numeric'
  /** A date is not a word. */
  spellCheck: false
  autoComplete?: 'bday-day' | 'bday-month' | 'bday-year'
  /** Controlled: from `value`. */
  value?: string
  /** Uncontrolled: from `defaultValue`. */
  defaultValue?: string
  readOnly?: true
  onChange: ChangeEventHandler<HTMLInputElement>
  /** Lets the hook read the other two boxes when this one changes. Put it on the input. */
  ref: RefCallback<HTMLInputElement>
}

export interface UseDateInputResult {
  /**
   * The order of the boxes for the provider's locale: `['year', 'month', 'day']` for `sv-SE`,
   * `['day', 'month', 'year']` for `sv-FI`, `fi`, `nb` and `en`. Month first becomes day first.
   * Or the `order` option. Render the boxes in this order.
   */
  order: readonly DateInputPart[]
  /** The resolved labels, for example `Dag`, `Månad` and `År`. */
  labels: Readonly<Record<DateInputPart, string>>
  /**
   * The resolved `dateInput.autoAdvanceHint` while `autoAdvance` is on, `undefined` when it is
   * off. Render it as visible text under the boxes and list its id in the group's
   * `aria-describedby`, so users are told before they type (WCAG 3.2.2).
   */
  autoAdvanceHint: string | undefined
  rootProps: DateInputRootPartProps
  getBoxProps: <Part extends DateInputPart>(part: Part) => DateInputBoxPartProps<Part>
  getInputProps: (part: DateInputPart) => DateInputInputPartProps
}

const rootProps: DateInputRootPartProps = Object.freeze({ className: 'kv-date-input' })

/** The most characters each box takes, so the digit that makes it full is the last one it needs. */
const boxLength: Readonly<Record<DateInputPart, number>> = { day: 2, month: 2, year: 4 }

const autoCompleteTokens = {
  day: 'bday-day',
  month: 'bday-month',
  year: 'bday-year',
} as const

/**
 * A date made of three text boxes, for your own markup (contract: date-input.a11y.md): the
 * order the region writes a date in, the labels, and each input's attributes. It holds no
 * value: pass `value` and `onValueChange`, or `defaultValue` and `name` for a plain form. It
 * never parses or validates the date and never steps a value with the arrow keys. While
 * `autoAdvance` is on (the default) it moves focus to the next box when the user's typing fills a
 * box: say so with `autoAdvanceHint`. Wrap the boxes in a group: a `<fieldset>` with a `<legend>`.
 *
 * @example
 * const dateInput = useDateInput({ name: 'birth', autoComplete: 'bday' })
 * <Fieldset.Root group required>
 *   <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
 *   <div {...dateInput.rootProps}>
 *     {dateInput.order.map((part) => (
 *       <Field.Root key={part} {...dateInput.getBoxProps(part)}>
 *         <Field.Label>{dateInput.labels[part]}</Field.Label>
 *         <TextInput {...dateInput.getInputProps(part)} />
 *       </Field.Root>
 *     ))}
 *   </div>
 *   {dateInput.autoAdvanceHint !== undefined && (
 *     <Fieldset.HelpText>{dateInput.autoAdvanceHint}</Fieldset.HelpText>
 *   )}
 * </Fieldset.Root>
 */
export function useDateInput({
  name,
  value,
  defaultValue,
  onValueChange,
  autoComplete,
  order,
  readOnly = false,
  autoAdvance = true,
  messages,
}: UseDateInputOptions = {}): UseDateInputResult {
  const { locale } = useLocale()
  const dateMessages = useMessages('dateInput', messages)
  const localeOrder = useMemo(() => dateInputOrder(locale), [locale])
  const elements = useRef<Record<DateInputPart, HTMLInputElement | null>>({
    day: null,
    month: null,
    year: null,
  })
  // What the user's typing is doing right now: `beforeinput` knows the input type and how long
  // the box was before the key, and `change` (after it) knows the box's new text.
  const typing = useRef<{ part: DateInputPart; lengthBefore: number } | null>(null)
  // One stable callback ref per box, so React doesn't detach and re-attach them each render.
  const refs = useMemo<Record<DateInputPart, RefCallback<HTMLInputElement>>>(() => {
    const refFor =
      (part: DateInputPart): RefCallback<HTMLInputElement> =>
      (element) => {
        elements.current[part] = element
        if (element === null) {
          return undefined
        }
        const record = (event: InputEvent) => {
          typing.current =
            event.inputType === 'insertText' ? { part, lengthBefore: element.value.length } : null
        }
        element.addEventListener('beforeinput', record)
        return () => {
          element.removeEventListener('beforeinput', record)
          elements.current[part] = null
        }
      }
    return { day: refFor('day'), month: refFor('month'), year: refFor('year') }
  }, [])

  const textOf = (part: DateInputPart, changed: HTMLInputElement, changedPart: DateInputPart) =>
    part === changedPart ? changed.value : (elements.current[part]?.value ?? value?.[part] ?? '')

  /**
   * The box after this one in the DOM, which is the Tab order and, by default, the field order.
   * Never from the last box, and never to a disabled one.
   */
  const nextBoxAfter = (part: DateInputPart): HTMLInputElement | null => {
    const boxes = [...(['day', 'month', 'year'] as const)]
      .map((name) => elements.current[name])
      .filter((element): element is HTMLInputElement => element !== null)
      .sort((first, second) =>
        first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      )
    const own = elements.current[part]
    const index = own === null ? -1 : boxes.indexOf(own)
    const next = index === -1 ? undefined : boxes[index + 1]
    return next === undefined || next.disabled ? null : next
  }

  /**
   * Only the user's own typing that makes the box full: the last key was `insertText` and the
   * box held fewer characters before it (guards 1 and 2, Plan 0040). Paste, drop, autofill and
   * deletion have another input type, and an edit of a full box starts from a full box.
   */
  const advanceAfterTyping = (part: DateInputPart, input: HTMLInputElement) => {
    const typed = typing.current
    typing.current = null
    if (
      !autoAdvance ||
      typed === null ||
      typed.part !== part ||
      typed.lengthBefore >= boxLength[part] ||
      input.value.length !== boxLength[part] ||
      !/^\d+$/.test(input.value)
    ) {
      return
    }
    const next = nextBoxAfter(part)
    next?.focus()
    // The whole next box is selected, so typing replaces a prefilled value (guard 6).
    next?.select()
  }

  const getInputProps = (part: DateInputPart): DateInputInputPartProps => {
    const startText = defaultValue?.[part]
    return {
      ...(name === undefined ? {} : { name: `${name}-${part}` }),
      inputMode: 'numeric',
      spellCheck: false,
      ...(autoComplete === undefined ? {} : { autoComplete: autoCompleteTokens[part] }),
      ...(value === undefined
        ? startText === undefined
          ? {}
          : { defaultValue: startText }
        : { value: value[part] }),
      ...(readOnly ? { readOnly: true as const } : {}),
      onChange: (event) => {
        const input = event.currentTarget
        onValueChange?.(
          {
            year: textOf('year', input, part),
            month: textOf('month', input, part),
            day: textOf('day', input, part),
          },
          { reason: 'input', part, event },
        )
        advanceAfterTyping(part, input)
      },
      ref: refs[part],
    }
  }

  return {
    order: order ?? localeOrder,
    labels: { day: dateMessages.day, month: dateMessages.month, year: dateMessages.year },
    autoAdvanceHint: autoAdvance ? dateMessages.autoAdvanceHint : undefined,
    rootProps,
    getBoxProps: (part) => ({ className: `kv-date-input-${part}` as const }),
    getInputProps,
  }
}

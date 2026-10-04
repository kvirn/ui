import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useMemo, useRef } from 'react'
import type { ChangeEvent, ChangeEventHandler, RefCallback } from 'react'
import { useLocale } from '../provider/use-locale.ts'
import { useMessages } from '../provider/use-messages.ts'
import { dateInputOrder } from './date-order.ts'
import type { DateInputPart } from './date-order.ts'

export type { DateInputPart } from './date-order.ts'

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
  /** Per-instance overrides for the three box labels. */
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
  rootProps: DateInputRootPartProps
  getBoxProps: <Part extends DateInputPart>(part: Part) => DateInputBoxPartProps<Part>
  getInputProps: (part: DateInputPart) => DateInputInputPartProps
}

const rootProps: DateInputRootPartProps = Object.freeze({ className: 'kv-date-input' })

const autoCompleteTokens = {
  day: 'bday-day',
  month: 'bday-month',
  year: 'bday-year',
} as const

/**
 * A date made of three text boxes, for your own markup (contract: date-input.a11y.md): the
 * order the region writes a date in, the labels, and each input's attributes. It holds no
 * value: pass `value` and `onValueChange`, or `defaultValue` and `name` for a plain form. It
 * never parses or validates the date, never moves focus to the next box, and never steps a
 * value with the arrow keys. Wrap the boxes in a group: a `<fieldset>` with a `<legend>`.
 *
 * @example
 * const dateInput = useDateInput({ name: 'birth', autoComplete: 'bday' })
 * <Fieldset.Root group required>
 *   <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
 *   <div {...dateInput.rootProps}>
 *     {dateInput.order.map((part) => (
 *       <Field.Root key={part} {...dateInput.getBoxProps(part)}>
 *         <Field.Label>{dateInput.labels[part]}</Field.Label>
 *         <Input {...dateInput.getInputProps(part)} />
 *       </Field.Root>
 *     ))}
 *   </div>
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
  // One stable callback ref per box, so React doesn't detach and re-attach them each render.
  const refs = useMemo<Record<DateInputPart, RefCallback<HTMLInputElement>>>(
    () => ({
      day: (element) => {
        elements.current.day = element
      },
      month: (element) => {
        elements.current.month = element
      },
      year: (element) => {
        elements.current.year = element
      },
    }),
    [],
  )

  const textOf = (part: DateInputPart, changed: HTMLInputElement, changedPart: DateInputPart) =>
    part === changedPart ? changed.value : (elements.current[part]?.value ?? value?.[part] ?? '')

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
      },
      ref: refs[part],
    }
  }

  return {
    order: order ?? localeOrder,
    labels: { day: dateMessages.day, month: dateMessages.month, year: dateMessages.year },
    rootProps,
    getBoxProps: (part) => ({ className: `kv-date-input-${part}` as const }),
    getInputProps,
  }
}

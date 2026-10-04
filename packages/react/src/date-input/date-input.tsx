'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { createContext, useContext, useEffect, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldGroupContext, FieldTextHostContext } from '../field/field-context.ts'
import { Field } from '../field/field.tsx'
import { Input } from '../input/input.tsx'
import type { InputProps } from '../input/input.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useMessages } from '../provider/use-messages.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useDateInput } from './use-date-input.ts'
import type {
  DateInputBoxPartProps,
  DateInputChangeDetails,
  DateInputInputPartProps,
  DateInputPart,
  DateInputValue,
} from './use-date-input.ts'

export type {
  DateInputChangeDetails,
  DateInputPart,
  DateInputValue,
  UseDateInputOptions,
} from './use-date-input.ts'

/** What `render` receives as its second argument. */
export interface DateInputState {
  /** The order of the boxes, as rendered by default. */
  order: readonly DateInputPart[]
  isRequired: boolean
  isDisabled: boolean
}

export interface DateInputRootProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'defaultValue' | 'onChange'
> {
  /**
   * A prefix for the inputs' `name`: `birth` gives `birth-day`, `birth-month` and `birth-year`.
   * Without it the inputs have no name, and a form submit doesn't send them.
   */
  name?: string | undefined
  /** Controlled: the date from your form state, all three as strings (`''` for an empty box). */
  value?: DateInputValue | undefined
  /** Uncontrolled: the text each box starts with. The native inputs keep it after that. */
  defaultValue?: Partial<DateInputValue> | undefined
  /** Called with the whole date after every change in any box. It only reports. */
  onValueChange?: ((value: DateInputValue, details: DateInputChangeDetails) => void) | undefined
  /** `'bday'` for a date of birth: `bday-day`, `bday-month` and `bday-year` on the boxes (1.3.5). */
  autoComplete?: 'bday' | undefined
  /** The order of the boxes when the Root renders them itself. Default: the locale's. */
  order?: readonly DateInputPart[] | undefined
  /** `aria-required` on the three boxes. Default: the Fieldset's `required`. */
  required?: boolean | undefined
  /** Native `disabled` on the three boxes. Default: the Fieldset's `disabled`. */
  disabled?: boolean | undefined
  /** Native `readOnly` on the three boxes. */
  readOnly?: boolean | undefined
  /**
   * The boxes that are wrong: `aria-invalid` and `data-invalid` on them only. For boxes the Root
   * renders itself; with your own children, set `invalid` on each box.
   */
  invalidParts?: readonly DateInputPart[] | undefined
  /** Per-instance message overrides for the three labels. */
  messages?: Partial<KvirnMessages['dateInput']> | undefined
  /** Change the element: `render={<section />}`. */
  render?: RenderProp<ComponentPropsWithRef<'div'>, DateInputState> | undefined
}

export interface DateInputBoxProps extends Omit<
  InputProps,
  | 'type'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'mask'
  | 'announceRejections'
  | 'messages'
  | 'part'
> {
  /**
   * This box is wrong: `aria-invalid="true"` and `data-invalid` on its input, label and field.
   * The Fieldset's `invalid` marks none of the boxes.
   */
  invalid?: boolean | undefined
}

export type DateInputDayProps = DateInputBoxProps
export type DateInputMonthProps = DateInputBoxProps
export type DateInputYearProps = DateInputBoxProps

interface DateInputContextValue {
  getInputProps: (part: DateInputPart) => DateInputInputPartProps
  getBoxProps: (part: DateInputPart) => DateInputBoxPartProps
  isRequired: boolean
  isDisabled: boolean
  invalidParts: readonly DateInputPart[] | undefined
  messages: Partial<KvirnMessages['dateInput']> | undefined
}

const DateInputContext = createContext<DateInputContextValue | null>(null)

/** The attributes a box has even outside a Root. */
const bareInputProps: Partial<DateInputInputPartProps> = Object.freeze({
  inputMode: 'numeric',
  spellCheck: false,
})

/**
 * A date of three text boxes: day, month and year, in the order the region writes dates in
 * (contract: date-input.a11y.md). Put it inside a `Fieldset.Root` whose `Fieldset.Legend` asks the
 * question, then the boxes, then a `Fieldset.Hint` under them with an example in the same order
 * and a `Fieldset.ErrorMessage`. Without children it renders `DateInput.Day`, `.Month` and `.Year` in
 * the locale's order; write them yourself to use another order. It holds no form state, never
 * parses or validates the date, never moves focus between the boxes, and the arrow keys never
 * step a value.
 *
 * @example
 * <Fieldset.Root group required invalid={error !== undefined}>
 *   <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
 *   <DateInput.Root name="birth" autoComplete="bday" invalidParts={error?.parts} />
 *   <Fieldset.Hint>Till exempel 1990 3 27</Fieldset.Hint>
 *   <Fieldset.ErrorMessage>{error?.message}</Fieldset.ErrorMessage>
 * </Fieldset.Root>
 */
export function DateInputRoot({
  name,
  value,
  defaultValue,
  onValueChange,
  autoComplete,
  order,
  required,
  disabled,
  readOnly,
  invalidParts,
  messages,
  children,
  render,
  ref,
  ...otherProps
}: DateInputRootProps): ReactElement {
  // The nearest Fieldset (a DateInput sits directly in one): its required and disabled are the
  // date's. Its invalid is not: each box has its own.
  const host = useContext(FieldTextHostContext)
  const isInGroup = useContext(FieldGroupContext)
  const isRequired = required ?? host?.state.isRequired ?? false
  const isDisabled = disabled ?? host?.state.isDisabled ?? false
  const dateInput = useDateInput({
    name,
    value,
    defaultValue,
    onValueChange,
    autoComplete,
    order,
    readOnly,
    messages,
  })
  const elementRef = useRef<HTMLDivElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)

  // The legend carries the optional text, and only a `group` fieldset adds it: otherwise an
  // optional date says so nowhere, because its boxes never do.
  const isFieldsetPlain = host !== null && !isInGroup && !host.state.isRequired
  useEffect(() => {
    if (isFieldsetPlain) {
      warnOnce(
        'date-input-fieldset-not-group',
        'A DateInput.Root is in a Fieldset that is neither `group` nor `required`, so an optional date shows "(optional)" nowhere: its boxes never do, and a plain Fieldset legend does not either (WCAG 1.3.1, 3.3.2). Write <Fieldset.Root group> (add `required` when the date is required).',
      )
    }
  }, [isFieldsetPlain])

  useEffect(() => {
    if (elementRef.current?.closest('fieldset, [role="group"], [role="radiogroup"]') === null) {
      warnOnce(
        'date-input-without-group',
        'A DateInput.Root is not inside a group, so its three boxes have no shared name (WCAG 1.3.1, 3.3.2). Put it in <Fieldset.Root> with a <Fieldset.Legend> that asks the question.',
      )
    }
  })

  const contextValue: DateInputContextValue = {
    getInputProps: dateInput.getInputProps,
    getBoxProps: dateInput.getBoxProps,
    isRequired,
    isDisabled,
    invalidParts,
    messages,
  }
  const state: DateInputState = { order: dateInput.order, isRequired, isDisabled }

  return (
    // The boxes are one question's parts: a Field in a group has no "(optional)" on its label.
    <FieldGroupContext.Provider value>
      <DateInputContext.Provider value={contextValue}>
        {renderPart({
          render,
          defaultElement: 'div',
          partProps: {
            ...mergeProps(otherProps, dateInput.rootProps),
            children:
              children === undefined
                ? dateInput.order.map((part) => <DateInputBox key={part} part={part} />)
                : children,
            ref: mergedRef,
          },
          state,
        })}
      </DateInputContext.Provider>
    </FieldGroupContext.Provider>
  )
}
DateInputRoot.displayName = 'DateInput.Root'

interface DateInputBoxInternalProps extends DateInputBoxProps {
  part: DateInputPart
}

function DateInputBox({
  part,
  invalid,
  ref,
  ...inputProps
}: DateInputBoxInternalProps): ReactElement {
  const root = useContext(DateInputContext)
  const dateMessages = useMessages('dateInput', root?.messages)
  const { ref: ownRef, ...ownProps } = root?.getInputProps(part) ?? bareInputProps
  const mergedRef = useMergedRef(ref, ownRef ?? null)

  useEffect(() => {
    if (root === null) {
      warnOnce(
        'date-input-part-outside-root',
        'A DateInput.Day, .Month or .Year is outside a DateInput.Root, so it has no name, value or autocomplete from it. Put the three boxes in <DateInput.Root> inside a <Fieldset.Root> (WCAG 1.3.1).',
      )
    }
  }, [root])

  // Per box, not from a Field: a Field.Root that is invalid expects its own ErrorMessage, and
  // the date has one error, the Fieldset's. The input, its label and its field are marked here.
  const isInvalid = invalid ?? root?.invalidParts?.includes(part) ?? false
  const invalidAttributes = isInvalid ? ({ 'data-invalid': '' } as const) : {}

  return (
    <Field.Root
      className={root?.getBoxProps(part).className ?? `kv-date-input-${part}`}
      required={root?.isRequired}
      disabled={root?.isDisabled}
      {...invalidAttributes}
    >
      <Field.Label {...invalidAttributes}>{dateMessages[part]}</Field.Label>
      {renderPart({
        render: undefined,
        defaultElement: Input,
        // The hook's props first, then the consumer's: class names join and handlers chain.
        partProps: {
          ...mergeProps(
            ownProps,
            inputProps,
            invalidAttributes,
            isInvalid ? { 'aria-invalid': 'true' } : {},
          ),
          ref: mergedRef,
        },
        state: { isInvalid },
      })}
    </Field.Root>
  )
}

/** The day box: a Field with the label `dateInput.day` and a numeric text input. */
export function DateInputDay(props: DateInputDayProps): ReactElement {
  return <DateInputBox {...props} part="day" />
}
DateInputDay.displayName = 'DateInput.Day'

/** The month box: a Field with the label `dateInput.month` and a numeric text input. */
export function DateInputMonth(props: DateInputMonthProps): ReactElement {
  return <DateInputBox {...props} part="month" />
}
DateInputMonth.displayName = 'DateInput.Month'

/** The year box: a Field with the label `dateInput.year` and a numeric text input. */
export function DateInputYear(props: DateInputYearProps): ReactElement {
  return <DateInputBox {...props} part="year" />
}
DateInputYear.displayName = 'DateInput.Year'

/**
 * A date of three text boxes: `DateInput.Root` is the row, with `DateInput.Day`, `.Month` and
 * `.Year` inside it, in the order you write them (or the locale's, when the Root has no
 * children).
 */
export const DateInput = {
  Root: DateInputRoot,
  Day: DateInputDay,
  Month: DateInputMonth,
  Year: DateInputYear,
} as const

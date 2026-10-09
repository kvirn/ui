'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { createContext, createElement, useContext, useEffect, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldGroupContext, FieldTextHostContext } from '../field/field-context.ts'
import { useDescriptionPart } from '../field/use-description-part.ts'
import { Field } from '../field/field.tsx'
import { TextInput } from '../text-input/text-input.tsx'
import type { TextInputProps } from '../text-input/text-input.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useMessages } from '../provider/use-messages.ts'
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
   * Focus moves to the next box, with its text selected, when the user's typing fills a box.
   * Default: `true`, with a visible hint under the boxes (`dateInput.autoAdvanceHint`) that is
   * part of the group's description. `false` turns both off: typing never moves focus.
   */
  autoAdvance?: boolean | undefined
  /**
   * The boxes that are wrong: `aria-invalid` and `data-invalid` on them only. For boxes the Root
   * renders itself; with your own children, set `invalid` on each box.
   */
  invalidParts?: readonly DateInputPart[] | undefined
  /** Per-instance message overrides for the three labels and the auto-advance hint. */
  messages?: Partial<KvirnMessages['dateInput']> | undefined
}

export interface DateInputBoxProps extends Omit<
  TextInputProps,
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

/**
 * The auto-advance hint: visible text under the row of boxes, and one of the descriptions of the
 * nearest Fieldset, so its id is in the group's `aria-describedby` in DOM order (WCAG 3.2.2:
 * users are told before they type). It looks like a `Fieldset.HelpText` but never warns:
 * outside a Fieldset (a native `<fieldset>` of your own) it is plain text with no id.
 */
function DateInputAutoAdvanceHint({ children }: { children: string }): ReactElement {
  const description = useDescriptionPart<HTMLParagraphElement>(undefined)
  return (
    <p {...description.partProps} className="kv-field-help-text" ref={description.ref}>
      {children}
    </p>
  )
}

/** The attributes a box has even outside a Root. */
const bareInputProps: Partial<DateInputInputPartProps> = Object.freeze({
  inputMode: 'numeric',
  spellCheck: false,
})

/**
 * A date of three text boxes: day, month and year, in the order the region writes dates in
 * (contract: date-input.a11y.md). Put it inside a `Fieldset.Root` whose `Fieldset.Legend` asks the
 * question, then the boxes, then a `Fieldset.HelpText` under them with an example in the same order
 * and a `Fieldset.ErrorMessage`. Without children it renders `DateInput.Day`, `.Month` and `.Year` in
 * the locale's order; write them yourself to use another order. It holds no form state, never
 * parses or validates the date, and the arrow keys never step a value. By default (`autoAdvance`)
 * focus moves to the next box when typing fills one, and a visible hint under the boxes, in the
 * group's description, says so; `autoAdvance={false}` turns both off.
 *
 * @example
 * <Fieldset.Root group required invalid={error !== undefined}>
 *   <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
 *   <DateInput.Root name="birth" autoComplete="bday" invalidParts={error?.parts} />
 *   <Fieldset.HelpText>Till exempel 1990 3 27</Fieldset.HelpText>
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
  autoAdvance,
  invalidParts,
  messages,
  children,
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
    autoAdvance,
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

  return (
    // The boxes are one question's parts: a Field in a group has no "(optional)" on its label.
    <FieldGroupContext.Provider value>
      <DateInputContext.Provider value={contextValue}>
        <div {...mergeProps(otherProps, dateInput.rootProps)} ref={mergedRef}>
          {children === undefined
            ? dateInput.order.map((part) => <DateInputBox key={part} part={part} />)
            : children}
        </div>
        {dateInput.autoAdvanceHint === undefined ? null : (
          <DateInputAutoAdvanceHint>{dateInput.autoAdvanceHint}</DateInputAutoAdvanceHint>
        )}
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
      {/* The hook's props first, then the consumer's: class names join and handlers chain. */}
      {createElement(TextInput, {
        ...mergeProps(
          ownProps,
          inputProps,
          invalidAttributes,
          isInvalid ? { 'aria-invalid': 'true' } : {},
        ),
        ref: mergedRef,
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

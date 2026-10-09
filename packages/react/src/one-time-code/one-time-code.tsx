'use client'
import { createContext, createElement, useContext, useEffect, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import { joinIds } from '../field/field-state.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useOneTimeCode } from './use-one-time-code.ts'
import type { UseOneTimeCodeOptions, UseOneTimeCodeResult } from './use-one-time-code.ts'

export type { OneTimeCodeSlotState } from './use-one-time-code.ts'

export type OneTimeCodeRootProps = UseOneTimeCodeOptions &
  Omit<ComponentPropsWithRef<'div'>, 'defaultValue'>

export type OneTimeCodeInputProps = Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'value' | 'defaultValue'
>

export interface OneTimeCodeSlotProps extends ComponentPropsWithRef<'span'> {
  /**
   * The position in the pattern this slot draws, from 0 to `pattern.length - 1`. A `-` in the
   * pattern is a separator slot: it shows `-`, and it is never filled or active.
   */
  index: number
}

const OneTimeCodeContext = createContext<UseOneTimeCodeResult | null>(null)

function hasNameSource(input: HTMLInputElement): boolean {
  return (
    input.hasAttribute('aria-label') ||
    input.hasAttribute('aria-labelledby') ||
    input.hasAttribute('title') ||
    (input.labels?.length ?? 0) > 0
  )
}

/**
 * The row of a one-time code (contract: one-time-code.a11y.md): one
 * `<div class="kv-one-time-code">` that holds the one native input and the slots that draw it.
 * It takes the options (`pattern`, `value`, `defaultValue`, `onValueChange`, `onComplete`), holds
 * no form state, and never moves focus or submits. Put it in a Field with a label and a help text that
 * says how many characters the code has and how they are grouped.
 *
 * @example
 * <Field.Root>
 *   <Field.Label>Kod från sms:et</Field.Label>
 *   <Field.Prose>
 *     <p>Koden har 8 tecken i två grupper om 4.</p>
 *   </Field.Prose>
 *   <OneTimeCode.Root pattern="&&&&-&&&&" onComplete={(value, unmaskedValue) => verify(unmaskedValue)}>
 *     <OneTimeCode.Input name="code" />
 *     {[...'&&&&-&&&&'].map((_, index) => <OneTimeCode.Slot key={index} index={index} />)}
 *   </OneTimeCode.Root>
 * </Field.Root>
 */
export function OneTimeCodeRoot({
  pattern,
  value,
  defaultValue,
  onValueChange,
  onComplete,
  disabled,
  announceRejections,
  messages,
  ref,
  children,
  ...otherProps
}: OneTimeCodeRootProps): ReactElement {
  const oneTimeCode = useOneTimeCode({
    pattern,
    value,
    defaultValue,
    onValueChange,
    onComplete,
    disabled,
    announceRejections,
    messages,
  })
  const mergedRef = useMergedRef(ref, null)

  return (
    <OneTimeCodeContext.Provider value={oneTimeCode}>
      <div {...mergeProps(otherProps, oneTimeCode.rootProps)} ref={mergedRef}>
        {children}
      </div>
    </OneTimeCodeContext.Provider>
  )
}
OneTimeCodeRoot.displayName = 'OneTimeCode.Root'

/**
 * The one native `<input>`: it takes the typing, paste, autofill, dictation and the pointer, and
 * the slots only draw its value. It is named by the Field's label and described by its help text and
 * error. `autocomplete="one-time-code"`, no `maxlength`, never `type="password"`: the
 * user has to see the code (3.3.8). Pass `name`, `readOnly`, `required` and so on as on an Input.
 */
export function OneTimeCodeInput({
  id,
  'aria-describedby': ownDescribedBy,
  ref,
  ...otherProps
}: OneTimeCodeInputProps): ReactElement {
  const field = useContext(FieldContext)
  const oneTimeCode = useContext(OneTimeCodeContext)
  const elementRef = useRef<HTMLInputElement | null>(null)
  // The consumer's ref, the hook's (so it can read the input) and this part's own.
  const mergedRef = useMergedRef(useMergedRef(ref, oneTimeCode?.inputProps.ref ?? null), elementRef)

  useEffect(() => {
    if (oneTimeCode === null) {
      warnOnce(
        'one-time-code-input-outside-root',
        'A OneTimeCode.Input is outside a OneTimeCode.Root, so it has no mask, no slots and no autofill attributes. Put it inside <OneTimeCode.Root>.',
      )
    }
  }, [oneTimeCode])
  useEffect(() => {
    if (field !== null && id !== undefined) {
      warnOnce(
        'one-time-code-id-in-field',
        `A OneTimeCode.Input inside a Field got id="${id}", which is ignored so the Field's label and help text stay linked. Set the id with controlId on Field.Root.`,
      )
    }
  }, [field, id])
  useEffect(() => {
    const element = elementRef.current
    if (element === null) {
      return
    }
    if (!hasNameSource(element)) {
      warnOnce(
        'one-time-code-without-label',
        'A OneTimeCode.Input has no accessible name (WCAG 1.3.1, 4.1.2). Put it in a Field with a Field.Label that says where the code is, such as "Kod från sms:et".',
      )
    }
    const row = element.closest('.kv-one-time-code')
    if (oneTimeCode !== null && row !== null) {
      const cellCount = row.querySelectorAll(
        '.kv-one-time-code-slot, .kv-one-time-code-separator',
      ).length
      if (cellCount < oneTimeCode.pattern.length) {
        warnOnce(
          'one-time-code-too-few-slots',
          `The OneTimeCode.Root has ${cellCount} slots, too few for the pattern "${oneTimeCode.pattern}" (${oneTimeCode.pattern.length} positions, separators included). A character typed in a position without a slot is in the field and submitted, but sighted users never see it. Render one OneTimeCode.Slot per position of the pattern, for example Array.from(pattern, (_, index) => <OneTimeCode.Slot key={index} index={index} />).`,
        )
      }
    }
    const controlId = field?.controlProps.id
    if (controlId !== undefined && ownDescribedBy === undefined) {
      const prefix = `${controlId}-description`
      if (element.ownerDocument.querySelector(`[id^="${CSS.escape(prefix)}"]`) === null) {
        warnOnce(
          'one-time-code-without-description',
          'A OneTimeCode.Input in a Field has no help text. The boxes are hidden from screen readers and disappear in the fallback, so say in a visible help text (a <Field.HelpText> under the boxes, or a <Prose> above them) how many characters the code has, how they are grouped and where to find it (WCAG 3.3.2).',
        )
      }
    }
  })

  const ownId = field === null ? { id } : {}
  // Outside a Root there's no hook: the Field's wiring alone keeps the label and help text linked.
  const inputProps = oneTimeCode === null ? field?.controlProps : oneTimeCode.inputProps
  const describedBy = joinIds(inputProps?.['aria-describedby'], ownDescribedBy)

  return createElement('input', {
    ...mergeProps(otherProps, ownId, inputProps ?? {}),
    'aria-describedby': describedBy,
    ref: mergedRef,
  })
}
OneTimeCodeInput.displayName = 'OneTimeCode.Input'

/**
 * One drawn cell of the pattern: a `<span aria-hidden="true">` that is never focusable and, in the
 * default theme, never takes a press: every press goes to the input. Render one per position of
 * the pattern, with `index` from 0 to `pattern.length - 1`: a character slot draws one character,
 * and a `-` in the pattern is a separator slot (class `kv-one-time-code-separator`) that shows `-`
 * and is never filled or active. The help text, not the slots, tells screen-reader users the length and
 * the groups.
 */
export function OneTimeCodeSlot({ index, ref, ...otherProps }: OneTimeCodeSlotProps): ReactElement {
  const oneTimeCode = useContext(OneTimeCodeContext)
  const mergedRef = useMergedRef(ref, null)

  useEffect(() => {
    if (oneTimeCode === null) {
      warnOnce(
        'one-time-code-slot-outside-root',
        'A OneTimeCode.Slot is outside a OneTimeCode.Root, so it draws nothing. Put it inside <OneTimeCode.Root>.',
      )
    } else if (!Number.isInteger(index) || index < 0 || index >= oneTimeCode.pattern.length) {
      warnOnce(
        'one-time-code-slot-index',
        `A OneTimeCode.Slot has index ${index}, but the pattern "${oneTimeCode.pattern}" has ${oneTimeCode.pattern.length} positions (0 to ${oneTimeCode.pattern.length - 1}). Render one slot per position of the pattern, separators included: the theme counts the slots to draw the row.`,
      )
    }
  }, [oneTimeCode, index])

  const slotProps = oneTimeCode?.getSlotProps(index)
  return (
    <span {...mergeProps(otherProps, slotProps ?? {})} aria-hidden="true" ref={mergedRef}>
      {otherProps.children ?? oneTimeCode?.slots[index]?.character ?? ''}
    </span>
  )
}
OneTimeCodeSlot.displayName = 'OneTimeCode.Slot'

/** A one-time code: one native input, with presentational slots. */
export const OneTimeCode = {
  Root: OneTimeCodeRoot,
  Input: OneTimeCodeInput,
  Slot: OneTimeCodeSlot,
} as const

'use client'
import { useMemo } from 'react'
import type { ReactElement } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { FieldContext, FieldTextHostContext, useTextPartRegistry } from './field-context.ts'
import type { FieldContextValue, FieldTextHostContextValue } from './field-context.ts'
import type { FieldState } from './field-state.ts'
import { useField } from './use-field.ts'

const optionTags = ['div', 'li'] as const

export type FieldOptionProps = AsTag<
  (typeof optionTags)[number],
  'div',
  {
    /** Native `disabled` on the option's control, and `data-disabled` on every part. */
    disabled?: boolean | undefined
    /** The control's id, so an error summary link can target the option. A generated id by default. */
    controlId?: string | undefined
  }
>

/**
 * Internal. One option of a group: the wiring of a `Field.Root` (control id, `Field.Label`,
 * `Field.HelpText`) without the Field's class, error message or marker. Shared by
 * `RadioGroup.Option` and `CheckboxGroup.Option`.
 */
export function FieldOption({
  disabled = false,
  controlId,
  as,
  ref,
  ...otherProps
}: FieldOptionProps): ReactElement {
  const registry = useTextPartRegistry(false, 'Field')
  const field = useField({
    id: controlId,
    disabled,
    descriptions: registry.descriptionNames,
  })
  const mergedRef = useMergedRef(ref, null)
  const state = useMemo<FieldState>(
    () => ({ isInvalid: false, isRequired: false, isDisabled: disabled }),
    [disabled],
  )

  const textHost = useMemo<FieldTextHostContextValue>(
    () => ({
      getDescriptionProps: field.getDescriptionProps,
      errorMessageProps: field.errorMessageProps,
      state,
      messages: undefined,
      registerDescription: registry.registerDescription,
      registerErrorMessage: registry.registerErrorMessage,
    }),
    [
      field.getDescriptionProps,
      field.errorMessageProps,
      state,
      registry.registerDescription,
      registry.registerErrorMessage,
    ],
  )
  const fieldContext = useMemo<FieldContextValue>(
    () => ({
      controlProps: field.controlProps,
      labelProps: field.labelProps,
      labelId: field.labelId,
      state,
      marker: field.marker,
      messages: undefined,
    }),
    [field.controlProps, field.labelProps, field.labelId, state, field.marker],
  )

  return (
    <FieldTextHostContext.Provider value={textHost}>
      <FieldContext.Provider value={fieldContext}>
        {renderPart({
          as: resolveAsTag({ part: 'Option', as, allowedTags: optionTags }),
          defaultElement: 'div',
          partProps: {
            ...mergeProps(otherProps, { ...field.rootProps, className: 'kv-option' }),
            ref: mergedRef,
          },
        })}
      </FieldContext.Provider>
    </FieldTextHostContext.Provider>
  )
}

import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useId, useMemo } from 'react'
import { joinIds, stateAttributes } from '../field/field-state.ts'
import type { FieldMarker, FieldState, FieldStateAttributes } from '../field/field-state.ts'
import type { FieldDescriptionPartProps, FieldErrorMessagePartProps } from '../field/use-field.ts'
import { useMessages } from '../provider/use-messages.ts'

export interface UseFieldsetOptions {
  /** The fieldset's id. Default: generated. The description and error ids are derived from it. */
  id?: string | undefined
  /** `data-invalid` on every part. The Fields inside keep their own state. */
  invalid?: boolean | undefined
  /** `data-required`, and no optional text in the legend. A group has no `aria-required`. */
  required?: boolean | undefined
  /** Native `disabled` on the `<fieldset>`, which disables every control inside it. */
  disabled?: boolean | undefined
  /**
   * `true` for one question answered with several controls: checkboxes, radios, a date. The
   * legend then carries the optional text, and the Fields inside drop theirs.
   */
  group?: boolean | undefined
  /**
   * `true` when you render one description with `descriptionProps`, so `aria-describedby` lists
   * it. For more than one, use `descriptions`.
   */
  hasDescription?: boolean | undefined
  /**
   * The names of the descriptions you render with `getDescriptionProps(name)`, in the order you
   * render them. `aria-describedby` lists them in this order, then the error. Pass
   * them from the first render, so server-rendered markup is complete. If you also set
   * `hasDescription`, that description (`descriptionProps`) comes first.
   */
  descriptions?: readonly string[] | undefined
  /** `false` when an invalid fieldset renders no error message. Default `true`. */
  hasErrorMessage?: boolean | undefined
  /** The legend's marker. Default `'optional'` in a group, `'none'` in a plain fieldset. */
  marker?: FieldMarker | undefined
  /** Per-instance message overrides. */
  messages?: Partial<KvirnMessages['field']> | undefined
}

/** Spread on the `<fieldset>`. */
export interface FieldsetRootPartProps extends FieldStateAttributes {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-fieldset`. Add your own class
   * next to it with `mergeProps`: class names join.
   */
  className: 'kv-fieldset'
  id: string
  /** Every description's id in the order you listed them, then the error's. Only rendered parts. */
  'aria-describedby'?: string
  disabled?: true
}

/** Spread on the `<legend>`, the first child of the fieldset. */
export interface FieldsetLegendPartProps extends FieldStateAttributes {
  className: 'kv-fieldset-legend'
}

export interface UseFieldsetResult {
  fieldsetProps: FieldsetRootPartProps
  legendProps: FieldsetLegendPartProps
  /** The one description (`hasDescription`). For several, use `getDescriptionProps`. */
  descriptionProps: FieldDescriptionPartProps
  /** The props for the description with this name: its own id, listed in `descriptions`. */
  getDescriptionProps: (name: string) => FieldDescriptionPartProps
  errorMessageProps: FieldErrorMessagePartProps
  descriptionId: string
  errorMessageId: string
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
  isGroup: boolean
  /** The resolved legend marker. */
  marker: FieldMarker
  /** The legend's optional text, for example `(valfritt)`, or `undefined` when it shows none. */
  optionalMarker: string | undefined
  /** The resolved `field.errorPrefix` text, for example `Fel:`. Start the message with it. */
  errorPrefix: string
}

/**
 * A fieldset's wiring for your own elements (contract: fieldset.a11y.md): the legend
 * names the group, and the descriptions and error describe it. It holds no form state.
 *
 * The default order is legend, description, the controls, then the error. With one
 * description, set `hasDescription` and spread `descriptionProps`. With several, list their
 * names in `descriptions` and spread `getDescriptionProps(name)` on each: every description has
 * its own id, so the markup is complete when rendered on the server.
 *
 * @example
 * const fieldset = useFieldset({ invalid, group: true, descriptions: ['helpText'] })
 * <fieldset {...fieldset.fieldsetProps}>
 *   <legend {...fieldset.legendProps}>Hur vill du bli kontaktad? {fieldset.optionalMarker}</legend>
 *   <p {...fieldset.getDescriptionProps('helpText')}>Välj alla som passar.</p>
 *   …
 *   {invalid ? <p {...fieldset.errorMessageProps}>{fieldset.errorPrefix} Välj ett sätt</p> : null}
 * </fieldset>
 */
export function useFieldset({
  id,
  invalid = false,
  required = false,
  disabled = false,
  group = false,
  hasDescription = false,
  descriptions,
  hasErrorMessage = true,
  marker,
  messages,
}: UseFieldsetOptions = {}): UseFieldsetResult {
  const generatedId = useId()
  const fieldMessages = useMessages('field', messages)
  const fieldsetId = id ?? generatedId
  const descriptionId = `${fieldsetId}-description`
  const errorMessageId = `${fieldsetId}-error`
  const resolvedMarker: FieldMarker = marker ?? (group ? 'optional' : 'none')

  const props = useMemo(() => {
    const state: FieldState = { isInvalid: invalid, isRequired: required, isDisabled: disabled }
    const describedBy = joinIds(
      hasDescription ? descriptionId : undefined,
      ...(descriptions ?? []).map((name) => `${descriptionId}-${name}`),
      invalid && hasErrorMessage ? errorMessageId : undefined,
    )
    const fieldsetProps: FieldsetRootPartProps = {
      className: 'kv-fieldset',
      id: fieldsetId,
      ...(describedBy === undefined ? {} : { 'aria-describedby': describedBy }),
      ...(disabled ? { disabled: true } : {}),
      ...stateAttributes(state),
    }
    const legendProps: FieldsetLegendPartProps = {
      className: 'kv-fieldset-legend',
      ...stateAttributes(state),
    }
    const descriptionProps: FieldDescriptionPartProps = {
      className: 'kv-prose',
      id: descriptionId,
      ...stateAttributes(state, ['data-invalid', 'data-disabled']),
    }
    const getDescriptionProps = (name: string): FieldDescriptionPartProps => ({
      className: 'kv-prose',
      id: `${descriptionId}-${name}`,
      ...stateAttributes(state, ['data-invalid', 'data-disabled']),
    })
    const errorMessageProps: FieldErrorMessagePartProps = {
      className: 'kv-field-error-message',
      id: errorMessageId,
      ...stateAttributes(state, ['data-disabled']),
      'data-invalid': '',
    }
    return { fieldsetProps, legendProps, descriptionProps, getDescriptionProps, errorMessageProps }
  }, [
    fieldsetId,
    descriptionId,
    errorMessageId,
    invalid,
    required,
    disabled,
    hasDescription,
    descriptions,
    hasErrorMessage,
  ])

  return {
    ...props,
    descriptionId,
    errorMessageId,
    isInvalid: invalid,
    isRequired: required,
    isDisabled: disabled,
    isGroup: group,
    marker: resolvedMarker,
    optionalMarker: !required && resolvedMarker === 'optional' ? fieldMessages.optional : undefined,
    errorPrefix: fieldMessages.errorPrefix,
  }
}

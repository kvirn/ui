import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useContext, useId, useMemo } from 'react'
import { useMessages } from '../provider/use-messages.ts'
import { FieldGroupContext } from './field-context.ts'
import { joinIds, stateAttributes } from './field-state.ts'
import type { FieldMarker, FieldState, FieldStateAttributes } from './field-state.ts'

export type { FieldMarker, FieldState, FieldStateAttributes } from './field-state.ts'

export interface UseFieldOptions {
  /**
   * The control's id, for example to link to it from an error summary. Default: generated.
   * The description and error ids are derived from it.
   */
  id?: string | undefined
  /** Marks the field as invalid: `aria-invalid` on the control, `data-invalid` on every part. */
  invalid?: boolean | undefined
  /**
   * `aria-required="true"` and `data-required` on the control, and no optional marker in the
   * label. Never native `required`: the browser's own validation bubbles don't replace yours
   *. For native validation, pass `required` on the control as well, and keep it
   * here too, so the label doesn't say "(optional)" while assistive technology says "required".
   */
  required?: boolean | undefined
  /** Native `disabled` on the control, and `data-disabled` on every part. */
  disabled?: boolean | undefined
  /**
   * `true` when you render one description with `descriptionProps`. The control's
   * `aria-describedby` then lists its id. Set it from the first render, so server-rendered
   * markup is complete. For more than one description, use `descriptions`.
   */
  hasDescription?: boolean | undefined
  /**
   * The names of the descriptions you render with `getDescriptionProps(name)`, in the order you
   * render them: for example `['above', 'under']` for a description above and a help text under the control
   *. The control's `aria-describedby` lists them in this order, then the error. Pass
   * the names from the first render, so server-rendered markup is complete. If you also set
   * `hasDescription`, that description (`descriptionProps`) comes first.
   */
  descriptions?: readonly string[] | undefined
  /**
   * `false` when you don't render the error message for an invalid field, so its id is left out
   * of `aria-describedby`. Default `true`: an invalid field renders its message.
   */
  hasErrorMessage?: boolean | undefined
  /**
   * `'none'` leaves the optional text out of the label. Default `'optional'`, and `'none'`
   * inside a group fieldset, where an option or a date box is never optional.
   */
  marker?: FieldMarker | undefined
  /** Per-instance message overrides. */
  messages?: Partial<KvirnMessages['field']> | undefined
}

/** Spread on the field's container. */
export interface FieldRootPartProps extends FieldStateAttributes {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-field`. Add your own class
   * next to it with `mergeProps`: class names join.
   */
  className: 'kv-field'
}

/** Spread on the `<label>`. */
export interface FieldLabelPartProps extends FieldStateAttributes {
  className: 'kv-field-label'
  /** The label's own id, derived from the control's id. For `aria-labelledby` from another part. */
  id: string
  /** The control's id. */
  htmlFor: string
}

/** Spread on the help text: its class is `kv-prose`. */
export interface FieldDescriptionPartProps extends FieldStateAttributes {
  className: 'kv-prose'
  id: string
}

/** Spread on the error message, which you render only while the field is invalid. */
export interface FieldErrorMessagePartProps extends FieldStateAttributes {
  className: 'kv-field-error-message'
  id: string
  'data-invalid': ''
}

/** Spread on the control: an `<input>`, or your own element. */
export interface FieldControlPartProps extends FieldStateAttributes {
  id: string
  /** Every description's id in the order you listed them, then the error's. Only rendered parts. */
  'aria-describedby'?: string
  'aria-invalid'?: 'true'
  'aria-required'?: 'true'
  disabled?: true
}

export interface UseFieldResult {
  rootProps: FieldRootPartProps
  labelProps: FieldLabelPartProps
  /** The one description (`hasDescription`). For several, use `getDescriptionProps`. */
  descriptionProps: FieldDescriptionPartProps
  /** The props for the description with this name: its own id, listed in `descriptions`. */
  getDescriptionProps: (name: string) => FieldDescriptionPartProps
  errorMessageProps: FieldErrorMessagePartProps
  controlProps: FieldControlPartProps
  controlId: string
  /** The label's id (`labelProps.id`), for an `aria-labelledby` that names a part by the label. */
  labelId: string
  descriptionId: string
  errorMessageId: string
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
  /** The resolved marker: the option, else `'none'` in a group fieldset, else `'optional'`. */
  marker: FieldMarker
  /**
   * The text to render in the label after a space, for example `(valfritt)`, or `undefined`
   * when the label shows none: the field is required, or the marker is `'none'`.
   */
  optionalMarker: string | undefined
  /** The resolved `field.errorPrefix` text, for example `Fel:`. Start the message with it. */
  errorPrefix: string
}

/**
 * A field's wiring for your own elements: ids, `aria-describedby`, state attributes and the
 * two message texts (contract: field.a11y.md). The default order is label, description, control,
 * a second description under the control, then the error, but you own the markup:
 * `aria-describedby` lists the descriptions in the order you give, then the error.
 *
 * With one description, set `hasDescription` and spread `descriptionProps`. With several, list
 * their names in `descriptions` and spread `getDescriptionProps(name)` on each. Each description
 * has its own id, so the markup is complete when rendered on the server.
 *
 * @example
 * const field = useField({ invalid, required, descriptions: ['above', 'under'] })
 * <div {...field.rootProps}>
 *   <label {...field.labelProps}>Registreringsnummer</label>
 *   <p {...field.getDescriptionProps('above')}>Det står på registreringsbeviset.</p>
 *   <input {...field.controlProps} />
 *   <p {...field.getDescriptionProps('under')}>Till exempel ABC 123</p>
 *   {invalid ? <p {...field.errorMessageProps}>{field.errorPrefix} Ange numret</p> : null}
 * </div>
 */
export function useField({
  id,
  invalid = false,
  required = false,
  disabled = false,
  hasDescription = false,
  descriptions,
  hasErrorMessage = true,
  marker,
  messages,
}: UseFieldOptions = {}): UseFieldResult {
  const generatedId = useId()
  const isInGroup = useContext(FieldGroupContext)
  const fieldMessages = useMessages('field', messages)
  const controlId = id ?? generatedId
  const labelId = `${controlId}-label`
  const descriptionId = `${controlId}-description`
  const errorMessageId = `${controlId}-error`
  const resolvedMarker: FieldMarker = marker ?? (isInGroup ? 'none' : 'optional')
  const optionalText = fieldMessages.optional
  const hasOptionalMarker = !required && resolvedMarker === 'optional'

  const props = useMemo(() => {
    const state: FieldState = { isInvalid: invalid, isRequired: required, isDisabled: disabled }
    const describedBy = joinIds(
      hasDescription ? descriptionId : undefined,
      ...(descriptions ?? []).map((name) => `${descriptionId}-${name}`),
      invalid && hasErrorMessage ? errorMessageId : undefined,
    )
    const rootProps: FieldRootPartProps = { className: 'kv-field', ...stateAttributes(state) }
    const labelProps: FieldLabelPartProps = {
      className: 'kv-field-label',
      id: labelId,
      htmlFor: controlId,
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
    const controlProps: FieldControlPartProps = {
      id: controlId,
      ...(describedBy === undefined ? {} : { 'aria-describedby': describedBy }),
      ...(invalid ? { 'aria-invalid': 'true' } : {}),
      ...(required ? { 'aria-required': 'true' } : {}),
      ...(disabled ? { disabled: true } : {}),
      ...stateAttributes(state),
    }
    return {
      rootProps,
      labelProps,
      descriptionProps,
      getDescriptionProps,
      errorMessageProps,
      controlProps,
    }
  }, [
    controlId,
    labelId,
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
    controlId,
    labelId,
    descriptionId,
    errorMessageId,
    isInvalid: invalid,
    isRequired: required,
    isDisabled: disabled,
    marker: resolvedMarker,
    optionalMarker: hasOptionalMarker ? optionalText : undefined,
    errorPrefix: fieldMessages.errorPrefix,
  }
}

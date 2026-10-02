'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useContext, useEffect, useId, useLayoutEffect, useMemo, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { Icon } from '../icon/icon.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useMessages } from '../provider/use-messages.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { FieldContext, FieldTextHostContext, useTextPartRegistry } from './field-context.ts'
import type { FieldContextValue, FieldTextHostContextValue } from './field-context.ts'
import type { FieldMarker, FieldState } from './field-state.ts'
import { useField } from './use-field.ts'

export type { FieldMarker, FieldState } from './field-state.ts'

export interface FieldRootProps extends ComponentPropsWithRef<'div'> {
  /**
   * Marks the field as invalid: `aria-invalid` on the control, `data-invalid` on every part, and
   * the ErrorMessage renders. You decide when: KvirnUI holds no form state (ADR-0029).
   */
  invalid?: boolean | undefined
  /** `aria-required` on the control, and no optional text in the label. Not native `required`. */
  required?: boolean | undefined
  /** Native `disabled` on the control, and `data-disabled` on every part. */
  disabled?: boolean | undefined
  /** The control's id, for example to link to it from an error summary. Default: generated. */
  controlId?: string | undefined
  /** Per-instance message overrides for the label's optional text and the error prefix. */
  messages?: Partial<KvirnMessages['field']> | undefined
  render?: RenderProp<ComponentPropsWithRef<'div'>, FieldState> | undefined
}

export interface FieldLabelProps extends Omit<ComponentPropsWithRef<'label'>, 'htmlFor'> {
  /** `'none'` leaves out the optional text. Default: `'optional'`, or `'none'` in a group. */
  marker?: FieldMarker | undefined
  render?: RenderProp<ComponentPropsWithRef<'label'>, FieldState> | undefined
}

export interface FieldDescriptionProps extends Omit<ComponentPropsWithRef<'p'>, 'id'> {
  render?: RenderProp<ComponentPropsWithRef<'p'>, FieldState> | undefined
}

export interface FieldErrorMessageProps extends Omit<ComponentPropsWithRef<'p'>, 'id'> {
  render?: RenderProp<ComponentPropsWithRef<'p'>, FieldState> | undefined
}

const noState: FieldState = { isInvalid: false, isRequired: false, isDisabled: false }

/** Internal. The optional text after a label or legend: a normal space, then a span. */
export function OptionalMarker({ text }: { text: string | undefined }): ReactNode {
  if (text === undefined) {
    return null
  }
  return (
    <>
      {' '}
      <span className="kv-field-optional">{text}</span>
    </>
  )
}

/**
 * One form question with one control: a `<div>` that wires its Label, Description and
 * ErrorMessage to the control inside it (ADR-0029, contract: field.a11y.md). It holds no form
 * state: pass `invalid`, `required` and `disabled` from your own form logic.
 *
 * @example
 * <Field.Root invalid={errors.phone !== undefined}>
 *   <Field.Label>Telefonnummer</Field.Label>
 *   <Field.Description>Vi ringer bara om något är fel.</Field.Description>
 *   <Field.ErrorMessage>{errors.phone}</Field.ErrorMessage>
 *   <Input name="phone" autoComplete="tel" />
 * </Field.Root>
 */
export function FieldRoot({
  invalid = false,
  required = false,
  disabled = false,
  controlId,
  messages,
  render,
  ref,
  ...otherProps
}: FieldRootProps): ReactElement {
  const registry = useTextPartRegistry(invalid, 'Field')
  const field = useField({
    id: controlId,
    invalid,
    required,
    disabled,
    descriptions: registry.descriptionNames,
    hasErrorMessage: registry.hasErrorMessage,
    messages,
  })
  const mergedRef = useMergedRef(ref, null)
  const state = useMemo<FieldState>(
    () => ({ isInvalid: invalid, isRequired: required, isDisabled: disabled }),
    [invalid, required, disabled],
  )

  const textHost = useMemo<FieldTextHostContextValue>(
    () => ({
      getDescriptionProps: field.getDescriptionProps,
      errorMessageProps: field.errorMessageProps,
      state,
      messages,
      registerDescription: registry.registerDescription,
      registerErrorMessage: registry.registerErrorMessage,
    }),
    [
      field.getDescriptionProps,
      field.errorMessageProps,
      state,
      messages,
      registry.registerDescription,
      registry.registerErrorMessage,
    ],
  )
  const fieldContext = useMemo<FieldContextValue>(
    () => ({
      controlProps: field.controlProps,
      labelProps: field.labelProps,
      state,
      marker: field.marker,
      messages,
    }),
    [field.controlProps, field.labelProps, state, field.marker, messages],
  )

  return (
    <FieldTextHostContext.Provider value={textHost}>
      <FieldContext.Provider value={fieldContext}>
        {renderPart({
          render,
          defaultElement: 'div',
          partProps: { ...mergeProps(otherProps, field.rootProps), ref: mergedRef },
          state,
        })}
      </FieldContext.Provider>
    </FieldTextHostContext.Provider>
  )
}
FieldRoot.displayName = 'Field.Root'

/**
 * The field's visible label, a `<label for>` that names the control. Adds the `field.optional`
 * text, for example `(valfritt)`, when the field isn't required (ADR-0029).
 */
export function FieldLabel({
  marker,
  children,
  render,
  ref,
  ...otherProps
}: FieldLabelProps): ReactElement {
  const field = useContext(FieldContext)
  const fieldMessages = useMessages('field', field?.messages)
  const mergedRef = useMergedRef(ref, null)

  useEffect(() => {
    if (field === null) {
      warnOnce(
        'field-label-outside-field',
        'A Field.Label is outside a Field.Root, so it isn’t linked to any control. Put it in <Field.Root> next to the control, or use a plain <label htmlFor>.',
      )
    }
  }, [field])

  const resolvedMarker = marker ?? field?.marker ?? 'none'
  const isRequired = field?.state.isRequired ?? false
  const optionalText =
    field !== null && !isRequired && resolvedMarker === 'optional'
      ? fieldMessages.optional
      : undefined
  const partProps = field === null ? { className: 'kv-field-label' } : field.labelProps

  return renderPart({
    render,
    defaultElement: 'label',
    partProps: {
      ...mergeProps(otherProps, partProps),
      ref: mergedRef,
      children: (
        <>
          {children}
          <OptionalMarker text={optionalText} />
        </>
      ),
    },
    state: field?.state ?? noState,
  })
}
FieldLabel.displayName = 'Field.Label'

/**
 * The hint: what the user needs to answer, such as the format. It's part of the control's
 * accessible description, or the group's in a Fieldset. A Field can have several: each has its
 * own id, and `aria-describedby` lists them in DOM order, then the error (ADR-0031). The default
 * order is label, a hint, the control, a hint under it, then the error.
 */
export function FieldDescription({
  render,
  ref,
  ...otherProps
}: FieldDescriptionProps): ReactElement {
  const host = useContext(FieldTextHostContext)
  const name = useId()
  const elementRef = useRef<Element | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)

  const registerDescription = host?.registerDescription
  useLayoutEffect(() => registerDescription?.(name, elementRef), [registerDescription, name])
  useEffect(() => {
    if (host === null) {
      warnOnce(
        'field-description-outside-field',
        'A Field.Description is outside a Field.Root or Fieldset.Root, so no control is described by it. Put it inside one.',
      )
    }
  }, [host])

  const partProps =
    host === null ? { className: 'kv-field-description' } : host.getDescriptionProps(name)

  return renderPart({
    render,
    defaultElement: 'p',
    partProps: { ...mergeProps(otherProps, partProps), ref: mergedRef },
    state: host?.state ?? noState,
  })
}
FieldDescription.displayName = 'Field.Description'

/**
 * The error message: says what's wrong and how to fix it. Renders only while its Field or
 * Fieldset is invalid, starts with the `field.errorPrefix` text ("Fel:") and the error icon, and
 * is part of the control's accessible description. Not a live region (ADR-0029).
 */
export function FieldErrorMessage({
  children,
  render,
  ref,
  ...otherProps
}: FieldErrorMessageProps): ReactElement | null {
  const host = useContext(FieldTextHostContext)
  const fieldMessages = useMessages('field', host?.messages)
  const mergedRef = useMergedRef(ref, null)
  const isShown = host === null || host.state.isInvalid

  const registerErrorMessage = host?.registerErrorMessage
  const isHostInvalid = host?.state.isInvalid ?? false
  useLayoutEffect(
    () => (isHostInvalid ? registerErrorMessage?.() : undefined),
    [registerErrorMessage, isHostInvalid],
  )
  useEffect(() => {
    if (host === null) {
      warnOnce(
        'field-error-message-outside-field',
        'A Field.ErrorMessage is outside a Field.Root or Fieldset.Root, so it isn’t linked to any control and always shows. Put it inside one.',
      )
    }
  }, [host])

  if (!isShown) {
    return null
  }
  const partProps =
    host === null
      ? { className: 'kv-field-error-message', 'data-invalid': '' }
      : host.errorMessageProps

  return renderPart({
    render,
    defaultElement: 'p',
    partProps: {
      ...mergeProps(otherProps, partProps),
      ref: mergedRef,
      children: (
        <>
          <Icon name="error" size="md" />
          <span className="kv-field-error-prefix">{fieldMessages.errorPrefix}</span> {children}
        </>
      ),
    },
    state: host?.state ?? { ...noState, isInvalid: true },
  })
}
FieldErrorMessage.displayName = 'Field.ErrorMessage'

/** A form question with one control, and its label, hint and error (ADR-0029). */
export const Field = {
  Root: FieldRoot,
  Label: FieldLabel,
  Description: FieldDescription,
  ErrorMessage: FieldErrorMessage,
} as const

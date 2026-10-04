'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useContext, useEffect, useLayoutEffect, useMemo } from 'react'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { Icon } from '../icon/icon.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { ProseRoot } from '../prose/prose.tsx'
import type { ProseRootProps } from '../prose/prose.tsx'
import { useMessages } from '../provider/use-messages.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { FieldContext, FieldTextHostContext, useTextPartRegistry } from './field-context.ts'
import type { FieldContextValue, FieldTextHostContextValue } from './field-context.ts'
import type { FieldMarker, FieldState } from './field-state.ts'
import { useDescriptionPart } from './use-description-part.ts'
import { useField } from './use-field.ts'

export type { FieldMarker, FieldState } from './field-state.ts'

export interface FieldRootProps extends ComponentPropsWithRef<'div'> {
  /**
   * Marks the field as invalid: `aria-invalid` on the control, `data-invalid` on every part, and
   * the ErrorMessage renders. You decide when: KvirnUI holds no form state.
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

export interface FieldLabelProps extends Omit<ComponentPropsWithRef<'label'>, 'htmlFor' | 'id'> {
  /** `'none'` leaves out the optional text. Default: `'optional'`, or `'none'` in a group. */
  marker?: FieldMarker | undefined
  render?: RenderProp<ComponentPropsWithRef<'label'>, FieldState> | undefined
}

export interface FieldErrorMessageProps extends Omit<ComponentPropsWithRef<'p'>, 'id'> {
  render?: RenderProp<ComponentPropsWithRef<'p'>, FieldState> | undefined
}

/** What a Hint's `render` receives as its second argument: the Field's or Fieldset's state. */
export type FieldHintState = FieldState

export interface FieldHintProps extends Omit<ComponentPropsWithRef<'p'>, 'id'> {
  /** Change the element: `render={<div />}`. Never to something interactive. */
  render?: RenderProp<ComponentPropsWithRef<'p'>, FieldHintState> | undefined
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
 * One form question with one control: a `<div>` that wires its Label, description (a
 * `Field.Prose`), hint (a `Field.Hint`) and ErrorMessage to the control inside it (contract:
 * field.a11y.md). It holds no form state: pass `invalid`, `required` and `disabled` from your own
 * form logic.
 *
 * @example
 * <Field.Root invalid={errors.phone !== undefined}>
 *   <Field.Label>Telefonnummer</Field.Label>
 *   <Field.Prose>
 *     <p>Vi ringer bara om något är fel.</p>
 *   </Field.Prose>
 *   <Input name="phone" autoComplete="tel" />
 *   <Field.Hint>Till exempel 070-123 45 67</Field.Hint>
 *   <Field.ErrorMessage>{errors.phone}</Field.ErrorMessage>
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
      labelId: field.labelId,
      state,
      marker: field.marker,
      messages,
    }),
    [field.controlProps, field.labelProps, field.labelId, state, field.marker, messages],
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
 * text, for example `(valfritt)`, when the field isn't required.
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
 * The error message: says what's wrong and how to fix it. Renders only while its Field or
 * Fieldset is invalid, starts with the `field.errorPrefix` text ("Fel:") and the error icon, and
 * is part of the control's accessible description. Not a live region.
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

/**
 * The field's description, a `Prose` above the control that describes it: what to answer, why we
 * ask, where to find it. It is the shared `Prose` under the name an adopter writes
 * (`Field.Prose`), so it registers with the Field the same way. It is `body` size wherever it
 * sits. A short instruction under the control is a `Field.Hint`.
 */
export function FieldProse(props: ProseRootProps): ReactElement {
  return <ProseRoot {...props} />
}
FieldProse.displayName = 'Field.Prose'

/**
 * The field's hint: a short instruction, format example or limit, almost always under the
 * control (`<p class="kv-field-hint">`, 14px in the default theme). Plain text only: no links,
 * lists or headings. It registers with the Field or Fieldset like a `Field.Prose`, so the
 * control's `aria-describedby` lists it in DOM order, then the error. It is never focusable and
 * not a live region. Outside a Field or Fieldset it warns and renders a plain paragraph with no
 * id.
 */
export function FieldHint({ render, ref, ...otherProps }: FieldHintProps): ReactElement {
  const description = useDescriptionPart<HTMLParagraphElement>(ref)
  const isOutsideHost = description.state === null
  useEffect(() => {
    if (isOutsideHost) {
      warnOnce(
        'hint-outside-field',
        'A Field.Hint or Fieldset.Hint is outside a Field.Root or Fieldset.Root, so it describes no control or group and has no id (WCAG 1.3.1, 3.3.2). Put it inside one, next to the control it explains.',
      )
    }
  }, [isOutsideHost])
  return renderPart({
    render,
    defaultElement: 'p',
    // The host's id and state attributes, with the hint's own class in place of the Prose class.
    partProps: {
      ...mergeProps(otherProps, { ...description.partProps, className: 'kv-field-hint' }),
      ref: description.ref,
    },
    state: description.state ?? noState,
  })
}
FieldHint.displayName = 'Field.Hint'

/** @deprecated Write `Field.Label`. The flat `Label` is removed in 1.0. */
export const Label = FieldLabel

/** @deprecated Write `Field.ErrorMessage`. The flat `ErrorMessage` is removed in 1.0. */
export const ErrorMessage = FieldErrorMessage

/**
 * A form question with one control, and its label and error: `Field.Root` is the root, with
 * `Field.Label`, `Field.Prose` for the description, `Field.Hint` for the hint and
 * `Field.ErrorMessage` inside it. The callable
 * `<Field.Root>` still works and is the same component as `Field.Root`, but it isn't shown in docs.
 *
 * @example
 * <Field.Root required>
 *   <Field.Label>E-postadress</Field.Label>
 *   <Field.Prose><p>Vi skickar beslutet hit.</p></Field.Prose>
 *   <Input name="email" type="email" autoComplete="email" />
 *   <Field.Hint>Till exempel namn@exempel.se</Field.Hint>
 * </Field.Root>
 */
export const Field = Object.assign(FieldRoot, {
  Root: FieldRoot,
  Label: FieldLabel,
  Prose: FieldProse,
  Hint: FieldHint,
  ErrorMessage: FieldErrorMessage,
})

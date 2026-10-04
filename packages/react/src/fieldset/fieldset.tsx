'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import {
  FieldContext,
  FieldGroupContext,
  FieldTextHostContext,
  useTextPartRegistry,
} from '../field/field-context.ts'
import type { FieldTextHostContextValue } from '../field/field-context.ts'
import type { FieldMarker, FieldState } from '../field/field-state.ts'
import { FieldErrorMessage, OptionalMarker } from '../field/field.tsx'
import type { FieldErrorMessageProps } from '../field/field.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { ProseRoot } from '../prose/prose.tsx'
import type { ProseRootProps } from '../prose/prose.tsx'
import { useMessages } from '../provider/use-messages.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { joinIds } from '../field/field-state.ts'
import { useFieldset } from './use-fieldset.ts'
import type { FieldsetLegendPartProps } from './use-fieldset.ts'

/** What `render` receives as its second argument, for every Fieldset part. */
export type FieldsetState = FieldState

export interface FieldsetRootProps extends ComponentPropsWithRef<'fieldset'> {
  /** `data-invalid` on the fieldset's parts, and its ErrorMessage renders. Not cascaded. */
  invalid?: boolean | undefined
  /** `data-required`, and no optional text in the legend. */
  required?: boolean | undefined
  /** Native `disabled`: every control inside is disabled. */
  disabled?: boolean | undefined
  /**
   * One question answered with several controls (checkboxes, radios, a date). The legend gets
   * the optional text, and the Fields inside drop theirs.
   */
  group?: boolean | undefined
  /** Per-instance message overrides for the legend's optional text and the error prefix. */
  messages?: Partial<KvirnMessages['field']> | undefined
  render?: RenderProp<ComponentPropsWithRef<'fieldset'>, FieldsetState> | undefined
}

export interface FieldsetLegendProps extends ComponentPropsWithRef<'legend'> {
  /** `'optional'` or `'none'`. Default: `'optional'` in a group that isn't required. */
  marker?: FieldMarker | undefined
  render?: RenderProp<ComponentPropsWithRef<'legend'>, FieldsetState> | undefined
}

interface FieldsetContextValue {
  legendProps: FieldsetLegendPartProps
  state: FieldsetState
  marker: FieldMarker
  messages: Partial<KvirnMessages['field']> | undefined
}

const FieldsetContext = createContext<FieldsetContextValue | null>(null)

const noState: FieldsetState = { isInvalid: false, isRequired: false, isDisabled: false }

/**
 * A native `<fieldset>` that groups questions, or the controls of one question, under its
 * legend (contract: fieldset.a11y.md). A `Fieldset.Prose` inside it (the hint) and its
 * `Fieldset.ErrorMessage` describe the group. It holds no form state.
 *
 * @example
 * <Fieldset.Root group invalid={errors.contact !== undefined}>
 *   <Fieldset.Legend>Hur vill du bli kontaktad?</Fieldset.Legend>
 *   <Fieldset.Prose>
 *     <p>Välj alla som passar.</p>
 *   </Fieldset.Prose>
 *   <Fieldset.ErrorMessage>{errors.contact}</Fieldset.ErrorMessage>
 *   …
 * </Fieldset.Root>
 */
export function FieldsetRoot({
  invalid = false,
  required = false,
  disabled = false,
  group = false,
  messages,
  id,
  'aria-describedby': ownDescribedBy,
  render,
  ref,
  ...otherProps
}: FieldsetRootProps): ReactElement {
  const registry = useTextPartRegistry(invalid, 'Fieldset')
  const fieldset = useFieldset({
    id,
    invalid,
    required,
    disabled,
    group,
    descriptions: registry.descriptionNames,
    hasErrorMessage: registry.hasErrorMessage,
    messages,
  })
  const elementRef = useRef<HTMLFieldSetElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)
  const state = useMemo<FieldsetState>(
    () => ({ isInvalid: invalid, isRequired: required, isDisabled: disabled }),
    [invalid, required, disabled],
  )

  useEffect(() => {
    const element = elementRef.current
    if (element === null || element.tagName !== 'FIELDSET') {
      const rendered =
        element === null ? 'nothing it could reference' : `<${element.tagName.toLowerCase()}>`
      warnOnce(
        `fieldset-not-a-fieldset:${rendered}`,
        `<Fieldset.Root render> must render a <fieldset> and forward its ref, but it rendered ${rendered}. The group's name comes from the native <legend>, and disabled from the native fieldset.`,
      )
    }
  })

  const textHost = useMemo<FieldTextHostContextValue>(
    () => ({
      getDescriptionProps: fieldset.getDescriptionProps,
      errorMessageProps: fieldset.errorMessageProps,
      state,
      messages,
      registerDescription: registry.registerDescription,
      registerErrorMessage: registry.registerErrorMessage,
    }),
    [
      fieldset.getDescriptionProps,
      fieldset.errorMessageProps,
      state,
      messages,
      registry.registerDescription,
      registry.registerErrorMessage,
    ],
  )
  const fieldsetContext = useMemo<FieldsetContextValue>(
    () => ({ legendProps: fieldset.legendProps, state, marker: fieldset.marker, messages }),
    [fieldset.legendProps, state, fieldset.marker, messages],
  )

  // Your own aria-describedby ids come after the fieldset's.
  const describedBy = joinIds(fieldset.fieldsetProps['aria-describedby'], ownDescribedBy)

  return (
    <FieldTextHostContext.Provider value={textHost}>
      <FieldsetContext.Provider value={fieldsetContext}>
        <FieldGroupContext.Provider value={group}>
          <FieldContext.Provider value={null}>
            {renderPart({
              render,
              defaultElement: 'fieldset',
              partProps: {
                ...mergeProps(otherProps, fieldset.fieldsetProps),
                'aria-describedby': describedBy,
                ref: mergedRef,
              },
              state,
            })}
          </FieldContext.Provider>
        </FieldGroupContext.Provider>
      </FieldsetContext.Provider>
    </FieldTextHostContext.Provider>
  )
}
FieldsetRoot.displayName = 'Fieldset.Root'

/**
 * The fieldset's `<legend>`: the question, and the group's accessible name. Render it first. In
 * a group that isn't required, it ends with the `field.optional` text.
 */
export function FieldsetLegend({
  marker,
  children,
  render,
  ref,
  ...otherProps
}: FieldsetLegendProps): ReactElement {
  const fieldset = useContext(FieldsetContext)
  const fieldMessages = useMessages('field', fieldset?.messages)
  const mergedRef = useMergedRef(ref, null)

  useEffect(() => {
    if (fieldset === null) {
      warnOnce(
        'fieldset-legend-outside-fieldset',
        'A Fieldset.Legend is outside a Fieldset.Root, so it names no group. Put it first in <Fieldset.Root>.',
      )
    }
  }, [fieldset])

  const resolvedMarker = marker ?? fieldset?.marker ?? 'none'
  const isRequired = fieldset?.state.isRequired ?? false
  const optionalText =
    !isRequired && resolvedMarker === 'optional' ? fieldMessages.optional : undefined
  const partProps = fieldset === null ? { className: 'kv-fieldset-legend' } : fieldset.legendProps

  return renderPart({
    render,
    defaultElement: 'legend',
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
    state: fieldset?.state ?? noState,
  })
}
FieldsetLegend.displayName = 'Fieldset.Legend'

/**
 * The group's hint, a `Prose` that describes the group. It is the shared `Prose` under the name
 * an adopter writes (`Fieldset.Prose`), so it registers with the Fieldset the same way.
 */
export function FieldsetProse(props: ProseRootProps): ReactElement {
  return <ProseRoot {...props} />
}
FieldsetProse.displayName = 'Fieldset.Prose'

/**
 * The group's error message: the `Field.ErrorMessage` behaviour under the name an adopter writes
 * (`Fieldset.ErrorMessage`). It renders only while the Fieldset is invalid.
 */
export function FieldsetErrorMessage(props: FieldErrorMessageProps): ReactElement {
  return <FieldErrorMessage {...props} />
}
FieldsetErrorMessage.displayName = 'Fieldset.ErrorMessage'

/** @deprecated Write `Fieldset.Legend`. The flat `Legend` is removed in 1.0. */
export const Legend = FieldsetLegend

/**
 * A native fieldset with its legend and error: `Fieldset.Root` is the root, with
 * `Fieldset.Legend`, `Fieldset.Prose` for the hint and `Fieldset.ErrorMessage` inside it. The
 * callable `<Fieldset>` still works and is the same component as `Fieldset.Root`, but it isn't
 * shown in docs.
 */
export const Fieldset = Object.assign(FieldsetRoot, {
  Root: FieldsetRoot,
  Legend: FieldsetLegend,
  Prose: FieldsetProse,
  ErrorMessage: FieldsetErrorMessage,
})

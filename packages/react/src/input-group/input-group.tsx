'use client'
import { createContext, useContext, useEffect, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { TextInput } from '../text-input/text-input.tsx'
import type { TextInputProps } from '../text-input/text-input.tsx'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { inputGroupAddonProps, useInputGroup } from './use-input-group.ts'

/** What `render` receives as its second argument, for both parts. */
export interface InputGroupState {
  isInvalid: boolean
  isDisabled: boolean
  isFocusVisible: boolean
}

export interface InputGroupRootProps extends ComponentPropsWithRef<'div'> {
  /** `data-invalid` on the box. Default: the nearest Field's `invalid`. */
  invalid?: boolean | undefined
  /** `data-disabled` on the box. Default: the nearest Field's `disabled`. */
  disabled?: boolean | undefined
  render?: RenderProp<ComponentPropsWithRef<'div'>, InputGroupState> | undefined
}

export interface InputGroupAddonProps extends ComponentPropsWithRef<'span'> {
  render?: RenderProp<ComponentPropsWithRef<'span'>, InputGroupState> | undefined
}

const InputGroupStateContext = createContext<InputGroupState | null>(null)

const focusableSelector =
  'a[href], button, input, select, textarea, summary, iframe, [tabindex], [contenteditable]:not([contenteditable="false"])'

/**
 * The input's box (contract: input-group.a11y.md): one `<div class="kv-input-group">`
 * that draws the edge, the invalid and disabled state and the focus ring around a `TextInput` and
 * its addons. Put a unit or an icon in an `InputGroup.Addon`, and a Button (clear, show password)
 * directly in the Root. It holds no form state.
 *
 * @example
 * <Field.Root>
 *   <Field.Label>Månadshyra i kronor</Field.Label>
 *   <InputGroup.Root>
 *     <InputGroup.Input name="rent" inputMode="decimal" className="kv-input--width-10" />
 *     <InputGroup.Addon>kr</InputGroup.Addon>
 *   </InputGroup.Root>
 * </Field.Root>
 */
export function InputGroupRoot({
  invalid,
  disabled,
  render,
  ref,
  children,
  ...otherProps
}: InputGroupRootProps): ReactElement {
  const group = useInputGroup({ invalid, disabled })
  const mergedRef = useMergedRef(ref, null)
  const state: InputGroupState = {
    isInvalid: group.isInvalid,
    isDisabled: group.isDisabled,
    isFocusVisible: group.isFocusVisible,
  }

  return (
    <InputGroupStateContext.Provider value={state}>
      {renderPart({
        render,
        defaultElement: 'div',
        partProps: { ...mergeProps(otherProps, group.rootProps), children, ref: mergedRef },
        state,
      })}
    </InputGroupStateContext.Provider>
  )
}
InputGroupRoot.displayName = 'InputGroup.Root'

/**
 * A short unit ("kr", "%", "km") or a decorative icon inside the box, before or after the Input:
 * at the start when it comes first, whatever the reading direction. A `<span aria-hidden="true">`
 * that is never focusable, so the label must say what it shows. Clicking it focuses the Input.
 */
export function InputGroupAddon({
  render,
  ref,
  ...otherProps
}: InputGroupAddonProps): ReactElement {
  const parent = useContext(InputGroupStateContext)
  const elementRef = useRef<HTMLElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)

  useEffect(() => {
    if (parent === null) {
      warnOnce(
        'input-group-addon-outside-root',
        'An InputGroup.Addon is outside an InputGroup.Root, so clicking it focuses nothing and the box has no edge. Put it inside <InputGroup.Root>.',
      )
    }
  }, [parent])
  useEffect(() => {
    const element = elementRef.current
    if (element !== null && element.querySelector(focusableSelector) !== null) {
      warnOnce(
        'input-group-addon-focusable',
        'An InputGroup.Addon contains focusable content, but an Addon is aria-hidden and visual only: keyboard and screen-reader users could reach something they can’t perceive. Put a Button directly in <InputGroup.Root>, next to the Addon, instead.',
      )
    }
  })

  return renderPart({
    render,
    defaultElement: 'span',
    partProps: { ...mergeProps(otherProps, inputGroupAddonProps), ref: mergedRef },
    state: parent ?? { isInvalid: false, isDisabled: false, isFocusVisible: false },
  })
}
InputGroupAddon.displayName = 'InputGroup.Addon'

/**
 * The box's input: the shared `TextInput` under the group's name, laid out by the box. It reads its
 * Field and label the same way, so nothing else changes.
 */
export function InputGroupInput(props: TextInputProps): ReactElement {
  return <TextInput {...props} />
}
InputGroupInput.displayName = 'InputGroup.Input'

/** An input with units or icons inside its box. */
export const InputGroup = {
  Root: InputGroupRoot,
  Addon: InputGroupAddon,
  Input: InputGroupInput,
} as const

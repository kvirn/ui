import { cloneElement, createElement, isValidElement } from 'react'
import type { ElementType, ReactElement } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'

/**
 * Changes the element a part renders (architecture: API conventions), instead of `asChild`:
 *
 * - an element, `render={<MyButton />}`: it gets the part's props merged with its own
 *   (`mergeProps(partProps, element.props)`, so its own plain props win and handlers chain);
 * - a function, `render={(partProps, state) => <MyButton {...partProps} />}`: you spread the
 *   props yourself and can read the part's state.
 */
export type RenderProp<PartProps, State> =
  | ReactElement
  | ((partProps: PartProps, state: State) => ReactElement)

export interface RenderPartOptions<PartProps extends object, State> {
  render: RenderProp<PartProps, State> | undefined
  /** The element rendered without `render`: a tag name or a component. */
  defaultElement: ElementType
  partProps: PartProps
  state: State
}

/** Internal. Renders exactly one element for a part, honouring `render`. */
export function renderPart<PartProps extends object, State>({
  render,
  defaultElement,
  partProps,
  state,
}: RenderPartOptions<PartProps, State>): ReactElement {
  if (typeof render === 'function') {
    return render(partProps, state)
  }
  if (isValidElement<Record<string, unknown>>(render)) {
    const elementProps: Record<string, unknown> = mergeProps(partProps, render.props)
    return cloneElement(render, elementProps)
  }
  return createElement(defaultElement, partProps)
}

export interface TakenRenderElementProps<PartProps, State, Key extends string> {
  /** `render` without the taken props, or unchanged when it isn't an element. */
  render: RenderProp<PartProps, State> | undefined
  /** The taken props' values on the element, `undefined` when absent. */
  takenProps: Partial<Record<Key, unknown>>
}

/**
 * Internal. Takes props out of a `render` element, so the part routes them through its hook
 * instead of letting `mergeProps` pass them straight through. A disabled Button must gate the
 * element's `onClick`, and Link must resolve the element's `target` and `rel`.
 */
export function takeRenderElementProps<PartProps, State, Key extends string>(
  render: RenderProp<PartProps, State> | undefined,
  keys: readonly Key[],
): TakenRenderElementProps<PartProps, State, Key> {
  if (!isValidElement<Record<string, unknown>>(render)) {
    return { render, takenProps: {} }
  }
  const takenProps: Partial<Record<Key, unknown>> = {}
  // `undefined` never overrides in mergeProps, so the part's own value is used instead.
  const clearedProps: Record<string, undefined> = {}
  for (const key of keys) {
    takenProps[key] = render.props[key]
    clearedProps[key] = undefined
  }
  return { render: cloneElement(render, clearedProps), takenProps }
}

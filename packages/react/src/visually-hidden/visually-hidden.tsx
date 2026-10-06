import type { HTMLAttributes, ReactElement, Ref, RefCallback } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useVisuallyHidden } from './use-visually-hidden.ts'

/** What `render` receives as its second argument. VisuallyHidden has no state, so it's empty. */
export type VisuallyHiddenState = Record<string, never>

/** What a `render` function gets to spread: your attributes, the class and a callback ref. */
export interface VisuallyHiddenElementProps extends HTMLAttributes<HTMLElement> {
  ref: RefCallback<HTMLElement>
}

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement> | undefined
  /** Change the element: `render={<h2 />}`. Its own semantics apply. */
  render?: RenderProp<VisuallyHiddenElementProps, VisuallyHiddenState> | undefined
}

const visuallyHiddenState: VisuallyHiddenState = Object.freeze({})

/**
 * Text for screen readers that is not drawn (contract: visually-hidden.a11y.md): one
 * `<span class="kv-visually-hidden">`. The text stays in the accessibility tree, so it is read
 * and found. It has no role, ARIA or behaviour. Never put a focusable element inside it: a
 * focused control must be visible (2.4.7). For a bypass link, use SkipLink.
 *
 * @example
 * <p>Sökträffar<VisuallyHidden>, 3 resultat</VisuallyHidden></p>
 *
 * @example
 * <VisuallyHidden render={<h2 />}>Meny</VisuallyHidden>
 */
export function VisuallyHidden({ render, ref, ...otherProps }: VisuallyHiddenProps): ReactElement {
  const { visuallyHiddenProps } = useVisuallyHidden()
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    render,
    defaultElement: 'span',
    partProps: { ...mergeProps(otherProps, visuallyHiddenProps), ref: elementRef },
    state: visuallyHiddenState,
  })
}
VisuallyHidden.displayName = 'VisuallyHidden'

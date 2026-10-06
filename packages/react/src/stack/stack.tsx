import type { HTMLAttributes, ReactElement, Ref } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useStack } from './use-stack.ts'
import type { UseStackOptions } from './use-stack.ts'

/** What `render` receives as its second argument. Stack has no state, so it's empty. */
export type StackState = Record<string, never>

/** What a `render` function gets to spread: your attributes, the class and the ref. */
export interface StackElementProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement> | undefined
}

export interface StackProps extends HTMLAttributes<HTMLElement>, UseStackOptions {
  /** The rendered element, whichever it is. */
  ref?: Ref<HTMLElement> | undefined
  /** Change the element: `render={<ul />}` with `<li>` children, or `<form />`. Its own semantics apply: Stack adds no role. */
  render?: RenderProp<StackElementProps, StackState> | undefined
}

const stackState: StackState = Object.freeze({})

/**
 * One `<div class="kv-stack">`: its children one below the other, with a `space` step between them. DOM order is the visual order (contract: stack.a11y.md). Usable in a server component.
 *
 * @example
 * <Stack gap="8">
 *   <Heading level={2}>Kontakta oss</Heading>
 *   <p>Vi svarar vardagar 9–16.</p>
 * </Stack>
 */
export function Stack({ render, gap, ...otherProps }: StackProps): ReactElement {
  // The class joins a prop's and a render element's own class names (mergeProps), so neither
  // can remove it and the theme keeps styling the layout.
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: mergeProps(otherProps, useStack({ gap }).stackProps),
    state: stackState,
  })
}
Stack.displayName = 'Stack'

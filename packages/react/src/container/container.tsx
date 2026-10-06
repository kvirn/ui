import type { HTMLAttributes, ReactElement, Ref } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useContainer } from './use-container.ts'
import type { UseContainerOptions } from './use-container.ts'

/** What `render` receives as its second argument. Container has no state, so it's empty. */
export type ContainerState = Record<string, never>

/** What a `render` function gets to spread: your attributes, the class and the ref. */
export interface ContainerElementProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement> | undefined
}

export interface ContainerProps extends HTMLAttributes<HTMLElement>, UseContainerOptions {
  /** The rendered element, whichever it is. */
  ref?: Ref<HTMLElement> | undefined
  /** Change the element: `render={<main />}` or `render={<section aria-labelledby={id} />}`. Its own semantics apply: Container adds no role. */
  render?: RenderProp<ContainerElementProps, ContainerState> | undefined
}

const containerState: ContainerState = Object.freeze({})

/**
 * One `<div class="kv-container">` that centres and limits the width of the page's content (contract: container.a11y.md). `size` picks the measure. With `@kvirn-ui/theme`, `'page'` is `80rem` with inline padding, `'reading'` `45rem` and `'form'` `40rem`. Usable in a server component.
 *
 * @example
 * <Container render={<main id="main" />} size="reading">
 *   <h1>Sophämtning</h1>
 * </Container>
 */
export function Container({ render, size, ...otherProps }: ContainerProps): ReactElement {
  // The class joins a prop's and a render element's own class names (mergeProps), so neither
  // can remove it and the theme keeps styling the layout.
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: mergeProps(otherProps, useContainer({ size }).containerProps),
    state: containerState,
  })
}
Container.displayName = 'Container'

'use client'
import type { HTMLAttributes, ReactElement, Ref, RefCallback } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useProse } from './use-prose.ts'

/** What `render` receives as its second argument. Prose has no state, so it's empty. */
export type ProseState = Record<string, never>

/** What a `render` function gets to spread: your attributes, the class and a callback ref. */
export interface ProseElementProps extends HTMLAttributes<HTMLElement> {
  ref: RefCallback<HTMLElement>
}

export interface ProseRootProps extends HTMLAttributes<HTMLElement> {
  /** The rendered element, whichever it is: `<div>`, `<article>` or `<section>`. */
  ref?: Ref<HTMLElement> | undefined
  /** Change the element: `render={<article />}`. Its own semantics apply. */
  render?: RenderProp<ProseElementProps, ProseState> | undefined
}

const proseState: ProseState = Object.freeze({})

/** The prose container: one `<div class="kv-prose">`. */
export function ProseRoot({ render, ref, ...otherProps }: ProseRootProps): ReactElement {
  // The class joins a prop's and a render element's own class names (mergeProps), so neither
  // can remove it and the theme keeps styling the text.
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: { ...mergeProps(otherProps, useProse().rootProps), ref: elementRef },
    state: proseState,
  })
}

/**
 * Text set for reading (contract: prose.a11y.md): a `<div class="kv-prose">` that the theme styles
 * for headings, paragraphs, lists, links and tables inside it. It has no role, ARIA or behaviour,
 * and `render` changes the element. Add `kv-prose--large` for the larger size.
 * `<Prose>` and `<Prose.Root>` are the same component.
 *
 * @example
 * <Prose>
 *   <Heading level={2}>Kontakta oss</Heading>
 *   <p>Vi svarar vardagar 9–16.</p>
 * </Prose>
 */
export const Prose = Object.assign(ProseRoot, { Root: ProseRoot })

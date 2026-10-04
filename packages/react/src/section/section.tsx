'use client'
import type { HTMLAttributes, ReactElement, Ref, RefCallback } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useSection } from './use-section.ts'

/** What `render` receives as its second argument. A section has no state, so it's empty. */
export type SectionState = Record<string, never>

/**
 * What a `render` function gets to spread: your attributes, the part's class and a callback ref,
 * which fits any element.
 */
export interface SectionElementProps extends HTMLAttributes<HTMLElement> {
  ref: RefCallback<HTMLElement>
}

export interface SectionRootProps extends HTMLAttributes<HTMLElement> {
  /** The rendered element, whichever it is: `<div>`, `<aside>`, `<section>`, `<nav>` or `<li>`. */
  ref?: Ref<HTMLElement> | undefined
  /**
   * Change the element: `render={<aside aria-labelledby={id} />}`,
   * `render={<section aria-labelledby={id} />}` or `render={<li />}`. Its own semantics apply.
   * Section adds no role, and a landmark needs a name.
   */
  render?: RenderProp<SectionElementProps, SectionState> | undefined
}

const sectionState: SectionState = Object.freeze({})

/**
 * The section's container: one `<div class="kv-section">`. It holds the content itself, so there
 * are no other parts. Not the `Section` part of Disclosure or Tabs: this is a region of the page.
 */
export function SectionRoot({ render, ref, ...otherProps }: SectionRootProps): ReactElement {
  // The class joins a prop's and a render element's own class names (mergeProps), so neither
  // can remove it and the theme keeps styling the section.
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: { ...mergeProps(otherProps, useSection().rootProps), ref: elementRef },
    state: sectionState,
  })
}
SectionRoot.displayName = 'Section'

/**
 * A plain container for a region of the page, such as a sidebar or a band of content (contract: section.a11y.md). It renders a `<div>` with no role, ARIA, text or behaviour, and
 * `render` changes the element. To make it a landmark, render it as a `<section>`, `<aside>` or
 * `<nav>` with a name. With `@kvirn-ui/theme`, add modifier classes: `kv-section--canvas` and
 * `kv-section--padding-none|sm|md|lg`. A Section is one element, so it is written `<Section>`.
 *
 * @example
 * <Section render={<aside aria-labelledby="kontakt" />} className="kv-section--padding-lg kv-prose">
 *   <h2 id="kontakt">Kontakta oss</h2>
 *   <p>Vi svarar vardagar 9–16.</p>
 * </Section>
 */
export const Section: typeof SectionRoot & {
  /** @deprecated A Section is one element: write `<Section>`. `Section.Root` is removed in 1.0. */
  Root: typeof SectionRoot
} = Object.assign(SectionRoot, { Root: SectionRoot })

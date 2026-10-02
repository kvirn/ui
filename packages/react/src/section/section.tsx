'use client'
import type { HTMLAttributes, ReactElement, Ref, RefCallback } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { usePanel } from './use-panel.ts'

/** What `render` receives as its second argument. A panel has no state, so it's empty. */
export type PanelState = Record<string, never>

/**
 * What a `render` function gets to spread: your attributes, the part's class and a callback ref,
 * which fits any element.
 */
export interface PanelElementProps extends HTMLAttributes<HTMLElement> {
  ref: RefCallback<HTMLElement>
}

export interface PanelRootProps extends HTMLAttributes<HTMLElement> {
  /** The rendered element, whichever it is: `<div>`, `<aside>`, `<section>`, `<nav>` or `<li>`. */
  ref?: Ref<HTMLElement> | undefined
  /**
   * Change the element: `render={<aside aria-labelledby={id} />}`,
   * `render={<section aria-labelledby={id} />}` or `render={<li />}`. Its own semantics apply.
   * Panel adds no role, and a landmark needs a name.
   */
  render?: RenderProp<PanelElementProps, PanelState> | undefined
}

const panelState: PanelState = Object.freeze({})

/**
 * The panel's container: one `<div class="kv-panel">`. It holds the content itself, so there
 * are no other parts. Not the `Panel` part of Disclosure or Tabs: this is a region of the page.
 */
export function PanelRoot({ render, ref, ...otherProps }: PanelRootProps): ReactElement {
  // The class joins a prop's and a render element's own class names (mergeProps), so neither
  // can remove it and the theme keeps styling the panel.
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: { ...mergeProps(otherProps, usePanel().rootProps), ref: elementRef },
    state: panelState,
  })
}

/**
 * A plain container for a region of the page, such as a sidebar or a band of content (ADR-0044,
 * contract: panel.a11y.md). It renders a `<div>` with no role, ARIA, text or behaviour, and
 * `render` changes the element. To make it a landmark, render it as a `<section>`, `<aside>` or
 * `<nav>` with a name. With `@kvirn-ui/theme`, add modifier classes: `kv-panel--canvas` and
 * `kv-panel--padding-none|sm|md|lg`. `<Panel>` and `<Panel.Root>` are the same component.
 *
 * @example
 * <Panel render={<aside aria-labelledby="kontakt" />} className="kv-panel--padding-lg kv-prose">
 *   <h2 id="kontakt">Kontakta oss</h2>
 *   <p>Vi svarar vardagar 9–16.</p>
 * </Panel>
 */
export const Panel = Object.assign(PanelRoot, { Root: PanelRoot })

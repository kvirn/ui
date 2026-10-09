'use client'
import type { ReactElement } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useSection } from './use-section.ts'

const sectionTags = ['div', 'section', 'aside', 'nav', 'footer', 'header', 'article', 'li'] as const

/**
 * `as` is `div` (default), `section`, `aside`, `nav`, `footer`, `header`, `article` or `li`. The
 * element's own semantics apply: Section adds no role, and a landmark needs a name.
 */
export type SectionRootProps = AsTag<(typeof sectionTags)[number], 'div'>

/**
 * The section's container: one `<div class="kv-section">`. It holds the content itself, so there
 * are no other parts. Not the `Section` part of Disclosure or Tabs: this is a region of the page.
 */
export function SectionRoot({ as, ref, ...otherProps }: SectionRootProps): ReactElement {
  // The class joins a prop's own class names (mergeProps), so a prop can't remove it and the
  // theme keeps styling the section.
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    as: resolveAsTag({ part: 'Section', as, allowedTags: sectionTags }),
    defaultElement: 'div',
    partProps: { ...mergeProps(otherProps, useSection().rootProps), ref: elementRef },
  })
}
SectionRoot.displayName = 'Section'

/**
 * A plain container for a region of the page, such as a sidebar or a band of content (contract: section.a11y.md). It renders a `<div>` with no role, ARIA, text or behaviour, and
 * `as` changes the element. To make it a landmark, use `as="section"`, `"aside"` or
 * `"nav"` with a name. With `@kvirn-ui/theme`, add modifier classes: `kv-section--canvas` and
 * `kv-section--padding-none|sm|md|lg`. A Section is one element, so it is written `<Section>`.
 *
 * @example
 * <Section as="aside" aria-labelledby="kontakt" className="kv-section--padding-lg kv-prose">
 *   <h2 id="kontakt">Kontakta oss</h2>
 *   <p>Vi svarar vardagar 9–16.</p>
 * </Section>
 */
export const Section: typeof SectionRoot & {
  /** @deprecated A Section is one element: write `<Section>`. `Section.Root` is removed in 1.0. */
  Root: typeof SectionRoot
} = Object.assign(SectionRoot, { Root: SectionRoot })

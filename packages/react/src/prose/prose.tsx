'use client'
import type { ReactElement } from 'react'
import { useDescriptionPart } from '../field/use-description-part.ts'
import type { FieldDescriptionPartProps } from '../field/use-field.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useProse } from './use-prose.ts'

const proseTags = ['div', 'article', 'section'] as const

/** `as` is `div` (default), `article` or `section`. Its own semantics apply. */
export type ProseRootProps = AsTag<(typeof proseTags)[number], 'div'>

/**
 * The prose container: one `<div class="kv-prose">`. Inside a Field.Root or Fieldset.Root it is
 * also the description of the control or the group: it registers, gets an id, and is
 * listed in `aria-describedby` in DOM order, before the error.
 */
export function ProseRoot({ as, ref, ...otherProps }: ProseRootProps): ReactElement {
  const prose = useProse()
  const description = useDescriptionPart<HTMLElement>(ref)
  // The class joins a prop's own class names (mergeProps), so a prop can't remove it and the
  // theme keeps styling the text. In a host the description's props carry
  // the same class, so only one of the two is merged.
  const partProps: Partial<FieldDescriptionPartProps> =
    description.state === null ? prose.rootProps : description.partProps
  return renderPart({
    as: resolveAsTag({ part: 'Prose', as, allowedTags: proseTags }),
    defaultElement: 'div',
    partProps: { ...mergeProps(otherProps, partProps), ref: description.ref },
  })
}

ProseRoot.displayName = 'Prose'

/**
 * Text set for reading (contract: prose.a11y.md): a `<div class="kv-prose">` that the theme styles
 * for headings, paragraphs, lists, links and tables inside it. It has no role, ARIA or behaviour,
 * and `as` changes the element. Add `kv-prose--large` for the larger size.
 * A Prose is one element, so it is written `<Prose>`. Inside a `Field.Root` or
 * `Fieldset.Root` write `Field.Prose` or `Fieldset.Prose`: it is the description of the control
 * or the group, read before answering and shown above the control. A help text that helps while typing
 * is a `Field.HelpText`.
 *
 * @example
 * <Prose>
 *   <h2>Kontakta oss</h2>
 *   <p>Vi svarar vardagar 9–16.</p>
 * </Prose>
 */
export const Prose: typeof ProseRoot & {
  /** @deprecated A Prose is one element: write `<Prose>`. `Prose.Root` is removed in 1.0. */
  Root: typeof ProseRoot
} = Object.assign(ProseRoot, { Root: ProseRoot })

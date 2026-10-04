'use client'
import type { HTMLAttributes, ReactElement, Ref, RefCallback } from 'react'
import type { FieldState } from '../field/field-state.ts'
import { useDescriptionPart } from '../field/use-description-part.ts'
import type { FieldDescriptionPartProps } from '../field/use-field.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useProse } from './use-prose.ts'

/**
 * What `render` receives as its second argument. Empty, except in a Field or Fieldset, where it is
 * that Field's or Fieldset's state (`isInvalid`, `isRequired`, `isDisabled`).
 */
export type ProseState = Partial<FieldState>

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

/**
 * The prose container: one `<div class="kv-prose">`. Inside a Field.Root or Fieldset.Root it is
 * also the description of the control or the group: it registers, gets an id, and is
 * listed in `aria-describedby` in DOM order, before the error.
 */
export function ProseRoot({ render, ref, ...otherProps }: ProseRootProps): ReactElement {
  const prose = useProse()
  const description = useDescriptionPart<HTMLElement>(ref)
  // The class joins a prop's and a render element's own class names (mergeProps), so neither
  // can remove it and the theme keeps styling the text. In a host the description's props carry
  // the same class, so only one of the two is merged.
  const partProps: Partial<FieldDescriptionPartProps> =
    description.state === null ? prose.rootProps : description.partProps
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: { ...mergeProps(otherProps, partProps), ref: description.ref },
    state: description.state ?? proseState,
  })
}

ProseRoot.displayName = 'Prose'

/**
 * Text set for reading (contract: prose.a11y.md): a `<div class="kv-prose">` that the theme styles
 * for headings, paragraphs, lists, links and tables inside it. It has no role, ARIA or behaviour,
 * and `render` changes the element. Add `kv-prose--large` for the larger size.
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

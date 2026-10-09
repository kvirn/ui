import type { ElementType, ReactElement, ReactNode } from 'react'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import type { AsComponent } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useSkipLink } from './use-skip-link.ts'

interface SkipLinkOwnProps {
  /** A same-page address, `#main`: the id of the main content. */
  href: string
  /** Your own text. Replaces the message `skipLink.label`, so its language is yours to set. */
  children?: ReactNode
  /** Per-instance message overrides: `{ label: 'Hoppa till innehållet' }`. */
  messages?: Partial<KvirnMessages['skipLink']> | undefined
}

/**
 * `as` is a component that renders an `<a href>` and forwards its ref, such as a router link: it
 * gets the other props, the ref and the part's class.
 */
export type SkipLinkProps<Component extends ElementType = 'a'> = AsComponent<
  Component,
  SkipLinkOwnProps
>

/**
 * A bypass link (contract: skip-link.a11y.md): `<a class="kv-skip-link" href="#main">`. Put it
 * first in the body. The theme shows it only while it has focus, in the flow of the page, and
 * activating it moves focus to the target.
 *
 * @example
 * <SkipLink href="#main" />
 * <main id="main">…</main>
 *
 * @example
 * <SkipLink href="#main">Hoppa till innehållet</SkipLink>
 */
export function SkipLink<Component extends ElementType = 'a'>(
  props: SkipLinkProps<Component>,
): ReactElement
export function SkipLink({
  as,
  href,
  messages,
  children,
  ref,
  ...otherProps
}: SkipLinkProps<'a'>): ReactElement {
  const { skipLinkProps, label } = useSkipLink({ href, messages })
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    as,
    defaultElement: 'a',
    partProps: {
      ...mergeProps(otherProps, skipLinkProps),
      ref: elementRef,
      children: children ?? label,
    },
  })
}
SkipLink.displayName = 'SkipLink'

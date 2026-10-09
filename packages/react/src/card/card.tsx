'use client'
import type { HTMLAttributes, ReactElement, Ref } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useCard } from './use-card.ts'
import type { CardPartProps } from './use-card.ts'

const cardTags = ['div', 'li', 'article', 'figure', 'section'] as const

/**
 * `as` is `div` (default), `li` in a list of cards, `article` for a self-contained item,
 * `figure` for media with a caption, or `section` with `aria-labelledby`. The element's own
 * semantics apply: Card adds no role.
 */
export type CardRootProps = AsTag<(typeof cardTags)[number], 'div'>

interface CardDivProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement> | undefined
}

export type CardHeaderProps = CardDivProps
export type CardBodyProps = CardDivProps
export type CardFooterProps = CardDivProps

/**
 * Internal. One part: one element. The part's class joins a prop's own class names (mergeProps),
 * so a prop can't remove it and the theme keeps styling the card.
 */
function useCardPart(
  { ref, ...otherProps }: CardDivProps,
  partProps: CardPartProps,
  as?: (typeof cardTags)[number],
): ReactElement {
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    as,
    defaultElement: 'div',
    partProps: { ...mergeProps(otherProps, partProps), ref: elementRef },
  })
}

/**
 * The card's container: one `<div class="kv-card">`. Without parts, it holds the content
 * itself. With parts, they're its direct children.
 */
export function CardRoot({ as, ...otherProps }: CardRootProps): ReactElement {
  return useCardPart(
    otherProps,
    useCard().rootProps,
    resolveAsTag({ part: 'Card.Root', as, allowedTags: cardTags }),
  )
}
CardRoot.displayName = 'Card.Root'

/** For media or a title row that needs a divider. A `<div>`, never a `<header>` landmark. */
export function CardHeader(props: CardHeaderProps): ReactElement {
  return useCardPart(props, useCard().headerProps)
}
CardHeader.displayName = 'Card.Header'

/** The card's content. Put the heading at its top. */
export function CardBody(props: CardBodyProps): ReactElement {
  return useCardPart(props, useCard().bodyProps)
}
CardBody.displayName = 'Card.Body'

/** For actions. A `<div>`, never a `<footer>` landmark. */
export function CardFooter(props: CardFooterProps): ReactElement {
  return useCardPart(props, useCard().footerProps)
}
CardFooter.displayName = 'Card.Footer'

/**
 * A plain container for one thing on the page: a service, a news item, a case (contract: card.a11y.md). It is always `surface-raised`. A region of the page, such as a
 * sidebar, is a `Section`. Every part is one `<div>` with no role, ARIA, text or
 * behaviour. Only `Card.Root` takes `as`. With `@kvirn-ui/theme`, add modifier classes:
 * `kv-card--radius-md`, `kv-card--padding-sm`, `kv-card-header--padding-none`,
 * `kv-card--dividers` and so on.
 *
 * @example
 * // role="list": the theme draws no markers, and Safari then drops the list semantics.
 * <ul role="list">
 *   <Card.Root as="li">
 *     <Card.Header className="kv-card-header--padding-none">
 *       <img src="/bibliotek.jpg" alt="" />
 *     </Card.Header>
 *     <Card.Body>
 *       <h3><Link.Root href="/bibliotek">Biblioteket på Storgatan</Link.Root></h3>
 *       <p>Öppet alla dagar 10–19.</p>
 *     </Card.Body>
 *     <Card.Footer className="kv-button-group">
 *       <Button>Boka tid</Button>
 *     </Card.Footer>
 *   </Card.Root>
 * </ul>
 */
export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
} as const

'use client'
import type { HTMLAttributes, ReactElement, Ref, RefCallback } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useCard } from './use-card.ts'
import type { CardPartProps } from './use-card.ts'

/** What `render` receives as its second argument. A card has no state, so it's empty. */
export type CardState = Record<string, never>

/**
 * What a `render` function gets to spread: your attributes, the part's class and a callback ref,
 * which fits any element.
 */
export interface CardElementProps extends HTMLAttributes<HTMLElement> {
  ref: RefCallback<HTMLElement>
}

interface CardPartComponentProps extends HTMLAttributes<HTMLElement> {
  /** The rendered element, whichever it is: `<div>`, `<article>`, `<section>` or `<li>`. */
  ref?: Ref<HTMLElement> | undefined
  /**
   * Change the element: `render={<article />}`, `render={<section aria-labelledby={id} />}` or
   * `render={<li />}`. Its own semantics apply. Card adds no role.
   */
  render?: RenderProp<CardElementProps, CardState> | undefined
}

export type CardRootProps = CardPartComponentProps
export type CardHeaderProps = CardPartComponentProps
export type CardBodyProps = CardPartComponentProps
export type CardFooterProps = CardPartComponentProps

const cardState: CardState = Object.freeze({})

/**
 * Internal. One part: one element. The part's class joins a prop's and a render element's own
 * class names (mergeProps), so neither can remove it and the theme keeps styling the card.
 */
function useCardPart(
  { render, ref, ...otherProps }: CardPartComponentProps,
  partProps: CardPartProps,
): ReactElement {
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: { ...mergeProps(otherProps, partProps), ref: elementRef },
    state: cardState,
  })
}

/**
 * The card's container: one `<div class="kv-card">`. Without parts, it holds the content
 * itself. With parts, they're its direct children.
 */
export function CardRoot(props: CardRootProps): ReactElement {
  return useCardPart(props, useCard().rootProps)
}

/** For media or a title row that needs a divider. A `<div>`, never a `<header>` landmark. */
export function CardHeader(props: CardHeaderProps): ReactElement {
  return useCardPart(props, useCard().headerProps)
}

/** The card's content. Put the heading at its top. */
export function CardBody(props: CardBodyProps): ReactElement {
  return useCardPart(props, useCard().bodyProps)
}

/** For actions. A `<div>`, never a `<footer>` landmark. */
export function CardFooter(props: CardFooterProps): ReactElement {
  return useCardPart(props, useCard().footerProps)
}

/**
 * A plain container for content on a surface (ADR-0020, contract: card.a11y.md). Every part is
 * one `<div>` with no role, ARIA, text or behaviour, and `render` changes the element. With
 * `@kvirn-ui/theme`, add modifier classes: `kv-card--surface`, `kv-card--radius-md`,
 * `kv-card--padding-sm`, `kv-card-header--padding-none`, `kv-card--dividers` and so on.
 *
 * @example
 * // role="list": the theme draws no markers, and Safari then drops the list semantics.
 * <ul role="list">
 *   <Card.Root render={<li />}>
 *     <Card.Header className="kv-card-header--padding-none">
 *       <img src="/bibliotek.jpg" alt="" />
 *     </Card.Header>
 *     <Card.Body>
 *       <h3><Link href="/bibliotek">Biblioteket på Storgatan</Link></h3>
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

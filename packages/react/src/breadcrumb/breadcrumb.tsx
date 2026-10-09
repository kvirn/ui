'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { createElement } from 'react'
import type { ElementType, HTMLAttributes, ReactElement, Ref, RefCallback } from 'react'
import { LinkRoot } from '../link/link.tsx'
import type { LinkProps } from '../link/link.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import type { RegisteredLinkComponent } from '../provider/register.ts'
import { useBreadcrumb } from './use-breadcrumb.ts'
import type {
  BreadcrumbCurrentPartProps,
  BreadcrumbItemPartProps,
  BreadcrumbListPartProps,
  BreadcrumbRootPartProps,
} from './use-breadcrumb.ts'

interface BreadcrumbPartComponentProps extends HTMLAttributes<HTMLElement> {
  /** The rendered element. */
  ref?: Ref<HTMLElement> | undefined
}

export interface BreadcrumbRootProps extends BreadcrumbPartComponentProps {
  /**
   * The trail's accessible name, from your translations: `Du är här`. Replaces the message
   * `breadcrumb.label`, set as `aria-label`.
   */
  label?: string | undefined
  /** Per-instance message overrides: `{ label: 'Du är här' }`. */
  messages?: Partial<KvirnMessages['breadcrumb']> | undefined
}
export type BreadcrumbListProps = BreadcrumbPartComponentProps
export type BreadcrumbItemProps = BreadcrumbPartComponentProps
export type BreadcrumbCurrentProps = BreadcrumbPartComponentProps
/** The props of `Link.Root`, `as` included. */
export type BreadcrumbLinkProps<Component extends ElementType = RegisteredLinkComponent> =
  LinkProps<Component>

/** Internal. One part: one element. The part's props join the consumer's (mergeProps). */
function renderBreadcrumbPart(
  otherProps: BreadcrumbPartComponentProps,
  defaultElement: 'nav' | 'ol' | 'li' | 'span',
  partProps:
    | BreadcrumbRootPartProps
    | BreadcrumbListPartProps
    | BreadcrumbItemPartProps
    | BreadcrumbCurrentPartProps,
  elementRef: RefCallback<HTMLElement>,
): ReactElement {
  return createElement(defaultElement, {
    // The part's class joins a prop's class names, so a prop can't remove it and the theme keeps
    // styling the trail.
    ...mergeProps(otherProps, partProps),
    ref: elementRef,
  })
}

/**
 * The landmark: one `<nav class="kv-breadcrumb">`, named by the message `breadcrumb.label` or
 * your `label`. Put a `Breadcrumb.List` in it, and never inside `<main>`.
 */
export function BreadcrumbRoot({
  label,
  messages,
  ref,
  ...otherProps
}: BreadcrumbRootProps): ReactElement {
  const breadcrumb = useBreadcrumb({ label, messages })
  const mergedRef = useMergedRef(ref, null)
  return renderBreadcrumbPart(otherProps, 'nav', breadcrumb.rootProps, mergedRef)
}
BreadcrumbRoot.displayName = 'Breadcrumb.Root'

/** An `<ol class="kv-breadcrumb-list">`: the order is the meaning, so it is an ordered list. */
export function BreadcrumbList({ ref, ...otherProps }: BreadcrumbListProps): ReactElement {
  const breadcrumb = useBreadcrumb()
  const mergedRef = useMergedRef(ref, null)
  return renderBreadcrumbPart(otherProps, 'ol', breadcrumb.listProps, mergedRef)
}
BreadcrumbList.displayName = 'Breadcrumb.List'

/**
 * An `<li class="kv-breadcrumb-item">`: a `Breadcrumb.Link`, or the last item's
 * `Breadcrumb.Current`. The theme draws the separator before every item but the first.
 */
export function BreadcrumbItem({ ref, ...otherProps }: BreadcrumbItemProps): ReactElement {
  const breadcrumb = useBreadcrumb()
  const mergedRef = useMergedRef(ref, null)
  return renderBreadcrumbPart(otherProps, 'li', breadcrumb.itemProps, mergedRef)
}
BreadcrumbItem.displayName = 'Breadcrumb.Item'

/**
 * The page you are on, as text: `<span class="kv-breadcrumb-current" aria-current="page">`. It
 * is the last item and never a link to itself.
 */
export function BreadcrumbCurrent({ ref, ...otherProps }: BreadcrumbCurrentProps): ReactElement {
  const breadcrumb = useBreadcrumb()
  const mergedRef = useMergedRef(ref, null)
  return renderBreadcrumbPart(otherProps, 'span', breadcrumb.currentProps, mergedRef)
}
BreadcrumbCurrent.displayName = 'Breadcrumb.Current'

/**
 * A link to a level above the current page. A thin wrapper over `Link.Root`, so it is a native
 * `<a href>` rendered by the app's registered router link.
 */
export function BreadcrumbLink<Component extends ElementType = RegisteredLinkComponent>(
  props: BreadcrumbLinkProps<Component>,
): ReactElement
export function BreadcrumbLink(props: BreadcrumbLinkProps<'a'>): ReactElement {
  return <LinkRoot {...mergeProps({ className: 'kv-breadcrumb-link' }, props)} />
}
BreadcrumbLink.displayName = 'Breadcrumb.Link'

/**
 * A trail from the home page down to the current page (contract: breadcrumb.a11y.md): a
 * labelled `<nav>` around an ordered list. Every item but the last is a link, and the last is
 * the current page as text with `aria-current="page"`. It never collapses into "…", because a
 * hidden level is a hidden way out: it wraps instead. Put it before `<main>`, not in it. The
 * links are `Link.Root`, so a registered router link is used.
 *
 * @example
 * <Breadcrumb.Root>
 *   <Breadcrumb.List>
 *     <Breadcrumb.Item><Breadcrumb.Link href="/">Start</Breadcrumb.Link></Breadcrumb.Item>
 *     <Breadcrumb.Item><Breadcrumb.Link href="/barn">Barn och utbildning</Breadcrumb.Link></Breadcrumb.Item>
 *     <Breadcrumb.Item><Breadcrumb.Current>Förskola</Breadcrumb.Current></Breadcrumb.Item>
 *   </Breadcrumb.List>
 * </Breadcrumb.Root>
 */
export const Breadcrumb = {
  Root: BreadcrumbRoot,
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Current: BreadcrumbCurrent,
} as const

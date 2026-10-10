'use client'

import { Icon, Link, mergeProps } from '@kvirn-ui/react'
import type { LinkProps } from '@kvirn-ui/react'
import type { ComponentPropsWithRef, ElementType, ReactElement } from 'react'

export type ServiceLinkRootProps = ComponentPropsWithRef<'div'>

/** Starts with a verb and names the service: `Apply for a building permit`. One per view. */
export type ServiceLinkLinkProps<Component extends ElementType = 'a'> = LinkProps<Component>

/** The sentence, as written: `The e-service is closed 1–3 November.` */
export type ServiceLinkClosedProps = ComponentPropsWithRef<'div'>

export type ServiceLinkAlternativeProps = ComponentPropsWithRef<'div'>

/**
 * The one link that starts an e-service, and the text that takes its place while the service is
 * closed. Put a `ServiceLink.Link`, or a `ServiceLink.Closed`, in it, then an optional
 * `ServiceLink.Alternative`. Contract: service-link.a11y.md.
 */
export function ServiceLinkRoot(props: ServiceLinkRootProps): ReactElement {
  return <div {...mergeProps(props, { className: 'kv-service-link' })} />
}
ServiceLinkRoot.displayName = 'ServiceLink.Root'

/**
 * A link, never a button: a `Link.Root` in the service look with an arrow that mirrors in RTL
 * and is decorative. The visible text is its name.
 */
export function ServiceLinkLink<Component extends ElementType = 'a'>(
  props: ServiceLinkLinkProps<Component>,
): ReactElement
export function ServiceLinkLink({ children, ...otherProps }: LinkProps<'a'>): ReactElement {
  return (
    <p className="kv-service-link-action">
      <Link.Root {...mergeProps(otherProps, { className: 'kv-link--service' })}>
        <Link.Icon>
          <Icon name="arrow-forward" size="24" />
        </Link.Icon>
        {children}
      </Link.Root>
    </p>
  )
}
ServiceLinkLink.displayName = 'ServiceLink.Link'

/**
 * The closed state: the children, as a sentence in an inset, and no link. Nothing is dimmed or
 * disabled: the words carry it.
 */
export function ServiceLinkClosed({
  children,
  ...otherProps
}: ServiceLinkClosedProps): ReactElement {
  return (
    <div {...mergeProps(otherProps, { className: 'kv-service-link-closed kv-inset' })}>
      <p>{children}</p>
    </div>
  )
}
ServiceLinkClosed.displayName = 'ServiceLink.Closed'

/** Other ways to apply, or what to do meanwhile: text and links, under the link. */
export function ServiceLinkAlternative(props: ServiceLinkAlternativeProps): ReactElement {
  return <div {...mergeProps(props, { className: 'kv-service-link-alternative' })} />
}
ServiceLinkAlternative.displayName = 'ServiceLink.Alternative'

export const ServiceLink = {
  Root: ServiceLinkRoot,
  Link: ServiceLinkLink,
  Closed: ServiceLinkClosed,
  Alternative: ServiceLinkAlternative,
} as const

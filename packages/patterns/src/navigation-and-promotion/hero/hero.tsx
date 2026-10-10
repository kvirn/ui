import { Container, Heading, Icon, Link, Section, mergeProps } from '@kvirn-ui/react'
import type { HeadingProps, LinkProps } from '@kvirn-ui/react'
import type { ComponentPropsWithRef, ElementType, ReactElement } from 'react'

export type HeroRootProps = ComponentPropsWithRef<'div'>
export type HeroHeadingProps = Omit<HeadingProps, 'as' | 'size'>
export type HeroLeadProps = ComponentPropsWithRef<'p'>
export type HeroActionProps<Component extends ElementType = 'a'> = LinkProps<Component> & {
  /** The link starts an e-service: the service look, with its arrow. One per view. */
  service?: boolean | undefined
}
export type HeroImageProps = ComponentPropsWithRef<'img'>

/**
 * The page's title and one next step, as a canvas band in a `Container`. DOM order is the order
 * of the children, and the image comes last: beside the text from `64rem`, below it before.
 * No minimum height, no text over the image and no carousel. Contract: hero.a11y.md.
 */
export function HeroRoot({ children, className, ...otherProps }: HeroRootProps): ReactElement {
  return (
    <Section
      className={['kv-section--canvas', 'kv-section--padding-lg', 'kv-hero', className]
        .filter(Boolean)
        .join(' ')}
    >
      <Container>
        <div {...mergeProps(otherProps, { className: 'kv-hero-inner' })}>{children}</div>
      </Container>
    </Section>
  )
}
HeroRoot.displayName = 'Hero.Root'

/** The page's `h1`, at the `display` size. The only `h1` of the page. */
export function HeroHeading(props: HeroHeadingProps): ReactElement {
  return <Heading as="h1" size="display" {...props} />
}
HeroHeading.displayName = 'Hero.Heading'

/** One sentence under the title, at `body-large`. */
export function HeroLead(props: HeroLeadProps): ReactElement {
  return <p {...mergeProps(props, { className: 'kv-hero-lead' })} />
}
HeroLead.displayName = 'Hero.Lead'

/** The one next step: a `Link.Root`, through the registered router link or `as`. */
export function HeroAction<Component extends ElementType = 'a'>(
  props: HeroActionProps<Component>,
): ReactElement
export function HeroAction({
  service,
  children,
  ...otherProps
}: HeroActionProps<'a'>): ReactElement {
  return (
    <Link.Root
      {...mergeProps(otherProps, {
        className: service === true ? 'kv-hero-action kv-link--service' : 'kv-hero-action',
      })}
    >
      {service === true && (
        <Link.Icon>
          <Icon name="arrow-forward" size={6} />
        </Link.Icon>
      )}
      {children}
    </Link.Root>
  )
}
HeroAction.displayName = 'Hero.Action'

/** Decorative by default (`alt=""`): it never carries the page's information. */
export function HeroImage({ alt = '', ...otherProps }: HeroImageProps): ReactElement {
  return <img alt={alt} {...mergeProps(otherProps, { className: 'kv-hero-image' })} />
}
HeroImage.displayName = 'Hero.Image'

export const Hero = {
  Root: HeroRoot,
  Heading: HeroHeading,
  Lead: HeroLead,
  Action: HeroAction,
  Image: HeroImage,
} as const

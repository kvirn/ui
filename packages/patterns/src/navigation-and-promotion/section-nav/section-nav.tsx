'use client'

import { Disclosure, Link, Navigation, mergeProps } from '@kvirn-ui/react'
import type { DisclosureTriggerProps, LinkProps } from '@kvirn-ui/react'
import { createContext, useContext, useState } from 'react'
import type { ComponentPropsWithRef, ElementType, ReactElement } from 'react'
import { useIsWideViewport } from '../../site-chrome/is-wide-viewport.ts'

const SectionNavLabelContext = createContext<string | undefined>(undefined)

export interface SectionNavRootProps extends Omit<ComponentPropsWithRef<'div'>, 'aria-label'> {
  /** The navigation's accessible name, from your translations: `In this section`. */
  label: string
  /** The panel starts open (below 64rem). */
  defaultOpen?: boolean | undefined
}

export type SectionNavTriggerProps = DisclosureTriggerProps
export type SectionNavPanelProps = Omit<ComponentPropsWithRef<'div'>, 'id' | 'hidden'>

/**
 * `current` is `page` on the page itself, or `true` on the deepest item shown when the page is
 * not listed: exactly one in the whole section nav, never an ancestor.
 */
export type SectionNavLinkProps<Component extends ElementType = 'a'> = LinkProps<Component>
export type SectionNavGroupProps = ComponentPropsWithRef<'li'>
export type SectionNavGroupLinkProps<Component extends ElementType = 'a'> = LinkProps<Component>
export type SectionNavGroupItemsProps = ComponentPropsWithRef<'ul'>

/**
 * The pages of the section, beside `main`: a `Disclosure` below 64rem, and its panel shown from
 * 64rem, where the button is gone. Put a `SectionNav.Trigger` and a `SectionNav.Panel` in it.
 * `label` names the navigation. Contract: section-nav.a11y.md.
 */
export function SectionNavRoot({
  label,
  defaultOpen = false,
  children,
  ...otherProps
}: SectionNavRootProps): ReactElement {
  const [isNarrowOpen, setIsNarrowOpen] = useState(defaultOpen)
  // Wide, the panel is always open (the button is gone), so the links are there before hydration.
  const isOpen = useIsWideViewport() || isNarrowOpen
  return (
    <div {...mergeProps(otherProps, { className: 'kv-section-navigation' })}>
      <SectionNavLabelContext.Provider value={label}>
        <Disclosure.Root open={isOpen} onOpenChange={setIsNarrowOpen}>
          {children}
        </Disclosure.Root>
      </SectionNavLabelContext.Provider>
    </div>
  )
}
SectionNavRoot.displayName = 'SectionNav.Root'

/** The button that opens the panel below 64rem; its children are its name. */
export function SectionNavTrigger(props: SectionNavTriggerProps): ReactElement {
  return (
    <Disclosure.Trigger {...mergeProps(props, { className: 'kv-section-navigation-trigger' })} />
  )
}
SectionNavTrigger.displayName = 'SectionNav.Trigger'

/** The panel: a `Navigation` named by the root's `label`, holding the links. */
export function SectionNavPanel({ children, ...otherProps }: SectionNavPanelProps): ReactElement {
  const label = useContext(SectionNavLabelContext)
  return (
    <Disclosure.Panel {...mergeProps(otherProps, { className: 'kv-section-navigation-panel' })}>
      <Navigation.Root label={label}>
        <Navigation.List>{children}</Navigation.List>
      </Navigation.Root>
    </Disclosure.Panel>
  )
}
SectionNavPanel.displayName = 'SectionNav.Panel'

/** A `<li>` with a `Link.Root`: a native `<a href>`, through the registered router link or `as`. */
export function SectionNavLink<Component extends ElementType = 'a'>(
  props: SectionNavLinkProps<Component>,
): ReactElement
export function SectionNavLink(props: LinkProps<'a'>): ReactElement {
  return (
    <Navigation.Item>
      <Link.Root {...props} />
    </Navigation.Item>
  )
}
SectionNavLink.displayName = 'SectionNav.Link'

/** A page with pages under it: a `<li>` of one `SectionNav.GroupLink` and one `SectionNav.GroupItems`. */
export function SectionNavGroup(props: SectionNavGroupProps): ReactElement {
  return <Navigation.Item {...props} />
}
SectionNavGroup.displayName = 'SectionNav.Group'

/** The group's own page: a native `<a href>` in the group's `<li>`. */
export function SectionNavGroupLink<Component extends ElementType = 'a'>(
  props: SectionNavGroupLinkProps<Component>,
): ReactElement
export function SectionNavGroupLink(props: LinkProps<'a'>): ReactElement {
  return <Link.Root {...props} />
}
SectionNavGroupLink.displayName = 'SectionNav.GroupLink'

/** The pages under the group: the nested `<ul>`, holding `SectionNav.Link`s. */
export function SectionNavGroupItems(props: SectionNavGroupItemsProps): ReactElement {
  return <Navigation.List {...props} />
}
SectionNavGroupItems.displayName = 'SectionNav.GroupItems'

export const SectionNav = {
  Root: SectionNavRoot,
  Trigger: SectionNavTrigger,
  Panel: SectionNavPanel,
  Link: SectionNavLink,
  Group: SectionNavGroup,
  GroupLink: SectionNavGroupLink,
  GroupItems: SectionNavGroupItems,
} as const

'use client'

import { Container, Disclosure, Link, Navigation, Section, mergeProps } from '@kvirn-ui/react'
import type { DisclosureTriggerProps, LinkProps } from '@kvirn-ui/react'
import { createContext, useContext, useRef, useState } from 'react'
import type {
  ComponentPropsWithRef,
  ElementType,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
} from 'react'
import { isWideViewport, useIsWideViewport } from '../is-wide-viewport.ts'

interface SiteHeaderMenuContextValue {
  isOpen: boolean
  setIsOpen: (nextOpen: boolean) => void
  setTrigger: (trigger: HTMLButtonElement | null) => void
  focusTrigger: () => void
}

const SiteHeaderMenuContext = createContext<SiteHeaderMenuContextValue | null>(null)

export type SiteHeaderRootProps = ComponentPropsWithRef<'header'>
export type SiteHeaderNoticeProps = ComponentPropsWithRef<'div'>
export type SiteHeaderTopbarProps = ComponentPropsWithRef<'div'>
export type SiteHeaderServiceProps = ComponentPropsWithRef<'span'>

/**
 * `current` is `page` on the start page. Put a `SiteHeader.Logo` first and the organisation's
 * name as text: the name is the link's accessible name.
 */
export type SiteHeaderBrandProps<Component extends ElementType = 'a'> = LinkProps<Component>
export type SiteHeaderLogoProps = Omit<ComponentPropsWithRef<'img'>, 'alt'>
export interface SiteHeaderUtilityProps extends Omit<
  ComponentPropsWithRef<'nav'>,
  'aria-label' | 'aria-labelledby'
> {
  /** The navigation's name, in the page's language, such as `Shortcuts`. */
  label: string
}
export type SiteHeaderUtilityLinkProps<Component extends ElementType = 'a'> = LinkProps<Component>
export interface SiteHeaderSearchProps extends ComponentPropsWithRef<'search'> {
  /** Where the form goes: a GET to the search page. */
  action: string
}
export type SiteHeaderMenuProps = ComponentPropsWithRef<'div'> & {
  /** The Menu panel starts open (below 64rem). */
  defaultOpen?: boolean | undefined
}
export type SiteHeaderMenuButtonProps = DisclosureTriggerProps
export type SiteHeaderMenuPanelProps = ComponentPropsWithRef<'div'>

/**
 * The banner: one `<header class="kv-section">` with its content inside a `Container`. DOM order
 * is reading and focus order at every width, and nothing is sticky. It holds no heading: the
 * page's `h1` is in `main`. Contract: site-header.a11y.md.
 */
export function SiteHeaderRoot({
  children,
  className,
  ...otherProps
}: SiteHeaderRootProps): ReactElement {
  return (
    <Section
      as="header"
      className={['kv-section--canvas', 'kv-section--padding-sm', 'kv-site-header', className]
        .filter(Boolean)
        .join(' ')}
      {...otherProps}
    >
      <Container className="kv-site-header-inner">{children}</Container>
    </Section>
  )
}
SiteHeaderRoot.displayName = 'SiteHeader.Root'

/** A line above the brand, for reference sites: text and links, no heading. */
export function SiteHeaderNotice(props: SiteHeaderNoticeProps): ReactElement {
  return <div {...mergeProps(props, { className: 'kv-site-header-notice' })} />
}
SiteHeaderNotice.displayName = 'SiteHeader.Notice'

/** The row of the brand, the language links and the shortcuts. */
export function SiteHeaderTopbar(props: SiteHeaderTopbarProps): ReactElement {
  return <div {...mergeProps(props, { className: 'kv-site-header-top' })} />
}
SiteHeaderTopbar.displayName = 'SiteHeader.Topbar'

/** The organisation's link to its start page: a `Link.Root`, through the registered router link or `as`. */
export function SiteHeaderBrand<Component extends ElementType = 'a'>(
  props: SiteHeaderBrandProps<Component>,
): ReactElement
export function SiteHeaderBrand(props: LinkProps<'a'>): ReactElement {
  return <Link.Root {...mergeProps(props, { className: 'kv-site-header-brand' })} />
}
SiteHeaderBrand.displayName = 'SiteHeader.Brand'

/** The brand's mark. It is decorative (`alt=""`): the organisation's name is the text beside it. */
export function SiteHeaderLogo(props: SiteHeaderLogoProps): ReactElement {
  return <img alt="" {...mergeProps(props, { className: 'kv-site-header-mark' })} />
}
SiteHeaderLogo.displayName = 'SiteHeader.Logo'

/** A transaction header's service name, as text after the brand. */
export function SiteHeaderService(props: SiteHeaderServiceProps): ReactElement {
  return <span {...mergeProps(props, { className: 'kv-site-header-service' })} />
}
SiteHeaderService.displayName = 'SiteHeader.Service'

/**
 * The shortcuts: a horizontal `Navigation` named by `label`. Put `SiteHeader.UtilityLink`s in
 * it, the same links in the same order on every page (3.2.6).
 */
export function SiteHeaderUtility({
  label,
  children,
  className,
  ...otherProps
}: SiteHeaderUtilityProps): ReactElement {
  return (
    <Navigation.Root
      label={label}
      className={['kv-navigation--horizontal', 'kv-site-header-utility', className]
        .filter(Boolean)
        .join(' ')}
      {...otherProps}
    >
      <Navigation.List>{children}</Navigation.List>
    </Navigation.Root>
  )
}
SiteHeaderUtility.displayName = 'SiteHeader.Utility'

/** A shortcut: a `<li>` with a native `<a href>`. */
export function SiteHeaderUtilityLink<Component extends ElementType = 'a'>(
  props: SiteHeaderUtilityLinkProps<Component>,
): ReactElement
export function SiteHeaderUtilityLink(props: LinkProps<'a'>): ReactElement {
  return (
    <Navigation.Item>
      <Link.Root {...props} />
    </Navigation.Item>
  )
}
SiteHeaderUtilityLink.displayName = 'SiteHeader.UtilityLink'

/**
 * The site search: a `<search>` landmark around a GET form. Write the field and the button as
 * children, from `Field`, `TextInput` and `Button`: a visible label, and a button that says
 * "Search" in words (2.5.3).
 */
export function SiteHeaderSearch({
  action,
  children,
  ...otherProps
}: SiteHeaderSearchProps): ReactElement {
  return (
    <search {...mergeProps(otherProps, { className: 'kv-site-header-search' })}>
      <form action={action} method="get" className="kv-site-header-search-form">
        {children}
      </form>
    </search>
  )
}
SiteHeaderSearch.displayName = 'SiteHeader.Search'

/**
 * The main navigation behind the Menu button below 64rem, always shown from 64rem. It owns the
 * open state: Escape inside the panel closes it and returns focus to the button (a topic of the
 * main menu that is open takes the Escape first), and following a link closes it. Write
 * `SiteHeader.MenuButton`, then `SiteHeader.MenuPanel`.
 */
export function SiteHeaderMenu({
  defaultOpen = false,
  children,
  ...otherProps
}: SiteHeaderMenuProps): ReactElement {
  const [isNarrowOpen, setIsOpen] = useState(defaultOpen)
  // Wide, the panel is always open (the button is gone), so the links are there before hydration.
  const isOpen = useIsWideViewport() || isNarrowOpen
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const context = {
    isOpen,
    setIsOpen,
    setTrigger: (trigger: HTMLButtonElement | null) => {
      triggerRef.current = trigger
    },
    focusTrigger: () => triggerRef.current?.focus(),
  }
  return (
    <SiteHeaderMenuContext.Provider value={context}>
      <div {...mergeProps(otherProps, { className: 'kv-site-header-menu' })}>
        <Disclosure.Root open={isOpen} onOpenChange={setIsOpen}>
          {children}
        </Disclosure.Root>
      </div>
    </SiteHeaderMenuContext.Provider>
  )
}
SiteHeaderMenu.displayName = 'SiteHeader.Menu'

function useMenu(partName: string) {
  const menu = useContext(SiteHeaderMenuContext)
  if (menu === null) {
    throw new Error(`<SiteHeader.${partName}> must be used inside <SiteHeader.Menu>.`)
  }
  return menu
}

/** The button that opens the panel below 64rem. Its text is its name: write `Menu`. */
export function SiteHeaderMenuButton(props: SiteHeaderMenuButtonProps): ReactElement {
  const menu = useMenu('MenuButton')
  return (
    <Disclosure.Trigger
      {...mergeProps(props, {
        ref: menu.setTrigger,
        className: 'kv-site-header-menu-trigger',
      })}
    />
  )
}
SiteHeaderMenuButton.displayName = 'SiteHeader.MenuButton'

/** The panel: put the `MainMenu` in it. */
export function SiteHeaderMenuPanel(props: SiteHeaderMenuPanelProps): ReactElement {
  const menu = useMenu('MenuPanel')
  // An Escape that no open topic took: closes the Menu and returns focus to its button (narrow only).
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || event.defaultPrevented || !menu.isOpen || isWideViewport()) return
    menu.setIsOpen(false)
    menu.focusTrigger()
  }
  const onClick = (event: MouseEvent<HTMLElement>) => {
    if (event.target instanceof Element && event.target.closest('a[href]') !== null) {
      menu.setIsOpen(false)
    }
  }
  return (
    <Disclosure.Panel
      {...mergeProps(props, { className: 'kv-site-header-menu-panel', onKeyDown, onClick })}
    />
  )
}
SiteHeaderMenuPanel.displayName = 'SiteHeader.MenuPanel'

export const SiteHeader = {
  Root: SiteHeaderRoot,
  Notice: SiteHeaderNotice,
  Topbar: SiteHeaderTopbar,
  Brand: SiteHeaderBrand,
  Logo: SiteHeaderLogo,
  Service: SiteHeaderService,
  Utility: SiteHeaderUtility,
  UtilityLink: SiteHeaderUtilityLink,
  Search: SiteHeaderSearch,
  Menu: SiteHeaderMenu,
  MenuButton: SiteHeaderMenuButton,
  MenuPanel: SiteHeaderMenuPanel,
} as const

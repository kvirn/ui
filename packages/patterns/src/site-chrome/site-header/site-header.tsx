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

export interface SiteHeaderRootProps extends ComponentPropsWithRef<'header'> {
  /**
   * `canvas` (default) adds no class. `primary` adds `kv-site-header--primary`: each child is a
   * full-width `primary` band, and a `TopBar` first is the darker top bar.
   */
  variant?: 'canvas' | 'primary' | undefined
}
export type SiteHeaderMastheadProps = ComponentPropsWithRef<'div'>
export interface SiteHeaderUtilityProps extends Omit<
  ComponentPropsWithRef<'nav'>,
  'aria-label' | 'aria-labelledby'
> {
  /** The navigation's name, in the page's language, such as `Shortcuts`. */
  label: string
}
export type SiteHeaderUtilityLinkProps<Component extends ElementType = 'a'> = LinkProps<Component>
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
  variant = 'canvas',
  children,
  className,
  ...otherProps
}: SiteHeaderRootProps): ReactElement {
  return (
    <Section
      as="header"
      className={[
        'kv-section--canvas',
        'kv-section--padding-sm',
        'kv-site-header',
        variant === 'primary' && 'kv-site-header--primary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...otherProps}
    >
      <Container className="kv-site-header-inner">{children}</Container>
    </Section>
  )
}
SiteHeaderRoot.displayName = 'SiteHeader.Root'

/** The row of the `ApplicationLogo`, the language links, the shortcuts and the `SiteSearch`. */
export function SiteHeaderMasthead(props: SiteHeaderMastheadProps): ReactElement {
  return <div {...mergeProps(props, { className: 'kv-site-header-masthead' })} />
}
SiteHeaderMasthead.displayName = 'SiteHeader.Masthead'

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
  Masthead: SiteHeaderMasthead,
  Utility: SiteHeaderUtility,
  UtilityLink: SiteHeaderUtilityLink,
  Menu: SiteHeaderMenu,
  MenuButton: SiteHeaderMenuButton,
  MenuPanel: SiteHeaderMenuPanel,
} as const

'use client'

import { Disclosure, Link, Navigation, mergeProps } from '@kvirn-ui/react'
import type { DisclosurePanelProps, DisclosureTriggerProps, LinkProps } from '@kvirn-ui/react'
import { useMergedRef } from '@kvirn-ui/react/internal'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  ComponentPropsWithRef,
  ElementType,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
} from 'react'
import { isWideViewport, wideViewportQuery } from '../is-wide-viewport.ts'

interface MainMenuContextValue {
  openIds: readonly string[]
  setTopicOpen: (id: string, nextOpen: boolean) => void
}

interface MainMenuTopicContextValue {
  isOpen: boolean
  hasCurrent: boolean
  registerCurrent: () => () => void
}

const MainMenuContext = createContext<MainMenuContextValue | null>(null)
const MainMenuTopicContext = createContext<MainMenuTopicContextValue | null>(null)

export interface MainMenuRootProps extends Omit<
  ComponentPropsWithRef<'nav'>,
  'aria-label' | 'aria-labelledby'
> {
  /** The navigation's name, in the page's language, such as `Main menu`. */
  label: string
}

export type MainMenuTopicProps = ComponentPropsWithRef<'li'>
export type MainMenuTopicButtonProps = DisclosureTriggerProps
export type MainMenuTopicPanelProps = Omit<DisclosurePanelProps, 'children'> &
  Pick<ComponentPropsWithRef<'ul'>, 'children'>

/**
 * `current` is `page` on the page's own link, or `true` on the deepest item shown when the page
 * isn't listed. A link in a closed topic is never exposed as current, whatever it is given.
 */
export type MainMenuLinkProps<Component extends ElementType = 'a'> = LinkProps<Component>

const isMarkedCurrent = (current: LinkProps<'a'>['current']): boolean =>
  current !== undefined && current !== false

/**
 * The main navigation: the APG Disclosure Navigation pattern from `Navigation` and `Disclosure`.
 * Put `MainMenu.Link`s and `MainMenu.Topic`s in it. A topic is a button that opens a list of
 * links; it is never `role="menu"`, opens on activation only and has no arrow keys. Wide, one
 * topic is open at a time. Contract: main-menu.a11y.md.
 */
export function MainMenuRoot({
  label,
  children,
  ref,
  ...otherProps
}: MainMenuRootProps): ReactElement {
  const [openIds, setOpenIds] = useState<readonly string[]>([])
  const rootRef = useRef<HTMLElement>(null)
  const mergedRef = useMergedRef(ref, rootRef)
  const closeAll = () => setOpenIds([])

  const setTopicOpen = useCallback((id: string, nextOpen: boolean) => {
    setOpenIds((current) => {
      if (!nextOpen) return current.filter((openId) => openId !== id)
      // Wide, a panel overlays the page, so one at a time. Narrow, panels are in flow and independent.
      return isWideViewport() ? [id] : [...current, id]
    })
  }, [])

  // A press outside the nav closes the open panel and leaves focus where the user pressed.
  const hasOpen = openIds.length > 0
  useEffect(() => {
    if (!hasOpen) return undefined
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!isWideViewport()) return
      const root = rootRef.current
      if (root !== null && event.target instanceof Node && !root.contains(event.target)) {
        setOpenIds([])
      }
    }
    document.addEventListener('pointerdown', closeOnOutsidePress)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePress)
  }, [hasOpen])

  // State survives a resize: crossing to wide keeps the topic that holds focus, else the last opened.
  useEffect(() => {
    const query = window.matchMedia(wideViewportQuery)
    const keepOne = () => {
      if (!query.matches) return
      const focusedId =
        document.activeElement?.closest<HTMLElement>('[data-main-menu-topic]')?.dataset[
          'mainMenuTopic'
        ]
      setOpenIds((current) => {
        if (current.length < 2) return current
        const kept =
          focusedId !== undefined && current.includes(focusedId) ? focusedId : current.at(-1)
        return kept === undefined ? [] : [kept]
      })
    }
    query.addEventListener('change', keepOne)
    return () => query.removeEventListener('change', keepOne)
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || !hasOpen || !(event.target instanceof Element)) return
    // The topic whose button or panel holds focus.
    const holder = event.target.closest<HTMLElement>('[data-main-menu-topic]')
    const topicId = holder?.dataset['mainMenuTopic']
    if (topicId !== undefined && openIds.includes(topicId)) {
      event.preventDefault()
      setOpenIds((current) => current.filter((openId) => openId !== topicId))
      holder?.querySelector<HTMLElement>('.kv-mega-menu-trigger')?.focus()
      return
    }
    // Wide, a panel stays open after Tab leaves it: Escape from anywhere in the nav closes it.
    if (isWideViewport()) {
      event.preventDefault()
      closeAll()
    }
  }

  // Wide, a panel closes when focus leaves the nav, so it never covers what has focus (2.4.11).
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!hasOpen || !isWideViewport()) return
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    closeAll()
  }

  const onClick = (event: MouseEvent<HTMLElement>) => {
    if (event.target instanceof Element && event.target.closest('a[href]') !== null) closeAll()
  }

  const context = useMemo(() => ({ openIds, setTopicOpen }), [openIds, setTopicOpen])

  return (
    <MainMenuContext.Provider value={context}>
      <Navigation.Root
        label={label}
        ref={mergedRef}
        {...mergeProps(otherProps, {
          className: 'kv-mega-menu kv-navigation--horizontal',
          onKeyDown,
          onBlur,
          onClick,
        })}
      >
        <Navigation.List>{children}</Navigation.List>
      </Navigation.Root>
    </MainMenuContext.Provider>
  )
}
MainMenuRoot.displayName = 'MainMenu.Root'

function MainMenuItemLink({
  itemClassName,
  ...linkProps
}: LinkProps<'a'> & { itemClassName?: string }): ReactElement {
  const topic = useContext(MainMenuTopicContext)
  const registerCurrent = topic?.registerCurrent
  const isCurrent = isMarkedCurrent(linkProps.current)
  // The trail of the topic button follows the page's link, shown or not.
  useLayoutEffect(() => (isCurrent ? registerCurrent?.() : undefined), [isCurrent, registerCurrent])
  // Never current inside a hidden group: the link is current only while it is shown.
  const current = topic === null || topic.isOpen ? linkProps.current : undefined
  return (
    <Navigation.Item className={itemClassName}>
      <Link.Root {...linkProps} current={current} />
    </Navigation.Item>
  )
}

/** A top-level page link, or a link in a topic's panel: a `<li>` with a native `<a href>`. */
export function MainMenuLink<Component extends ElementType = 'a'>(
  props: MainMenuLinkProps<Component>,
): ReactElement
export function MainMenuLink(props: LinkProps<'a'>): ReactElement {
  return <MainMenuItemLink {...props} />
}
MainMenuLink.displayName = 'MainMenu.Link'

/**
 * The first link of a topic's panel, the topic's own page: the trigger is a button and not a
 * link, so the page it stands for needs one.
 */
export function MainMenuOverview<Component extends ElementType = 'a'>(
  props: MainMenuLinkProps<Component>,
): ReactElement
export function MainMenuOverview(props: LinkProps<'a'>): ReactElement {
  return <MainMenuItemLink {...props} itemClassName="kv-mega-menu-overview" />
}
MainMenuOverview.displayName = 'MainMenu.Overview'

/**
 * A topic with sub-pages: a `<li>` that owns the open state of its `TopicButton` and
 * `TopicPanel`. A topic with no sub-pages is a `MainMenu.Link`.
 */
export function MainMenuTopic({ children, ...otherProps }: MainMenuTopicProps): ReactElement {
  const menu = useContext(MainMenuContext)
  const id = useId()
  const [currentCount, setCurrentCount] = useState(0)
  const registerCurrent = useCallback(() => {
    setCurrentCount((count) => count + 1)
    return () => setCurrentCount((count) => count - 1)
  }, [])
  const isOpen = menu?.openIds.includes(id) ?? false
  const context = useMemo(
    () => ({ isOpen, hasCurrent: currentCount > 0, registerCurrent }),
    [isOpen, currentCount, registerCurrent],
  )
  return (
    <Navigation.Item data-main-menu-topic={id} {...otherProps}>
      <Disclosure.Root open={isOpen} onOpenChange={(nextOpen) => menu?.setTopicOpen(id, nextOpen)}>
        <MainMenuTopicContext.Provider value={context}>{children}</MainMenuTopicContext.Provider>
      </Disclosure.Root>
    </Navigation.Item>
  )
}
MainMenuTopic.displayName = 'MainMenu.Topic'

/**
 * The topic's `<button>`, with `aria-expanded`, `aria-controls` and a chevron. `data-trail` is set
 * while a link inside the topic is the page, as a visual trail that is not announced.
 */
export function MainMenuTopicButton(props: MainMenuTopicButtonProps): ReactElement {
  const topic = useContext(MainMenuTopicContext)
  return (
    <Disclosure.Trigger
      {...mergeProps(props, {
        className: 'kv-mega-menu-trigger',
        'data-trail': topic?.hasCurrent === true ? '' : undefined,
      })}
    />
  )
}
MainMenuTopicButton.displayName = 'MainMenu.TopicButton'

/** The topic's links: a `<div>`, `hidden` while closed, with a list inside. Start it with `MainMenu.Overview`. */
export function MainMenuTopicPanel({
  children,
  ...otherProps
}: MainMenuTopicPanelProps): ReactElement {
  return (
    <Disclosure.Panel {...mergeProps(otherProps, { className: 'kv-mega-menu-panel' })}>
      <Navigation.List className="kv-mega-menu-list">{children}</Navigation.List>
    </Disclosure.Panel>
  )
}
MainMenuTopicPanel.displayName = 'MainMenu.TopicPanel'

export const MainMenu = {
  Root: MainMenuRoot,
  Link: MainMenuLink,
  Overview: MainMenuOverview,
  Topic: MainMenuTopic,
  TopicButton: MainMenuTopicButton,
  TopicPanel: MainMenuTopicPanel,
} as const

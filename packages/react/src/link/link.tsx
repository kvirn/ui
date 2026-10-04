'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import type { RegisteredLinkComponent } from '../provider/register.ts'
import { useLinkComponent } from '../provider/use-link-component.ts'
import { useMessages } from '../provider/use-messages.ts'
import { renderPart, takeRenderElementProps } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useLink } from './use-link.ts'
import type { LinkCurrent } from './use-link.ts'

export type { LinkCurrent } from './use-link.ts'

/** What `render` receives as its second argument. */
export interface LinkState {
  isCurrent: boolean
  isFocusVisible: boolean
  opensInNewTab: boolean
}

/**
 * The registered router link's props, or `<a>` props when nothing is
 * registered. `aria-current` is set through `current` only.
 */
export type LinkElementProps = Omit<ComponentPropsWithRef<RegisteredLinkComponent>, 'aria-current'>

export type LinkProps = LinkElementProps & {
  /** Marks the link as the current item in a set, as `aria-current`. Link doesn't detect it. */
  current?: LinkCurrent | undefined
  /** Per-instance message overrides for this link and its NewTabNotice. */
  messages?: Partial<KvirnMessages['link']> | undefined
  /** Change the element, for example `render={<a />}` to bypass the router for a download. */
  render?: RenderProp<LinkElementProps, LinkState> | undefined
}

export interface LinkNewTabNoticeProps extends ComponentPropsWithRef<'span'> {
  /** Your own text. Wins over every message. */
  children?: ReactNode
  render?: RenderProp<ComponentPropsWithRef<'span'>, Record<string, never>> | undefined
}

interface LinkContextValue {
  messages: Partial<KvirnMessages['link']> | undefined
  /** A NewTabNotice inside the link registers itself. Returns the unregister function. */
  registerNewTabNotice: () => () => void
}

const LinkContext = createContext<LinkContextValue | null>(null)

const noticeState: Record<string, never> = {}

/** Empty, whitespace-only or boolean children fall through to the message. */
function hasOwnText(children: ReactNode): boolean {
  if (children === undefined || children === null || typeof children === 'boolean') {
    return false
  }
  return typeof children !== 'string' || children.trim() !== ''
}

function describeElement(element: Element | null): string {
  return element === null ? 'nothing it could reference' : `<${element.tagName.toLowerCase()}>`
}

export function LinkRoot({
  current,
  messages,
  render,
  target,
  rel,
  ref,
  ...otherProps
}: LinkProps): ReactElement {
  // A render element's own target and rel win, and go through useLink so a new
  // tab still gets `noopener noreferrer` and the missing-notice check.
  const { render: renderWithoutTarget, takenProps } = takeRenderElementProps(render, [
    'target',
    'rel',
  ])
  const link = useLink({
    current,
    target: typeof takenProps.target === 'string' ? takenProps.target : target,
    rel: typeof takenProps.rel === 'string' ? takenProps.rel : rel,
    messages,
  })
  const linkComponent = useLinkComponent()
  const elementRef = useRef<HTMLAnchorElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)
  const newTabNoticeCount = useRef(0)

  const registerNewTabNotice = useCallback(() => {
    newTabNoticeCount.current += 1
    return () => {
      newTabNoticeCount.current -= 1
    }
  }, [])
  const context = useMemo(
    () => ({ messages, registerNewTabNotice }),
    [messages, registerNewTabNotice],
  )

  // Runs after the NewTabNotice children's effects, so their registration is visible here.
  useEffect(() => {
    const element = elementRef.current
    if (element === null || element.tagName !== 'A') {
      const rendered = describeElement(element)
      warnOnce(
        `link-not-an-anchor:${rendered}`,
        `A Link must render an <a href> and forward its ref, but it rendered ${rendered}. Check the registered link component or the render prop.`,
      )
    }
    if (link.opensInNewTab && newTabNoticeCount.current === 0) {
      const text = element?.textContent?.trim() ?? ''
      warnOnce(
        `link-new-tab-without-notice:${text}`,
        `The link "${text}" opens in a new tab (target="_blank") but has no <Link.NewTabNotice />, so users aren't told before it opens (WCAG 3.2.5, G201). Put <Link.NewTabNotice /> inside the link.`,
      )
    }
  })

  return (
    <LinkContext.Provider value={context}>
      {renderPart({
        render: renderWithoutTarget,
        defaultElement: linkComponent,
        partProps: { ...mergeProps(otherProps, link.linkProps), ref: mergedRef },
        state: {
          isCurrent: link.isCurrent,
          isFocusVisible: link.isFocusVisible,
          opensInNewTab: link.opensInNewTab,
        },
      })}
    </LinkContext.Provider>
  )
}
LinkRoot.displayName = 'Link.Root'

/**
 * Tells users that the link opens in a new tab: `(öppnas i en ny flik)` from
 * `link.newTabNotice`. It's part of the link's name. Hide it visually if you must, but keep
 * it for screen readers (WCAG 3.2.5, G201).
 */
export function LinkNewTabNotice({
  children,
  render,
  ...otherProps
}: LinkNewTabNoticeProps): ReactElement {
  const link = useContext(LinkContext)
  const linkMessages = useMessages('link', link?.messages)

  useEffect(() => link?.registerNewTabNotice(), [link])

  return renderPart({
    render,
    defaultElement: 'span',
    // Your class joins the part's class, so the theme keeps styling the notice.
    partProps: {
      ...mergeProps({ className: 'kv-link-new-tab-notice' }, otherProps),
      children: hasOwnText(children) ? children : linkMessages.newTabNotice,
    },
    state: noticeState,
  })
}
LinkNewTabNotice.displayName = 'Link.NewTabNotice'

/**
 * A native `<a href>`, written `Link.Root`, rendered by the app's registered router link, with
 * `aria-current`, safe new-tab `rel`, and a translated new-tab notice (contract: link.a11y.md).
 * No `disabled` prop: a disabled link isn't a thing. The callable `<Link>` still works and is the
 * same component as `Link.Root`, but it isn't shown in docs.
 *
 * @example
 * <Link.Root href="/ansok" current="page">Ansök</Link.Root>
 * <Link.Root href="https://www.digg.se/" target="_blank">
 *   Digg <Link.NewTabNotice />
 * </Link.Root>
 */
export const Link = Object.assign(LinkRoot, { Root: LinkRoot, NewTabNotice: LinkNewTabNotice })

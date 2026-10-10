'use client'

import type { KvirnMessages } from '@kvirn-ui/i18n'
import { Alert, Link, mergeProps } from '@kvirn-ui/react'
import type { AlertCloseProps, LinkProps } from '@kvirn-ui/react'
import { useContext, useId, useMemo, useState } from 'react'
import type {
  ComponentPropsWithRef,
  ElementType,
  HTMLAttributes,
  MouseEvent,
  ReactElement,
  Ref,
} from 'react'
import { PageFrameContext } from '../../page-frame/page-frame-context.ts'
import { SiteAlertContext } from './site-alert-context.ts'

export interface SiteAlertRootProps extends Omit<
  ComponentPropsWithRef<'section'>,
  'aria-label' | 'aria-labelledby'
> {
  /** `warning` (default) for something that affects people, `info` for news they may want. */
  tone?: 'warning' | 'info' | undefined
  /** Called when `SiteAlert.Close` dismisses the alert, so the site can remember it for the session. */
  onDismiss?: (() => void) | undefined
  /** The id of `main`, where focus goes on dismiss. Default: the `PageFrame`'s, else `main`. */
  mainId?: string | undefined
  /** Per-instance message overrides: the status words and `close`. */
  messages?: Partial<KvirnMessages['alert']> | undefined
}

type ElementProps = HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> | undefined }

export type SiteAlertTitleProps = Omit<ElementProps, 'id'>
export type SiteAlertBodyProps = ElementProps
export type SiteAlertLinkProps<Component extends ElementType = 'a'> = LinkProps<Component>
export type SiteAlertCloseProps = AlertCloseProps

/**
 * A notice for the whole site, as a named region after the banner and before `main`: a
 * `<section>` named by its `SiteAlert.Title`. It is never announced on load and never takes
 * focus. Dismissing removes it. `data-tone` is `warning` or `info`. Contract: site-alert.a11y.md.
 */
export function SiteAlertRoot({
  tone = 'warning',
  onDismiss,
  mainId: mainIdProp,
  messages,
  children,
  ...otherProps
}: SiteAlertRootProps): ReactElement | null {
  const titleId = useId()
  const frame = useContext(PageFrameContext)
  const mainId = mainIdProp ?? frame.mainId
  const [isDismissed, setIsDismissed] = useState(false)
  const context = useMemo(
    () => ({
      titleId,
      dismiss: () => {
        // Focus moves before the alert leaves the DOM, so it is never left on `body`.
        focusMain(mainId, titleId)
        setIsDismissed(true)
        onDismiss?.()
      },
    }),
    [titleId, mainId, onDismiss],
  )
  if (isDismissed) return null

  const StatusRoot = tone === 'info' ? Alert.Info : Alert.Warning
  return (
    <SiteAlertContext.Provider value={context}>
      <StatusRoot
        as="section"
        aria-labelledby={titleId}
        data-tone={tone}
        messages={messages}
        {...mergeProps(otherProps, { className: 'kv-site-alert' })}
      >
        {children}
      </StatusRoot>
    </SiteAlertContext.Provider>
  )
}
SiteAlertRoot.displayName = 'SiteAlert.Root'

/**
 * The one-line headline, a `<p>`: the page has no heading before its `h1`. It starts with the
 * status word. Wrap another language in `lang`.
 */
export function SiteAlertTitle(props: SiteAlertTitleProps): ReactElement {
  const alert = useContext(SiteAlertContext)
  return <Alert.Title as="p" {...props} id={alert?.titleId} />
}
SiteAlertTitle.displayName = 'SiteAlert.Title'

/** The details: a sentence or two, as text or paragraphs. */
export function SiteAlertBody(props: SiteAlertBodyProps): ReactElement {
  return <Alert.Body as="div" {...props} />
}
SiteAlertBody.displayName = 'SiteAlert.Body'

/** The one link to more information: a `Link.Root` in `Alert.Actions`. */
export function SiteAlertLink<Component extends ElementType = 'a'>(
  props: SiteAlertLinkProps<Component>,
): ReactElement
export function SiteAlertLink(props: LinkProps<'a'>): ReactElement {
  return (
    <Alert.Actions>
      <Link.Root {...props} />
    </Alert.Actions>
  )
}
SiteAlertLink.displayName = 'SiteAlert.Link'

/**
 * The close button, named `alert.close`. Pressing it removes the alert, calls `onDismiss` and
 * moves focus to `main`, never `body`. Put it last.
 */
export function SiteAlertClose({ onClick, ...otherProps }: SiteAlertCloseProps): ReactElement {
  const alert = useContext(SiteAlertContext)
  const dismiss = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) alert?.dismiss()
  }
  return <Alert.Close {...otherProps} onClick={dismiss} />
}
SiteAlertClose.displayName = 'SiteAlert.Close'

export const SiteAlert = {
  Root: SiteAlertRoot,
  Title: SiteAlertTitle,
  Body: SiteAlertBody,
  Link: SiteAlertLink,
  Close: SiteAlertClose,
} as const

function focusMain(mainId: string, titleId: string) {
  const target = document.getElementById(mainId) ?? headingAfter(document.getElementById(titleId))
  if (target === null) return
  // The target is not focusable by itself: give it `tabindex` until it loses focus, as the skip link does.
  if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1')
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
  }
  target.focus()
}

// With no `main` to find, the first heading after the alert is the next place in the page.
function headingAfter(from: HTMLElement | null): HTMLElement | null {
  const region = from?.closest('[data-tone]') ?? null
  if (region === null) return null
  const headings = document.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')
  for (const heading of headings) {
    if (
      !region.contains(heading) &&
      region.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING
    ) {
      return heading
    }
  }
  return null
}

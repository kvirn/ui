'use client'

import { Button, ButtonGroup, Heading, Link, Prose, Section, mergeProps } from '@kvirn-ui/react'
import type { ButtonGroupProps, ButtonProps, HeadingProps, LinkProps } from '@kvirn-ui/react'
import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from 'react'
import type {
  ComponentPropsWithRef,
  ElementType,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
} from 'react'

export type CookieConsentDecision = 'accepted' | 'rejected'

interface CookieConsentContextValue {
  /** `undefined` until the visitor has chosen. */
  decision: CookieConsentDecision | undefined
  choose: (decision: CookieConsentDecision) => void
  headingId: string
  /** True once `choose` ran, so a result shown by a choice takes focus and a remembered one does not. */
  hasChosen: boolean
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

export interface CookieConsentRootProps extends Omit<
  ComponentPropsWithRef<'section'>,
  'aria-label' | 'aria-labelledby'
> {
  /** The state to start in, for a page that remembers the choice. Focus is not moved for it. */
  defaultDecision?: CookieConsentDecision | undefined
  /** Called with the choice. Storing it and setting cookies are the site's. */
  onDecision?: ((decision: CookieConsentDecision) => void) | undefined
}

/** The region's name: an `h2`. Write what it asks, such as `Cookies on this website`. */
export type CookieConsentHeadingProps = Omit<HeadingProps, 'as' | 'size'>
type ElementProps = HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> | undefined }

/** What the cookies are for, in plain words. Gone after a choice. */
export type CookieConsentTextProps = ElementProps
export type CookieConsentActionsProps = ButtonGroupProps
/** The button's words are its children: write them so both choices read alike. */
export type CookieConsentAcceptProps = Omit<ButtonProps, 'type' | 'children'> & {
  children: ReactNode
}
export type CookieConsentRejectProps = Omit<ButtonProps, 'type' | 'children'> & {
  children: ReactNode
}
/** The sentence shown after the choice: what was chosen and where to change it. */
export type CookieConsentAcceptedProps = ComponentPropsWithRef<'p'>
export type CookieConsentRejectedProps = ComponentPropsWithRef<'p'>
export type CookieConsentLinkProps<Component extends ElementType = 'a'> = LinkProps<Component>

function useConsent(partName: string) {
  const consent = useContext(CookieConsentContext)
  if (consent === null) {
    throw new Error(`<CookieConsent.${partName}> must be used inside <CookieConsent.Root>.`)
  }
  return consent
}

/**
 * A request for consent to statistics cookies, in the page's flow: a named region, not a dialog,
 * not a trap, and nothing behind it is inert. It owns the choice (`data-decision` is
 * `undecided`, `accepted` or `rejected`) and moves focus to the result after one. Write the
 * result parts too: both are shown only after their choice. Contract: cookie-consent.a11y.md.
 */
export function CookieConsentRoot({
  defaultDecision,
  onDecision,
  children,
  className,
  ...otherProps
}: CookieConsentRootProps): ReactElement {
  const headingId = useId()
  const [decision, setDecision] = useState<CookieConsentDecision | undefined>(defaultDecision)
  const [hasChosen, setHasChosen] = useState(false)

  // The result part takes focus in its own effect, which runs first. With none written the
  // buttons are gone and focus is on `body`, so it goes to the heading.
  useEffect(() => {
    if (!hasChosen) return
    const heading = document.getElementById(headingId)
    const region = heading?.closest('[data-decision]')
    if (heading !== null && region !== null && !region?.contains(document.activeElement)) {
      heading?.focus()
    }
  }, [hasChosen, decision, headingId])

  const context = useMemo(
    () => ({
      decision,
      choose: (choice: CookieConsentDecision) => {
        setHasChosen(true)
        setDecision(choice)
        onDecision?.(choice)
      },
      headingId,
      hasChosen,
    }),
    [decision, hasChosen, headingId, onDecision],
  )

  return (
    <CookieConsentContext.Provider value={context}>
      <Section
        as="section"
        aria-labelledby={headingId}
        data-decision={decision ?? 'undecided'}
        className={['kv-cookie-consent', className].filter(Boolean).join(' ')}
        {...otherProps}
      >
        {children}
      </Section>
    </CookieConsentContext.Provider>
  )
}
CookieConsentRoot.displayName = 'CookieConsent.Root'

export function CookieConsentHeading(props: CookieConsentHeadingProps): ReactElement {
  const consent = useConsent('Heading')
  return <Heading as="h2" size="heading-4" tabIndex={-1} {...props} id={consent.headingId} />
}
CookieConsentHeading.displayName = 'CookieConsent.Heading'

export function CookieConsentText(props: CookieConsentTextProps): ReactElement | null {
  const consent = useConsent('Text')
  if (consent.decision !== undefined) return null
  return <Prose {...props} />
}
CookieConsentText.displayName = 'CookieConsent.Text'

/** The two choices, side by side at equal weight. Gone after a choice. */
export function CookieConsentActions(props: CookieConsentActionsProps): ReactElement | null {
  const consent = useConsent('Actions')
  if (consent.decision !== undefined) return null
  return <ButtonGroup {...props} />
}
CookieConsentActions.displayName = 'CookieConsent.Actions'

export function CookieConsentAccept(props: CookieConsentAcceptProps) {
  const consent = useConsent('Accept')
  return <Button {...mergeProps(props, { onClick: () => consent.choose('accepted') })} />
}
CookieConsentAccept.displayName = 'CookieConsent.Accept'

export function CookieConsentReject(props: CookieConsentRejectProps) {
  const consent = useConsent('Reject')
  return <Button {...mergeProps(props, { onClick: () => consent.choose('rejected') })} />
}
CookieConsentReject.displayName = 'CookieConsent.Reject'

/**
 * Internal. The result text: `tabindex="-1"` so focus can move to it. It takes focus only when
 * the choice was made on this page, never when the region starts answered.
 */
function CookieConsentResult({
  decision,
  ...otherProps
}: ComponentPropsWithRef<'p'> & { decision: CookieConsentDecision }): ReactElement | null {
  const consent = useConsent(decision === 'accepted' ? 'Accepted' : 'Rejected')
  const resultRef = useRef<HTMLParagraphElement>(null)
  const isShown = consent.decision === decision
  const { hasChosen } = consent

  useEffect(() => {
    if (isShown && hasChosen) resultRef.current?.focus()
  }, [isShown, hasChosen])

  if (!isShown) return null
  return (
    <p
      {...mergeProps(otherProps, { className: 'kv-cookie-consent-result', tabIndex: -1 })}
      ref={resultRef}
    />
  )
}

export function CookieConsentAccepted(props: CookieConsentAcceptedProps): ReactElement | null {
  return <CookieConsentResult {...props} decision="accepted" />
}
CookieConsentAccepted.displayName = 'CookieConsent.Accepted'

export function CookieConsentRejected(props: CookieConsentRejectedProps): ReactElement | null {
  return <CookieConsentResult {...props} decision="rejected" />
}
CookieConsentRejected.displayName = 'CookieConsent.Rejected'

/** The link to the cookies page, where the choice can be changed. Always shown. */
export function CookieConsentLink<Component extends ElementType = 'a'>(
  props: CookieConsentLinkProps<Component>,
): ReactElement
export function CookieConsentLink(props: LinkProps<'a'>): ReactElement {
  return (
    <p className="kv-cookie-consent-more">
      <Link.Root {...props} />
    </p>
  )
}
CookieConsentLink.displayName = 'CookieConsent.Link'

export const CookieConsent = {
  Root: CookieConsentRoot,
  Heading: CookieConsentHeading,
  Text: CookieConsentText,
  Actions: CookieConsentActions,
  Accept: CookieConsentAccept,
  Reject: CookieConsentReject,
  Accepted: CookieConsentAccepted,
  Rejected: CookieConsentRejected,
  Link: CookieConsentLink,
} as const

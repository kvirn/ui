'use client'
import type { AnnouncerPoliteness } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useContext, useEffect } from 'react'
import type { HTMLAttributes, ReactElement, Ref, RefCallback } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { Icon } from '../icon/icon.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { NotificationContext } from './notification-context.ts'
import { useNotification } from './use-notification.ts'
import type { NotificationVariant } from './use-notification.ts'

export type { NotificationVariant } from './use-notification.ts'

/** What `render` receives as its second argument. A notification has no state, so it's empty. */
export type NotificationState = Record<string, never>

/**
 * What a `render` function gets to spread: your attributes, the part's class and a callback ref,
 * which fits any element. Keep `className` to keep the theme's look, or set your own to drop it.
 */
export interface NotificationElementProps extends HTMLAttributes<HTMLElement> {
  ref: RefCallback<HTMLElement>
}

interface NotificationPartComponentProps extends HTMLAttributes<HTMLElement> {
  /** The rendered element, whichever it is: `<div>`, `<section>`, a heading or `<p>`. */
  ref?: Ref<HTMLElement> | undefined
  /**
   * Change the element: `render={<h3 />}` or `render={<p />}` for the Title, or
   * `render={<section aria-labelledby={titleId} />}` for a site-wide notification. Its own
   * semantics apply. A notification adds no role.
   */
  render?: RenderProp<NotificationElementProps, NotificationState> | undefined
}

/** The plain Root: `kv-notification` only. No status class, no icon and no status word. */
export interface NotificationRootProps extends NotificationPartComponentProps {
  /**
   * Announces the Title and Body text once, when the notification mounts, through the shared
   * Announcer (4.1.3): `polite` for the result of what the user just did, `assertive`
   * only for something to act on right now. Set it only on a notification inserted after an
   * action, never on one present at load. Needs a `KvirnProvider`. Default: nothing is
   * announced.
   */
  announce?: AnnouncerPoliteness | undefined
}

/** The four ready-made roots: the plain Root's props, and the status word's messages. */
export interface NotificationStatusRootProps extends NotificationRootProps {
  /** Per-instance override for this root's status word, such as `{ dangerPrefix: 'Viktigt:' }`. */
  messages?: Partial<KvirnMessages['notification']> | undefined
}

export type NotificationTitleProps = NotificationPartComponentProps
export type NotificationBodyProps = NotificationPartComponentProps
export type NotificationActionsProps = NotificationPartComponentProps

const notificationState: NotificationState = Object.freeze({})

interface NotificationRootBaseProps extends NotificationStatusRootProps {
  variant: NotificationVariant | undefined
}

/**
 * Internal. One root: `useNotification` for the classes, the icon and the status word, a
 * context for the parts, and one element. The ready-made roots only choose `variant`.
 */
function NotificationRootBase({
  variant,
  announce,
  messages,
  render,
  ref,
  children,
  ...otherProps
}: NotificationRootBaseProps): ReactElement {
  const notification = useNotification({ variant, announce, messages })
  const { ref: ownRef, ...rootProps } = notification.rootProps
  const elementRef = useMergedRef(ref, ownRef)
  const iconProps = notification.iconProps
  // The class joins a prop's and a render element's own class names (mergeProps), so neither
  // can remove it. The icon is a child, so it stays when the `render` function form spreads
  // the props.
  return (
    <NotificationContext.Provider value={notification}>
      {renderPart({
        render,
        defaultElement: 'div',
        partProps: {
          ...mergeProps(otherProps, rootProps),
          ref: elementRef,
          children:
            iconProps === undefined ? (
              children
            ) : (
              <>
                <Icon {...iconProps} />
                {children}
              </>
            ),
        },
        state: notificationState,
      })}
    </NotificationContext.Provider>
  )
}

/**
 * The plain root: one `<div class="kv-notification">`, with no status class, icon or status
 * word. Use it for your own design: bring your own class, your own `<Icon>` and your own
 * `<span className="kv-notification-status">` with your translated word first in the Title.
 * Dev warning if it gets one of our status classes. The ready-made roots do all of it for you.
 */
export function NotificationRoot(props: NotificationRootProps): ReactElement {
  return <NotificationRootBase {...props} variant={undefined} />
}
NotificationRoot.displayName = 'Notification.Root'

/**
 * A ready-made root for information: the `kv-notification--info` class, the `info` icon and
 * the `notification.infoPrefix` word ("Information:") at the start of the Title.
 */
export function NotificationInfo(props: NotificationStatusRootProps): ReactElement {
  return <NotificationRootBase {...props} variant="info" />
}
NotificationInfo.displayName = 'Notification.Info'

/**
 * A ready-made root for success: the `kv-notification--success` class, the `success` icon and
 * the `notification.successPrefix` word ("Klart:") at the start of the Title.
 */
export function NotificationSuccess(props: NotificationStatusRootProps): ReactElement {
  return <NotificationRootBase {...props} variant="success" />
}
NotificationSuccess.displayName = 'Notification.Success'

/**
 * A ready-made root for a warning: the `kv-notification--warning` class, the `warning` icon and
 * the `notification.warningPrefix` word ("Varning:") at the start of the Title.
 */
export function NotificationWarning(props: NotificationStatusRootProps): ReactElement {
  return <NotificationRootBase {...props} variant="warning" />
}
NotificationWarning.displayName = 'Notification.Warning'

/**
 * A ready-made root for an error or a failure: the `kv-notification--danger` class, the `error`
 * icon and the `notification.dangerPrefix` word ("Fel:") at the start of the Title.
 */
export function NotificationDanger(props: NotificationStatusRootProps): ReactElement {
  return <NotificationRootBase {...props} variant="danger" />
}
NotificationDanger.displayName = 'Notification.Danger'

/** Internal. Warns once when a part is used outside a root. */
function useWarnOutsideRoot(isOutside: boolean, partName: string): void {
  useEffect(() => {
    if (isOutside) {
      warnOnce(
        `notification-${partName.toLowerCase()}-outside-root`,
        `A Notification.${partName} is outside a Notification root, so it has no status word and no announcement. Put it inside Notification.Info, .Success, .Warning, .Danger or .Root.`,
      )
    }
  }, [isOutside, partName])
}

/**
 * The message's title: a heading, `<h2>` by default. Set the level with `render={<h3 />}` to
 * fit the page's outline (1.3.1, 2.4.6), or `render={<p />}` for a one-sentence notification.
 * Inside a ready-made root it starts with the status word in a `kv-notification-status` span
 * (visually hidden by the theme), then a space, then your text. Write the outcome in the user's
 * words, never only the status.
 */
export function NotificationTitle({
  render,
  ref,
  children,
  ...otherProps
}: NotificationTitleProps): ReactElement {
  const notification = useContext(NotificationContext)
  useWarnOutsideRoot(notification === null, 'Title')
  const elementRef = useMergedRef(ref, notification?.titleProps.ref ?? null)
  const statusProps = notification?.statusProps
  return renderPart({
    render,
    defaultElement: 'h2',
    partProps: {
      ...mergeProps(otherProps, { className: 'kv-notification-title' }),
      ref: elementRef,
      children: (
        <>
          {statusProps === undefined ? null : (
            <>
              <span {...statusProps} />{' '}
            </>
          )}
          {children}
        </>
      ),
    },
    state: notificationState,
  })
}
NotificationTitle.displayName = 'Notification.Title'

/** What to do, and by when: one to three short sentences. Optional. */
export function NotificationBody({
  render,
  ref,
  ...otherProps
}: NotificationBodyProps): ReactElement {
  const notification = useContext(NotificationContext)
  useWarnOutsideRoot(notification === null, 'Body')
  const elementRef = useMergedRef(ref, notification?.bodyProps.ref ?? null)
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: {
      ...mergeProps(otherProps, { className: 'kv-notification-body' }),
      ref: elementRef,
    },
    state: notificationState,
  })
}
NotificationBody.displayName = 'Notification.Body'

/**
 * Up to two actions: Links for navigation, Buttons for actions. The theme lays them out as a
 * wrapping row. They aren't announced: users reach them with Tab. Optional.
 */
export function NotificationActions({
  render,
  ref,
  ...otherProps
}: NotificationActionsProps): ReactElement {
  const notification = useContext(NotificationContext)
  useWarnOutsideRoot(notification === null, 'Actions')
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: {
      ...mergeProps(otherProps, { className: 'kv-notification-actions' }),
      ref: elementRef,
    },
    state: notificationState,
  })
}
NotificationActions.displayName = 'Notification.Actions'

/**
 * A status message in the content: something people need to know now, or the result of what
 * they just did (contract: notification.a11y.md). Use `Notification.Info`,
 * `.Success`, `.Warning` or `.Danger`: each shows its status with an icon, a word and a colour,
 * never with colour alone. It doesn't announce itself unless you set `announce`, adds no role
 * or `aria-live` to its box, and never takes focus on its own. Status is a class, not a prop:
 * you choose it by choosing the component. `Notification.Root` is the plain base for your own
 * design. With `@kvirn-ui/theme`, the look is only CSS on the status class.
 *
 * @example
 * <Notification.Warning>
 *   <Notification.Title>Ditt parkeringstillstånd går ut den 12 november 2026</Notification.Title>
 *   <Notification.Body>
 *     <p>Förnya det senast den 5 november.</p>
 *   </Notification.Body>
 *   <Notification.Actions>
 *     <Button>Förnya tillståndet</Button>
 *   </Notification.Actions>
 * </Notification.Warning>
 */
export const Notification = {
  Root: NotificationRoot,
  Info: NotificationInfo,
  Success: NotificationSuccess,
  Warning: NotificationWarning,
  Danger: NotificationDanger,
  Title: NotificationTitle,
  Body: NotificationBody,
  Actions: NotificationActions,
} as const

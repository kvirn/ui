'use client'
import type { AnnouncerPoliteness } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useContext, useEffect, useRef } from 'react'
import type {
  ComponentPropsWithRef,
  HTMLAttributes,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  Ref,
  RefCallback,
} from 'react'
import { useButton } from '../button/use-button.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { Icon } from '../icon/icon.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useMessages } from '../provider/use-messages.ts'
import { renderPart, takeRenderElementProps } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { AlertContext } from './alert-context.ts'
import { useAlert } from './use-alert.ts'
import type { AlertVariant } from './use-alert.ts'

export type { AlertVariant } from './use-alert.ts'

/** What `render` receives as its second argument. An alert has no state, so it's empty. */
export type AlertState = Record<string, never>

/**
 * What a `render` function gets to spread: your attributes, the part's class and a callback ref,
 * which fits any element. Keep `className` to keep the theme's look, or set your own to drop it.
 */
export interface AlertElementProps extends HTMLAttributes<HTMLElement> {
  ref: RefCallback<HTMLElement>
}

interface AlertPartComponentProps extends HTMLAttributes<HTMLElement> {
  /** The rendered element, whichever it is: `<div>`, `<section>`, a heading or `<p>`. */
  ref?: Ref<HTMLElement> | undefined
  /**
   * Change the element: `render={<h3 />}` or `render={<p />}` for the Title, or
   * `render={<section aria-labelledby={titleId} />}` for a site-wide alert. Its own
   * semantics apply. An alert adds no role.
   */
  render?: RenderProp<AlertElementProps, AlertState> | undefined
}

/** The plain Root: `kv-alert` only. No status class, no icon and no status word. */
export interface AlertRootProps extends AlertPartComponentProps {
  /**
   * Announces the Title and Body text once, when the alert mounts, through the shared
   * Announcer (4.1.3): `polite` for the result of what the user just did, `assertive`
   * only for something to act on right now. Set it only on an alert inserted after an
   * action, never on one present at load. Needs a `KvirnProvider`. Default: nothing is
   * announced.
   */
  announce?: AnnouncerPoliteness | undefined
}

/** The four ready-made roots: the plain Root's props, and the status word's messages. */
export interface AlertStatusRootProps extends AlertRootProps {
  /** Per-instance override for this root's status word, such as `{ dangerPrefix: 'Viktigt:' }`. */
  messages?: Partial<KvirnMessages['alert']> | undefined
  /**
   * Replaces the status icon, such as a `kv-spinner` for a job in progress. Give it
   * `className="kv-alert-icon"` and `aria-hidden="true"`: the status stays in the word.
   */
  icon?: ReactNode | undefined
}

export type AlertTitleProps = AlertPartComponentProps
export type AlertBodyProps = AlertPartComponentProps
export type AlertActionsProps = AlertPartComponentProps

/** What `render` receives as its second argument for `Alert.Close`. */
export interface AlertCloseState {
  isDisabled: boolean
  isFocusVisible: boolean
}

/**
 * `aria-disabled` and `type` are left out: the close button is always `type="button"`, and
 * `disabled` blocks `onClick`.
 */
export interface AlertCloseProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'aria-disabled' | 'type'
> {
  /**
   * Per-instance override of the button's name (`close`). Without it, the alert root's
   * `messages`, then the provider's, then the built-in English text.
   */
  messages?: Partial<KvirnMessages['alert']> | undefined
  /**
   * Change the element. It must still be a `<button>`. An element's own `onClick` is gated like
   * the button's. In the function form, keep `className` and the handlers you spread.
   */
  render?: RenderProp<ComponentPropsWithRef<'button'>, AlertCloseState> | undefined
}

const isClickHandler = (value: unknown): value is MouseEventHandler<HTMLButtonElement> =>
  typeof value === 'function'

const alertState: AlertState = Object.freeze({})

interface AlertRootBaseProps extends AlertStatusRootProps {
  variant: AlertVariant | undefined
}

/**
 * Internal. One root: `useAlert` for the classes, the icon and the status word, a
 * context for the parts, and one element. The ready-made roots only choose `variant`.
 */
function AlertRootBase({
  variant,
  announce,
  messages,
  icon,
  render,
  ref,
  children,
  ...otherProps
}: AlertRootBaseProps): ReactElement {
  const alert = useAlert({ variant, announce, messages })
  const { ref: ownRef, ...rootProps } = alert.rootProps
  const elementRef = useMergedRef(ref, ownRef)
  const iconProps = alert.iconProps
  // The class joins a prop's and a render element's own class names (mergeProps), so neither
  // can remove it. The icon is a child, so it stays when the `render` function form spreads
  // the props.
  return (
    <AlertContext.Provider value={alert}>
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
                {icon === undefined ? <Icon {...iconProps} /> : icon}
                {children}
              </>
            ),
        },
        state: alertState,
      })}
    </AlertContext.Provider>
  )
}

/**
 * The plain root: one `<div class="kv-alert">`, with no status class, icon or status
 * word. Use it for your own design: bring your own class, your own `<Icon>` and your own
 * `<span className="kv-alert-status">` with your translated word first in the Title.
 * Dev warning if it gets one of our status classes. The ready-made roots do all of it for you.
 */
export function AlertRoot(props: AlertRootProps): ReactElement {
  return <AlertRootBase {...props} variant={undefined} />
}
AlertRoot.displayName = 'Alert.Root'

/**
 * A ready-made root for information: the `kv-alert--info` class, the `info` icon and
 * the `alert.infoPrefix` word ("Information:") at the start of the Title.
 */
export function AlertInfo(props: AlertStatusRootProps): ReactElement {
  return <AlertRootBase {...props} variant="info" />
}
AlertInfo.displayName = 'Alert.Info'

/**
 * A ready-made root for success: the `kv-alert--success` class, the `success` icon and
 * the `alert.successPrefix` word ("Klart:") at the start of the Title.
 */
export function AlertSuccess(props: AlertStatusRootProps): ReactElement {
  return <AlertRootBase {...props} variant="success" />
}
AlertSuccess.displayName = 'Alert.Success'

/**
 * A ready-made root for a warning: the `kv-alert--warning` class, the `warning` icon and
 * the `alert.warningPrefix` word ("Varning:") at the start of the Title.
 */
export function AlertWarning(props: AlertStatusRootProps): ReactElement {
  return <AlertRootBase {...props} variant="warning" />
}
AlertWarning.displayName = 'Alert.Warning'

/**
 * A ready-made root for an error or a failure: the `kv-alert--danger` class, the `error`
 * icon and the `alert.dangerPrefix` word ("Fel:") at the start of the Title.
 */
export function AlertDanger(props: AlertStatusRootProps): ReactElement {
  return <AlertRootBase {...props} variant="danger" />
}
AlertDanger.displayName = 'Alert.Danger'

/** Internal. Warns once when a part is used outside a root. */
function useWarnOutsideRoot(isOutside: boolean, partName: string): void {
  useEffect(() => {
    if (isOutside) {
      warnOnce(
        `alert-${partName.toLowerCase()}-outside-root`,
        `An Alert.${partName} is outside an Alert root, so it has no status word and no announcement. Put it inside Alert.Info, .Success, .Warning, .Danger or .Root.`,
      )
    }
  }, [isOutside, partName])
}

/**
 * The message's title: a heading, `<h2>` by default. Set the level with `render={<h3 />}` to
 * fit the page's outline (1.3.1, 2.4.6), or `render={<p />}` for a one-sentence alert.
 * Inside a ready-made root it starts with the status word in a `kv-alert-status` span
 * (visually hidden by the theme), then a space, then your text. Write the outcome in the user's
 * words, never only the status.
 */
export function AlertTitle({
  render,
  ref,
  children,
  ...otherProps
}: AlertTitleProps): ReactElement {
  const alert = useContext(AlertContext)
  useWarnOutsideRoot(alert === null, 'Title')
  const elementRef = useMergedRef(ref, alert?.titleProps.ref ?? null)
  const statusProps = alert?.statusProps
  return renderPart({
    render,
    defaultElement: 'h2',
    partProps: {
      ...mergeProps(otherProps, { className: 'kv-alert-title' }),
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
    state: alertState,
  })
}
AlertTitle.displayName = 'Alert.Title'

/** What to do, and by when: one to three short sentences. Optional. */
export function AlertBody({ render, ref, ...otherProps }: AlertBodyProps): ReactElement {
  const alert = useContext(AlertContext)
  useWarnOutsideRoot(alert === null, 'Body')
  const elementRef = useMergedRef(ref, alert?.bodyProps.ref ?? null)
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: {
      ...mergeProps(otherProps, { className: 'kv-alert-body' }),
      ref: elementRef,
    },
    state: alertState,
  })
}
AlertBody.displayName = 'Alert.Body'

/**
 * Up to two actions: Links for navigation, Buttons for actions. The theme lays them out as a
 * wrapping row. They aren't announced: users reach them with Tab. Optional.
 */
export function AlertActions({ render, ref, ...otherProps }: AlertActionsProps): ReactElement {
  const alert = useContext(AlertContext)
  useWarnOutsideRoot(alert === null, 'Actions')
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: {
      ...mergeProps(otherProps, { className: 'kv-alert-actions' }),
      ref: elementRef,
    },
    state: alertState,
  })
}
AlertActions.displayName = 'Alert.Actions'

/**
 * The optional close (dismiss) button: a native `<button type="button">` with the decorative
 * `close` icon, named by `alert.close` ("Stäng meddelandet"). The Alert owns no open or closed
 * state: remove the alert in `onClick`, then move focus to a sensible place, because the button
 * that had focus is gone (WCAG 2.4.3). Put it last in the root: the theme shows it at the inline
 * end of the first line, and it is the last Tab stop of the alert. It never changes how the
 * alert is announced. Give `children` for a visible label of your own, which then names it.
 */
export function AlertClose({
  disabled,
  onClick,
  messages,
  render,
  ref,
  children,
  ...otherProps
}: AlertCloseProps): ReactElement {
  const alert = useContext(AlertContext)
  useWarnOutsideRoot(alert === null, 'Close')
  const ownMessages = useMessages('alert', messages)
  // The root's own override of `close` counts, unless this button has its own.
  const name =
    messages?.close === undefined && alert !== null
      ? alert.closeProps['aria-label']
      : ownMessages.close
  // `null`, `false` and `''` render nothing, so they leave the icon and the name in place.
  const hasVisibleText =
    children !== undefined && children !== null && children !== false && children !== ''
  // The element's onClick goes through useButton too, so a disabled button blocks it.
  const { render: renderWithoutClick, takenProps } = takeRenderElementProps(render, ['onClick'])
  const elementOnClick = takenProps.onClick
  const activationHandler = isClickHandler(elementOnClick)
    ? mergeProps({ onClick }, { onClick: elementOnClick }).onClick
    : onClick
  const button = useButton({ disabled, onClick: activationHandler })
  const elementRef = useRef<HTMLButtonElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)

  useEffect(() => {
    const element = elementRef.current
    if (element !== null && element.tagName !== 'BUTTON') {
      const rendered = `<${element.tagName.toLowerCase()}>`
      warnOnce(
        `alert-close-not-a-button:${rendered}`,
        `<Alert.Close render> must render a <button> and forward its ref, but it rendered ${rendered}. Keyboard activation and the disabled state come from the native element (WCAG 4.1.2).`,
      )
    }
  })

  return renderPart({
    render: renderWithoutClick,
    defaultElement: 'button',
    partProps: {
      // The consumer's props come last, so their own `aria-label` replaces ours.
      ...mergeProps(
        {
          ...button.buttonProps,
          // Not the Button's look: a quiet icon button of the alert's own.
          className: 'kv-alert-close',
          ...(hasVisibleText ? {} : { 'aria-label': name }),
        },
        otherProps,
      ),
      ref: mergedRef,
      children: hasVisibleText ? children : <Icon name="close" />,
    },
    state: { isDisabled: button.isDisabled, isFocusVisible: button.isFocusVisible },
  })
}
AlertClose.displayName = 'Alert.Close'

/**
 * A status message in the content: something people need to know now, or the result of what
 * they just did (contract: alert.a11y.md). Use `Alert.Info`,
 * `.Success`, `.Warning` or `.Danger`: each shows its status with an icon, a word and a colour,
 * never with colour alone. It doesn't announce itself unless you set `announce`, adds no role
 * or `aria-live` to its box, and never takes focus on its own. Status is a class, not a prop:
 * you choose it by choosing the component. `Alert.Root` is the plain base for your own
 * design. With `@kvirn-ui/theme`, the look is only CSS on the status class.
 *
 * @example
 * <Alert.Warning>
 *   <Alert.Title>Ditt parkeringstillstånd går ut den 12 november 2026</Alert.Title>
 *   <Alert.Body>
 *     <p>Förnya det senast den 5 november.</p>
 *   </Alert.Body>
 *   <Alert.Actions>
 *     <Button>Förnya tillståndet</Button>
 *   </Alert.Actions>
 *   <Alert.Close onClick={dismiss} />
 * </Alert.Warning>
 */
export const Alert = {
  Root: AlertRoot,
  Info: AlertInfo,
  Success: AlertSuccess,
  Warning: AlertWarning,
  Danger: AlertDanger,
  Title: AlertTitle,
  Body: AlertBody,
  Actions: AlertActions,
  Close: AlertClose,
} as const

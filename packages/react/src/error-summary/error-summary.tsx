'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useContext, useEffect } from 'react'
import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, Ref, RefCallback } from 'react'
import { Alert } from '../alert/alert.tsx'
import type { AlertElementProps, AlertState } from '../alert/alert.tsx'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { ErrorSummaryContext } from './error-summary-context.ts'
import { useErrorSummary } from './use-error-summary.ts'

/** What `render` receives as its second argument. An error summary has no state, so it's empty. */
export type ErrorSummaryState = Record<string, never>

/** What a `render` function gets to spread: your attributes, the part's props and a callback ref. */
export type ErrorSummaryElementProps = AlertElementProps

export interface ErrorSummaryRootProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement> | undefined
  /** Moves focus to the summary on mount and each time this changes: pass the submit count. */
  focusKey?: string | number | undefined
  /** Puts "Fel:" before the page title while the summary is shown. Off by default. */
  prefixDocumentTitle?: boolean | undefined
  /** Per-instance overrides: the title and the page title prefix. */
  messages?: Partial<KvirnMessages['errorSummary']> | undefined
  /** Change the element: `render={(props) => <Alert.Danger {...props} />}` is the default. */
  render?: RenderProp<ErrorSummaryElementProps, AlertState> | undefined
}

interface ErrorSummaryPartComponentProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement> | undefined
  render?: RenderProp<ErrorSummaryElementProps, ErrorSummaryState> | undefined
}

export type ErrorSummaryTitleProps = ErrorSummaryPartComponentProps
export type ErrorSummaryListProps = ErrorSummaryPartComponentProps
export type ErrorSummaryItemProps = ErrorSummaryPartComponentProps

/** What a `render` function of the link gets to spread. */
export interface ErrorSummaryLinkElementProps extends Omit<ComponentPropsWithRef<'a'>, 'ref'> {
  ref: RefCallback<HTMLAnchorElement>
}

export interface ErrorSummaryLinkProps extends Omit<ComponentPropsWithRef<'a'>, 'href'> {
  /** The id of the control the error is about, or of a group's first option. Sets `href="#id"`. */
  controlId: string
  /** Change the element: `render={<a />}`. */
  render?: RenderProp<ErrorSummaryLinkElementProps, ErrorSummaryState> | undefined
}

const errorSummaryState: ErrorSummaryState = Object.freeze({})

function useWarnOutsideRoot(isOutside: boolean, partName: string): void {
  useEffect(() => {
    if (isOutside) {
      warnOnce(
        `error-summary-${partName.toLowerCase()}-outside-root`,
        `An ErrorSummary.${partName} is outside an ErrorSummary.Root, so it has no focus move or link handler. Put it inside ErrorSummary.Root.`,
      )
    }
  }, [isOutside, partName])
}

/**
 * The summary: an `Alert.Danger` (icon, status word, danger colour) that is a named group,
 * takes focus when it appears and again when `focusKey` changes, and is never announced through a
 * live region. `render` replaces the Alert.
 */
export function ErrorSummaryRoot({
  focusKey,
  prefixDocumentTitle,
  messages,
  render,
  ref,
  children,
  ...otherProps
}: ErrorSummaryRootProps): ReactElement {
  const errorSummary = useErrorSummary({ focusKey, prefixDocumentTitle, messages })
  const { ref: ownRef, ...rootProps } = errorSummary.rootProps
  const elementRef = useMergedRef(ref, ownRef)
  const partProps = { ...mergeProps(otherProps, rootProps), ref: elementRef, children }
  return (
    <ErrorSummaryContext.Provider value={errorSummary}>
      {renderPart({
        render,
        defaultElement: Alert.Danger,
        partProps,
        state: errorSummaryState,
      })}
    </ErrorSummaryContext.Provider>
  )
}
ErrorSummaryRoot.displayName = 'ErrorSummary.Root'

/**
 * The heading, an `h2` by default (`render` for another level), with the status word first.
 * Without children it reads `errorSummary.title`.
 */
export function ErrorSummaryTitle({
  render,
  ref,
  children,
  ...otherProps
}: ErrorSummaryTitleProps): ReactElement {
  const errorSummary = useContext(ErrorSummaryContext)
  useWarnOutsideRoot(errorSummary === null, 'Title')
  return (
    <Alert.Title
      {...mergeProps(otherProps, errorSummary?.titleProps ?? {})}
      ref={ref}
      render={render}
    >
      {children ?? errorSummary?.title}
    </Alert.Title>
  )
}
ErrorSummaryTitle.displayName = 'ErrorSummary.Title'

function useErrorSummaryPart(
  { render, ref, ...otherProps }: ErrorSummaryPartComponentProps,
  partProps: { className: string; role?: string },
  defaultElement: 'ul' | 'li',
): ReactElement {
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    render,
    defaultElement,
    partProps: { ...mergeProps(otherProps, partProps), ref: elementRef },
    state: errorSummaryState,
  })
}

/** The list of problems: a `<ul>`. */
export function ErrorSummaryList(props: ErrorSummaryListProps): ReactElement {
  const errorSummary = useContext(ErrorSummaryContext)
  useWarnOutsideRoot(errorSummary === null, 'List')
  return useErrorSummaryPart(
    props,
    errorSummary?.listProps ?? { className: 'kv-error-summary-list', role: 'list' },
    'ul',
  )
}
ErrorSummaryList.displayName = 'ErrorSummary.List'

/** One problem: an `<li>` holding a Link. */
export function ErrorSummaryItem(props: ErrorSummaryItemProps): ReactElement {
  return useErrorSummaryPart(props, { className: 'kv-error-summary-item' }, 'li')
}
ErrorSummaryItem.displayName = 'ErrorSummary.Item'

/**
 * A link to the control: `<a href="#controlId">`. Its text is the field's own error text, worded
 * the same. Activating it moves focus to the control and scrolls its label into view.
 */
export function ErrorSummaryLink({
  controlId,
  render,
  ref,
  ...otherProps
}: ErrorSummaryLinkProps): ReactElement {
  const errorSummary = useContext(ErrorSummaryContext)
  useWarnOutsideRoot(errorSummary === null, 'Link')
  const elementRef = useMergedRef(ref, null)
  const linkProps = errorSummary?.getLinkProps(controlId) ?? {
    className: 'kv-link kv-error-summary-link' as const,
    href: `#${controlId}`,
  }
  return renderPart({
    render,
    defaultElement: 'a',
    partProps: { ...mergeProps(otherProps, linkProps), ref: elementRef },
    state: errorSummaryState,
  })
}
ErrorSummaryLink.displayName = 'ErrorSummary.Link'

/**
 * All the problems of a failed submit, each a link to its field, at the top of the form
 * (contract: error-summary.a11y.md). Render it only while there are errors, and pass the submit
 * count as `focusKey`. The field keeps its own error message under the control.
 *
 * @example
 * {errors.length > 0 && (
 *   <ErrorSummary.Root focusKey={submitCount} prefixDocumentTitle>
 *     <ErrorSummary.Title />
 *     <ErrorSummary.List>
 *       {errors.map((error) => (
 *         <ErrorSummary.Item key={error.controlId}>
 *           <ErrorSummary.Link controlId={error.controlId}>{error.message}</ErrorSummary.Link>
 *         </ErrorSummary.Item>
 *       ))}
 *     </ErrorSummary.List>
 *   </ErrorSummary.Root>
 * )}
 */
export const ErrorSummary = {
  Root: ErrorSummaryRoot,
  Title: ErrorSummaryTitle,
  List: ErrorSummaryList,
  Item: ErrorSummaryItem,
  Link: ErrorSummaryLink,
} as const

'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { createElement, useContext, useEffect } from 'react'
import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, Ref } from 'react'
import { Alert } from '../alert/alert.tsx'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { ErrorSummaryContext } from './error-summary-context.ts'
import { useErrorSummary } from './use-error-summary.ts'

const titleTags = ['h2', 'h3', 'h4', 'h5', 'h6'] as const
const listTags = ['ul', 'ol'] as const

export interface ErrorSummaryRootProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement> | undefined
  /** Moves focus to the summary on mount and each time this changes: pass the submit count. */
  focusKey?: string | number | undefined
  /** Puts "Fel:" before the page title while the summary is shown. Off by default. */
  prefixDocumentTitle?: boolean | undefined
  /** Per-instance overrides: the title and the page title prefix. */
  messages?: Partial<KvirnMessages['errorSummary']> | undefined
}

interface ErrorSummaryPartComponentProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement> | undefined
}

/** `as` is `h2` (default) to `h6`: the level the page's outline needs (2.4.6, 1.3.1). */
export type ErrorSummaryTitleProps = AsTag<(typeof titleTags)[number], 'h2'>
/** `as` is `ul` (default) or `ol`. */
export type ErrorSummaryListProps = AsTag<(typeof listTags)[number], 'ul'>
export type ErrorSummaryItemProps = ErrorSummaryPartComponentProps

export interface ErrorSummaryLinkProps extends Omit<ComponentPropsWithRef<'a'>, 'href'> {
  /** The id of the control the error is about, or of a group's first option. Sets `href="#id"`. */
  controlId: string
}

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
 * live region. It takes no `as`: the Alert is its element.
 */
export function ErrorSummaryRoot({
  focusKey,
  prefixDocumentTitle,
  messages,
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
      <Alert.Danger {...partProps} />
    </ErrorSummaryContext.Provider>
  )
}
ErrorSummaryRoot.displayName = 'ErrorSummary.Root'

/**
 * The heading, an `h2` by default (`as` for another level), with the status word first.
 * Without children it reads `errorSummary.title`.
 */
export function ErrorSummaryTitle({
  as,
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
      as={resolveAsTag({ part: 'ErrorSummary.Title', as, allowedTags: titleTags })}
    >
      {children ?? errorSummary?.title}
    </Alert.Title>
  )
}
ErrorSummaryTitle.displayName = 'ErrorSummary.Title'

function useErrorSummaryPart(
  { ref, ...otherProps }: ErrorSummaryPartComponentProps,
  partProps: { className: string; role?: string },
  defaultElement: 'ul' | 'li',
  as?: 'ul' | 'ol',
): ReactElement {
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    as,
    defaultElement,
    partProps: { ...mergeProps(otherProps, partProps), ref: elementRef },
  })
}

/** The list of problems: a `<ul>`, or an `<ol>` with `as`. */
export function ErrorSummaryList({ as, ...props }: ErrorSummaryListProps): ReactElement {
  const errorSummary = useContext(ErrorSummaryContext)
  useWarnOutsideRoot(errorSummary === null, 'List')
  return useErrorSummaryPart(
    props,
    errorSummary?.listProps ?? { className: 'kv-error-summary-list', role: 'list' },
    'ul',
    resolveAsTag({ part: 'ErrorSummary.List', as, allowedTags: listTags }),
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
  return createElement('a', { ...mergeProps(otherProps, linkProps), ref: elementRef })
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

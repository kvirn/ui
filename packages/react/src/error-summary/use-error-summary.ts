import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useCallback, useEffect, useId, useMemo, useRef } from 'react'
import type { MouseEvent, RefCallback } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { useEnv } from '../provider/use-env.ts'
import { useMessages } from '../provider/use-messages.ts'

export interface UseErrorSummaryOptions {
  /**
   * Moves focus to the summary on mount and each time this changes. Pass the submit count, so a
   * second failed submit moves focus again while the summary is already on screen. Without it,
   * focus moves once, on mount.
   */
  focusKey?: string | number | undefined
  /**
   * Never moves focus to the summary, on mount or when `focusKey` changes. For a static preview
   * (a docs page, a screenshot) where the move would scroll the page. Leave it off in an app:
   * the focus move is how the summary is announced.
   */
  disableAutoFocus?: boolean | undefined
  /**
   * Puts `errorSummary.titlePrefix` ("Fel:") before `document.title` while the summary is shown,
   * and restores the title when it is removed (2.4.2). Off by default, because a router that
   * owns the title would fight it: then set the prefix there.
   */
  prefixDocumentTitle?: boolean | undefined
  /** Per-instance message overrides: `{ title: 'Rätta felen', titlePrefix: 'Problem:' }`. */
  messages?: Partial<KvirnMessages['errorSummary']> | undefined
}

/**
 * Spread on the summary's element, usually an `Alert.Danger`. A callback ref lets the hook move
 * focus to it.
 */
export interface ErrorSummaryRootPartProps {
  className: 'kv-error-summary'
  /** A named group, not `alert` (no live region: the focus move is the announcement) and not a landmark. */
  role: 'group'
  /** Focusable by script, not a Tab stop. */
  tabIndex: -1
  /** The title's id. */
  'aria-labelledby': string
  ref: RefCallback<HTMLElement>
}

/** Spread on the heading. The id names the group. */
export interface ErrorSummaryTitlePartProps {
  id: string
}

export interface ErrorSummaryListPartProps {
  className: 'kv-error-summary-list'
  /** Explicit: the theme draws no markers, and Safari then drops the list semantics. */
  role: 'list'
}

export interface ErrorSummaryItemPartProps {
  className: 'kv-error-summary-item'
}

/** Spread on the `<a>`. */
export interface ErrorSummaryLinkPartProps {
  className: 'kv-link kv-error-summary-link'
  /** `#` plus the control's id. */
  href: string
  /**
   * Moves focus to the control and scrolls its label into view. A modified click and a missing
   * control are left to the browser.
   */
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void
}

export interface UseErrorSummaryResult {
  rootProps: ErrorSummaryRootPartProps
  titleProps: ErrorSummaryTitlePartProps
  listProps: ErrorSummaryListPartProps
  itemProps: ErrorSummaryItemPartProps
  /** `controlId` is the control's id, or for a group of options, the first option's. */
  getLinkProps: (controlId: string) => ErrorSummaryLinkPartProps
  /** The message `errorSummary.title`: the default text of the heading. */
  title: string
}

function setTitle(pageDocument: Document, title: string): void {
  pageDocument.title = title
}

const listProps: ErrorSummaryListPartProps = Object.freeze({
  className: 'kv-error-summary-list',
  role: 'list',
})
const itemProps: ErrorSummaryItemPartProps = Object.freeze({ className: 'kv-error-summary-item' })

/**
 * An error summary's props, focus move and link handler (contract: error-summary.a11y.md). It is
 * not a live region: focus moves to the summary on mount and when `focusKey` changes, and the
 * screen reader reads the focused group, so nothing is announced twice. Render the summary only
 * after a failed submit, at the top of `main`, and never update it while the user types.
 *
 * @example
 * const errorSummary = useErrorSummary({ focusKey: submitCount })
 * <div {...errorSummary.rootProps}>
 *   <h2 {...errorSummary.titleProps}>{errorSummary.title}</h2>
 *   <ul {...errorSummary.listProps}>
 *     <li {...errorSummary.itemProps}>
 *       <a {...errorSummary.getLinkProps('email')}>Ange din e-postadress</a>
 *     </li>
 *   </ul>
 * </div>
 */
export function useErrorSummary({
  focusKey,
  disableAutoFocus = false,
  prefixDocumentTitle = false,
  messages,
}: UseErrorSummaryOptions = {}): UseErrorSummaryResult {
  const env = useEnv()
  const errorSummaryMessages = useMessages('errorSummary', messages)
  const titleId = useId()
  const rootElement = useRef<HTMLElement | null>(null)
  const rootRef = useCallback<RefCallback<HTMLElement>>((element) => {
    rootElement.current = element
  }, [])

  useEffect(() => {
    if (!disableAutoFocus) {
      rootElement.current?.focus()
    }
  }, [focusKey, disableAutoFocus])

  const prefix = errorSummaryMessages.titlePrefix
  useEffect(() => {
    if (!prefixDocumentTitle || env === undefined) {
      return
    }
    const pageDocument = env.document
    const original = pageDocument.title
    if (original.startsWith(prefix)) {
      return
    }
    const prefixed = `${prefix} ${original}`
    setTitle(pageDocument, prefixed)
    return () => {
      if (pageDocument.title === prefixed) {
        setTitle(pageDocument, original)
      }
    }
  }, [env, prefixDocumentTitle, prefix])

  const getLinkProps = useCallback(
    (controlId: string): ErrorSummaryLinkPartProps => ({
      className: 'kv-link kv-error-summary-link',
      href: `#${controlId}`,
      onClick: (event) => {
        if (
          env === undefined ||
          event.defaultPrevented ||
          event.button !== 0 ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        ) {
          return
        }
        const control = env.document.getElementById(controlId)
        if (control === null) {
          warnOnce(
            `error-summary-control-missing:${controlId}`,
            `An ErrorSummary link points at #${controlId}, but the page has no element with the id "${controlId}", so the link goes nowhere (3.3.1). Give the control that id (Field.Root controlId), or for a group, its first option.`,
          )
          return
        }
        control.focus({ preventScroll: true })
        if (env.document.activeElement !== control) {
          warnOnce(
            `error-summary-control-unfocusable:${controlId}`,
            `An ErrorSummary link points at #${controlId}, but that element can't take focus (it is hidden, disabled or not focusable), so the link falls back to the browser's own jump (2.4.3). Point it at the focusable control.`,
          )
          return
        }
        event.preventDefault()
        // The label or legend scrolls into view, so the question shows with the field, and
        // the control itself is focused without a second scroll.
        const label =
          env.document.querySelector(`label[for="${env.window.CSS.escape(controlId)}"]`) ??
          control.closest('fieldset')?.querySelector('legend') ??
          control
        label.scrollIntoView({ block: 'center', behavior: 'instant' })
      },
    }),
    [env],
  )

  return useMemo(
    () => ({
      rootProps: {
        className: 'kv-error-summary',
        role: 'group',
        tabIndex: -1,
        'aria-labelledby': titleId,
        ref: rootRef,
      },
      titleProps: { id: titleId },
      listProps,
      itemProps,
      getLinkProps,
      title: errorSummaryMessages.title,
    }),
    [titleId, rootRef, getLinkProps, errorSummaryMessages.title],
  )
}

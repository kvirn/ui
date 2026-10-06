import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useMemo } from 'react'
import { useMessages } from '../provider/use-messages.ts'

export interface UseBreadcrumbOptions {
  /**
   * The trail's accessible name, from your translations. Replaces the message `breadcrumb.label`
   * (`Du är här`). An empty or whitespace-only label counts as none.
   */
  label?: string | undefined
  /** Per-instance message overrides: `{ label: 'Du är här' }`. */
  messages?: Partial<KvirnMessages['breadcrumb']> | undefined
}

/** Spread on the `<nav>`. */
export interface BreadcrumbRootPartProps {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-breadcrumb`. Add your own
   * class next to it with `mergeProps`: class names join.
   */
  className: 'kv-breadcrumb'
  /** From `label`, or the message `breadcrumb.label`. */
  'aria-label': string
}

/** Spread on the `<ol>`. Only the part's class. */
export interface BreadcrumbListPartProps {
  className: 'kv-breadcrumb-list'
}

/** Spread on each `<li>`. Only the part's class. */
export interface BreadcrumbItemPartProps {
  className: 'kv-breadcrumb-item'
}

/** Spread on the current page's `<span>`, the last item's content. */
export interface BreadcrumbCurrentPartProps {
  className: 'kv-breadcrumb-current'
  'aria-current': 'page'
}

export interface UseBreadcrumbResult {
  rootProps: BreadcrumbRootPartProps
  listProps: BreadcrumbListPartProps
  itemProps: BreadcrumbItemPartProps
  currentProps: BreadcrumbCurrentPartProps
  /** The resolved name of the landmark. */
  label: string
}

// The same objects every time, frozen, so nothing a consumer does can change another trail.
const listProps: BreadcrumbListPartProps = Object.freeze({ className: 'kv-breadcrumb-list' })
const itemProps: BreadcrumbItemPartProps = Object.freeze({ className: 'kv-breadcrumb-item' })
const currentProps: BreadcrumbCurrentPartProps = Object.freeze({
  className: 'kv-breadcrumb-current',
  'aria-current': 'page',
})

/**
 * A breadcrumb trail's part props and its name for your own elements (contract:
 * breadcrumb.a11y.md): a labelled `<nav>` around an ordered list of links, ending in the current
 * page as text with `aria-current="page"`. It adds no key handling, so the links own the keys.
 *
 * @example
 * const breadcrumb = useBreadcrumb()
 * <nav {...breadcrumb.rootProps}>
 *   <ol {...breadcrumb.listProps}>
 *     <li {...breadcrumb.itemProps}><a href="/">Start</a></li>
 *     <li {...breadcrumb.itemProps}><span {...breadcrumb.currentProps}>Förskola</span></li>
 *   </ol>
 * </nav>
 */
export function useBreadcrumb({ label, messages }: UseBreadcrumbOptions = {}): UseBreadcrumbResult {
  const breadcrumbMessages = useMessages('breadcrumb', messages)
  const name = label !== undefined && label.trim() !== '' ? label : breadcrumbMessages.label
  const rootProps = useMemo<BreadcrumbRootPartProps>(
    () => ({ className: 'kv-breadcrumb', 'aria-label': name }),
    [name],
  )
  return useMemo(
    () => ({ rootProps, listProps, itemProps, currentProps, label: name }),
    [rootProps, name],
  )
}

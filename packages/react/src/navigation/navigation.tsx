'use client'
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
import type { HTMLAttributes, ReactElement, Ref, RefCallback } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useNavigation } from './use-navigation.ts'
import type {
  NavigationItemPartProps,
  NavigationLabelPartProps,
  NavigationListPartProps,
  NavigationRootPartProps,
} from './use-navigation.ts'

const listTags = ['ul', 'ol'] as const
const labelTags = ['span', 'p'] as const

interface NavigationPartComponentProps extends HTMLAttributes<HTMLElement> {
  /** The rendered element. */
  ref?: Ref<HTMLElement> | undefined
}

export interface NavigationRootProps extends NavigationPartComponentProps {
  /**
   * The navigation's accessible name, from your translations: `Huvudmeny`. Set as
   * `aria-label`. Give a name, or `aria-labelledby` pointing at a visible heading (preferred
   * where one exists): a screen reader user picks a landmark by its name (WCAG 2.4.1, 2.4.6).
   * Two navigations on a page need two names. A dev warning fires without one.
   */
  label?: string | undefined
}
/** `as` is `ul` (default) or `ol`, for a list whose order is the meaning. */
export type NavigationListProps = AsTag<(typeof listTags)[number], 'ul'>
export type NavigationItemProps = NavigationPartComponentProps
/** `as` is `span` (default) or `p`. It is a name, not a heading. */
export type NavigationLabelProps = AsTag<(typeof labelTags)[number], 'span'>

/** The text a landmark is named by: `aria-label`, or the text of the `aria-labelledby` elements. */
function landmarkName(element: Element): string {
  const label = element.getAttribute('aria-label')?.trim()
  if (label !== undefined && label !== '') {
    return label
  }
  const ids = element.getAttribute('aria-labelledby')?.split(/\s+/).filter(Boolean) ?? []
  return ids
    .map((id) => element.ownerDocument.getElementById(id)?.textContent?.trim() ?? '')
    .join(' ')
    .trim()
}

// Internal. A `Navigation.Item` and the parts in it: the label registers, and the nested list is
// named by it. The label and the list are siblings, so neither can find the other without it.
interface NavigationItemContextValue {
  labelId: string
  hasLabel: boolean
  registerLabel: (id: string) => () => void
  registerList: () => () => void
}

const NavigationItemContext = createContext<NavigationItemContextValue | null>(null)

/** Internal. One part: one element. The part's props join the consumer's (mergeProps). */
function renderNavigationPart(
  otherProps: NavigationPartComponentProps,
  defaultElement: 'nav' | 'ul' | 'li' | 'span',
  partProps:
    | NavigationRootPartProps
    | NavigationListPartProps
    | NavigationItemPartProps
    | NavigationLabelPartProps,
  elementRef: RefCallback<HTMLElement>,
  as?: 'ul' | 'ol' | 'span' | 'p',
): ReactElement {
  return renderPart({
    as,
    defaultElement,
    // The part's class joins a prop's class names, so a prop can't remove it and the theme keeps
    // styling the navigation.
    partProps: { ...mergeProps(otherProps, partProps), ref: elementRef },
  })
}

/**
 * The landmark: one `<nav class="kv-navigation">` named by `label` (or your own
 * `aria-labelledby`). Put a `Navigation.List` in it.
 */
export function NavigationRoot({ label, ref, ...otherProps }: NavigationRootProps): ReactElement {
  const navigation = useNavigation({ label })
  const ownRef = useRef<HTMLElement | null>(null)
  const mergedRef = useMergedRef(ref, ownRef)

  useEffect(() => {
    const element = ownRef.current
    if (element === null) {
      return
    }
    const name = landmarkName(element)
    if (name === '') {
      warnOnce(
        'navigation-without-name',
        'A <Navigation.Root> has no name, so a screen reader user hears "navigation" and nothing else, and can\'t tell two apart. Give it label from your translations, or aria-labelledby pointing at a visible heading (WCAG 2.4.1, 2.4.6).',
      )
    } else {
      for (const other of element.ownerDocument.querySelectorAll('nav, [role="navigation"]')) {
        if (other !== element && landmarkName(other) === name) {
          warnOnce(
            `navigation-duplicate-name:${name}`,
            `Two navigation landmarks are both named "${name}", so a screen reader user can't tell them apart in the landmarks list. Give each its own name, for example "Huvudmeny" and "I det här avsnittet" (WCAG 2.4.1, 2.4.6).`,
          )
          break
        }
      }
    }
    // One current item per navigation. Every aria-current counts, a nested or hidden one too: the
    // default theme draws each as the current page, and a hidden link is not exposed to assistive
    // technology, so the deepest item shown carries it instead.
    const currentCount = element.querySelectorAll(
      '[aria-current]:not([aria-current="false"])',
    ).length
    if (currentCount > 1) {
      const subject = name === '' ? 'A navigation' : `The navigation "${name}"`
      warnOnce(
        `navigation-multiple-current:${name}`,
        `${subject} has ${currentCount} links marked current (aria-current). ARIA allows one current item in a set, so a screen reader user hears "current" more than once and can't tell which link is the page, and the default theme draws each one as the current page. Mark one: current="page" on the link to the page, or current on the deepest item shown when the page is not in the navigation. Never mark an ancestor of the page, or a link inside a hidden group (WCAG 1.3.1, 4.1.2).`,
      )
    }
  })

  return renderNavigationPart(otherProps, 'nav', navigation.rootProps, mergedRef)
}
NavigationRoot.displayName = 'Navigation.Root'

/**
 * A `<ul class="kv-navigation-list">`. For a sub-navigation, put another `Navigation.List`
 * inside a `Navigation.Item`: the lists nest natively, so the level is announced. A group you
 * collapse is rendered with `hidden` and never unmounted: its links leave the Tab sequence and
 * the accessibility tree, and the default theme keeps it collapsed.
 */
export function NavigationList({ as, ref, ...otherProps }: NavigationListProps): ReactElement {
  const navigation = useNavigation()
  const item = useContext(NavigationItemContext)
  const mergedRef = useMergedRef(ref, null)
  const registerList = item?.registerList
  useLayoutEffect(() => registerList?.(), [registerList])
  // A name of the consumer's own wins over the label's.
  const isNamedByLabel =
    item?.hasLabel === true &&
    otherProps['aria-label'] === undefined &&
    otherProps['aria-labelledby'] === undefined
  return renderNavigationPart(
    isNamedByLabel ? { ...otherProps, 'aria-labelledby': item.labelId } : otherProps,
    'ul',
    navigation.listProps,
    mergedRef,
    resolveAsTag({ part: 'Navigation.List', as, allowedTags: listTags }),
  )
}
NavigationList.displayName = 'Navigation.List'

/**
 * An `<li class="kv-navigation-item">`: a `Link`, and optionally a nested `Navigation.List`, or a
 * `Navigation.Label` that names it.
 */
export function NavigationItem({ ref, ...otherProps }: NavigationItemProps): ReactElement {
  const navigation = useNavigation()
  const mergedRef = useMergedRef(ref, null)
  const defaultLabelId = useId()
  const [labelIds, setLabelIds] = useState<readonly string[]>([])
  const [listCount, setListCount] = useState(0)
  const registerLabel = useCallback((id: string) => {
    setLabelIds((ids) => [...ids, id])
    return () => setLabelIds((ids) => ids.filter((registeredId) => registeredId !== id))
  }, [])
  const context = useMemo<NavigationItemContextValue>(
    () => ({
      // The list points at the id the label has, which is the consumer's when they pass one.
      labelId: labelIds[0] ?? defaultLabelId,
      hasLabel: labelIds.length > 0,
      registerLabel,
      registerList: () => {
        setListCount((count) => count + 1)
        return () => setListCount((count) => count - 1)
      },
    }),
    [defaultLabelId, labelIds, registerLabel],
  )
  useEffect(() => {
    if (labelIds.length > 0 && listCount === 0) {
      warnOnce(
        'navigation-label-without-list',
        'A Navigation.Label is in a Navigation.Item that has no nested Navigation.List, so it names nothing. Put the Navigation.List it labels in the same Navigation.Item, or use plain text.',
      )
    }
  }, [labelIds, listCount])
  return (
    <NavigationItemContext.Provider value={context}>
      {renderNavigationPart(otherProps, 'li', navigation.itemProps, mergedRef)}
    </NavigationItemContext.Provider>
  )
}
NavigationItem.displayName = 'Navigation.Item'

/**
 * The name of a group, in a `Navigation.Item` next to its nested `Navigation.List`: a
 * `<span class="kv-navigation-label">` that the list points at with `aria-labelledby`, so a
 * screen reader announces "Komponenter, list, 3 items". It is not a heading and not a link, so
 * nobody mistakes it for one: it has no role, is not focusable and is never a Tab stop. Its text
 * is yours, in your own translations.
 */
export function NavigationLabel({ as, ref, ...otherProps }: NavigationLabelProps): ReactElement {
  const navigation = useNavigation()
  const item = useContext(NavigationItemContext)
  const mergedRef = useMergedRef(ref, null)
  const registerLabel = item?.registerLabel
  const labelId = otherProps.id ?? item?.labelId
  useLayoutEffect(
    () => (labelId === undefined ? undefined : registerLabel?.(labelId)),
    [registerLabel, labelId],
  )
  useEffect(() => {
    if (item === null) {
      warnOnce(
        'navigation-label-outside-item',
        'A Navigation.Label is outside a Navigation.Item, so it names no list. Put it in the Navigation.Item that holds the Navigation.List it labels.',
      )
    }
  }, [item])
  return renderNavigationPart(
    item === null ? otherProps : { ...otherProps, id: labelId },
    'span',
    navigation.labelProps,
    mergedRef,
    resolveAsTag({ part: 'Navigation.Label', as, allowedTags: labelTags }),
  )
}
NavigationLabel.displayName = 'Navigation.Label'

/**
 * A labelled `<nav>` landmark around a list of page links, with an optional second level
 * (contract: navigation.a11y.md). Mark the current page with `current` on its `Link`, which sets
 * `aria-current="page"`: one current link per navigation and never an ancestor (when the page
 * isn't listed, `current` goes on the deepest item shown). It is a vertical list by default, and
 * a row that wraps with `className="kv-navigation--horizontal"` on the root. Orientation is a
 * class and not a prop, because links are plain Tab stops and the layout changes no keys. A menu
 * with flyouts or a collapsing header is NavigationMenu. With `@kvirn-ui/theme`, the links become
 * navigation items: the current page is a solid fill, and its ancestors are a quiet bold trail.
 *
 * @example
 * <Navigation.Root label="Huvudmeny">
 *   <Navigation.List>
 *     <Navigation.Item>
 *       <Link.Root href="/start" current="page">Start</Link.Root>
 *     </Navigation.Item>
 *     <Navigation.Item>
 *       <Link.Root href="/bygga">Bygga och bo</Link.Root>
 *       <Navigation.List>
 *         <Navigation.Item><Link.Root href="/bygglov">Bygglov</Link.Root></Navigation.Item>
 *       </Navigation.List>
 *     </Navigation.Item>
 *   </Navigation.List>
 * </Navigation.Root>
 */
export const Navigation = {
  Root: NavigationRoot,
  List: NavigationList,
  Item: NavigationItem,
  Label: NavigationLabel,
} as const

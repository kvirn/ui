'use client'
import { useEffect, useRef } from 'react'
import type { HTMLAttributes, ReactElement, Ref, RefCallback } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useNavigation } from './use-navigation.ts'
import type {
  NavigationItemPartProps,
  NavigationListPartProps,
  NavigationRootPartProps,
} from './use-navigation.ts'

/** What `render` receives as its second argument. A navigation has no state, so it's empty. */
export type NavigationState = Record<string, never>

/**
 * What a `render` function gets to spread: your attributes, the part's props and a callback
 * ref, which fits any element.
 */
export interface NavigationElementProps extends HTMLAttributes<HTMLElement> {
  ref: RefCallback<HTMLElement>
}

interface NavigationPartComponentProps extends HTMLAttributes<HTMLElement> {
  /** The rendered element. */
  ref?: Ref<HTMLElement> | undefined
  /** Change the element. Its own semantics apply. */
  render?: RenderProp<NavigationElementProps, NavigationState> | undefined
}

export interface NavigationRootProps extends NavigationPartComponentProps {
  /**
   * The navigation's accessible name, from your translations: `Huvudmeny`. Set as
   * `aria-label`. Give a name, or `aria-labelledby` pointing at a visible heading (preferred
   * where one exists): a screen reader user picks a landmark by its name (WCAG 2.4.1, 2.4.6).
   * Two navigations on a page need two names. A dev warning fires without one.
   */
  label?: string | undefined
  /**
   * Change the element. It must stay a `<nav>` (or have `role="navigation"`), otherwise the
   * landmark is gone.
   */
  render?: RenderProp<NavigationElementProps, NavigationState> | undefined
}
export type NavigationListProps = NavigationPartComponentProps
export type NavigationItemProps = NavigationPartComponentProps

const navigationState: NavigationState = Object.freeze({})

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

/** Internal. One part: one element. The part's props join the consumer's (mergeProps). */
function renderNavigationPart(
  { render, ...otherProps }: NavigationPartComponentProps,
  defaultElement: 'nav' | 'ul' | 'li',
  partProps: NavigationRootPartProps | NavigationListPartProps | NavigationItemPartProps,
  elementRef: RefCallback<HTMLElement>,
): ReactElement {
  return renderPart({
    render,
    defaultElement,
    // The part's class joins a prop's and a render element's own class names, so neither can
    // remove it and the theme keeps styling the navigation.
    partProps: { ...mergeProps(otherProps, partProps), ref: elementRef },
    state: navigationState,
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
export function NavigationList({ ref, ...otherProps }: NavigationListProps): ReactElement {
  const navigation = useNavigation()
  const mergedRef = useMergedRef(ref, null)
  return renderNavigationPart(otherProps, 'ul', navigation.listProps, mergedRef)
}
NavigationList.displayName = 'Navigation.List'

/** An `<li class="kv-navigation-item">`: a `Link`, and optionally a nested `Navigation.List`. */
export function NavigationItem({ ref, ...otherProps }: NavigationItemProps): ReactElement {
  const navigation = useNavigation()
  const mergedRef = useMergedRef(ref, null)
  return renderNavigationPart(otherProps, 'li', navigation.itemProps, mergedRef)
}
NavigationItem.displayName = 'Navigation.Item'

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
} as const

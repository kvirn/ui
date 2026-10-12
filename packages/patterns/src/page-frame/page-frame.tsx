'use client'

import { Container, Grid, SkipLink, mergeProps } from '@kvirn-ui/react'
import type { ContainerProps, GridItemProps } from '@kvirn-ui/react'
import { useContext, useMemo } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { PageFrameBodyContext, PageFrameContext } from './page-frame-context.ts'

export interface PageFrameRootProps extends ComponentPropsWithRef<'div'> {
  /** The id of `main`, and the skip link's target. Default `main`. */
  mainId?: string | undefined
}

/** The `main` landmark. Its `id` is the root's `mainId`. */
export interface PageFrameMainProps extends Omit<ContainerProps, 'as'> {
  /** A full-width `main` with no `Container`: each band brings its own, as a start page's do. */
  bleed?: boolean | undefined
}
export type PageFrameBodyProps = ComponentPropsWithRef<'div'>
/** `as` is `nav` or `aside` with a name; the default is a `div`. Never `main`: the page has one. */
export type PageFrameSidebarProps = Extract<
  GridItemProps,
  { as?: 'div' | 'nav' | 'aside' | undefined }
>

/**
 * The frame of every page: the skip link first, then your children in the order you write them,
 * which is reading and focus order at every width. Write the header, the alert, the breadcrumb,
 * `PageFrame.Main` (or `PageFrame.Body`) and the footer. Nothing is sticky and nothing is
 * reordered. Contract: page-frame.a11y.md.
 */
export function PageFrameRoot({
  mainId = 'main',
  children,
  className,
  ...otherProps
}: PageFrameRootProps): ReactElement {
  const context = useMemo(() => ({ mainId }), [mainId])
  return (
    <PageFrameContext.Provider value={context}>
      <div
        {...mergeProps(otherProps, {
          className: ['kv-page-frame', className].filter(Boolean).join(' '),
        })}
      >
        <SkipLink href={`#${mainId}`} />
        {children}
      </div>
    </PageFrameContext.Provider>
  )
}
PageFrameRoot.displayName = 'PageFrame.Root'

/**
 * A page with a section navigation: a `Container` with `PageFrame.Sidebar` before
 * `PageFrame.Main`. The sidebar sits beside `main` from the grid's 64rem (about a 69rem window
 * inside the `Container`) and stacks above it below, in DOM order. A section navigation that
 * collapses by viewport width (`useIsWideViewport`, 64rem) is open and stacked between 64rem and
 * about 69rem.
 */
export function PageFrameBody({ children, ...otherProps }: PageFrameBodyProps): ReactElement {
  return (
    <PageFrameBodyContext.Provider value>
      <Container {...mergeProps(otherProps, { className: 'kv-page-frame-body' })}>
        <Grid.Root className="kv-grid--lg-cols-12 kv-grid--lg-gap-10">{children}</Grid.Root>
      </Container>
    </PageFrameBodyContext.Provider>
  )
}
PageFrameBody.displayName = 'PageFrame.Body'

/** The section navigation, as a named `nav` (`as="nav"`). Inside `PageFrame.Body`, before `Main`. */
export function PageFrameSidebar({
  className,
  ...otherProps
}: PageFrameSidebarProps): ReactElement {
  const { className: sidebarClassName } = mergeProps(
    { className },
    { className: 'kv-grid-item--lg-span-3' },
  )
  return <Grid.Item {...otherProps} className={sidebarClassName} />
}
PageFrameSidebar.displayName = 'PageFrame.Sidebar'

/** The page's one `main`: its own `Container`, a full-width `main` with `bleed`, or the content of `PageFrame.Body`. */
export function PageFrameMain({ id, bleed, ...otherProps }: PageFrameMainProps): ReactElement {
  const { mainId } = useContext(PageFrameContext)
  const isInBody = useContext(PageFrameBodyContext)
  const mainProps = mergeProps(otherProps, { className: 'kv-page-frame-main' })
  if (isInBody) {
    return (
      <Grid.Item
        as="main"
        id={id ?? mainId}
        {...mergeProps(mainProps, { className: 'kv-grid-item--lg-span-9' })}
      />
    )
  }
  if (bleed === true) {
    return <main id={id ?? mainId} {...mainProps} />
  }
  return <Container as="main" id={id ?? mainId} {...mainProps} />
}
PageFrameMain.displayName = 'PageFrame.Main'

export const PageFrame = {
  Root: PageFrameRoot,
  Body: PageFrameBody,
  Sidebar: PageFrameSidebar,
  Main: PageFrameMain,
} as const

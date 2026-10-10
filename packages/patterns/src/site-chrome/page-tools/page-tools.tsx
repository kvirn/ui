'use client'

import { Button, CopyButton, ReadAloud, mergeProps } from '@kvirn-ui/react'
import type { ButtonProps, CopyButtonProps, ReadAloudRootProps } from '@kvirn-ui/react'
import type { ComponentPropsWithRef, MouseEvent, ReactElement, RefObject } from 'react'

export type PageToolsRootProps = ComponentPropsWithRef<'div'>

export interface PageToolsCopyLinkProps extends Omit<CopyButtonProps, 'text'> {
  /** The address to copy, or a function that reads it when pressed. Default: the page's own. */
  text?: CopyButtonProps['text'] | undefined
}

export interface PageToolsPrintProps extends Omit<ButtonProps, 'type'> {
  /** Replaces `window.print()`. */
  onPrint?: (() => void) | undefined
}

export interface PageToolsTopProps extends Omit<ReadAloudRootProps, 'contentRef'> {
  /** The element whose text is read: `main`, or the lead and the prose of the page. */
  contentRef: RefObject<HTMLElement | null>
}

/**
 * The row at the end of `main`: copy the page's link and print it. No third-party share links.
 * Write the parts in the order you want them, and the page's last-updated date as your own
 * `<p>` with a `<time>`. Contract: page-tools.a11y.md.
 */
export function PageToolsRoot({ className, ...otherProps }: PageToolsRootProps): ReactElement {
  return (
    <div
      {...mergeProps(otherProps, {
        className: ['kv-page-tools', className].filter(Boolean).join(' '),
      })}
    />
  )
}
PageToolsRoot.displayName = 'PageTools.Root'

/**
 * A CopyButton whose label never changes: its status is announced and shown beside it, from
 * the button's own messages. Without `text` it copies the page's own address.
 */
export function PageToolsCopyLink({ text, ...otherProps }: PageToolsCopyLinkProps): ReactElement {
  return <CopyButton text={text ?? (() => window.location.href)} {...otherProps} />
}
PageToolsCopyLink.displayName = 'PageTools.CopyLink'

/** A Button that calls `window.print()`, or `onPrint`. Its text is its children. */
export function PageToolsPrint({ onPrint, ...otherProps }: PageToolsPrintProps): ReactElement {
  const print = (_event: MouseEvent<HTMLButtonElement>) => (onPrint ?? window.print.bind(window))()
  return <Button {...mergeProps(otherProps, { onClick: print })} />
}
PageToolsPrint.displayName = 'PageTools.Print'

/**
 * Read aloud under the `h1`, for the lead and the prose of the page. Without children it has the
 * full set of controls; write `ReadAloud` parts to choose your own.
 */
export function PageToolsTop({
  contentRef,
  className,
  children,
  ...otherProps
}: PageToolsTopProps): ReactElement {
  return (
    <ReadAloud.Root
      contentRef={contentRef}
      className={['kv-page-tools-top', className].filter(Boolean).join(' ')}
      {...otherProps}
    >
      {children ?? (
        <>
          <ReadAloud.Play />
          <ReadAloud.Previous />
          <ReadAloud.Next />
          <ReadAloud.Stop />
          <ReadAloud.Rate />
          <ReadAloud.Voice />
          <ReadAloud.Status />
        </>
      )}
    </ReadAloud.Root>
  )
}
PageToolsTop.displayName = 'PageTools.Top'

export const PageTools = {
  Root: PageToolsRoot,
  CopyLink: PageToolsCopyLink,
  Print: PageToolsPrint,
  Top: PageToolsTop,
} as const

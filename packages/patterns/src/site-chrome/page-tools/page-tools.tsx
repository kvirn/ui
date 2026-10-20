'use client'

import { Button, CopyButton, mergeProps } from '@kvirn-ui/react'
import type { ButtonProps, CopyButtonProps } from '@kvirn-ui/react'
import type { ComponentPropsWithRef, MouseEvent, ReactElement } from 'react'

export type PageToolsRootProps = ComponentPropsWithRef<'div'>

export interface PageToolsCopyLinkProps extends Omit<CopyButtonProps, 'text'> {
  /** The address to copy, or a function that reads it when pressed. Default: the page's own. */
  text?: CopyButtonProps['text'] | undefined
}

export interface PageToolsPrintProps extends Omit<ButtonProps, 'type'> {
  /** Replaces `window.print()`. */
  onPrint?: (() => void) | undefined
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

export const PageTools = {
  Root: PageToolsRoot,
  CopyLink: PageToolsCopyLink,
  Print: PageToolsPrint,
} as const

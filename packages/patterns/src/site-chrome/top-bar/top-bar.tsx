import { mergeProps } from '@kvirn-ui/react'
import type { ComponentPropsWithRef, ReactElement } from 'react'

export interface TopBarRootProps extends ComponentPropsWithRef<'div'> {
  /**
   * The fill. None by default: the page's colours. `primary`, `secondary` or `accent` adds
   * `kv-top-bar--<variant>`: that fill with its on-colour text, links, focus ring and current bar.
   */
  variant?: 'primary' | 'secondary' | 'accent' | undefined
}

/**
 * A slim bar of two sides: its children sit at the start and at the end, in DOM order, and wrap
 * when there is no room. Write the text first and the navigation last. No landmark of its own:
 * a `Navigation` inside it is the landmark. Contract: top-bar.a11y.md.
 */
export function TopBarRoot({ variant, ...otherProps }: TopBarRootProps): ReactElement {
  return (
    <div
      {...mergeProps(otherProps, {
        className: variant === undefined ? 'kv-top-bar' : `kv-top-bar kv-top-bar--${variant}`,
      })}
    />
  )
}
TopBarRoot.displayName = 'TopBar.Root'

export const TopBar = {
  Root: TopBarRoot,
} as const

import type { ComponentPropsWithRef, ReactElement } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useTopBar } from './use-top-bar.ts'
import type { UseTopBarOptions } from './use-top-bar.ts'

export interface TopBarProps extends ComponentPropsWithRef<'div'>, UseTopBarOptions {}

/**
 * A slim bar of two sides: its children sit at the start and at the end, in DOM order, and wrap
 * when there is no room (contract: top-bar.a11y.md). Write the text first and the navigation
 * last. No landmark of its own: a `Navigation` inside it is the landmark. `variant` fills it.
 *
 * @example
 * <TopBar variant="accent">
 *   <p>A KvirnUI reference site.</p>
 *   <Navigation.Root label="Tools" className="kv-navigation--horizontal">…</Navigation.Root>
 * </TopBar>
 */
export function TopBar({ variant, ...otherProps }: TopBarProps): ReactElement {
  // The class joins a prop's own class names (mergeProps), so a prop can't remove it and the
  // theme keeps styling the bar.
  return <div {...mergeProps(otherProps, useTopBar({ variant }).topBarProps)} />
}
TopBar.displayName = 'TopBar'

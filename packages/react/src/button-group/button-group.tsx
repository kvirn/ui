'use client'
import { createElement, useContext, useEffect } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { ToolbarContext } from '../toolbar/toolbar-context.ts'
import { useButtonGroup } from './use-button-group.ts'

/** `role` is left out: it comes from the name. */
export type ButtonGroupProps = Omit<ComponentPropsWithRef<'div'>, 'role'>

/**
 * A row of related Buttons: one `<div class="kv-button-group">` (contract:
 * button-group.a11y.md). Name it with `aria-label` or `aria-labelledby` and it is a
 * `role="group"`, so a screen reader says where the buttons belong. Without a name it is a plain
 * `<div>`, so an unnamed Card footer adds nothing to the accessibility tree.
 *
 * Add `kv-button-group--attached` to join the buttons into one strip, like a segmented control.
 * It changes the look only.
 *
 * It holds no state and handles no keys: every button is its own Tab stop. For one Tab stop and
 * the arrow keys, put the buttons in a `Toolbar`. **A group in a Toolbar needs a name.**
 *
 * @example
 * <ButtonGroup aria-label="Ärendet">
 *   <Button>Spara utkast</Button>
 *   <Button className="kv-button--primary">Skicka</Button>
 * </ButtonGroup>
 */
export function ButtonGroup({ ref, ...otherProps }: ButtonGroupProps): ReactElement {
  const isNamed =
    otherProps['aria-label'] !== undefined || otherProps['aria-labelledby'] !== undefined
  const group = useButtonGroup({ isNamed })
  const toolbar = useContext(ToolbarContext)
  const isInToolbar = toolbar !== null
  const mergedRef = useMergedRef(ref, null)

  useEffect(() => {
    if (isInToolbar && !isNamed) {
      warnOnce(
        'button-group-in-toolbar-without-name',
        'A <ButtonGroup> in a <Toolbar> has no name, so a screen reader user hears no group as focus moves between them. Give it aria-label from your translations, or aria-labelledby (WCAG 1.3.1, 4.1.2).',
      )
    }
  }, [isInToolbar, isNamed])

  return createElement('div', { ...mergeProps(otherProps, group.groupProps), ref: mergedRef })
}
ButtonGroup.displayName = 'ButtonGroup'

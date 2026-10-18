import type { ComponentPropsWithRef, ReactElement } from 'react'
import { createElement } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'

export type DividerProps = ComponentPropsWithRef<'hr'>

/**
 * A horizontal rule between two blocks (contract: divider.a11y.md): one `<hr class="kv-divider">`.
 * It has no behaviour and no `as`: the element is the semantics. Pass `role="presentation"` for a
 * purely visual line. Usable in a server component.
 *
 * @example
 * <Divider />
 * <Divider role="presentation" />
 */
export function Divider(props: DividerProps): ReactElement {
  // The class joins a prop's own class names (mergeProps), so a prop can't remove it.
  return createElement('hr', mergeProps(props, { className: 'kv-divider' }))
}
Divider.displayName = 'Divider'

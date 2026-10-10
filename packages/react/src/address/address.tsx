import type { ComponentPropsWithRef, ReactElement } from 'react'
import { createElement } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'

export type AddressProps = ComponentPropsWithRef<'address'>

/**
 * Contact details for the nearest article or the page (contract: address.a11y.md): one
 * `<address class="kv-address">`. It has no role, ARIA or behaviour, and no `as`: the element is
 * the semantics. Usable in a server component.
 *
 * @example
 * <Address>
 *   Kvirnby municipality<br />
 *   Storgatan 1<br />
 *   123 45 Kvirnby
 * </Address>
 */
export function Address(props: AddressProps): ReactElement {
  // The class joins a prop's own class names (mergeProps), so a prop can't remove it and the
  // theme keeps undoing the browser's italic.
  return createElement('address', mergeProps(props, { className: 'kv-address' }))
}
Address.displayName = 'Address'

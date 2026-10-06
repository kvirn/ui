import type { Env } from '@kvirn-ui/core'
import { textEntrySelector } from '../focus-visible/use-focus-visible.ts'

export type MoveOnResult =
  | { status: 'moved'; target: HTMLElement }
  | { status: 'typing' }
  | { status: 'missing' }

/**
 * Internal. Moves focus to the first element matching `selector` in `container` (the document when
 * absent). It stays put while the user is typing in a field, and a target with no `tabindex` gets
 * `-1` until it blurs, so it adds no Tab stop and the next Tab continues after it.
 */
export function moveFocusOn(
  env: Env,
  selector: string,
  container: Element | null | undefined,
): MoveOnResult {
  const activeElement = env.document.activeElement
  if (activeElement !== null && activeElement.matches(textEntrySelector)) {
    return { status: 'typing' }
  }
  const target = (container ?? env.document).querySelector<HTMLElement>(selector)
  if (target === null) {
    return { status: 'missing' }
  }
  const addedTabIndex = !target.hasAttribute('tabindex')
  if (addedTabIndex) {
    target.setAttribute('tabindex', '-1')
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
  }
  target.focus({ preventScroll: false })
  return { status: 'moved', target }
}

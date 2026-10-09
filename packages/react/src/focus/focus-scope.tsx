'use client'
import type { ReactElement } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useFocus } from './use-focus.ts'
import type { UseFocusOptions } from './use-focus.ts'

const scopeTags = ['div', 'section', 'aside', 'nav', 'form'] as const

/**
 * `as` is `div` (default), `section`, `aside`, `nav` or `form`: `as="aside"` with
 * `aria-labelledby={id}`. Its own semantics apply. The scope adds no role and no ARIA.
 */
export type FocusScopeProps = AsTag<(typeof scopeTags)[number], 'div', UseFocusOptions>

/**
 * A container that moves focus in when `active`, can hold it (`contain`) and returns it when it
 * ends (contract: focus.a11y.md). Prefer a native `<dialog>` where it fits. A `FocusScope` is one element, so it is written `<FocusScope>`.
 *
 * @example
 * <FocusScope active={open} contain="loop" onEscape={close} as="aside" aria-label="Filter">
 *   …
 * </FocusScope>
 */
export function FocusScope({
  as,
  ref,
  active = false,
  restore,
  finalFocusRef,
  triggerRef,
  initialFocus,
  contain,
  onEscape,
  moveOn,
  onLost,
  ...otherProps
}: FocusScopeProps): ReactElement {
  const { scopeProps } = useFocus({
    active,
    restore,
    finalFocusRef,
    triggerRef,
    initialFocus,
    contain,
    onEscape,
    moveOn,
    onLost,
  })
  const elementRef = useMergedRef(ref, scopeProps.ref)
  return renderPart({
    as: resolveAsTag({ part: 'FocusScope', as, allowedTags: scopeTags }),
    defaultElement: 'div',
    partProps: {
      ...mergeProps(otherProps, { onKeyDown: scopeProps.onKeyDown }),
      ref: elementRef,
    },
  })
}
FocusScope.displayName = 'FocusScope'

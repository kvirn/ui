'use client'
import type { ReactElement } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useKbd } from './use-kbd.ts'

const kbdTags = ['kbd'] as const

/** `as` is `kbd`, the only element: program output (`samp`) is not a key and is not drawn as one. */
export type KbdProps = AsTag<(typeof kbdTags)[number], 'kbd'>

/**
 * Keyboard input in text (contract: kbd.a11y.md): one `<kbd class="kv-kbd">`, which the theme
 * draws as a key. It has no role, ARIA, text or behaviour. One key per `Kbd`. To show a
 * combination, nest them: the outer one groups and stays plain.
 *
 * Key names that are the surrounding language's vernacular (Ctrl, Shift, Tab, Esc in Nordic text) need nothing.
 * A key in another script (Arabic text, say) goes in your own `<span lang="en"><Kbd>Tab</Kbd></span>` (3.1.2).
 *
 * @example
 * <p>You can move between the fields with <Kbd>Tab</Kbd>.</p>
 *
 * @example
 * <Kbd><Kbd>Ctrl</Kbd>+<Kbd>C</Kbd></Kbd>
 */
export function Kbd({ as, ref, ...otherProps }: KbdProps): ReactElement {
  const kbd = useKbd()
  // The class joins a prop's own class names (mergeProps), so a prop can't remove it and the
  // theme keeps drawing the key.
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    as: resolveAsTag({ part: 'Kbd', as, allowedTags: kbdTags }),
    defaultElement: kbd.element,
    partProps: { ...mergeProps(otherProps, kbd.rootProps), ref: elementRef },
  })
}
Kbd.displayName = 'Kbd'

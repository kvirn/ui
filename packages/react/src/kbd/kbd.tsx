'use client'
import type { HTMLAttributes, ReactElement, Ref, RefCallback } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useKbd } from './use-kbd.ts'

/** What `render` receives as its second argument. Kbd has no state, so it's empty. */
export type KbdState = Record<string, never>

/** What a `render` function gets to spread: your attributes, the class and a callback ref. */
export interface KbdElementProps extends HTMLAttributes<HTMLElement> {
  ref: RefCallback<HTMLElement>
}

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement> | undefined
  /** Change the element: `render={<samp />}`. Its own semantics apply. */
  render?: RenderProp<KbdElementProps, KbdState> | undefined
}

const kbdState: KbdState = Object.freeze({})

/**
 * Keyboard input in text (contract: kbd.a11y.md): one `<kbd class="kv-kbd">`, which the theme
 * draws as a key. It has no role, ARIA, text or behaviour. One key per `Kbd`. To show a
 * combination, nest them: the outer one groups and stays plain.
 *
 * Key names are not translated, because they are what's printed on the keyboard. Set `lang="en"`
 * on a key in a text of another language (3.1.2).
 *
 * @example
 * <p>Du kan flytta mellan fälten med <Kbd lang="en">Tab</Kbd>.</p>
 *
 * @example
 * <Kbd><Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">C</Kbd></Kbd>
 */
export function Kbd({ render, ref, ...otherProps }: KbdProps): ReactElement {
  const kbd = useKbd()
  // The class joins a prop's and a render element's own class names (mergeProps), so neither
  // can remove it and the theme keeps drawing the key.
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    render,
    defaultElement: kbd.element,
    partProps: { ...mergeProps(otherProps, kbd.rootProps), ref: elementRef },
    state: kbdState,
  })
}
Kbd.displayName = 'Kbd'

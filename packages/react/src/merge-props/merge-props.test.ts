import { createRef } from 'react'
import type { MouseEvent } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { mergeProps } from './merge-props.ts'

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const clickEvent = {} as MouseEvent<HTMLButtonElement>

describe('mergeProps', () => {
  it('lets a later prop object win for plain props', () => {
    expect(mergeProps({ type: 'submit', title: 'Egen' }, { type: 'button' })).toEqual({
      type: 'button',
      title: 'Egen',
    })
  })

  it('never lets an undefined value override a defined one', () => {
    expect(mergeProps({ type: 'submit' }, { type: undefined })).toEqual({ type: 'submit' })
  })

  it('chains event handlers in argument order, with the same arguments', () => {
    const calls: string[] = []
    const merged = mergeProps(
      {
        onClick: (event: MouseEvent<HTMLButtonElement>) =>
          calls.push(`own:${String(event === clickEvent)}`),
      },
      {
        onClick: (event: MouseEvent<HTMLButtonElement>) =>
          calls.push(`part:${String(event === clickEvent)}`),
      },
    )
    merged.onClick(clickEvent)
    expect(calls).toEqual(['own:true', 'part:true'])
  })

  it('keeps a single handler as it is', () => {
    const onFocus = () => {}
    expect(mergeProps({ onFocus }, { onFocus: undefined }).onFocus).toBe(onFocus)
    expect(mergeProps({}, { onFocus }).onFocus).toBe(onFocus)
  })

  it('joins class names', () => {
    expect(mergeProps({ className: 'egen' }, { className: 'del' }).className).toBe('egen del')
    expect(mergeProps({ className: 'egen' }, {}).className).toBe('egen')
    expect(mergeProps({ className: '' }, { className: 'del' }).className).toBe('del')
  })

  it('merges styles, the later object winning per property', () => {
    expect(
      mergeProps({ style: { color: 'red', margin: 0 } }, { style: { color: 'blue' } }).style,
    ).toEqual({ color: 'blue', margin: 0 })
  })

  it('merges refs, so every ref receives the element and is cleared on detach', () => {
    const objectRef = createRef<HTMLButtonElement>()
    const seen: (HTMLButtonElement | null)[] = []
    const callbackRef = (element: HTMLButtonElement | null) => {
      seen.push(element)
    }
    const merged = mergeProps({ ref: objectRef }, { ref: callbackRef })
    const element = document.createElement('button')

    expect(typeof merged.ref).toBe('function')
    const cleanup = (merged.ref as (element: HTMLButtonElement | null) => (() => void) | void)(
      element,
    )
    expect(objectRef.current).toBe(element)
    expect(seen).toEqual([element])

    cleanup?.()
    expect(objectRef.current).toBeNull()
    expect(seen).toEqual([element, null])
  })

  it('calls a callback ref’s own cleanup instead of calling it with null', () => {
    const calls: string[] = []
    const objectRef = createRef<HTMLButtonElement>()
    const merged = mergeProps(
      { ref: objectRef },
      {
        ref: () => {
          calls.push('attach')
          return () => calls.push('cleanup')
        },
      },
    )
    const cleanup = (merged.ref as (element: HTMLButtonElement | null) => (() => void) | void)(
      document.createElement('button'),
    )
    cleanup?.()
    expect(calls).toEqual(['attach', 'cleanup'])
  })

  it('warns once when two prop objects set different ids, and the later wins', () => {
    expect(mergeProps({ id: 'egen' }, { id: 'del' }).id).toBe('del')
    mergeProps({ id: 'egen' }, { id: 'del' })
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('"egen"')
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('"del"')
  })

  it('does not warn for the same id twice', () => {
    mergeProps({ id: 'samma' }, { id: 'samma' })
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  it('merges any number of prop objects', () => {
    expect(
      mergeProps({ className: 'a' }, { className: 'b' }, { className: 'c', title: 'Sista' }),
    ).toEqual({ className: 'a b c', title: 'Sista' })
  })

  it('is typed: the later object’s type wins per key', () => {
    const merged = mergeProps(
      { type: 'submit' as const, title: 'Egen' },
      { type: 'button' as const },
    )
    expectTypeOf(merged.type).toEqualTypeOf<'button'>()
    expectTypeOf(merged.title).toEqualTypeOf<string>()
  })
})

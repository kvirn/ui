import { describe, expect, test } from 'vite-plus/test'
import { createDismissableLayerStack } from './dismissable-layer-stack.ts'

/** Targets are plain strings here, and a layer "contains" the targets listed for it. */
function containsFrom(elements: Record<string, readonly string[]>) {
  return (id: string, target: unknown) => elements[id]?.includes(target as string) === true
}

describe('createDismissableLayerStack: ordering', () => {
  test('starts empty', () => {
    const stack = createDismissableLayerStack()
    expect(stack.getIds()).toEqual([])
    expect(stack.getTopId()).toBeUndefined()
    expect(stack.isTop('a')).toBe(false)
    expect(stack.has('a')).toBe(false)
  })

  test('the last pushed layer is the top one', () => {
    const stack = createDismissableLayerStack()
    stack.push('a')
    stack.push('b')
    expect(stack.getIds()).toEqual(['a', 'b'])
    expect(stack.getTopId()).toBe('b')
    expect(stack.isTop('b')).toBe(true)
    expect(stack.isTop('a')).toBe(false)
  })

  test('removing the top layer makes the one below it the top', () => {
    const stack = createDismissableLayerStack()
    stack.push('a')
    stack.push('b')
    expect(stack.remove('b')).toBe(true)
    expect(stack.isTop('a')).toBe(true)
  })

  test('removing a layer in the middle keeps the order of the rest', () => {
    const stack = createDismissableLayerStack()
    stack.push('a')
    stack.push('b')
    stack.push('c')
    stack.remove('b')
    expect(stack.getIds()).toEqual(['a', 'c'])
    expect(stack.isTop('c')).toBe(true)
  })

  test('remove reports false for a layer that is not there', () => {
    const stack = createDismissableLayerStack()
    expect(stack.remove('missing')).toBe(false)
  })

  test('push returns a function that removes the layer', () => {
    const stack = createDismissableLayerStack()
    stack.push('a')
    const removeB = stack.push('b')
    removeB()
    expect(stack.getIds()).toEqual(['a'])
    removeB()
    expect(stack.getIds()).toEqual(['a'])
  })

  test('pushing an id that is already there keeps its place and replaces its options', () => {
    const stack = createDismissableLayerStack()
    stack.push('a', { dismissOnEscape: false })
    stack.push('b')
    stack.push('a', { dismissOnEscape: true })
    expect(stack.getIds()).toEqual(['a', 'b'])
    expect(stack.isTop('b')).toBe(true)
    stack.remove('b')
    expect(stack.handleEscape()).toBe('a')
  })
})

describe('createDismissableLayerStack: Escape', () => {
  test('dismisses nothing when there are no layers', () => {
    expect(createDismissableLayerStack().handleEscape()).toBeUndefined()
  })

  test('only the top layer dismisses', () => {
    const stack = createDismissableLayerStack()
    stack.push('a')
    stack.push('b')
    expect(stack.handleEscape()).toBe('b')
  })

  test('the next Escape reaches the layer below once the top one is removed', () => {
    const stack = createDismissableLayerStack()
    stack.push('a')
    stack.push('b')
    stack.remove(stack.handleEscape() as string)
    expect(stack.handleEscape()).toBe('a')
    stack.remove('a')
    expect(stack.handleEscape()).toBeUndefined()
  })

  test('answering does not remove the layer', () => {
    const stack = createDismissableLayerStack()
    stack.push('a')
    stack.handleEscape()
    expect(stack.has('a')).toBe(true)
  })

  test('a top layer that opted out of Escape dismisses nothing, and does not pass it on', () => {
    const stack = createDismissableLayerStack()
    stack.push('a')
    stack.push('b', { dismissOnEscape: false })
    expect(stack.handleEscape()).toBeUndefined()
  })
})

describe('createDismissableLayerStack: outside press', () => {
  const contains = containsFrom({ a: ['a-item'], b: ['b-item'] })

  test('dismisses nothing when there are no layers', () => {
    expect(createDismissableLayerStack().handleOutsidePress('page', contains)).toBeUndefined()
  })

  test('a press outside the top layer dismisses it', () => {
    const stack = createDismissableLayerStack()
    stack.push('a')
    expect(stack.handleOutsidePress('page', contains)).toBe('a')
  })

  test('a press inside the top layer dismisses nothing', () => {
    const stack = createDismissableLayerStack()
    stack.push('a')
    expect(stack.handleOutsidePress('a-item', contains)).toBeUndefined()
  })

  test('only the top layer dismisses', () => {
    const stack = createDismissableLayerStack()
    stack.push('a')
    stack.push('b')
    expect(stack.handleOutsidePress('page', contains)).toBe('b')
  })

  test('a press inside a layer below dismisses the top layer only', () => {
    const stack = createDismissableLayerStack()
    stack.push('a')
    stack.push('b')
    expect(stack.handleOutsidePress('a-item', contains)).toBe('b')
  })

  test('a press inside the top layer does not dismiss the layer below', () => {
    const stack = createDismissableLayerStack()
    stack.push('a')
    stack.push('b')
    expect(stack.handleOutsidePress('b-item', contains)).toBeUndefined()
  })

  test('the layer under the top one is not asked about the press', () => {
    const stack = createDismissableLayerStack()
    stack.push('a')
    stack.push('b')
    const asked: string[] = []
    stack.handleOutsidePress('page', (id) => {
      asked.push(id)
      return false
    })
    expect(asked).toEqual(['b'])
  })

  test('a top layer that opted out of outside presses dismisses nothing', () => {
    const stack = createDismissableLayerStack()
    stack.push('a')
    stack.push('b', { dismissOnOutsidePress: false })
    expect(stack.handleOutsidePress('page', contains)).toBeUndefined()
  })
})

describe('createDismissableLayerStack: layers that pass outside presses through', () => {
  const contains = containsFrom({})

  test('a press goes to the layer below a see-through top layer', () => {
    const stack = createDismissableLayerStack()
    stack.push('popover')
    stack.push('tooltip', { dismissOnOutsidePress: false, passOutsidePressThrough: true })
    expect(stack.handleOutsidePress('page', contains)).toBe('popover')
  })

  test('a press inside the layer below is not outside it', () => {
    const stack = createDismissableLayerStack()
    stack.push('popover')
    stack.push('tooltip', { passOutsidePressThrough: true })
    const insidePopover = containsFrom({ popover: ['trigger'] })
    expect(stack.handleOutsidePress('trigger', insidePopover)).toBeUndefined()
  })

  test('Escape still goes to the see-through layer first', () => {
    const stack = createDismissableLayerStack()
    stack.push('popover')
    stack.push('tooltip', { passOutsidePressThrough: true })
    expect(stack.handleEscape()).toBe('tooltip')
  })

  test('a modal layer that only opts out of presses still shields the layers below', () => {
    const stack = createDismissableLayerStack()
    stack.push('popover')
    stack.push('dialog', { dismissOnOutsidePress: false })
    expect(stack.handleOutsidePress('page', contains)).toBeUndefined()
  })
})

describe('createDismissableLayerStack: ignore predicates', () => {
  const contains = containsFrom({ listbox: ['option'] })
  const isInput = (target: unknown) => target === 'input'
  const isButton = (target: unknown) => target === 'button'

  test('a press on an ignored target counts as inside', () => {
    const stack = createDismissableLayerStack()
    stack.push('listbox', { ignore: [isInput, isButton] })
    expect(stack.handleOutsidePress('input', contains)).toBeUndefined()
    expect(stack.handleOutsidePress('button', contains)).toBeUndefined()
  })

  test('a press on anything else still dismisses', () => {
    const stack = createDismissableLayerStack()
    stack.push('listbox', { ignore: [isInput, isButton] })
    expect(stack.handleOutsidePress('page', contains)).toBe('listbox')
  })

  test('one matching predicate is enough', () => {
    const stack = createDismissableLayerStack()
    stack.push('listbox', { ignore: [isInput, isButton] })
    expect(stack.handleOutsidePress('button', contains)).toBeUndefined()
  })

  test('an ignore list does not affect Escape', () => {
    const stack = createDismissableLayerStack()
    stack.push('listbox', { ignore: [isInput] })
    expect(stack.handleEscape()).toBe('listbox')
  })

  test('only the top layer`s ignore predicates apply', () => {
    const stack = createDismissableLayerStack()
    stack.push('listbox', { ignore: [isInput] })
    stack.push('popover')
    expect(stack.handleOutsidePress('input', contains)).toBe('popover')
  })

  test('replacing the options replaces the ignore list', () => {
    const stack = createDismissableLayerStack()
    stack.push('listbox', { ignore: [isInput] })
    stack.push('listbox', { ignore: [isButton] })
    expect(stack.handleOutsidePress('input', contains)).toBe('listbox')
    expect(stack.handleOutsidePress('button', contains)).toBeUndefined()
  })
})

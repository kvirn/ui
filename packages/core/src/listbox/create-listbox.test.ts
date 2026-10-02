import { describe, expect, test, vi } from 'vite-plus/test'
import { createListbox } from './create-listbox.ts'
import type { ListboxEnv } from './create-listbox.ts'

interface Timer {
  id: number
  at: number
  run: () => void
}

/** Hand-driven timers. No DOM and no real waiting in Node. */
function createFakeEnv() {
  let now = 0
  let nextId = 1
  let timers: Timer[] = []
  const env: ListboxEnv = {
    window: {
      setTimeout: (handler, milliseconds) => {
        const id = nextId++
        timers.push({ id, at: now + milliseconds, run: handler })
        return id
      },
      clearTimeout: (id) => {
        timers = timers.filter((timer) => timer.id !== id)
      },
    },
  }
  return {
    env,
    advance(milliseconds: number) {
      const target = now + milliseconds
      for (;;) {
        const due = timers.filter((timer) => timer.at <= target).toSorted((a, b) => a.at - b.at)[0]
        if (due === undefined) {
          break
        }
        timers = timers.filter((timer) => timer !== due)
        now = due.at
        due.run()
      }
      now = target
    },
  }
}

const fruit = ['Apple', 'Apricot', 'Banana', 'Cherry', 'Date']
const numbered = Array.from({ length: 25 }, (_, index) => `Item ${String(index).padStart(2, '0')}`)

describe('active entry', () => {
  test('nothing is active at first', () => {
    const listbox = createListbox({ items: fruit })
    expect(listbox.getActiveKey()).toBeUndefined()
    expect(listbox.getActiveIndex()).toBe(-1)
    expect(listbox.getState().activeKey).toBeUndefined()
    expect(listbox.getSize()).toBe(5)
  })

  test('activateNext from nothing goes to the first entry, then on, and stops at the last', () => {
    const listbox = createListbox({ items: fruit })
    expect(listbox.actions.activateNext()).toBe('Apple')
    expect(listbox.actions.activateNext()).toBe('Apricot')
    listbox.actions.activateLast()
    expect(listbox.actions.activateNext()).toBe('Date')
    expect(listbox.getActiveIndex()).toBe(4)
  })

  test('activatePrevious from nothing goes to the last entry, back, and stops at the first', () => {
    const listbox = createListbox({ items: fruit })
    expect(listbox.actions.activatePrevious()).toBe('Date')
    expect(listbox.actions.activatePrevious()).toBe('Cherry')
    listbox.actions.activateFirst()
    expect(listbox.actions.activatePrevious()).toBe('Apple')
    expect(listbox.getActiveIndex()).toBe(0)
  })

  test('activateFirst and activateLast', () => {
    const listbox = createListbox({ items: fruit })
    expect(listbox.actions.activateLast()).toBe('Date')
    expect(listbox.actions.activateFirst()).toBe('Apple')
  })

  test('page jumps move ten entries and stop at the ends', () => {
    const listbox = createListbox({ items: numbered })
    expect(listbox.actions.activateNextPage()).toBe('Item 09')
    expect(listbox.actions.activateNextPage()).toBe('Item 19')
    expect(listbox.actions.activateNextPage()).toBe('Item 24')
    expect(listbox.actions.activatePreviousPage()).toBe('Item 14')
    expect(listbox.actions.activatePreviousPage()).toBe('Item 04')
    expect(listbox.actions.activatePreviousPage()).toBe('Item 00')
  })

  test('PageUp from nothing goes to the last entry', () => {
    const listbox = createListbox({ items: numbered })
    expect(listbox.actions.activatePreviousPage()).toBe('Item 24')
  })

  test('the page size can be changed', () => {
    const listbox = createListbox({ items: numbered, pageSize: 3 })
    expect(listbox.actions.activateNextPage()).toBe('Item 02')
    expect(listbox.actions.activateNextPage()).toBe('Item 05')
  })

  test('an empty list has nothing to activate', () => {
    const listbox = createListbox<string>({ items: [] })
    expect(listbox.actions.activateNext()).toBeUndefined()
    expect(listbox.actions.activatePrevious()).toBeUndefined()
    expect(listbox.actions.activateFirst()).toBeUndefined()
    expect(listbox.actions.activateLast()).toBeUndefined()
    expect(listbox.actions.activateNextPage()).toBeUndefined()
    expect(listbox.actions.activatePreviousPage()).toBeUndefined()
  })

  test('setActiveKey refuses a key that is not in the list and clears with undefined', () => {
    const listbox = createListbox({ items: fruit })
    expect(listbox.actions.setActiveKey('Cherry')).toBe(true)
    expect(listbox.actions.setActiveKey('Mango')).toBe(false)
    expect(listbox.getActiveKey()).toBe('Cherry')
    expect(listbox.actions.setActiveKey(undefined)).toBe(true)
    expect(listbox.getActiveKey()).toBeUndefined()
    expect(listbox.getActiveIndex()).toBe(-1)
  })

  test('subscribers hear about a change of the active entry', () => {
    const listbox = createListbox({ items: fruit })
    const listener = vi.fn<(...args: unknown[]) => void>()
    listbox.subscribe(listener)
    listbox.actions.activateNext()
    expect(listener).toHaveBeenCalledTimes(1)
  })
})

describe('items, keys and groups', () => {
  test('itemToString and itemToKey work on objects, and the types are inferred', () => {
    const listbox = createListbox({
      items: [
        { code: '0180', name: 'Stockholm' },
        { code: '1480', name: 'Göteborg' },
      ],
      itemToString: (municipality) => municipality.name,
      itemToKey: (municipality) => municipality.code,
    })
    expect(listbox.getState().entries.map((entry) => [entry.key, entry.label])).toEqual([
      ['0180', 'Stockholm'],
      ['1480', 'Göteborg'],
    ])
    listbox.actions.select('1480')
    expect(listbox.getEntry('1480')?.item.name).toBe('Göteborg')
  })

  test('groups number their entries across groups, and keep the group', () => {
    const listbox = createListbox({
      groups: [
        { key: 'fruit', label: 'Fruit', items: ['Apple', 'Banana'] },
        { key: 'vegetables', label: 'Vegetables', items: ['Carrot'] },
      ],
    })
    const state = listbox.getState()
    expect(state.size).toBe(3)
    expect(state.entries.map((entry) => [entry.label, entry.index, entry.groupKey])).toEqual([
      ['Apple', 0, 'fruit'],
      ['Banana', 1, 'fruit'],
      ['Carrot', 2, 'vegetables'],
    ])
    expect(
      state.sections?.map((section) => [section.key, section.label, section.entries.length]),
    ).toEqual([
      ['fruit', 'Fruit', 2],
      ['vegetables', 'Vegetables', 1],
    ])
    listbox.actions.setActiveKey('Banana')
    expect(listbox.actions.activateNext()).toBe('Carrot')
  })

  test('a flat list has no sections', () => {
    expect(createListbox({ items: fruit }).getState().sections).toBeUndefined()
  })

  test('setItems keeps the active entry when it is still there and clears it when it is gone', () => {
    const listbox = createListbox({ items: fruit })
    listbox.actions.setActiveKey('Banana')
    listbox.actions.setItems(['Banana', 'Fig'])
    expect(listbox.getActiveKey()).toBe('Banana')
    expect(listbox.getActiveIndex()).toBe(0)
    expect(listbox.getSize()).toBe(2)
    listbox.actions.setItems(['Fig'])
    expect(listbox.getActiveKey()).toBeUndefined()
    expect(listbox.getActiveIndex()).toBe(-1)
  })

  test('setGroups replaces a flat list with groups', () => {
    const listbox = createListbox({ items: fruit })
    listbox.actions.setGroups([{ key: 'a', label: 'A', items: ['Apple'] }])
    expect(listbox.getSize()).toBe(1)
    expect(listbox.getState().sections).toHaveLength(1)
  })

  test('the selection survives items that are filtered out', () => {
    const listbox = createListbox({ items: fruit, selectedKeys: ['Cherry'] })
    listbox.actions.setItems(['Apple'])
    expect(listbox.getSelectedKeys()).toEqual(['Cherry'])
  })

  test('getRequiredRenderKeys reports the active entry, then the selected ones that are listed', () => {
    const listbox = createListbox({ items: fruit, multiple: true, selectedKeys: ['Date', 'Fig'] })
    expect(listbox.getRequiredRenderKeys()).toEqual(['Date'])
    listbox.actions.setActiveKey('Apple')
    expect(listbox.getRequiredRenderKeys()).toEqual(['Apple', 'Date'])
    listbox.actions.setActiveKey('Date')
    expect(listbox.getRequiredRenderKeys()).toEqual(['Date'])
  })
})

describe('disabled entries', () => {
  const options = {
    items: fruit,
    isItemDisabled: (item: string) => item === 'Banana',
  }

  test('stay reachable with the arrow keys', () => {
    const listbox = createListbox(options)
    listbox.actions.setActiveKey('Apricot')
    expect(listbox.actions.activateNext()).toBe('Banana')
    expect(listbox.getEntry('Banana')?.disabled).toBe(true)
    expect(listbox.actions.activateNext()).toBe('Cherry')
  })

  test('cannot be selected or toggled', () => {
    const onSelectedKeysChange = vi.fn<(...args: unknown[]) => void>()
    const listbox = createListbox({ ...options, onSelectedKeysChange })
    expect(listbox.actions.select('Banana')).toBe(false)
    expect(listbox.actions.toggle('Banana')).toBe(false)
    expect(listbox.getSelectedKeys()).toEqual([])
    expect(onSelectedKeysChange).not.toHaveBeenCalled()
  })

  test('are found by typeahead', () => {
    const listbox = createListbox(options)
    expect(listbox.actions.typeahead('b')).toBe('Banana')
  })
})

describe('selection', () => {
  test('single: select replaces the selection and reports the change once', () => {
    const onSelectedKeysChange = vi.fn<(...args: unknown[]) => void>()
    const listbox = createListbox({ items: fruit, onSelectedKeysChange })
    expect(listbox.actions.select('Apple')).toBe(true)
    expect(listbox.actions.select('Cherry')).toBe(true)
    expect(listbox.getSelectedKeys()).toEqual(['Cherry'])
    expect(onSelectedKeysChange).toHaveBeenCalledTimes(2)
    expect(onSelectedKeysChange).toHaveBeenLastCalledWith(['Cherry'])
    // Selecting what is already selected is accepted and is not a change.
    expect(listbox.actions.select('Cherry')).toBe(true)
    expect(onSelectedKeysChange).toHaveBeenCalledTimes(2)
  })

  test('single: toggle selects and does not unselect', () => {
    const listbox = createListbox({ items: fruit })
    listbox.actions.toggle('Apple')
    listbox.actions.toggle('Apple')
    expect(listbox.getSelectedKeys()).toEqual(['Apple'])
  })

  test('single: only the first initial key is used', () => {
    const listbox = createListbox({ items: fruit, selectedKeys: ['Banana', 'Cherry'] })
    expect(listbox.getSelectedKeys()).toEqual(['Banana'])
  })

  test('select refuses a key that is not in the list', () => {
    const listbox = createListbox({ items: fruit })
    expect(listbox.actions.select('Mango')).toBe(false)
  })

  test('multiple: select adds, toggle flips, in the order chosen', () => {
    const onSelectedKeysChange = vi.fn<(...args: unknown[]) => void>()
    const listbox = createListbox({ items: fruit, multiple: true, onSelectedKeysChange })
    listbox.actions.select('Cherry')
    listbox.actions.select('Apple')
    expect(listbox.getSelectedKeys()).toEqual(['Cherry', 'Apple'])
    listbox.actions.toggle('Cherry')
    expect(listbox.getSelectedKeys()).toEqual(['Apple'])
    listbox.actions.toggle('Date')
    expect(listbox.getSelectedKeys()).toEqual(['Apple', 'Date'])
    expect(onSelectedKeysChange).toHaveBeenLastCalledWith(['Apple', 'Date'])
  })

  test('multiple: select does not add a key twice', () => {
    const listbox = createListbox({ items: fruit, multiple: true })
    listbox.actions.select('Apple')
    listbox.actions.select('Apple')
    expect(listbox.getSelectedKeys()).toEqual(['Apple'])
  })

  test('deselect and clearSelection', () => {
    const listbox = createListbox({ items: fruit, multiple: true, selectedKeys: ['Apple', 'Date'] })
    expect(listbox.actions.deselect('Apple')).toBe(true)
    expect(listbox.actions.deselect('Apple')).toBe(false)
    expect(listbox.getSelectedKeys()).toEqual(['Date'])
    listbox.actions.clearSelection()
    expect(listbox.getSelectedKeys()).toEqual([])
  })

  test('deselect works on a key the list no longer shows', () => {
    const listbox = createListbox({ items: fruit, multiple: true, selectedKeys: ['Date'] })
    listbox.actions.setItems(['Apple'])
    expect(listbox.actions.deselect('Date')).toBe(true)
  })

  test('setSelectedKeys sets the selection without calling onSelectedKeysChange', () => {
    const onSelectedKeysChange = vi.fn<(...args: unknown[]) => void>()
    const listbox = createListbox({ items: fruit, multiple: true, onSelectedKeysChange })
    listbox.actions.setSelectedKeys(['Date', 'Apple', 'Date'])
    expect(listbox.getSelectedKeys()).toEqual(['Date', 'Apple'])
    expect(onSelectedKeysChange).not.toHaveBeenCalled()
  })

  test('selecting does not move the active entry', () => {
    const listbox = createListbox({ items: fruit })
    listbox.actions.select('Cherry')
    expect(listbox.getActiveKey()).toBeUndefined()
  })
})

describe('typeahead', () => {
  test('matches the start of the label', () => {
    const listbox = createListbox({ items: fruit })
    expect(listbox.actions.typeahead('b')).toBe('Banana')
    expect(listbox.getActiveKey()).toBe('Banana')
  })

  test('the same letter again cycles through the entries that start with it', () => {
    const listbox = createListbox({ items: fruit })
    expect(listbox.actions.typeahead('a')).toBe('Apple')
    expect(listbox.actions.typeahead('a')).toBe('Apricot')
    expect(listbox.actions.typeahead('a')).toBe('Apple')
  })

  test('more letters narrow the match and keep the active entry when it still fits', () => {
    const listbox = createListbox({ items: fruit })
    expect(listbox.actions.typeahead('a')).toBe('Apple')
    expect(listbox.actions.typeahead('p')).toBe('Apple')
    expect(listbox.actions.typeahead('r')).toBe('Apricot')
    expect(listbox.getState().typeaheadBuffer).toBe('apr')
  })

  test('wraps from the end of the list', () => {
    const listbox = createListbox({ items: fruit })
    listbox.actions.setActiveKey('Cherry')
    expect(listbox.actions.typeahead('a')).toBe('Apple')
  })

  test('a letter with no match returns undefined and keeps the active entry', () => {
    const listbox = createListbox({ items: fruit })
    listbox.actions.setActiveKey('Cherry')
    expect(listbox.actions.typeahead('z')).toBeUndefined()
    expect(listbox.getActiveKey()).toBe('Cherry')
  })

  test('the word ends after a pause, through the injected timers', () => {
    const clock = createFakeEnv()
    const listbox = createListbox({ items: fruit }, clock.env)
    expect(listbox.actions.typeahead('b')).toBe('Banana')
    clock.advance(499)
    expect(listbox.getState().typeaheadBuffer).toBe('b')
    clock.advance(1)
    expect(listbox.getState().typeaheadBuffer).toBe('')
    // A fresh word: "bc" would match nothing, "c" finds Cherry.
    expect(listbox.actions.typeahead('c')).toBe('Cherry')
  })

  test('each letter restarts the pause', () => {
    const clock = createFakeEnv()
    const listbox = createListbox({ items: fruit }, clock.env)
    listbox.actions.typeahead('a')
    clock.advance(400)
    listbox.actions.typeahead('p')
    clock.advance(400)
    expect(listbox.getState().typeaheadBuffer).toBe('ap')
    clock.advance(100)
    expect(listbox.getState().typeaheadBuffer).toBe('')
  })

  test('the pause can be changed', () => {
    const clock = createFakeEnv()
    const listbox = createListbox({ items: fruit, typeaheadResetMilliseconds: 100 }, clock.env)
    listbox.actions.typeahead('a')
    clock.advance(100)
    expect(listbox.getState().typeaheadBuffer).toBe('')
  })

  test('moving with an arrow ends the word', () => {
    const listbox = createListbox({ items: fruit })
    listbox.actions.typeahead('a')
    listbox.actions.activateNext()
    expect(listbox.getState().typeaheadBuffer).toBe('')
  })

  test('without timers the word lasts until resetTypeahead', () => {
    const listbox = createListbox({ items: fruit })
    listbox.actions.typeahead('b')
    expect(listbox.getState().typeaheadBuffer).toBe('b')
    listbox.actions.resetTypeahead()
    expect(listbox.getState().typeaheadBuffer).toBe('')
  })

  test('is locale-aware: å, ä and ö are not a and o in Swedish', () => {
    const items = ['Zebra', 'Ärlig', 'Arvika', 'Åre']
    expect(createListbox({ items, locale: 'sv' }).actions.typeahead('a')).toBe('Arvika')
    expect(createListbox({ items, locale: 'sv' }).actions.typeahead('å')).toBe('Åre')
    expect(createListbox({ items, locale: 'sv' }).actions.typeahead('ä')).toBe('Ärlig')
    expect(createListbox({ items, locale: 'en' }).actions.typeahead('a')).toBe('Ärlig')
  })

  test('ignores case', () => {
    const listbox = createListbox({ items: fruit })
    expect(listbox.actions.typeahead('B')).toBe('Banana')
  })

  test('a space inside a word', () => {
    const listbox = createListbox({ items: ['Newark', 'New York'] })
    for (const letter of ['n', 'e', 'w', ' ']) {
      listbox.actions.typeahead(letter)
    }
    expect(listbox.getActiveKey()).toBe('New York')
  })

  test('an empty character does nothing', () => {
    const listbox = createListbox({ items: fruit })
    expect(listbox.actions.typeahead('')).toBeUndefined()
    expect(listbox.getState().typeaheadBuffer).toBe('')
  })
})

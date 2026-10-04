import type { FileUploadEntry, FileUploadItem } from '@kvirn-ui/core'
import type { ComponentProps } from 'react'
import { describe, expect, expectTypeOf, test } from 'vite-plus/test'
import * as api from './index.ts'

// The naming rules for compound components (api-conventions skill), checked over the public entry:
// a component with parts is a namespace (`X.Root` + `X.Part`), a single element is flat, a part of
// another component is aliased onto its parent under its own display name, and every part also has
// a flat named export (`FieldRoot`, `CardHeader`) for React Server Components, which can't dot
// into a client module.

// The deprecated names, in one place. They keep working until 1.0 and are skipped by the checks
// that would otherwise fail on them.
/** Bare generic exports, replaced by the namespace part named here. */
const deprecatedExports: Record<string, string> = {
  Label: 'Field.Label',
  ErrorMessage: 'Field.ErrorMessage',
  Legend: 'Fieldset.Legend',
}
/** Bare exports whose namespace part is a wrapper around them, so not the same component. */
const deprecatedWrappedExports: Record<string, string> = {
  Radio: 'RadioGroup.Radio',
}
/** `<Export>.<Key>` aliases on single-element components. A Prose and a Section are one element. */
const deprecatedKeys = ['Prose.Root', 'Section.Root']

type Entry = [name: string, value: unknown]

const exportEntries = Object.entries(api) as Entry[]

function isComponent(value: unknown): value is { displayName?: unknown } {
  if (typeof value === 'function') {
    return true
  }
  return typeof value === 'object' && value !== null && '$$typeof' in value
}

function isComponentName(name: string): boolean {
  return /^[A-Z]/.test(name)
}

/** The parts of a namespace object or a callable root: its capitalised component properties. */
function partsOf(value: unknown): Entry[] {
  if ((typeof value !== 'object' && typeof value !== 'function') || value === null) {
    return []
  }
  return Object.entries(value).filter(([key, part]) => isComponentName(key) && isComponent(part))
}

/**
 * The namespaces: every capitalised export that has parts. A callable root is exported twice
 * (`Field` and `FieldRoot` are one function), so only the shortest name of each is a namespace.
 */
function namespaces(): Array<{ name: string; value: unknown; parts: Entry[] }> {
  const byValue = new Map<unknown, string>()
  for (const [name, value] of exportEntries) {
    if (!isComponentName(name) || partsOf(value).length === 0) {
      continue
    }
    const known = byValue.get(value)
    if (known === undefined || name.length < known.length) {
      byValue.set(value, name)
    }
  }
  return [...byValue].map(([value, name]) => ({ name, value, parts: partsOf(value) }))
}

describe('display names', () => {
  test('every exported component has a display name', () => {
    const missing: string[] = []
    for (const [name, value] of exportEntries) {
      if (isComponentName(name) && isComponent(value)) {
        if (typeof value.displayName !== 'string' || value.displayName === '') {
          missing.push(name)
        }
      }
    }
    expect(missing).toEqual([])
  })

  test('every part of a namespace or callable root is named <Export>.<Key>, except deprecated keys', () => {
    const wrong: string[] = []
    for (const { name, parts } of namespaces()) {
      for (const [key, part] of parts) {
        if (deprecatedKeys.includes(`${name}.${key}`)) {
          continue
        }
        const displayName = (part as { displayName?: unknown }).displayName
        if (displayName !== `${name}.${key}`) {
          wrong.push(`${name}.${key} has displayName ${String(displayName)}`)
        }
      }
    }
    expect(wrong).toEqual([])
  })

  test('a callable root is named after its Root: Field.Root, Fieldset.Root, Link.Root', () => {
    expect(api.Field.displayName).toBe('Field.Root')
    expect(api.Fieldset.displayName).toBe('Fieldset.Root')
    expect(api.Link.displayName).toBe('Link.Root')
    expect(api.Link.NewTabNotice.displayName).toBe('Link.NewTabNotice')
  })

  test('single elements are named flat', () => {
    expect(api.Button.displayName).toBe('Button')
    expect(api.Heading.displayName).toBe('Heading')
    expect(api.Kbd.displayName).toBe('Kbd')
    expect(api.Icon.displayName).toBe('Icon')
    expect(api.Input.displayName).toBe('Input')
    expect(api.Checkbox.displayName).toBe('Checkbox')
    expect(api.Prose.displayName).toBe('Prose')
    expect(api.Section.displayName).toBe('Section')
  })

  test('a part aliased onto its parent has its own name, not the source component’s', () => {
    expect(api.Combobox.Option.displayName).toBe('Combobox.Option')
    expect(api.Autocomplete.Control.displayName).toBe('Autocomplete.Control')
    expect(api.Autocomplete.Option.displayName).toBe('Autocomplete.Option')
    expect(api.Field.Prose.displayName).toBe('Field.Prose')
    expect(api.Fieldset.Prose.displayName).toBe('Fieldset.Prose')
    expect(api.CheckboxGroup.Legend.displayName).toBe('CheckboxGroup.Legend')
    expect(api.RadioGroup.Radio.displayName).toBe('RadioGroup.Radio')
    expect(api.InputGroup.Input.displayName).toBe('InputGroup.Input')
    expect(api.Combobox.Option).not.toBe(api.Listbox.Option)
    expect(api.Autocomplete.Option).not.toBe(api.Combobox.Option)
    expect(api.Field.Prose).not.toBe(api.Prose)
  })
})

describe('single elements', () => {
  test('have no .Root other than the deprecated ones', () => {
    const roots: string[] = []
    for (const { name, parts } of namespaces()) {
      const isOnlyRoot = parts.length === 1 && parts[0]?.[0] === 'Root'
      if (isOnlyRoot && !deprecatedKeys.includes(`${name}.Root`)) {
        roots.push(`${name}.Root`)
      }
    }
    expect(roots).toEqual([])
  })

  test('the deprecated keys are exactly the ones on the allowlist', () => {
    expect(api.Prose.Root).toBe(api.ProseRoot)
    expect(api.Section.Root).toBe(api.SectionRoot)
    expect(deprecatedKeys).toEqual(['Prose.Root', 'Section.Root'])
  })
})

describe('flat part exports', () => {
  test('every part of a namespace has a flat export <Export><Key> that is the same component', () => {
    const exported = new Map(exportEntries)
    const missing: string[] = []
    for (const { name, parts } of namespaces()) {
      for (const [key, part] of parts) {
        if (deprecatedKeys.includes(`${name}.${key}`)) {
          continue
        }
        const flat = exported.get(`${name}${key}`)
        if (flat !== part) {
          missing.push(`${name}${key}`)
        }
      }
    }
    expect(missing).toEqual([])
  })

  test('the deprecated bare names are the same components as their namespace parts', () => {
    const exported = new Map(exportEntries)
    for (const [bare, path] of Object.entries(deprecatedExports)) {
      const [namespace, key] = path.split('.')
      expect(exported.get(bare)).toBe(
        Reflect.get(exported.get(namespace ?? '') as object, key ?? ''),
      )
    }
  })

  test('the deprecated wrapped names have a namespace part that replaces them', () => {
    const exported = new Map(exportEntries)
    for (const [bare, path] of Object.entries(deprecatedWrappedExports)) {
      const [namespace, key] = path.split('.')
      const part = Reflect.get(exported.get(namespace ?? '') as object, key ?? '') as {
        displayName?: string
      }
      expect(exported.get(bare)).toBeDefined()
      expect(part.displayName).toBe(path)
    }
  })

  test('callable roots stay callable and are the same function as their Root', () => {
    expect(api.Field).toBe(api.Field.Root)
    expect(api.Fieldset).toBe(api.Fieldset.Root)
    expect(api.Link).toBe(api.Link.Root)
  })
})

describe('alias sets', () => {
  test('each parent offers the parts of its decided alias set', () => {
    const keys = (value: unknown) => partsOf(value).map(([key]) => key)
    expect(keys(api.Field)).toEqual(
      expect.arrayContaining(['Root', 'Label', 'Prose', 'ErrorMessage']),
    )
    expect(keys(api.Fieldset)).toEqual(
      expect.arrayContaining(['Root', 'Legend', 'Prose', 'ErrorMessage']),
    )
    expect(keys(api.CheckboxGroup)).toEqual(
      expect.arrayContaining(['Root', 'Legend', 'Prose', 'ErrorMessage']),
    )
    expect(keys(api.RadioGroup)).toEqual(
      expect.arrayContaining(['Root', 'Radio', 'Legend', 'Prose', 'ErrorMessage']),
    )
    expect(keys(api.InputGroup)).toEqual(expect.arrayContaining(['Root', 'Addon', 'Input']))
    expect(keys(api.Link)).toEqual(expect.arrayContaining(['Root', 'NewTabNotice']))
  })
})

describe('types', () => {
  type Municipality = { id: string; name: string }

  test('a generic TItem flows through the Combobox and Autocomplete wrappers', () => {
    const municipality: Municipality = { id: 'sk', name: 'Skellefteå' }
    // `item` fixes TItem, so the state that `render` receives carries the same type.
    const comboboxOption = (
      <api.Combobox.Option
        item={municipality}
        render={(partProps, state) => {
          expectTypeOf(state.item).toEqualTypeOf<Municipality>()
          return <div {...partProps} />
        }}
      />
    )
    const autocompleteOption = (
      <api.Autocomplete.Option
        item={municipality}
        render={(partProps, state) => {
          expectTypeOf(state.item).toEqualTypeOf<Municipality>()
          return <div {...partProps} />
        }}
      />
    )
    expect(comboboxOption).toBeDefined()
    expect(autocompleteOption).toBeDefined()
  })

  test('the wrapper’s props are the shared part’s props', () => {
    expectTypeOf<ComponentProps<typeof api.Combobox.Option<Municipality>>>().toEqualTypeOf<
      api.ComboboxOptionProps<Municipality>
    >()
    expectTypeOf<ComponentProps<typeof api.Combobox.List<Municipality>>>().toEqualTypeOf<
      api.ComboboxListProps<Municipality>
    >()
    expectTypeOf<ComponentProps<typeof api.Autocomplete.Group<Municipality>>>().toEqualTypeOf<
      api.AutocompleteGroupProps<Municipality>
    >()
  })

  test('the deprecated core type is the renamed one', () => {
    expectTypeOf<FileUploadItem<string>>().toEqualTypeOf<FileUploadEntry<string>>()
  })
})

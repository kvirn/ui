import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import {
  SummaryList,
  SummaryListActions,
  SummaryListChange,
  SummaryListKey,
  SummaryListRoot,
  SummaryListRow,
  SummaryListValue,
} from './summary-list.tsx'
import type {
  SummaryListActionsProps,
  SummaryListChangeProps,
  SummaryListKeyProps,
  SummaryListPartProps,
  SummaryListRootProps,
  SummaryListRowProps,
  SummaryListValueProps,
} from './summary-list.tsx'
import { useSummaryList } from './use-summary-list.ts'
import type { UseSummaryListResult } from './use-summary-list.ts'

// Contract: summary-list.a11y.md. The stacked layout below 40rem is the theme's, proved by the
// axe run of the Reflow320 story, where theme.css is loaded.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const warnings = () => consoleWarn.mock.calls.map(([message]) => String(message))

function Answers() {
  return (
    <>
      {/* Unstyled links: a 24px minimum keeps them clear of axe's target-size rule (2.5.8). */}
      <style>{'a { display: inline-block; min-block-size: 24px; }'}</style>
      <a href="/forra">Föregående</a>
      <SummaryList.Root aria-label="Dina svar">
        <SummaryList.Row>
          <SummaryList.Key>Namn</SummaryList.Key>
          <SummaryList.Value>Anna Svensson</SummaryList.Value>
          <SummaryList.Actions>
            <SummaryList.Change href="/steg/1" />
          </SummaryList.Actions>
        </SummaryList.Row>
        <SummaryList.Row>
          <SummaryList.Key>Adress</SummaryList.Key>
          <SummaryList.Value>Storgatan 12</SummaryList.Value>
          <SummaryList.Actions>
            <SummaryList.Change href="/steg/2" />
          </SummaryList.Actions>
        </SummaryList.Row>
        <SummaryList.Row>
          <SummaryList.Key>Telefon</SummaryList.Key>
          <SummaryList.Value>070-000 00 00</SummaryList.Value>
        </SummaryList.Row>
      </SummaryList.Root>
      <a href="/nasta">Nästa</a>
    </>
  )
}

describe('summary list', () => {
  test('the list is a description list: a term per key and definitions per value', async () => {
    const { container } = await render(<Answers />)
    const list = container.querySelector('dl')
    expect(list?.className).toBe('kv-summary-list')
    const rows = [...(list?.children ?? [])]
    expect(rows.map((row) => row.tagName)).toEqual(['DIV', 'DIV', 'DIV'])
    expect(rows.map((row) => row.className)).toEqual(Array(3).fill('kv-summary-list-row'))
    expect([...rows[0]!.children].map((child) => child.tagName)).toEqual(['DT', 'DD', 'DD'])
    expect([...rows[2]!.children].map((child) => child.tagName)).toEqual(['DT', 'DD'])
    expect(rows[0]!.children[0]!.className).toBe('kv-summary-list-key')
    expect(rows[0]!.children[1]!.className).toBe('kv-summary-list-value')
    expect(rows[0]!.children[2]!.className).toBe('kv-summary-list-actions')
    await expect.element(page.getByRole('term').first()).toHaveTextContent('Namn')
    await expect.element(page.getByRole('definition').first()).toHaveTextContent('Anna Svensson')
  })

  test('it adds no role, no tabindex and no data attribute of its own', async () => {
    const { container } = await render(<Answers />)
    const own = [...container.querySelectorAll('dl, dl div, dt, dd')]
    for (const element of own) {
      expect(element.hasAttribute('role')).toBe(false)
      expect(element.hasAttribute('tabindex')).toBe(false)
      expect(element.getAttributeNames().filter((name) => name.startsWith('data-'))).toEqual([])
    }
  })

  test('each part forwards its ref, its attributes and its class', async () => {
    const rootRef = createRef<HTMLElement>()
    const rowRef = createRef<HTMLElement>()
    const keyRef = createRef<HTMLElement>()
    const valueRef = createRef<HTMLElement>()
    const actionsRef = createRef<HTMLElement>()
    await render(
      <SummaryListRoot ref={rootRef} className="egen" data-testid="root">
        <SummaryListRow ref={rowRef} className="egen">
          <SummaryListKey ref={keyRef} className="egen">
            Namn
          </SummaryListKey>
          <SummaryListValue ref={valueRef} className="egen">
            Anna
          </SummaryListValue>
          <SummaryListActions ref={actionsRef} className="egen" />
        </SummaryListRow>
      </SummaryListRoot>,
    )
    expect(rootRef.current?.tagName).toBe('DL')
    expect(rootRef.current?.className).toBe('egen kv-summary-list')
    expect(rowRef.current?.className).toBe('egen kv-summary-list-row')
    expect(keyRef.current?.tagName).toBe('DT')
    expect(valueRef.current?.className).toBe('egen kv-summary-list-value')
    expect(actionsRef.current?.tagName).toBe('DD')
    await expect.element(page.getByTestId('root')).toBeInTheDocument()
  })

  test('no part takes as: the dl, div, dt and dd structure is fixed', () => {
    expectTypeOf<SummaryListRootProps>().not.toHaveProperty('as')
    expectTypeOf<SummaryListRowProps>().not.toHaveProperty('as')
    expectTypeOf<SummaryListKeyProps>().not.toHaveProperty('as')
    expectTypeOf<SummaryListValueProps>().not.toHaveProperty('as')
    expectTypeOf<SummaryListActionsProps>().not.toHaveProperty('as')
    expectTypeOf<SummaryListChangeProps>().not.toHaveProperty('as')
  })

  test('the flat aliases are the compound parts', () => {
    expect(SummaryList.Root).toBe(SummaryListRoot)
    expect(SummaryList.Row).toBe(SummaryListRow)
    expect(SummaryList.Key).toBe(SummaryListKey)
    expect(SummaryList.Value).toBe(SummaryListValue)
    expect(SummaryList.Actions).toBe(SummaryListActions)
    expect(SummaryList.Change).toBe(SummaryListChange)
    expect(SummaryListChange.displayName).toBe('SummaryList.Change')
  })

  test('it renders on the server with a stable id', () => {
    const html = renderToString(<Answers />)
    expect(html).toContain('class="kv-summary-list"')
    expect(html).toContain('aria-labelledby=')
  })

  test('a Key with its own id is not yet followed by the Change link in server HTML', () => {
    const html = renderToString(
      <SummaryList.Root>
        <SummaryList.Row>
          <SummaryList.Key id="namn-nyckel">Namn</SummaryList.Key>
          <SummaryList.Actions>
            <SummaryList.Change href="/steg/1" />
          </SummaryList.Actions>
        </SummaryList.Row>
      </SummaryList.Root>,
    )
    expect(html).toContain('id="namn-nyckel"')
    expect(html).not.toMatch(/aria-labelledby="[^"]* namn-nyckel"/)
  })
})

describe('Change link', () => {
  test('the name is "Change" plus the key and starts with the visible text', async () => {
    await render(<Answers />)
    const link = page.getByRole('link', { name: 'Change Namn' })
    await expect.element(link).toHaveAttribute('href', '/steg/1')
    expect(link.element().textContent).toBe('Change')
    expect(page.getByRole('link', { name: 'Change Adress' }).element().textContent).toBe('Change')
  })

  test('the name is read from the key of its own row', async () => {
    await render(<Answers />)
    const names = page
      .getByRole('link')
      .elements()
      .map((link) => link.getAttribute('aria-labelledby'))
    const [, first, second] = names
    const keys = [...document.querySelectorAll('dt')].map((term) => term.id)
    expect(first?.split(' ')[1]).toBe(keys[0])
    expect(second?.split(' ')[1]).toBe(keys[1])
  })

  test.each([
    ['sv', sv, 'Ändra'],
    ['en', en, 'Change'],
    ['fi', fi, 'Muuta'],
    ['nb', nb, 'Endre'],
    ['nn', nn, 'Endre'],
  ] as const)('the %s catalog gives the visible word', async (locale, messages, word) => {
    await render(
      <KvirnProvider locale={locale} messages={messages}>
        <SummaryList.Root>
          <SummaryList.Row>
            <SummaryList.Key>Namn</SummaryList.Key>
            <SummaryList.Value>Anna</SummaryList.Value>
            <SummaryList.Actions>
              <SummaryList.Change href="/steg/1" />
            </SummaryList.Actions>
          </SummaryList.Row>
        </SummaryList.Root>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('link', { name: `${word} Namn` })).toBeInTheDocument()
  })

  test('messages override the word per instance, and children replace it', async () => {
    await render(
      <SummaryList.Root>
        <SummaryList.Row>
          <SummaryList.Key>Namn</SummaryList.Key>
          <SummaryList.Actions>
            <SummaryList.Change href="/a" messages={{ change: 'Redigera' }} />
            <SummaryList.Change href="/b">Lägg till</SummaryList.Change>
          </SummaryList.Actions>
        </SummaryList.Row>
      </SummaryList.Root>,
    )
    await expect.element(page.getByRole('link', { name: 'Redigera Namn' })).toBeInTheDocument()
    await expect.element(page.getByRole('link', { name: 'Lägg till Namn' })).toBeInTheDocument()
  })

  test('outside a row it keeps its own text and warns once in development', async () => {
    await render(<SummaryList.Change href="/a" />)
    await expect.element(page.getByRole('link', { name: 'Change' })).toBeInTheDocument()
    expect(warnings()).toEqual([expect.stringContaining('SummaryList.Change is outside a Row')])
  })

  test('a Key with its own id keeps it and still names the Change link', async () => {
    await render(
      <SummaryList.Root>
        <SummaryList.Row>
          <SummaryList.Key id="namn-nyckel">Namn</SummaryList.Key>
          <SummaryList.Value>Anna</SummaryList.Value>
          <SummaryList.Actions>
            <SummaryList.Change href="/steg/1" />
          </SummaryList.Actions>
        </SummaryList.Row>
      </SummaryList.Root>,
    )
    expect(document.querySelector('dt')?.id).toBe('namn-nyckel')
    await expect.element(page.getByRole('link', { name: 'Change Namn' })).toBeInTheDocument()
    expect(warnings()).toEqual([])
  })

  test('a Change link whose Key is not in the row warns once in development', async () => {
    const row = (
      <SummaryList.Root>
        <SummaryList.Row>
          <SummaryList.Value>Anna</SummaryList.Value>
          <SummaryList.Actions>
            <SummaryList.Change href="/steg/1" />
          </SummaryList.Actions>
        </SummaryList.Row>
      </SummaryList.Root>
    )
    const { rerender } = await render(row)
    await rerender(row)
    expect(warnings()).toEqual([
      expect.stringContaining('the document has no element with that id'),
    ])
  })

  test('a link in a row does not warn', async () => {
    await render(<Answers />)
    expect(warnings()).toEqual([])
  })

  test('the link class joins the consumer class', async () => {
    await render(
      <SummaryList.Root>
        <SummaryList.Row>
          <SummaryList.Key>Namn</SummaryList.Key>
          <SummaryList.Change className="egen" href="/c" data-testid="change" />
        </SummaryList.Row>
      </SummaryList.Root>,
    )
    expect(page.getByTestId('change').element().className).toBe(
      'egen kv-link kv-summary-list-change',
    )
  })
})

describe('keyboard', () => {
  test('Tab moves through the Change links in row order', async () => {
    await render(<Answers />)
    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('link', { name: 'Föregående' }).element())
    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('link', { name: 'Change Namn' }).element())
    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('link', { name: 'Change Adress' }).element())
    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('link', { name: 'Nästa' }).element())
  })

  test('Shift+Tab moves back through the Change links', async () => {
    await render(<Answers />)
    page.getByRole('link', { name: 'Nästa' }).element().focus()
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(page.getByRole('link', { name: 'Change Adress' }).element())
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(page.getByRole('link', { name: 'Change Namn' }).element())
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(page.getByRole('link', { name: 'Föregående' }).element())
  })

  test('Enter on a Change link follows it', async () => {
    await render(<Answers />)
    const link = page.getByRole('link', { name: 'Change Namn' }).element()
    const click = vi.fn<(event: Event) => void>((event) => event.preventDefault())
    link.addEventListener('click', click)
    link.focus()
    await userEvent.keyboard('{Enter}')
    expect(click).toHaveBeenCalledOnce()
  })
})

describe('hook', () => {
  test('useSummaryList returns the class props and builds the Change link props', async () => {
    function Probe() {
      const list = useSummaryList()
      const result: UseSummaryListResult & { changeProps: unknown } = {
        ...list,
        changeProps: list.getChangeProps({ id: 'a', keyId: 'b' }),
      }
      return <output data-testid="result">{JSON.stringify(result)}</output>
    }
    await render(<Probe />)
    const result = JSON.parse(page.getByTestId('result').element().textContent)
    expect(result.rootProps).toEqual({ className: 'kv-summary-list' })
    expect(result.rowProps).toEqual({ className: 'kv-summary-list-row' })
    expect(result.keyProps).toEqual({ className: 'kv-summary-list-key' })
    expect(result.valueProps).toEqual({ className: 'kv-summary-list-value' })
    expect(result.actionsProps).toEqual({ className: 'kv-summary-list-actions' })
    expect(result.changeLabel).toBe('Change')
    expect(result.changeProps).toEqual({
      className: 'kv-link kv-summary-list-change',
      id: 'a',
      'aria-labelledby': 'a b',
    })
  })

  test('the types are exported', () => {
    expectTypeOf<SummaryListPartProps>().toBeObject()
    expectTypeOf<SummaryListChangeProps['href']>().toEqualTypeOf<string | undefined>()
  })
})

describe('accessibility', () => {
  test('no axe violations', async () => {
    const { container } = await render(<Answers />)
    await expect.element(page.getByRole('term').first()).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('no axe violations with the Change link focused', async () => {
    const { container } = await render(<Answers />)
    await userEvent.tab()
    await userEvent.tab()
    await expect.element(page.getByRole('link', { name: 'Change Namn' })).toHaveFocus()
    await expectNoA11yViolations(container)
  })
})

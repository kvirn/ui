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
  DefinitionList,
  DefinitionListActions,
  DefinitionListChange,
  DefinitionListTerm,
  DefinitionListRoot,
  DefinitionListRow,
  DefinitionListDescription,
} from './definition-list.tsx'
import type {
  DefinitionListActionsProps,
  DefinitionListChangeProps,
  DefinitionListTermProps,
  DefinitionListPartProps,
  DefinitionListRootProps,
  DefinitionListRowProps,
  DefinitionListDescriptionProps,
} from './definition-list.tsx'
import { useDefinitionList } from './use-definition-list.ts'
import type { UseDefinitionListResult } from './use-definition-list.ts'

// Contract: definition-list.a11y.md. The stacked layout below 40rem is the theme's, proved by the
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
      <DefinitionList.Root aria-label="Dina svar">
        <DefinitionList.Row>
          <DefinitionList.Term>Namn</DefinitionList.Term>
          <DefinitionList.Description>Anna Svensson</DefinitionList.Description>
          <DefinitionList.Actions>
            <DefinitionList.Change href="/steg/1" />
          </DefinitionList.Actions>
        </DefinitionList.Row>
        <DefinitionList.Row>
          <DefinitionList.Term>Adress</DefinitionList.Term>
          <DefinitionList.Description>Storgatan 12</DefinitionList.Description>
          <DefinitionList.Actions>
            <DefinitionList.Change href="/steg/2" />
          </DefinitionList.Actions>
        </DefinitionList.Row>
        <DefinitionList.Row>
          <DefinitionList.Term>Telefon</DefinitionList.Term>
          <DefinitionList.Description>070-000 00 00</DefinitionList.Description>
        </DefinitionList.Row>
      </DefinitionList.Root>
      <a href="/nasta">Nästa</a>
    </>
  )
}

describe('definition list', () => {
  test('the list is a description list: a term per row and its descriptions', async () => {
    const { container } = await render(<Answers />)
    const list = container.querySelector('dl')
    expect(list?.className).toBe('kv-definition-list')
    const rows = [...(list?.children ?? [])]
    expect(rows.map((row) => row.tagName)).toEqual(['DIV', 'DIV', 'DIV'])
    expect(rows.map((row) => row.className)).toEqual(Array(3).fill('kv-definition-list-row'))
    expect([...rows[0]!.children].map((child) => child.tagName)).toEqual(['DT', 'DD', 'DD'])
    expect([...rows[2]!.children].map((child) => child.tagName)).toEqual(['DT', 'DD'])
    expect(rows[0]!.children[0]!.className).toBe('kv-definition-list-term')
    expect(rows[0]!.children[1]!.className).toBe('kv-definition-list-description')
    expect(rows[0]!.children[2]!.className).toBe('kv-definition-list-actions')
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
    const termRef = createRef<HTMLElement>()
    const valueRef = createRef<HTMLElement>()
    const actionsRef = createRef<HTMLElement>()
    await render(
      <DefinitionListRoot ref={rootRef} className="egen" data-testid="root">
        <DefinitionListRow ref={rowRef} className="egen">
          <DefinitionListTerm ref={termRef} className="egen">
            Namn
          </DefinitionListTerm>
          <DefinitionListDescription ref={valueRef} className="egen">
            Anna
          </DefinitionListDescription>
          <DefinitionListActions ref={actionsRef} className="egen" />
        </DefinitionListRow>
      </DefinitionListRoot>,
    )
    expect(rootRef.current?.tagName).toBe('DL')
    expect(rootRef.current?.className).toBe('egen kv-definition-list')
    expect(rowRef.current?.className).toBe('egen kv-definition-list-row')
    expect(termRef.current?.tagName).toBe('DT')
    expect(valueRef.current?.className).toBe('egen kv-definition-list-description')
    expect(actionsRef.current?.tagName).toBe('DD')
    await expect.element(page.getByTestId('root')).toBeInTheDocument()
  })

  test('no part takes as: the dl, div, dt and dd structure is fixed', () => {
    expectTypeOf<DefinitionListRootProps>().not.toHaveProperty('as')
    expectTypeOf<DefinitionListRowProps>().not.toHaveProperty('as')
    expectTypeOf<DefinitionListTermProps>().not.toHaveProperty('as')
    expectTypeOf<DefinitionListDescriptionProps>().not.toHaveProperty('as')
    expectTypeOf<DefinitionListActionsProps>().not.toHaveProperty('as')
    expectTypeOf<DefinitionListChangeProps>().not.toHaveProperty('as')
  })

  test('the flat aliases are the compound parts', () => {
    expect(DefinitionList.Root).toBe(DefinitionListRoot)
    expect(DefinitionList.Row).toBe(DefinitionListRow)
    expect(DefinitionList.Term).toBe(DefinitionListTerm)
    expect(DefinitionList.Description).toBe(DefinitionListDescription)
    expect(DefinitionList.Actions).toBe(DefinitionListActions)
    expect(DefinitionList.Change).toBe(DefinitionListChange)
    expect(DefinitionListChange.displayName).toBe('DefinitionList.Change')
  })

  test('it renders on the server with a stable id', () => {
    const html = renderToString(<Answers />)
    expect(html).toContain('class="kv-definition-list"')
    expect(html).toContain('aria-labelledby=')
  })

  test('a Term with its own id is not yet followed by the Change link in server HTML', () => {
    const html = renderToString(
      <DefinitionList.Root>
        <DefinitionList.Row>
          <DefinitionList.Term id="namn-nyckel">Namn</DefinitionList.Term>
          <DefinitionList.Actions>
            <DefinitionList.Change href="/steg/1" />
          </DefinitionList.Actions>
        </DefinitionList.Row>
      </DefinitionList.Root>,
    )
    expect(html).toContain('id="namn-nyckel"')
    expect(html).not.toMatch(/aria-labelledby="[^"]* namn-nyckel"/)
  })
})

describe('Change link', () => {
  test('the name is "Change" plus the term and starts with the visible text', async () => {
    await render(<Answers />)
    const link = page.getByRole('link', { name: 'Change Namn' })
    await expect.element(link).toHaveAttribute('href', '/steg/1')
    expect(link.element().textContent).toBe('Change')
    expect(page.getByRole('link', { name: 'Change Adress' }).element().textContent).toBe('Change')
  })

  test('the name is read from the term of its own row', async () => {
    await render(<Answers />)
    const names = page
      .getByRole('link')
      .elements()
      .map((link) => link.getAttribute('aria-labelledby'))
    const [, first, second] = names
    const terms = [...document.querySelectorAll('dt')].map((term) => term.id)
    expect(first?.split(' ')[1]).toBe(terms[0])
    expect(second?.split(' ')[1]).toBe(terms[1])
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
        <DefinitionList.Root>
          <DefinitionList.Row>
            <DefinitionList.Term>Namn</DefinitionList.Term>
            <DefinitionList.Description>Anna</DefinitionList.Description>
            <DefinitionList.Actions>
              <DefinitionList.Change href="/steg/1" />
            </DefinitionList.Actions>
          </DefinitionList.Row>
        </DefinitionList.Root>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('link', { name: `${word} Namn` })).toBeInTheDocument()
  })

  test('messages override the word per instance, and children replace it', async () => {
    await render(
      <DefinitionList.Root>
        <DefinitionList.Row>
          <DefinitionList.Term>Namn</DefinitionList.Term>
          <DefinitionList.Actions>
            <DefinitionList.Change href="/a" messages={{ change: 'Redigera' }} />
            <DefinitionList.Change href="/b">Lägg till</DefinitionList.Change>
          </DefinitionList.Actions>
        </DefinitionList.Row>
      </DefinitionList.Root>,
    )
    await expect.element(page.getByRole('link', { name: 'Redigera Namn' })).toBeInTheDocument()
    await expect.element(page.getByRole('link', { name: 'Lägg till Namn' })).toBeInTheDocument()
  })

  test('outside a row it keeps its own text and warns once in development', async () => {
    await render(<DefinitionList.Change href="/a" />)
    await expect.element(page.getByRole('link', { name: 'Change' })).toBeInTheDocument()
    expect(warnings()).toEqual([expect.stringContaining('DefinitionList.Change is outside a Row')])
  })

  test('a Term with its own id keeps it and still names the Change link', async () => {
    await render(
      <DefinitionList.Root>
        <DefinitionList.Row>
          <DefinitionList.Term id="namn-nyckel">Namn</DefinitionList.Term>
          <DefinitionList.Description>Anna</DefinitionList.Description>
          <DefinitionList.Actions>
            <DefinitionList.Change href="/steg/1" />
          </DefinitionList.Actions>
        </DefinitionList.Row>
      </DefinitionList.Root>,
    )
    expect(document.querySelector('dt')?.id).toBe('namn-nyckel')
    await expect.element(page.getByRole('link', { name: 'Change Namn' })).toBeInTheDocument()
    expect(warnings()).toEqual([])
  })

  test('a Change link whose Term is not in the row warns once in development', async () => {
    const row = (
      <DefinitionList.Root>
        <DefinitionList.Row>
          <DefinitionList.Description>Anna</DefinitionList.Description>
          <DefinitionList.Actions>
            <DefinitionList.Change href="/steg/1" />
          </DefinitionList.Actions>
        </DefinitionList.Row>
      </DefinitionList.Root>
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
      <DefinitionList.Root>
        <DefinitionList.Row>
          <DefinitionList.Term>Namn</DefinitionList.Term>
          <DefinitionList.Change className="egen" href="/c" data-testid="change" />
        </DefinitionList.Row>
      </DefinitionList.Root>,
    )
    expect(page.getByTestId('change').element().className).toBe(
      'egen kv-link kv-definition-list-change',
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
  test('useDefinitionList returns the class props and builds the Change link props', async () => {
    function Probe() {
      const list = useDefinitionList()
      const result: UseDefinitionListResult & { changeProps: unknown } = {
        ...list,
        changeProps: list.getChangeProps({ id: 'a', termId: 'b' }),
      }
      return <output data-testid="result">{JSON.stringify(result)}</output>
    }
    await render(<Probe />)
    const result = JSON.parse(page.getByTestId('result').element().textContent)
    expect(result.rootProps).toEqual({ className: 'kv-definition-list' })
    expect(result.rowProps).toEqual({ className: 'kv-definition-list-row' })
    expect(result.termProps).toEqual({ className: 'kv-definition-list-term' })
    expect(result.descriptionProps).toEqual({ className: 'kv-definition-list-description' })
    expect(result.actionsProps).toEqual({ className: 'kv-definition-list-actions' })
    expect(result.changeLabel).toBe('Change')
    expect(result.changeProps).toEqual({
      className: 'kv-link kv-definition-list-change',
      id: 'a',
      'aria-labelledby': 'a b',
    })
  })

  test('the types are exported', () => {
    expectTypeOf<DefinitionListPartProps>().toBeObject()
    expectTypeOf<DefinitionListChangeProps['href']>().toEqualTypeOf<string | undefined>()
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

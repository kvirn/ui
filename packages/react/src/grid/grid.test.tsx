import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { readAloud } from '@kvirn-ui/testing/read-aloud'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Button } from '../button/button.tsx'
import { Link } from '../link/link.tsx'
import { Grid } from './grid.tsx'
import type { GridItemProps, GridRootProps } from './grid.tsx'
import { useGrid } from './use-grid.ts'
import type { GridPartProps, UseGridResult } from './use-grid.ts'

// Contract: grid.a11y.md.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const warnings = () => consoleWarn.mock.calls.map(([message]) => String(message))

describe('rendering', () => {
  test('renders a container div with only its class around the grid element with the children', async () => {
    const { container } = await render(
      <Grid.Root data-testid="grid">
        <Grid.Item data-testid="item">Content</Grid.Item>
      </Grid.Root>,
    )
    const grid = page.getByTestId('grid').element()
    const wrapper = container.firstElementChild as HTMLElement
    expect(container.children).toHaveLength(1)
    expect(wrapper.tagName).toBe('DIV')
    expect(wrapper.getAttributeNames()).toEqual(['class'])
    expect(wrapper.className).toBe('kv-grid-container')
    expect(wrapper.children).toHaveLength(1)
    expect(wrapper.firstElementChild).toBe(grid)
    expect(grid.tagName).toBe('DIV')
    expect(grid.className).toBe('kv-grid')
    expect(page.getByTestId('item').element().className).toBe('kv-grid-item')
  })

  test('props and the ref go to the grid element, not the container', async () => {
    const ref = createRef<HTMLElement>()
    const { container } = await render(
      <Grid.Root
        ref={ref}
        id="innehall"
        aria-describedby="hjalp"
        title="Title"
        data-testid="grid"
      />,
    )
    const grid = page.getByTestId('grid')
    expect(ref.current).toBe(grid.element())
    await expect.element(grid).toHaveAttribute('id', 'innehall')
    await expect.element(grid).toHaveAttribute('aria-describedby', 'hjalp')
    await expect.element(grid).toHaveAttribute('title', 'Title')
    expect((container.firstElementChild as HTMLElement).getAttributeNames()).toEqual(['class'])
  })

  test('keeps its own class: a consumer className joins it on the grid element only', async () => {
    const { container } = await render(
      <Grid.Root data-testid="grid" className="kv-grid--fit-md annat" />,
    )
    await expect
      .element(page.getByTestId('grid'))
      .toHaveClass('kv-grid', 'kv-grid--fit-md', 'annat')
    expect((container.firstElementChild as HTMLElement).className).toBe('kv-grid-container')
  })

  test('an Item className joins its class', async () => {
    await render(
      <Grid.Root>
        <Grid.Item data-testid="item" className="kv-grid-item--lg-span-8 annat" />
      </Grid.Root>,
    )
    await expect
      .element(page.getByTestId('item'))
      .toHaveClass('kv-grid-item', 'kv-grid-item--lg-span-8', 'annat')
  })

  test('adds no tabindex, ARIA, inert or data attribute on a div Root or an Item', async () => {
    const { container } = await render(
      <Grid.Root data-testid="grid">
        <Grid.Item data-testid="item" />
      </Grid.Root>,
    )
    const names = [...container.querySelectorAll('div')].flatMap((element) =>
      element.getAttributeNames().filter((name) => name !== 'class' && name !== 'data-testid'),
    )
    expect(names).toEqual([])
  })
})

describe('as', () => {
  test('Root renders div, ul and ol and keeps the class', async () => {
    await render(
      <>
        <Grid.Root as="ul" data-testid="first" />
        <Grid.Root as="ol" data-testid="second" />
        <Grid.Root as="div" data-testid="third" />
      </>,
    )
    expect(page.getByTestId('first').element().tagName).toBe('UL')
    expect(page.getByTestId('second').element().tagName).toBe('OL')
    expect(page.getByTestId('third').element().tagName).toBe('DIV')
    await expect.element(page.getByTestId('first')).toHaveClass('kv-grid')
  })

  test('Item renders div, li, article and section and keeps the class', async () => {
    await render(
      <Grid.Root as="ul">
        <Grid.Item as="li" data-testid="li" />
        <Grid.Item as="article" data-testid="article" />
        <Grid.Item as="section" data-testid="section" aria-label="Del" />
        <Grid.Item as="div" data-testid="div" />
      </Grid.Root>,
    )
    expect(page.getByTestId('li').element().tagName).toBe('LI')
    expect(page.getByTestId('article').element().tagName).toBe('ARTICLE')
    expect(page.getByTestId('section').element().tagName).toBe('SECTION')
    expect(page.getByTestId('div').element().tagName).toBe('DIV')
    await expect.element(page.getByTestId('li')).toHaveClass('kv-grid-item')
  })

  test('Item renders nav, aside and main and keeps the class', async () => {
    await render(
      <Grid.Root>
        <Grid.Item as="nav" aria-label="Meny" data-testid="nav" />
        <Grid.Item as="aside" aria-label="Relaterat" data-testid="aside" />
        <Grid.Item as="main" data-testid="main" />
      </Grid.Root>,
    )
    expect(page.getByTestId('nav').element().tagName).toBe('NAV')
    expect(page.getByTestId('aside').element().tagName).toBe('ASIDE')
    expect(page.getByTestId('main').element().tagName).toBe('MAIN')
    await expect.element(page.getByTestId('main')).toHaveClass('kv-grid-item')
  })

  test('adds role="list" to a ul and an ol Root, and no role to a div', async () => {
    await render(
      <>
        <Grid.Root as="ul" data-testid="unordered" />
        <Grid.Root as="ol" data-testid="ordered" />
        <Grid.Root as="div" data-testid="plain" />
      </>,
    )
    expect(page.getByTestId('unordered').element().getAttribute('role')).toBe('list')
    expect(page.getByTestId('ordered').element().getAttribute('role')).toBe('list')
    expect(page.getByTestId('plain').element().hasAttribute('role')).toBe(false)
  })

  test('a Root element outside the allowed list warns once and renders a div', async () => {
    const notAllowed = 'p' as 'div'
    await render(<Grid.Root as={notAllowed} data-testid="grid" />)
    expect(page.getByTestId('grid').element().tagName).toBe('DIV')
    expect(warnings().filter((message) => message.includes('Grid.Root as="p"'))).toHaveLength(1)
  })

  test('an Item element outside the allowed list warns once and renders a div', async () => {
    const notAllowed = 'p' as 'div'
    await render(
      <Grid.Root>
        <Grid.Item as={notAllowed} data-testid="item" />
      </Grid.Root>,
    )
    expect(page.getByTestId('item').element().tagName).toBe('DIV')
    expect(warnings().filter((message) => message.includes('Grid.Item as="p"'))).toHaveLength(1)
  })

  test('an Item outside a Root warns once', async () => {
    await render(
      <>
        <Grid.Item>One</Grid.Item>
        <Grid.Item>Two</Grid.Item>
      </>,
    )
    expect(warnings().filter((message) => message.includes('Grid.Item is outside'))).toHaveLength(1)
  })

  test('an Item inside a Root does not warn', async () => {
    await render(
      <Grid.Root>
        <Grid.Item>One</Grid.Item>
      </Grid.Root>,
    )
    expect(warnings()).toEqual([])
  })

  test('displayNames are Grid.Root and Grid.Item', () => {
    expect(Grid.Root.displayName).toBe('Grid.Root')
    expect(Grid.Item.displayName).toBe('Grid.Item')
  })
})

describe('keyboard', () => {
  function Controls() {
    return (
      <Grid.Root>
        <Grid.Item>
          <Link.Root href="#first">First</Link.Root>
        </Grid.Item>
        <Grid.Item>
          <Button>Second</Button>
        </Grid.Item>
        <Grid.Item>
          <Link.Root href="#tredje">Tredje</Link.Root>
        </Grid.Item>
      </Grid.Root>
    )
  }

  test('is not a Tab stop and keeps the children in DOM order', async () => {
    await render(<Controls />)
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('link', { name: 'First' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Second' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('link', { name: 'Tredje' })).toHaveFocus()
  })

  test('Shift+Tab walks the children in reverse DOM order', async () => {
    await render(<Controls />)
    page.getByRole('link', { name: 'Tredje' }).element().focus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('button', { name: 'Second' })).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('link', { name: 'First' })).toHaveFocus()
  })
})

describe('useGrid', () => {
  test('returns the same frozen objects every time', () => {
    const first = useGrid()
    expect(useGrid()).toBe(first)
    expect(Object.isFrozen(first)).toBe(true)
    expect(Object.isFrozen(first.containerProps)).toBe(true)
    expect(Object.isFrozen(first.rootProps)).toBe(true)
    expect(Object.isFrozen(first.itemProps)).toBe(true)
  })

  test('spreads on the consumer’s elements', async () => {
    function HookGrid() {
      const grid = useGrid()
      return (
        <div {...grid.containerProps} data-testid="container">
          <nav {...grid.rootProps} aria-label="Egen" data-testid="grid" />
        </div>
      )
    }
    await render(<HookGrid />)
    await expect.element(page.getByTestId('container')).toHaveClass('kv-grid-container')
    await expect.element(page.getByTestId('grid')).toHaveClass('kv-grid')
    await expect.element(page.getByRole('navigation', { name: 'Egen' })).toBeInTheDocument()
  })
})

describe('types', () => {
  test('the exported props and result types fit together', () => {
    expectTypeOf<GridRootProps>().toHaveProperty('as')
    expectTypeOf<GridItemProps>().toHaveProperty('as')
    expectTypeOf<ReturnType<typeof useGrid>>().toEqualTypeOf<UseGridResult>()
    expectTypeOf<UseGridResult['rootProps']>().toEqualTypeOf<GridPartProps<'kv-grid'>>()
  })
})

describe('accessibility', () => {
  test('has no axe violations around real content', async () => {
    const { container } = await render(
      <main>
        <Grid.Root className="kv-grid--cols-1 kv-grid--lg-cols-12">
          <Grid.Item className="kv-grid-item--lg-span-8">
            <h1>Kvirnby kommun</h1>
            <p>Vi svarar vardagar 9–16.</p>
          </Grid.Item>
          <Grid.Item as="section" aria-label="Contact" className="kv-grid-item--lg-span-4">
            <Link.Root href="#contact">Contact us</Link.Root>
          </Grid.Item>
        </Grid.Root>
      </main>,
    )
    await expect.element(page.getByRole('main')).toBeVisible()
    await expectNoA11yViolations(container)
  })
})

describe('read aloud', () => {
  test('a div Root reads only its children in DOM order', async () => {
    const { container } = await render(
      <Grid.Root>
        <Grid.Item>First</Grid.Item>
        <Grid.Item>Second</Grid.Item>
      </Grid.Root>,
    )
    expect(await readAloud(container)).toEqual(['First', 'Second'])
  })

  test('a ul Root with li Items reads as a list with its items', async () => {
    const { container } = await render(
      <Grid.Root as="ul">
        <Grid.Item as="li">Waste collection</Grid.Item>
        <Grid.Item as="li">Winter road maintenance</Grid.Item>
      </Grid.Root>,
    )
    const phrases = await readAloud(container)
    expect(phrases[0]).toMatch(/^list/)
    expect(phrases.filter((phrase) => phrase.startsWith('listitem'))).toHaveLength(2)
    expect(phrases).toContain('Waste collection')
    expect(phrases.indexOf('Waste collection')).toBeLessThan(
      phrases.indexOf('Winter road maintenance'),
    )
    expect(phrases.at(-1)).toBe('end of list')
  })

  test('a main Item reads as main', async () => {
    const { container } = await render(
      <Grid.Root>
        <Grid.Item as="main">Content</Grid.Item>
      </Grid.Root>,
    )
    expect(await readAloud(container)).toContain('main')
  })

  test('a named nav Item reads as a navigation', async () => {
    const { container } = await render(
      <Grid.Root>
        <Grid.Item as="nav" aria-label="In this section">
          <Link.Root href="#a">One</Link.Root>
        </Grid.Item>
      </Grid.Root>,
    )
    expect(await readAloud(container)).toContain('navigation, In this section')
  })

  test('a named section Item reads as a region', async () => {
    const { container } = await render(
      <Grid.Root>
        <Grid.Item as="section" aria-label="Contact">
          Ring oss
        </Grid.Item>
      </Grid.Root>,
    )
    expect(await readAloud(container)).toContain('region, Contact')
  })
})

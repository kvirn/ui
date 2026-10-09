import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { ScrollArea } from './scroll-area.tsx'
import type { ScrollAreaProps } from './scroll-area.tsx'
import { useScrollArea } from './use-scroll-area.ts'
import type { ScrollAreaPartProps, UseScrollAreaResult } from './use-scroll-area.ts'

// Contract: scroll-area.a11y.md. The keyboard rows are in the `keyboard` block.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const renderInProvider = (ui: ReactNode) => render(<KvirnProvider locale="en">{ui}</KvirnProvider>)

function WideContent() {
  return <div style={{ inlineSize: 600, blockSize: 400 }}>Wide content</div>
}

function Overflowing(props: ScrollAreaProps) {
  return (
    <ScrollArea
      aria-label="Fees"
      style={{ inlineSize: 150, blockSize: 100, overflow: 'auto' }}
      {...props}
    >
      <WideContent />
    </ScrollArea>
  )
}

function Fitting(props: ScrollAreaProps) {
  return (
    <ScrollArea aria-label="Fees" style={{ inlineSize: 300, overflow: 'auto' }} {...props}>
      <div>Short</div>
    </ScrollArea>
  )
}

function areaOf(container: Element): HTMLElement {
  const area = container.querySelector<HTMLElement>('.kv-scroll-area')
  if (area === null) throw new Error('no scroll area')
  return area
}

describe('rendering', () => {
  test('content that fits is a plain div: no role, no name, no tabindex, no data-overflowing', async () => {
    const { container } = await renderInProvider(<Fitting />)
    await expect.element(page.getByText('Short')).toBeVisible()
    const area = areaOf(container)
    expect(area.className).toBe('kv-scroll-region kv-scroll-area')
    expect(area.hasAttribute('role')).toBe(false)
    expect(area.hasAttribute('aria-label')).toBe(false)
    expect(area.hasAttribute('tabindex')).toBe(false)
    expect(area.hasAttribute('data-overflowing')).toBe(false)
    expect(page.getByRole('region').elements()).toEqual([])
    await expectNoA11yViolations(container)
  })

  test('content that overflows is a named region and a Tab stop with data-overflowing', async () => {
    const { container } = await renderInProvider(<Overflowing />)
    await expect.element(page.getByRole('region', { name: 'Fees' })).toBeVisible()
    const area = areaOf(container)
    await expect.poll(() => area.getAttribute('tabindex')).toBe('0')
    expect(area.hasAttribute('data-overflowing')).toBe(true)
    await expectNoA11yViolations(container)
  })

  test('region="always" is a named region that fits, and not a Tab stop', async () => {
    const { container } = await renderInProvider(<Fitting region="always" />)
    await expect.element(page.getByRole('region', { name: 'Fees' })).toBeVisible()
    expect(areaOf(container).hasAttribute('tabindex')).toBe(false)
    await expectNoA11yViolations(container)
  })

  test('region="always" that overflows is a region and a Tab stop', async () => {
    const { container } = await renderInProvider(<Overflowing region="always" />)
    await expect.poll(() => areaOf(container).getAttribute('tabindex')).toBe('0')
    expect(areaOf(container).getAttribute('role')).toBe('region')
  })

  test('an area that grows past its box becomes a region, and a plain div again when it fits', async () => {
    const { container } = await renderInProvider(
      <ScrollArea aria-label="Fees" style={{ inlineSize: 150, overflow: 'auto' }}>
        <div data-testid="content" style={{ inlineSize: 100, blockSize: 10 }} />
      </ScrollArea>,
    )
    const area = areaOf(container)
    const content = page.getByTestId('content').element() as HTMLElement
    expect(area.hasAttribute('role')).toBe(false)
    content.style.inlineSize = '500px'
    await expect.poll(() => area.getAttribute('role')).toBe('region')
    content.style.inlineSize = '100px'
    await expect.poll(() => area.hasAttribute('role')).toBe(false)
    expect(area.hasAttribute('aria-label')).toBe(false)
  })

  test('the area stays a region and a Tab stop while it holds focus, even if nothing scrolls any more', async () => {
    const { container } = await renderInProvider(
      <ScrollArea aria-label="Fees" style={{ inlineSize: 150, overflow: 'auto' }}>
        <div data-testid="content" style={{ inlineSize: 500, blockSize: 10 }} />
      </ScrollArea>,
    )
    const area = areaOf(container)
    const content = page.getByTestId('content').element() as HTMLElement
    await expect.poll(() => area.getAttribute('tabindex')).toBe('0')
    area.focus()
    content.style.inlineSize = '100px'
    await expect.poll(() => area.scrollWidth <= area.clientWidth).toBe(true)
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(area.getAttribute('role')).toBe('region')
    expect(area.getAttribute('tabindex')).toBe('0')
    expect(document.activeElement).toBe(area)
    area.blur()
    await expect.poll(() => area.hasAttribute('tabindex')).toBe(false)
    expect(area.hasAttribute('role')).toBe(false)
  })

  test('text that grows wider inside a block child makes the area a region, with no resize of the child box', async () => {
    const { container } = await renderInProvider(
      <ScrollArea aria-label="Code" style={{ inlineSize: 150, overflow: 'auto' }}>
        <pre data-testid="code" style={{ margin: 0, whiteSpace: 'pre' }}>
          short
        </pre>
      </ScrollArea>,
    )
    const area = areaOf(container)
    const code = page.getByTestId('code').element()
    expect(area.hasAttribute('tabindex')).toBe(false)
    code.textContent = 'a much longer line of code that does not fit in a narrow area at all'
    await expect.poll(() => area.getAttribute('tabindex')).toBe('0')
    expect(area.getAttribute('role')).toBe('region')
  })

  test('a child added later is measured too', async () => {
    const { container } = await renderInProvider(
      <ScrollArea aria-label="Fees" style={{ inlineSize: 150, overflow: 'auto' }}>
        <div data-testid="host" />
      </ScrollArea>,
    )
    const area = areaOf(container)
    const host = page.getByTestId('host').element()
    const wide = document.createElement('div')
    wide.style.inlineSize = '500px'
    wide.style.blockSize = '10px'
    host.replaceWith(wide)
    await expect.poll(() => area.getAttribute('tabindex')).toBe('0')
  })

  test('the first render is a plain div, the same on the server', () => {
    const html = renderToString(
      <ScrollArea aria-label="Fees">
        <div>Short</div>
      </ScrollArea>,
    )
    expect(html).toBe('<div class="kv-scroll-region kv-scroll-area"><div>Short</div></div>')
  })

  test('forwards its ref, joins a className and keeps native props', async () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = await renderInProvider(
      <Fitting ref={ref} className="egen" id="fees" data-extra="x" />,
    )
    const area = areaOf(container)
    expect(ref.current).toBe(area)
    expect(area.className).toContain('kv-scroll-area')
    expect(area.className).toContain('egen')
    expect(area.id).toBe('fees')
    expect(area.getAttribute('data-extra')).toBe('x')
  })

  test('a name from aria-labelledby names the region', async () => {
    await renderInProvider(
      <>
        <h2 id="heading">Fees</h2>
        <ScrollArea aria-labelledby="heading" style={{ inlineSize: 100, blockSize: 10 }}>
          <WideContent />
        </ScrollArea>
      </>,
    )
    await expect.element(page.getByRole('region', { name: 'Fees' })).toBeVisible()
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('your own tabIndex wins', async () => {
    const { container } = await renderInProvider(<Overflowing tabIndex={-1} />)
    await expect.poll(() => areaOf(container).getAttribute('role')).toBe('region')
    expect(areaOf(container).getAttribute('tabindex')).toBe('-1')
  })

  test('as swaps the element to a section, which is a region while it scrolls', async () => {
    await renderInProvider(
      <ScrollArea
        as="section"
        aria-label="Fees"
        style={{ inlineSize: 150, overflow: 'auto' }}
        data-testid="area"
      >
        <WideContent />
      </ScrollArea>,
    )
    const element = page.getByTestId('area').element()
    expect(element.tagName).toBe('SECTION')
    await expect.poll(() => element.getAttribute('role')).toBe('region')
    expect(element.getAttribute('tabindex')).toBe('0')
  })

  test('an element outside the allowed list warns once and renders a div', async () => {
    const notAllowed = 'main' as 'div'
    await renderInProvider(
      <ScrollArea as={notAllowed} data-testid="area">
        <div>Short</div>
      </ScrollArea>,
    )
    expect(page.getByTestId('area').element().tagName).toBe('DIV')
    expect(
      consoleWarn.mock.calls.filter((call) => String(call[0]).includes('ScrollArea as="main"')),
    ).toHaveLength(1)
  })
})

describe('dev warnings', () => {
  test('a region with no name warns once', async () => {
    await renderInProvider(
      <ScrollArea region="always">
        <div>Short</div>
      </ScrollArea>,
    )
    await expect.poll(() => consoleWarn.mock.calls.length).toBe(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('A ScrollArea is a region')
  })

  test('an area that fits and has no name does not warn', async () => {
    await renderInProvider(
      <ScrollArea>
        <div>Short</div>
      </ScrollArea>,
    )
    await expect.element(page.getByText('Short')).toBeVisible()
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('useScrollArea', () => {
  test('returns the props, the state and the element for your own element', async () => {
    function Own() {
      const { scrollAreaProps, isOverflowing, isRegion, element } = useScrollArea()
      return (
        <div
          {...scrollAreaProps}
          aria-label="Own"
          style={{ inlineSize: 100, blockSize: 10 }}
          data-state={`${isOverflowing} ${isRegion} ${element === null}`}
        >
          <WideContent />
        </div>
      )
    }
    const { container } = await renderInProvider(<Own />)
    await expect.element(page.getByRole('region', { name: 'Own' })).toBeVisible()
    expect(container.querySelector('.kv-scroll-area')?.getAttribute('data-state')).toBe(
      'true true false',
    )
  })

  test('types', () => {
    expectTypeOf<ScrollAreaProps['region']>().toEqualTypeOf<'overflow' | 'always' | undefined>()
    expectTypeOf<UseScrollAreaResult['scrollAreaProps']>().toEqualTypeOf<ScrollAreaPartProps>()
  })
})

describe('keyboard', () => {
  const withNeighbours = (area: ReactNode) => (
    <>
      <button type="button">Before</button>
      {area}
      <button type="button">After</button>
    </>
  )

  test('Tab focuses the area when it overflows', async () => {
    const { container } = await renderInProvider(withNeighbours(<Overflowing />))
    await expect.poll(() => areaOf(container).getAttribute('tabindex')).toBe('0')
    page.getByRole('button', { name: 'Before' }).element().focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(areaOf(container))
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'After' })).toHaveFocus()
  })

  test('Tab skips the area when nothing scrolls', async () => {
    await renderInProvider(withNeighbours(<Fitting />))
    await expect.element(page.getByText('Short')).toBeVisible()
    page.getByRole('button', { name: 'Before' }).element().focus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'After' })).toHaveFocus()
  })

  test('Shift+Tab moves back to the area when it overflows', async () => {
    const { container } = await renderInProvider(withNeighbours(<Overflowing />))
    await expect.poll(() => areaOf(container).getAttribute('tabindex')).toBe('0')
    page.getByRole('button', { name: 'After' }).element().focus()
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(areaOf(container))
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('button', { name: 'Before' })).toHaveFocus()
  })

  test('ArrowDown scrolls the focused area', async () => {
    const { container } = await renderInProvider(<Overflowing />)
    const area = areaOf(container)
    await expect.poll(() => area.getAttribute('tabindex')).toBe('0')
    area.focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(() => area.scrollTop).toBeGreaterThan(0)
  })

  test('ArrowRight scrolls the focused area sideways', async () => {
    const { container } = await renderInProvider(<Overflowing />)
    const area = areaOf(container)
    await expect.poll(() => area.getAttribute('tabindex')).toBe('0')
    area.focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.poll(() => area.scrollLeft).toBeGreaterThan(0)
  })

  test('ArrowLeft scrolls the area sideways in right-to-left', async () => {
    const { container } = await renderInProvider(
      <div dir="rtl">
        <Overflowing />
      </div>,
    )
    const area = areaOf(container)
    await expect.poll(() => area.getAttribute('tabindex')).toBe('0')
    area.focus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.poll(() => area.scrollLeft).toBeLessThan(0)
  })

  test('PageDown scrolls the focused area a page', async () => {
    const { container } = await renderInProvider(
      <ScrollArea aria-label="Fees" style={{ blockSize: 100, overflow: 'auto' }}>
        <div style={{ blockSize: 1000, overflow: 'auto' }} />
      </ScrollArea>,
    )
    const area = areaOf(container)
    await expect.poll(() => area.getAttribute('tabindex')).toBe('0')
    area.focus()
    await userEvent.keyboard('{PageDown}')
    await expect.poll(() => area.scrollTop).toBeGreaterThan(50)
  })

  test('ArrowUp scrolls the focused area back up', async () => {
    const { container } = await renderInProvider(<Overflowing />)
    const area = areaOf(container)
    await expect.poll(() => area.getAttribute('tabindex')).toBe('0')
    area.focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(() => area.scrollTop).toBe(40)
    await new Promise((resolve) => setTimeout(resolve, 300))
    await userEvent.keyboard('{ArrowUp}')
    await expect.poll(() => area.scrollTop).toBe(0)
  })

  test('ArrowRight scrolls the area sideways in right-to-left', async () => {
    const { container } = await renderInProvider(
      <div dir="rtl">
        <Overflowing />
      </div>,
    )
    const area = areaOf(container)
    await expect.poll(() => area.getAttribute('tabindex')).toBe('0')
    area.focus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.poll(() => area.scrollLeft).toBe(-40)
    await new Promise((resolve) => setTimeout(resolve, 300))
    await userEvent.keyboard('{ArrowRight}')
    await expect.poll(() => area.scrollLeft).toBe(0)
  })

  test('PageUp, Home and End scroll the focused area', async () => {
    const { container } = await renderInProvider(
      <ScrollArea aria-label="Fees" style={{ blockSize: 100, overflow: 'auto' }}>
        <div style={{ blockSize: 1000 }} />
      </ScrollArea>,
    )
    const area = areaOf(container)
    await expect.poll(() => area.getAttribute('tabindex')).toBe('0')
    area.focus()
    await userEvent.keyboard('{End}')
    await expect.poll(() => area.scrollTop).toBe(900)
    await new Promise((resolve) => setTimeout(resolve, 300))
    await userEvent.keyboard('{PageUp}')
    await expect.poll(() => area.scrollTop).toBeLessThan(900)
    await new Promise((resolve) => setTimeout(resolve, 300))
    await userEvent.keyboard('{Home}')
    await expect.poll(() => area.scrollTop).toBe(0)
  })

  test('Space scrolls the focused area a page', async () => {
    const { container } = await renderInProvider(
      <ScrollArea aria-label="Fees" style={{ blockSize: 100, overflow: 'auto' }}>
        <div style={{ blockSize: 1000 }} />
      </ScrollArea>,
    )
    const area = areaOf(container)
    await expect.poll(() => area.getAttribute('tabindex')).toBe('0')
    area.focus()
    await userEvent.keyboard(' ')
    await expect.poll(() => area.scrollTop).toBeGreaterThan(50)
  })

  test('Escape and letters do nothing', async () => {
    const { container } = await renderInProvider(<Overflowing />)
    const area = areaOf(container)
    await expect.poll(() => area.getAttribute('tabindex')).toBe('0')
    area.focus()
    await userEvent.keyboard('{Escape}ax')
    expect(document.activeElement).toBe(area)
    expect(area.scrollTop).toBe(0)
    expect(area.scrollLeft).toBe(0)
  })
})

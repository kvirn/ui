import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Accordion } from '../index.ts'
import type { AccordionItemProps, AccordionPanelProps, AccordionRootProps } from '../index.ts'
import { useAccordion } from './use-accordion.ts'
import { useDisclosure } from '../disclosure/use-disclosure.ts'

// Contract: accordion.a11y.md. The wiring and find-in-page rules are proved in disclosure.test.tsx.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

interface ExampleProps extends AccordionRootProps {
  firstItem?: Partial<AccordionItemProps>
  firstPanel?: Partial<AccordionPanelProps>
  children?: ReactNode
}

function Example({ firstItem, firstPanel, ...rootProps }: ExampleProps) {
  return (
    <>
      <button type="button">Före</button>
      <Accordion.Root {...rootProps}>
        <Accordion.Item {...firstItem}>
          <Accordion.Heading level={3}>
            <Accordion.Trigger>Hur ansöker jag?</Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel {...firstPanel}>
            <a href="/ansok">Ansök här</a>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Heading level={3}>
            <Accordion.Trigger>Vad kostar det?</Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>Det är gratis.</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Heading level={3}>
            <Accordion.Trigger>Hur länge tar det?</Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>Två veckor.</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
      <button type="button">Efter</button>
    </>
  )
}

const trigger = (name: string) => page.getByRole('button', { name, exact: true })
const first = () => trigger('Hur ansöker jag?')
const second = () => trigger('Vad kostar det?')
const third = () => trigger('Hur länge tar det?')
const expanded = (name: string) => trigger(name).element().getAttribute('aria-expanded')

describe('rendering', () => {
  test('every item is a heading around a button, and no part has a role', async () => {
    const { container } = await render(<Example />)
    const headings = page.getByRole('heading', { level: 3 })
    expect(headings.elements()).toHaveLength(3)
    for (const heading of headings.elements()) {
      expect(heading.children).toHaveLength(1)
      expect(heading.firstElementChild?.tagName).toBe('BUTTON')
    }
    expect(container.querySelector('.kv-accordion')?.hasAttribute('role')).toBe(false)
    expect(container.querySelector('.kv-accordion-item')?.hasAttribute('role')).toBe(false)
    expect(container.querySelector('.kv-accordion-panel')?.hasAttribute('role')).toBe(false)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('the heading follows the level: h2 for 2, h4 for 4', async () => {
    const { container } = await render(
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Heading level={2}>
            <Accordion.Trigger>En</Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>Text</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Heading level={4}>
            <Accordion.Trigger>Två</Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>Text</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>,
    )
    expect(container.querySelector('h2 > button')?.textContent).toBe('En')
    expect(container.querySelector('h4 > button')?.textContent).toBe('Två')
  })

  test('each trigger controls its own panel, closed by default', async () => {
    await render(<Example />)
    const panels = [...document.querySelectorAll<HTMLElement>('.kv-accordion-panel')]
    const triggers = [first(), second(), third()].map((locator) => locator.element())
    triggers.forEach((button, index) => {
      expect(button.getAttribute('aria-controls')).toBe(panels[index]?.id)
      expect(button.getAttribute('aria-expanded')).toBe('false')
      expect(panels[index]?.hasAttribute('hidden')).toBe(true)
    })
    expect(new Set(panels.map((panel) => panel.id)).size).toBe(3)
  })

  test('items are independent: opening one leaves the others as they are', async () => {
    const { container } = await render(<Example firstItem={{ defaultOpen: true }} />)
    await userEvent.click(second())
    expect(expanded('Hur ansöker jag?')).toBe('true')
    expect(expanded('Vad kostar det?')).toBe('true')
    expect(expanded('Hur länge tar det?')).toBe('false')
    expect(container.querySelectorAll('.kv-accordion-item[data-open]')).toHaveLength(2)
    await expectNoA11yViolations(container)
  })

  test('region is opt-in: the panel is a region named by its trigger', async () => {
    await render(<Example firstItem={{ defaultOpen: true }} firstPanel={{ region: true }} />)
    await expect.element(page.getByRole('region', { name: 'Hur ansöker jag?' })).toBeVisible()
    expect(page.getByRole('region').elements()).toHaveLength(1)
  })

  test('hiddenUntilFound on the Root applies to every item, and an item can opt out', async () => {
    await render(<Example hiddenUntilFound firstItem={{ hiddenUntilFound: false }} />)
    const panels = [...document.querySelectorAll<HTMLElement>('.kv-accordion-panel')]
    expect(panels.map((panel) => panel.getAttribute('hidden'))).toEqual([
      '',
      'until-found',
      'until-found',
    ])
    panels[1]?.dispatchEvent(new Event('beforematch', { bubbles: true }))
    await expect.poll(() => expanded('Vad kostar det?')).toBe('true')
    expect(expanded('Hur länge tar det?')).toBe('false')
  })

  test('a disabled item blocks, and the others still work', async () => {
    await render(<Example firstItem={{ disabled: true, focusableWhenDisabled: true }} />)
    await userEvent.click(first(), { force: true })
    expect(expanded('Hur ansöker jag?')).toBe('false')
    await userEvent.click(second())
    expect(expanded('Vad kostar det?')).toBe('true')
  })

  test('forwards refs, className and native props, and merges them with its own', async () => {
    const rootRef = createRef<HTMLDivElement>()
    const itemRef = createRef<HTMLDivElement>()
    const headingRef = createRef<HTMLHeadingElement>()
    const triggerRef = createRef<HTMLButtonElement>()
    const panelRef = createRef<HTMLDivElement>()
    await render(
      <Accordion.Root ref={rootRef} className="egen">
        <Accordion.Item ref={itemRef} className="egen">
          <Accordion.Heading level={3} ref={headingRef} className="egen">
            <Accordion.Trigger ref={triggerRef} className="egen" data-egen="trigger">
              Fråga
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel ref={panelRef} className="egen">
            Svar
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>,
    )
    expect(rootRef.current?.className).toBe('egen kv-accordion')
    expect(itemRef.current?.className).toBe('egen kv-accordion-item')
    expect(headingRef.current?.className).toBe('egen kv-accordion-heading')
    expect(triggerRef.current?.className).toBe('kv-accordion-trigger egen kv-disclosure-trigger')
    expect(panelRef.current?.className).toBe('kv-accordion-panel egen kv-disclosure-panel')
    expect(triggerRef.current?.getAttribute('data-egen')).toBe('trigger')
  })

  test('render replaces the element: a list with list items', async () => {
    const { container } = await render(
      <Accordion.Root render={<ul role="list" />}>
        <Accordion.Item render={<li />}>
          <Accordion.Heading level={3}>
            <Accordion.Trigger>Fråga</Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>Svar</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>,
    )
    expect(container.querySelector('ul.kv-accordion > li.kv-accordion-item')).not.toBeNull()
    await expectNoA11yViolations(container)
  })

  test('useAccordion and useDisclosure spread on your own elements', async () => {
    function Own() {
      const accordion = useAccordion()
      const disclosure = useDisclosure()
      return (
        <div {...accordion.itemProps}>
          <h3 {...accordion.headingProps}>
            <button {...disclosure.triggerProps}>Fråga</button>
          </h3>
          <div {...disclosure.panelProps}>Svar</div>
        </div>
      )
    }
    const { container } = await render(<Own />)
    expect(container.querySelector('.kv-accordion-item .kv-accordion-heading')).not.toBeNull()
    await userEvent.click(trigger('Fråga'))
    expect(expanded('Fråga')).toBe('true')
  })

  test('server rendering writes the headings, the wiring and hidden panels', () => {
    const html = renderToString(<Example />)
    expect(html.match(/<h3[^>]*class="kv-accordion-heading"/g)).toHaveLength(3)
    expect(html.match(/aria-expanded="false"/g)).toHaveLength(3)
    expect(html).toMatch(/<div[^>]*class="kv-accordion-panel[^"]*"[^>]*hidden/)
  })
})

describe('keyboard', () => {
  test('Tab visits every trigger in order, and Shift+Tab goes back', async () => {
    await render(<Example />)
    page.getByRole('button', { name: 'Före' }).element().focus()
    await userEvent.tab()
    await expect.element(first()).toHaveFocus()
    await userEvent.tab()
    await expect.element(second()).toHaveFocus()
    await userEvent.tab()
    await expect.element(third()).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await userEvent.tab({ shift: true })
    await expect.element(second()).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(first()).toHaveFocus()
  })

  test('Enter and Space toggle one item and leave the others', async () => {
    await render(<Example />)
    second().element().focus()
    await userEvent.keyboard('{Enter}')
    expect(expanded('Vad kostar det?')).toBe('true')
    await expect.element(second()).toHaveFocus()
    await userEvent.keyboard(' ')
    expect(expanded('Vad kostar det?')).toBe('false')
    await expect.element(second()).toHaveFocus()
    expect(expanded('Hur ansöker jag?')).toBe('false')
    expect(expanded('Hur länge tar det?')).toBe('false')
  })

  test('Tab goes through an open section before the next trigger', async () => {
    await render(<Example firstItem={{ defaultOpen: true }} />)
    first().element().focus()
    await userEvent.tab()
    await expect.element(page.getByRole('link', { name: 'Ansök här' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(second()).toHaveFocus()
  })

  test('the arrow keys, Home and End are not handled', async () => {
    await render(<Example />)
    second().element().focus()
    const prevented: boolean[] = []
    const record = (event: KeyboardEvent) => prevented.push(event.defaultPrevented)
    document.addEventListener('keydown', record)
    for (const key of ['{ArrowDown}', '{ArrowUp}', '{Home}', '{End}']) {
      await userEvent.keyboard(key)
      await expect.element(second()).toHaveFocus()
    }
    document.removeEventListener('keydown', record)
    expect(prevented).toEqual([false, false, false, false])
    expect(expanded('Vad kostar det?')).toBe('false')
  })

  test('a Heading, Trigger or Panel outside an Item each warn once and name Accordion', async () => {
    await render(
      <Accordion.Root>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Lös fråga</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>Löst svar</Accordion.Panel>
      </Accordion.Root>,
    )
    const messages = consoleWarn.mock.calls.map(([message]) => String(message))
    expect(messages).toHaveLength(3)
    expect(messages.some((message) => message.includes('Accordion.Heading'))).toBe(true)
    expect(messages.some((message) => message.includes('Accordion.Trigger'))).toBe(true)
    expect(messages.some((message) => message.includes('Accordion.Panel'))).toBe(true)
    expect(messages.some((message) => message.includes('Disclosure.Root'))).toBe(false)
  })
})

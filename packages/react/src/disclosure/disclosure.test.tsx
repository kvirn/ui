import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Disclosure } from '../index.ts'
import type { DisclosureChangeDetails, DisclosureRootProps } from '../index.ts'
import { useDisclosure } from './use-disclosure.ts'

// Contract: disclosure.a11y.md. Component tests load no theme.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

function Example(rootProps: DisclosureRootProps) {
  return (
    <>
      <button type="button">Före</button>
      {/* Space around the controls, so the axe target-size rule has room without the theme. */}
      <div style={{ padding: 24 }}>
        <Disclosure.Root {...rootProps}>
          <Disclosure.Trigger>Öppettider</Disclosure.Trigger>
          <Disclosure.Panel>
            <a href="/kontakt" style={{ display: 'inline-block', padding: 8 }}>
              Kontakta oss
            </a>
          </Disclosure.Panel>
        </Disclosure.Root>
      </div>
      <button type="button">Efter</button>
    </>
  )
}

const trigger = () => page.getByRole('button', { name: 'Öppettider', exact: true })
const triggerElement = () => trigger().element()
const panelElement = () => document.querySelector<HTMLElement>('.kv-disclosure-panel')
const link = () => page.getByRole('link', { name: 'Kontakta oss', includeHidden: true })

describe('rendering', () => {
  test('a closed disclosure: the trigger is wired to a hidden panel', async () => {
    const { container } = await render(<Example />)
    const button = triggerElement()
    const panel = panelElement()
    expect(button.getAttribute('type')).toBe('button')
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(button.hasAttribute('data-open')).toBe(false)
    expect(panel?.id).not.toBe('')
    expect(button.getAttribute('aria-controls')).toBe(panel?.id)
    expect(panel?.hasAttribute('hidden')).toBe(true)
    expect(panel?.getAttribute('hidden')).not.toBe('until-found')
    expect(panel?.hasAttribute('data-open')).toBe(false)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('an open disclosure: expanded, visible, data-open, no axe violations', async () => {
    const { container } = await render(<Example defaultOpen />)
    expect(triggerElement().getAttribute('aria-expanded')).toBe('true')
    expect(triggerElement().hasAttribute('data-open')).toBe(true)
    expect(panelElement()?.hasAttribute('hidden')).toBe(false)
    expect(panelElement()?.hasAttribute('data-open')).toBe(true)
    await expect.element(link()).toBeVisible()
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('the chevron is decorative and flips from down to up when open', async () => {
    await render(<Example />)
    const iconPath = () => triggerElement().querySelector('svg')?.innerHTML
    const closedPath = iconPath()
    expect(triggerElement().querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    await userEvent.click(trigger())
    expect(iconPath()).not.toBe(closedPath)
    expect(trigger().element().textContent).toBe('Öppettider')
  })

  test('forwards refs, className and native props, and merges them with its own', async () => {
    const triggerRef = createRef<HTMLButtonElement>()
    const panelRef = createRef<HTMLDivElement>()
    await render(
      <Disclosure.Root>
        <Disclosure.Trigger ref={triggerRef} className="egen" data-egen="trigger">
          Öppettider
        </Disclosure.Trigger>
        <Disclosure.Panel ref={panelRef} className="egen" data-egen="panel">
          Text
        </Disclosure.Panel>
      </Disclosure.Root>,
    )
    expect(triggerRef.current).toBe(triggerElement())
    expect(panelRef.current).toBe(panelElement())
    expect(triggerRef.current?.className).toBe('egen kv-disclosure-trigger')
    expect(panelRef.current?.className).toBe('egen kv-disclosure-panel')
    expect(triggerRef.current?.getAttribute('data-egen')).toBe('trigger')
    expect(panelRef.current?.getAttribute('data-egen')).toBe('panel')
  })

  test('useDisclosure spreads the same props on your own elements', async () => {
    function Own() {
      const disclosure = useDisclosure()
      return (
        <>
          <button {...disclosure.triggerProps}>Öppettider</button>
          <div {...disclosure.panelProps}>Text</div>
        </>
      )
    }
    await render(<Own />)
    expect(triggerElement().getAttribute('aria-expanded')).toBe('false')
    await userEvent.click(trigger())
    expect(triggerElement().getAttribute('aria-expanded')).toBe('true')
    expect(panelElement()?.hasAttribute('hidden')).toBe(false)
  })

  test('server rendering writes the wiring and a hidden panel, with matching ids', () => {
    const html = renderToString(<Example />)
    expect(html).toContain('aria-expanded="false"')
    expect(html).toMatch(/<div[^>]*class="kv-disclosure-panel"[^>]*hidden/)
    const controls = /aria-controls="([^"]+)"/.exec(html)?.[1]
    expect(controls).toBeDefined()
    expect(html).toContain(`id="${controls}"`)
  })
})

describe('opening and closing', () => {
  test('a press on the trigger opens the panel, then closes it', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: DisclosureChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    expect(triggerElement().getAttribute('aria-expanded')).toBe('true')
    await userEvent.click(trigger())
    expect(triggerElement().getAttribute('aria-expanded')).toBe('false')
    expect(onOpenChange.mock.calls.map(([isOpen]) => isOpen)).toEqual([true, false])
    expect(onOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: 'trigger-press', event: expect.anything() }),
    )
  })

  test('controlled: open is the state, and onOpenChange only reports', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: DisclosureChangeDetails) => void>()
    const { rerender } = await render(<Example open={false} onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything())
    expect(triggerElement().getAttribute('aria-expanded')).toBe('false')
    await rerender(<Example open onOpenChange={onOpenChange} />)
    expect(triggerElement().getAttribute('aria-expanded')).toBe('true')
  })

  test('Enter and Space on the trigger toggle the panel', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: DisclosureChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    triggerElement().focus()
    await userEvent.keyboard('{Enter}')
    expect(triggerElement().getAttribute('aria-expanded')).toBe('true')
    await expect.element(trigger()).toHaveFocus()
    await userEvent.keyboard(' ')
    expect(triggerElement().getAttribute('aria-expanded')).toBe('false')
    await expect.element(trigger()).toHaveFocus()
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'trigger-press' }),
    )
  })

  test('Tab focuses the trigger, and is one stop', async () => {
    await render(<Example />)
    page.getByRole('button', { name: 'Före' }).element().focus()
    await userEvent.tab()
    await expect.element(trigger()).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })

  test('Shift+Tab leaves the trigger backwards', async () => {
    await render(<Example />)
    triggerElement().focus()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
  })

  test('Tab goes from the trigger into an open panel', async () => {
    await render(<Example defaultOpen />)
    triggerElement().focus()
    await userEvent.tab()
    await expect.element(link()).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(link()).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(trigger()).toHaveFocus()
  })

  test('Tab skips the content of a closed panel', async () => {
    await render(<Example />)
    triggerElement().focus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })
})

describe('disabled', () => {
  test('a disabled trigger does not open, and leaves the Tab order', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: DisclosureChangeDetails) => void>()
    await render(<Example disabled onOpenChange={onOpenChange} />)
    expect(triggerElement().hasAttribute('disabled')).toBe(true)
    page.getByRole('button', { name: 'Före' }).element().focus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(triggerElement().getAttribute('aria-expanded')).toBe('false')
  })

  test('focusableWhenDisabled keeps the trigger a Tab stop with aria-disabled, and still blocks', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: DisclosureChangeDetails) => void>()
    const onClick = vi.fn<() => void>()
    await render(
      <Disclosure.Root disabled focusableWhenDisabled onOpenChange={onOpenChange}>
        <Disclosure.Trigger onClick={onClick}>Öppettider</Disclosure.Trigger>
        <Disclosure.Panel>Text</Disclosure.Panel>
      </Disclosure.Root>,
    )
    expect(triggerElement().getAttribute('aria-disabled')).toBe('true')
    expect(triggerElement().hasAttribute('data-disabled')).toBe(true)
    triggerElement().focus()
    await expect.element(trigger()).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(onClick).not.toHaveBeenCalled()
    expect(triggerElement().getAttribute('aria-expanded')).toBe('false')
  })
})

describe('find-in-page', () => {
  test('a closed panel is hidden="until-found" with hiddenUntilFound, and a match opens it', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: DisclosureChangeDetails) => void>()
    await render(<Example hiddenUntilFound onOpenChange={onOpenChange} />)
    expect(panelElement()?.getAttribute('hidden')).toBe('until-found')
    panelElement()?.dispatchEvent(new Event('beforematch', { bubbles: true }))
    await expect.poll(() => triggerElement().getAttribute('aria-expanded')).toBe('true')
    expect(onOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: 'find-in-page', event: expect.any(Event) }),
    )
    expect(panelElement()?.hasAttribute('hidden')).toBe(false)
  })

  test('a controlled panel whose consumer ignores the match is hidden until-found again', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: DisclosureChangeDetails) => void>()
    await render(<Example hiddenUntilFound open={false} onOpenChange={onOpenChange} />)
    const panel = panelElement()
    panel?.dispatchEvent(new Event('beforematch', { bubbles: true }))
    panel?.removeAttribute('hidden')
    await expect.poll(() => panel?.getAttribute('hidden')).toBe('until-found')
    expect(onOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: 'find-in-page' }),
    )
    expect(triggerElement().getAttribute('aria-expanded')).toBe('false')
  })

  test('a controlled consumer that accepts the match keeps the panel visible and expanded', async () => {
    function Accepting() {
      const [open, setOpen] = useState(false)
      return <Example hiddenUntilFound open={open} onOpenChange={setOpen} />
    }
    await render(<Accepting />)
    const panel = panelElement()
    panel?.dispatchEvent(new Event('beforematch', { bubbles: true }))
    panel?.removeAttribute('hidden')
    await expect.poll(() => triggerElement().getAttribute('aria-expanded')).toBe('true')
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(panel?.hasAttribute('hidden')).toBe(false)
    expect(triggerElement().getAttribute('aria-expanded')).toBe('true')
  })

  test('an uncontrolled panel stays visible and expanded after the match', async () => {
    await render(<Example hiddenUntilFound />)
    const panel = panelElement()
    panel?.dispatchEvent(new Event('beforematch', { bubbles: true }))
    panel?.removeAttribute('hidden')
    await expect.poll(() => triggerElement().getAttribute('aria-expanded')).toBe('true')
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(panel?.hasAttribute('hidden')).toBe(false)
    expect(triggerElement().getAttribute('aria-expanded')).toBe('true')
  })

  test('without hiddenUntilFound a match event opens nothing', async () => {
    await render(<Example />)
    panelElement()?.dispatchEvent(new Event('beforematch', { bubbles: true }))
    expect(triggerElement().getAttribute('aria-expanded')).toBe('false')
  })

  test('an open panel has no hidden attribute, even with hiddenUntilFound', async () => {
    await render(<Example hiddenUntilFound defaultOpen />)
    expect(panelElement()?.hasAttribute('hidden')).toBe(false)
  })
})

describe('developer warnings', () => {
  test('a Trigger and a Panel outside a Root warn once each', async () => {
    await render(
      <>
        <Disclosure.Trigger>Öppettider</Disclosure.Trigger>
        <Disclosure.Panel>Text</Disclosure.Panel>
      </>,
    )
    const messages = consoleWarn.mock.calls.map(([message]) => String(message))
    expect(messages.some((message) => message.includes('Disclosure.Trigger is outside'))).toBe(true)
    expect(messages.some((message) => message.includes('Disclosure.Panel is outside'))).toBe(true)
  })
})

import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Popover, Toolbar, Tooltip, createTooltipGroup, useTooltip } from '../index.ts'
import type {
  PopoverChangeDetails,
  TooltipChangeDetails,
  TooltipRootProps,
  UseTooltipResult,
} from '../index.ts'

// Contract: tooltip.a11y.md. The timing is proved in core (tooltip-machine.test.ts, with fake
// time); here the delays are short real ones, so a hover waits for what the browser really does.
// The keyboard and pointer rows are also covered end to end in
// apps/storybook/src/components/tooltip/tooltip.e2e.ts. Component tests load no theme: the popup
// is the browser's own `popover` element with the inline placement the hook sets.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

/** The fixture's own buttons are unstyled: give them the 24px that 2.5.8 asks for, so axe checks the Tooltip. */
const buttonStyle = { minBlockSize: '2rem', minInlineSize: '2rem' }

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

type ExampleProps = Omit<TooltipRootProps, 'children'>

/** A trigger with a name of its own, and a tooltip with the name and the shortcut. Each test has its own group. */
function Example(rootProps: ExampleProps) {
  const [ownGroup] = useState(() => createTooltipGroup())
  return (
    <>
      <button type="button" style={buttonStyle}>
        Före
      </button>
      <Tooltip.Root delay={20} closeDelay={50} group={ownGroup} {...rootProps}>
        <Tooltip.Trigger aria-label="Fetstil" style={buttonStyle}>
          B
        </Tooltip.Trigger>
        <Tooltip.Popup>
          <Tooltip.Name>Fetstil</Tooltip.Name> <Tooltip.Shortcut>Ctrl+B</Tooltip.Shortcut>
        </Tooltip.Popup>
      </Tooltip.Root>
      <button type="button" style={buttonStyle}>
        Efter
      </button>
    </>
  )
}

const trigger = () => page.getByRole('button', { name: 'Fetstil', exact: true })
const triggerElement = () => trigger().element()
const popupElement = () => document.querySelector<HTMLElement>('.kv-tooltip')
const isShown = () => popupElement()?.matches(':popover-open') === true

/** Tab to the trigger: from the page's start, through "Före". */
async function tabToTrigger() {
  await userEvent.tab()
  await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
  await userEvent.tab()
  await expect.element(trigger()).toHaveFocus()
}

/** The text of what the trigger's `aria-describedby` points at, also while the popup is closed. */
function describedText(element: HTMLElement): string {
  return (element.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ')
    .trim()
}

describe('rendering', () => {
  test('closed: the popup is in the DOM, hidden, a role="tooltip" in the top layer, and the trigger is described by its shortcut', async () => {
    const { container } = await render(<Example />)
    const popup = popupElement()
    expect(popup?.tagName).toBe('DIV')
    expect(popup?.getAttribute('role')).toBe('tooltip')
    expect(popup?.getAttribute('popover')).toBe('manual')
    expect(popup?.id).not.toBe('')
    expect(popup?.hasAttribute('data-open')).toBe(false)
    expect(popup?.getAttribute('data-placement')).toBe('top')
    expect(isShown()).toBe(false)
    // The reference resolves before it opens, and it is the shortcut alone: the name is not described.
    const shortcut = document.getElementById(
      triggerElement().getAttribute('aria-describedby') ?? '',
    )
    expect(shortcut?.textContent).toBe('Ctrl+B')
    expect(popup?.contains(shortcut ?? null)).toBe(true)
    // The trigger keeps its own name and no tooltip state of its own.
    expect(triggerElement().getAttribute('aria-label')).toBe('Fetstil')
    expect(triggerElement().hasAttribute('data-open')).toBe(false)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('the part that repeats the name is aria-hidden, so the name is heard once', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isShown).toBe(true)
    const name = popupElement()?.querySelector('.kv-tooltip-name')
    expect(name?.getAttribute('aria-hidden')).toBe('true')
    expect(name?.textContent).toBe('Fetstil')
    // With a shortcut the popup itself is part of the tree: only the name line is hidden.
    expect(popupElement()?.hasAttribute('aria-hidden')).toBe(false)
    await expect.element(trigger()).toHaveAccessibleName('Fetstil')
    await expect.element(trigger()).toHaveAccessibleDescription('Ctrl+B')
  })

  test('plain text in the popup is the description as a whole', async () => {
    const { container } = await render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger aria-label="Skriv ut" style={buttonStyle}>
          P
        </Tooltip.Trigger>
        <Tooltip.Popup>Öppnar utskriftsvyn</Tooltip.Popup>
      </Tooltip.Root>,
    )
    await expect.poll(isShown).toBe(true)
    const button = page.getByRole('button', { name: 'Skriv ut', exact: true })
    expect(button.element().getAttribute('aria-describedby')).toBe(popupElement()?.id)
    await expect.element(button).toHaveAccessibleDescription('Öppnar utskriftsvyn')
    expect(popupElement()?.hasAttribute('aria-hidden')).toBe(false)
    await expectNoA11yViolations(container)
  })

  test('a popup with only the name adds nothing for assistive technology: no description, and the whole popup is aria-hidden with its role kept', async () => {
    const { container } = await render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger aria-label="Sök" style={buttonStyle}>
          S
        </Tooltip.Trigger>
        <Tooltip.Popup>
          <Tooltip.Name>Sök</Tooltip.Name>
        </Tooltip.Popup>
      </Tooltip.Root>,
    )
    const button = page.getByRole('button', { name: 'Sök', exact: true })
    await expect.element(button).toBeVisible()
    await expect.poll(isShown).toBe(true)
    expect(button.element().hasAttribute('aria-describedby')).toBe(false)
    await expect.element(button).toHaveAccessibleDescription('')
    // An open role="tooltip" must have accessible text (axe aria-tooltip-name), or be hidden.
    expect(popupElement()?.getAttribute('aria-hidden')).toBe('true')
    expect(popupElement()?.getAttribute('role')).toBe('tooltip')
    // It stays in the DOM while closed too.
    expect(popupElement()).not.toBeNull()
    await expectNoA11yViolations(container)
  })

  test('an open tooltip has data-open and data-placement, and no axe violations', async () => {
    const { container } = await render(<Example defaultOpen />)
    await expect.poll(isShown).toBe(true)
    expect(popupElement()?.hasAttribute('data-open')).toBe(true)
    expect(popupElement()?.getAttribute('data-placement')).toMatch(/^(top|bottom)/)
    await expect.element(page.getByRole('tooltip')).toBeVisible()
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('the server renders the closed popup with its attributes and no inline position', () => {
    const html = renderToString(<Example />)
    expect(html).toContain('role="tooltip"')
    expect(html).toContain('popover="manual"')
    expect(html).toContain('data-placement="top"')
    expect(html).not.toContain('position:')
  })
})

describe('keyboard focus (WCAG 1.4.13, 2.1.1)', () => {
  test('a click does not open the tooltip from focus', async () => {
    await render(<Example delay={5000} />)
    await userEvent.click(trigger())
    await expect.element(trigger()).toHaveFocus()
    await wait(150)
    expect(isShown()).toBe(false)
    await userEvent.unhover(document.body)
  })
})

describe('hover (WCAG 1.4.13 hoverable and persistent)', () => {
  test('a touch pointer opens no tooltip', async () => {
    await render(<Example />)
    const enter = (pointerType: string) =>
      triggerElement().dispatchEvent(
        new PointerEvent('pointerover', { bubbles: true, pointerType, relatedTarget: null }),
      )
    enter('touch')
    await wait(150)
    expect(isShown()).toBe(false)
    // The same event from a mouse does open it, so the touch case above proves something.
    enter('mouse')
    await expect.poll(isShown).toBe(true)
  })
})

describe('composition', () => {
  function FormattingToolbar({ delay = 5000 }: { delay?: number }) {
    const [group] = useState(() => createTooltipGroup())
    return (
      <>
        <p id="hint">Markera texten först.</p>
        <Toolbar.Root aria-label="Formatering">
          {(
            [
              ['Fetstil', 'Ctrl+B', 'Control+B'],
              ['Kursiv', 'Ctrl+I', 'Control+I'],
              ['Understruken', 'Ctrl+U', 'Control+U'],
            ] as const
          ).map(([name, shortcut, keys]) => (
            <Tooltip.Root key={name} delay={delay} group={group}>
              <Tooltip.Trigger
                render={
                  <Toolbar.Toggle
                    aria-label={name}
                    aria-keyshortcuts={keys}
                    aria-describedby="hint"
                    style={buttonStyle}
                  />
                }
              >
                {name.slice(0, 1)}
              </Tooltip.Trigger>
              <Tooltip.Popup>
                <Tooltip.Name>{name}</Tooltip.Name> <Tooltip.Shortcut>{shortcut}</Tooltip.Shortcut>
              </Tooltip.Popup>
            </Tooltip.Root>
          ))}
        </Toolbar.Root>
      </>
    )
  }

  test('works on a Toolbar.Toggle: its name, state and keys stay, and its own aria-describedby is kept', async () => {
    const { container } = await render(<FormattingToolbar />)
    const bold = page.getByRole('button', { name: 'Fetstil', exact: true })
    const element = bold.element()
    expect(element.getAttribute('aria-pressed')).toBe('false')
    expect(element.getAttribute('aria-keyshortcuts')).toBe('Control+B')
    const tokens = (element.getAttribute('aria-describedby') ?? '').split(' ')
    expect(tokens).toContain('hint')
    expect(tokens).toHaveLength(2)
    expect(describedText(element as HTMLElement)).toBe('Markera texten först. Ctrl+B')
    // Still one Tab stop with the toolbar's roving tabindex.
    expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(1)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('the tooltip layer and a Popover underneath', () => {
  test('a press outside reaches the Popover in the same press: the tooltip layer passes it through', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: PopoverChangeDetails) => void>()
    await render(
      <>
        <p>Text utanför</p>
        <Popover.Root defaultOpen onOpenChange={onOpenChange}>
          <Popover.Trigger style={buttonStyle}>Meny</Popover.Trigger>
          <Popover.Popup aria-label="Meny">
            <Tooltip.Root>
              <Tooltip.Trigger aria-label="Fetstil" style={buttonStyle}>
                B
              </Tooltip.Trigger>
              <Tooltip.Popup>
                <Tooltip.Name>Fetstil</Tooltip.Name> <Tooltip.Shortcut>Ctrl+B</Tooltip.Shortcut>
              </Tooltip.Popup>
            </Tooltip.Root>
          </Popover.Popup>
        </Popover.Root>
      </>,
    )
    const popover = () => document.querySelector<HTMLElement>('.kv-popover-popup')
    await expect.poll(() => popover()?.matches(':popover-open')).toBe(true)
    await userEvent.tab()
    await userEvent.tab()
    await expect.element(trigger()).toHaveFocus()
    await expect.poll(isShown).toBe(true)
    await userEvent.click(page.getByText('Text utanför'))
    await expect.poll(() => popover()?.matches(':popover-open')).toBe(false)
    // Our own outside-press handling closed it on pointerdown. Had the tooltip's layer taken the
    // press, only the platform's light dismiss would have, later.
    expect(onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: 'outside-press' }),
    )
  })
})

describe('dev warnings', () => {
  test('a trigger with no accessible name of its own warns once', async () => {
    await render(
      <Tooltip.Root>
        <Tooltip.Trigger style={buttonStyle}>
          <svg aria-hidden="true" width="16" height="16" />
        </Tooltip.Trigger>
        <Tooltip.Popup>Sök</Tooltip.Popup>
      </Tooltip.Root>,
    )
    await expect.poll(() => consoleWarn.mock.calls.length).toBe(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('no accessible name of its own')
  })

  test('a title does not count as a name', async () => {
    await render(
      <Tooltip.Root>
        <Tooltip.Trigger title="Sök" style={buttonStyle}>
          <svg aria-hidden="true" width="16" height="16" />
        </Tooltip.Trigger>
        <Tooltip.Popup>Sök</Tooltip.Popup>
      </Tooltip.Root>,
    )
    await expect.poll(() => consoleWarn.mock.calls.length).toBe(1)
  })

  test('interactive content in the popup warns once', async () => {
    await render(
      <Tooltip.Root>
        <Tooltip.Trigger aria-label="Hjälp" style={buttonStyle}>
          ?
        </Tooltip.Trigger>
        <Tooltip.Popup>
          Mer hjälp: <a href="/hjalp">Läs här</a>
        </Tooltip.Popup>
      </Tooltip.Root>,
    )
    await expect.poll(() => consoleWarn.mock.calls.length).toBe(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('interactive content')
  })

  test('a part outside a Root warns, and renders an ordinary element', async () => {
    await render(
      <>
        <Tooltip.Trigger aria-label="Hjälp" style={buttonStyle}>
          ?
        </Tooltip.Trigger>
        <Tooltip.Popup>Hjälp</Tooltip.Popup>
        <Tooltip.Name>Hjälp</Tooltip.Name>
        <Tooltip.Shortcut>F1</Tooltip.Shortcut>
      </>,
    )
    await expect.poll(() => consoleWarn.mock.calls.length).toBe(4)
    const messages = consoleWarn.mock.calls.map(([message]) => String(message))
    for (const part of ['Trigger', 'Popup', 'Name', 'Shortcut']) {
      expect(messages.some((message) => message.includes(`Tooltip.${part} is outside`))).toBe(true)
    }
  })
})

describe('controlled and uncontrolled', () => {
  test('defaultOpen shows the tooltip from the start', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isShown).toBe(true)
  })

  test('open is the owner’s: a request the owner refuses leaves it closed, and reports why', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: TooltipChangeDetails) => void>()
    await render(<Example open={false} onOpenChange={onOpenChange} />)
    await tabToTrigger()
    await expect.poll(() => onOpenChange.mock.calls.length).toBe(1)
    expect(onOpenChange).toHaveBeenCalledWith(true, { reason: 'focus' })
    await wait(100)
    expect(isShown()).toBe(false)
  })

  test('the owner opens and closes it with open', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" style={buttonStyle} onClick={() => setOpen((current) => !current)}>
            Visa
          </button>
          <Example open={open} onOpenChange={setOpen} />
        </>
      )
    }
    await render(<Controlled />)
    await userEvent.click(page.getByRole('button', { name: 'Visa' }))
    await expect.poll(isShown).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Visa' }))
    await expect.poll(isShown).toBe(false)
  })

  test('reports why it opened and closed: focus, escape, blur, hover, pointer-leave and trigger-press', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: TooltipChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await tabToTrigger()
    await expect.poll(isShown).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    await userEvent.tab()
    await userEvent.tab({ shift: true })
    await expect.poll(isShown).toBe(true)
    await userEvent.tab()
    await expect.poll(isShown).toBe(false)
    await userEvent.hover(trigger())
    await expect.poll(isShown).toBe(true)
    await userEvent.unhover(document.body)
    await expect.poll(isShown).toBe(false)
    await userEvent.hover(trigger())
    await expect.poll(isShown).toBe(true)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(false)
    await userEvent.unhover(document.body)
    expect(onOpenChange.mock.calls.map(([isOpen, { reason }]) => [isOpen, reason])).toEqual([
      [true, 'focus'],
      [false, 'escape'],
      [true, 'focus'],
      [false, 'blur'],
      [true, 'hover'],
      [false, 'pointer-leave'],
      [true, 'hover'],
      [false, 'trigger-press'],
    ])
  })
})

describe('the public API', () => {
  test('forwards refs, className and native props, merges them with its own, and keeps the part classes', async () => {
    const triggerRef = createRef<HTMLButtonElement>()
    const popupRef = createRef<HTMLDivElement>()
    const nameRef = createRef<HTMLSpanElement>()
    const shortcutRef = createRef<HTMLSpanElement>()
    await render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger ref={triggerRef} className="egen" data-egen="trigger" aria-label="Fetstil">
          B
        </Tooltip.Trigger>
        <Tooltip.Popup ref={popupRef} className="egen" data-egen="popup">
          <Tooltip.Name ref={nameRef} className="egen">
            Fetstil
          </Tooltip.Name>
          <Tooltip.Shortcut ref={shortcutRef} className="egen">
            Ctrl+B
          </Tooltip.Shortcut>
        </Tooltip.Popup>
      </Tooltip.Root>,
    )
    expect(triggerRef.current).toBe(triggerElement())
    expect(popupRef.current).toBe(popupElement())
    expect(popupRef.current?.className).toBe('egen kv-tooltip')
    expect(nameRef.current?.className).toBe('egen kv-tooltip-name')
    expect(shortcutRef.current?.className).toBe('egen kv-tooltip-shortcut')
    // The trigger gets no class of the tooltip's: its look never depends on its tooltip.
    expect(triggerRef.current?.className).toBe('egen')
    expect(triggerRef.current?.getAttribute('data-egen')).toBe('trigger')
    expect(popupRef.current?.getAttribute('data-egen')).toBe('popup')
    // The part's own ref still reaches the hook: the popup was placed next to the trigger.
    await expect.poll(() => popupRef.current?.style.position).toBe('fixed')
  })

  test('render replaces the element and gives the state', async () => {
    const states: boolean[] = []
    await render(
      <Tooltip.Root>
        <Tooltip.Trigger
          render={(partProps, state) => {
            states.push(state.isOpen)
            return (
              <button {...partProps} data-egen="render">
                B
              </button>
            )
          }}
          aria-label="Fetstil"
        />
        <Tooltip.Popup render={(partProps) => <section {...partProps} />}>Fetstil</Tooltip.Popup>
      </Tooltip.Root>,
    )
    expect(triggerElement().getAttribute('data-egen')).toBe('render')
    expect(popupElement()?.tagName).toBe('SECTION')
    expect(popupElement()?.getAttribute('role')).toBe('tooltip')
    await userEvent.tab()
    await expect.poll(() => states.at(-1)).toBe(true)
  })

  test('useTooltip spreads the same props on your own elements', async () => {
    function Own() {
      const tooltip = useTooltip({ description: 'shortcut' })
      return (
        <>
          <button {...tooltip.triggerProps} aria-label="Fetstil" style={buttonStyle}>
            B
          </button>
          <div {...tooltip.popupProps}>
            <span {...tooltip.nameProps}>Fetstil</span>{' '}
            <span {...tooltip.shortcutProps}>Ctrl+B</span>
          </div>
        </>
      )
    }
    await render(<Own />)
    await userEvent.tab()
    await expect.element(trigger()).toHaveFocus()
    await expect.poll(isShown).toBe(true)
    await expect.element(trigger()).toHaveAccessibleDescription('Ctrl+B')
  })

  test('the hook’s props are typed for the elements they go on', () => {
    expectTypeOf<UseTooltipResult['popupProps']['role']>().toEqualTypeOf<'tooltip'>()
    expectTypeOf<UseTooltipResult['popupProps']['className']>().toEqualTypeOf<'kv-tooltip'>()
    expectTypeOf<UseTooltipResult['nameProps']['aria-hidden']>().toEqualTypeOf<true>()
    expectTypeOf<TooltipChangeDetails['reason']>().toEqualTypeOf<
      'hover' | 'focus' | 'escape' | 'pointer-leave' | 'blur' | 'trigger-press'
    >()
  })
})

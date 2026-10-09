import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useState } from 'react'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Icon } from '../icon/icon.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { Toggle } from './toggle.tsx'
import type { ToggleProps } from './toggle.tsx'
import { useToggle } from './use-toggle.ts'
import type { TogglePartProps, UseToggleOptions, UseToggleResult } from './use-toggle.ts'

// Contract: toggle.a11y.md.

type PressedChange = NonNullable<UseToggleOptions['onPressedChange']>

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

describe('rendering', () => {
  test('is a native button with aria-pressed, off by default, and the part classes', async () => {
    const { container } = await render(<Toggle>Visa bara olästa</Toggle>)
    const toggle = page.getByRole('button', { name: 'Visa bara olästa' })
    await expect.element(toggle).toHaveAttribute('type', 'button')
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect.element(toggle).not.toHaveAttribute('data-pressed')
    expect(toggle.element().className).toBe('kv-button kv-toggle')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a consumer class joins the part classes and other button props pass through', async () => {
    await render(
      <Toggle className="egen-klass" name="olasta" value="ja">
        Visa bara olästa
      </Toggle>,
    )
    const toggle = page.getByRole('button', { name: 'Visa bara olästa' })
    await expect.element(toggle).toHaveClass('kv-button', 'kv-toggle', 'egen-klass')
    await expect.element(toggle).toHaveAttribute('name', 'olasta')
    await expect.element(toggle).toHaveAttribute('value', 'ja')
  })

  test('forwards its ref to the button', async () => {
    const ref = createRef<HTMLButtonElement>()
    await render(<Toggle ref={ref}>Visa bara olästa</Toggle>)
    expect(ref.current).toBe(page.getByRole('button', { name: 'Visa bara olästa' }).element())
  })
})

describe('uncontrolled', () => {
  test('defaultPressed starts it on, and a press switches it, with data-pressed', async () => {
    const { container } = await render(<Toggle defaultPressed>Visa bara olästa</Toggle>)
    const toggle = page.getByRole('button', { name: 'Visa bara olästa' })
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect.element(toggle).toHaveAttribute('data-pressed', '')
    await expectNoA11yViolations(container)
    await userEvent.click(toggle)
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect.element(toggle).not.toHaveAttribute('data-pressed')
    await userEvent.click(toggle)
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'true')
  })

  test('Enter and Space switch it, the name stays and focus stays', async () => {
    await render(<Toggle>Visa bara olästa</Toggle>)
    const toggle = page.getByRole('button', { name: 'Visa bara olästa' })
    await userEvent.keyboard('{Tab}')
    await expect.element(toggle).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'true')
    await userEvent.keyboard(' ')
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect.element(toggle).toHaveFocus()
    // The accessible name is found again by the same name: it never changed with the state.
    await expect.element(page.getByRole('button', { name: 'Visa bara olästa' })).toBeVisible()
  })

  test('onPressedChange reports the new value and the event, once per press', async () => {
    const onPressedChange = vi.fn<PressedChange>()
    await render(<Toggle onPressedChange={onPressedChange}>Visa bara olästa</Toggle>)
    const toggle = page.getByRole('button', { name: 'Visa bara olästa' })
    await userEvent.click(toggle)
    await userEvent.click(toggle)
    expect(onPressedChange).toHaveBeenCalledTimes(2)
    expect(onPressedChange.mock.calls[0]?.[0]).toBe(true)
    expect(onPressedChange.mock.calls[0]?.[1].event.type).toBe('click')
    expect(onPressedChange.mock.calls[1]?.[0]).toBe(false)
  })

  test('onClick is called too, after the switch', async () => {
    const calls: string[] = []
    await render(
      <Toggle
        onPressedChange={() => calls.push('pressed-change')}
        onClick={() => calls.push('click')}
      >
        Visa bara olästa
      </Toggle>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Visa bara olästa' }))
    expect(calls).toEqual(['pressed-change', 'click'])
  })
})

describe('controlled', () => {
  test('shows the pressed it is given and only reports a press', async () => {
    const onPressedChange = vi.fn<PressedChange>()
    await render(
      <Toggle pressed={false} onPressedChange={onPressedChange}>
        Visa bara olästa
      </Toggle>,
    )
    const toggle = page.getByRole('button', { name: 'Visa bara olästa' })
    await userEvent.click(toggle)
    expect(onPressedChange).toHaveBeenCalledTimes(1)
    expect(onPressedChange.mock.calls[0]?.[0]).toBe(true)
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  test('follows the consumer’s state', async () => {
    function Controlled() {
      const [isOn, setIsOn] = useState(false)
      return (
        <>
          <Toggle pressed={isOn} onPressedChange={setIsOn}>
            Visa bara olästa
          </Toggle>
          <output>{isOn ? 'på' : 'av'}</output>
        </>
      )
    }
    await render(<Controlled />)
    const toggle = page.getByRole('button', { name: 'Visa bara olästa' })
    await userEvent.click(toggle)
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect.element(page.getByText('på')).toBeVisible()
    await userEvent.click(toggle)
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('disabled', () => {
  test('is natively disabled, keeps aria-pressed and is skipped by Tab', async () => {
    const { container } = await render(
      <>
        <Toggle disabled defaultPressed>
          Visa bara olästa
        </Toggle>
        <button type="button">Efter</button>
      </>,
    )
    const toggle = page.getByRole('button', { name: 'Visa bara olästa' })
    await expect.element(toggle).toBeDisabled()
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect.element(toggle).toHaveAttribute('data-disabled', '')
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
    await expectNoA11yViolations(container)
  })

  test('a focusable disabled toggle uses aria-disabled, stays in the Tab order, and ignores press, Enter and Space', async () => {
    const onPressedChange = vi.fn<PressedChange>()
    const { container } = await render(
      <Toggle disabled focusableWhenDisabled onPressedChange={onPressedChange}>
        Visa bara olästa
      </Toggle>,
    )
    const toggle = page.getByRole('button', { name: 'Visa bara olästa' })
    await expect.element(toggle).toHaveAttribute('aria-disabled', 'true')
    await expect.element(toggle).not.toHaveAttribute('disabled')
    await userEvent.keyboard('{Tab}')
    await expect.element(toggle).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await userEvent.click(toggle, { force: true })
    expect(onPressedChange).not.toHaveBeenCalled()
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect.element(toggle).toHaveFocus()
    await expectNoA11yViolations(container)
  })
})

describe('Tab order', () => {
  test('Tab moves to the toggle and Shift+Tab moves off it', async () => {
    await render(
      <>
        <button type="button">Före</button>
        <Toggle>Visa bara olästa</Toggle>
        <button type="button">Efter</button>
      </>,
    )
    const toggle = page.getByRole('button', { name: 'Visa bara olästa' })
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(toggle).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(toggle).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
  })
})

describe('focus visible', () => {
  test('sets data-focus-visible on keyboard focus only', async () => {
    await render(
      <>
        <Toggle>Fet</Toggle>
        <Toggle>Kursiv</Toggle>
      </>,
    )
    const toggle = page.getByRole('button', { name: 'Fet' })
    await userEvent.keyboard('{Tab}')
    await expect.element(toggle).toHaveAttribute('data-focus-visible', '')
    await userEvent.keyboard('{Tab}')
    await expect.element(toggle).not.toHaveAttribute('data-focus-visible')
    await userEvent.click(toggle)
    await expect.element(toggle).not.toHaveAttribute('data-focus-visible')
  })
})

describe('handlers on a focusable disabled toggle', () => {
  test('onClick is blocked while a focusable toggle is disabled', async () => {
    const onClick = vi.fn<() => void>()
    await render(
      <Toggle disabled focusableWhenDisabled onClick={onClick}>
        Visa bara olästa
      </Toggle>,
    )
    const toggle = page.getByRole('button', { name: 'Visa bara olästa' })
    await userEvent.click(toggle, { force: true })
    await userEvent.keyboard('{Tab}')
    await userEvent.keyboard('{Enter}')
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe('accessible name', () => {
  test('warns in development when an icon-only toggle has no accessible name', async () => {
    await render(
      <Toggle>
        <Icon name="close" />
      </Toggle>,
    )
    await expect.element(page.getByRole('button')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('no accessible name')
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('aria-label')
  })

  test('an aria-label names an icon-only toggle, and it does not change with the state', async () => {
    await render(
      <Toggle aria-label="Fetstil">
        <Icon name="close" />
      </Toggle>,
    )
    const toggle = page.getByRole('button', { name: 'Fetstil' })
    await userEvent.click(toggle)
    await expect.element(page.getByRole('button', { name: 'Fetstil', pressed: true })).toBeVisible()
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('useToggle', () => {
  function HookToggle(options: UseToggleOptions & { children: ReactNode }) {
    const { children, ...toggleOptions } = options
    const toggle = useToggle(toggleOptions)
    return (
      <button {...mergeProps(toggle.toggleProps, { className: 'egen' })}>
        {children} ({toggle.isPressed ? 'på' : 'av'})
      </button>
    )
  }

  test('gives spreadable toggleProps with the same behaviour', async () => {
    const onPressedChange = vi.fn<PressedChange>()
    const { container } = await render(
      <HookToggle onPressedChange={onPressedChange}>Fet</HookToggle>,
    )
    const toggle = page.getByRole('button', { name: /Fet/ })
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(toggle)
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect.element(toggle).toHaveAttribute('data-pressed', '')
    expect(onPressedChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ event: expect.anything() }),
    )
    await expectNoA11yViolations(container)
  })

  test('a focusable disabled hook toggle blocks the press', async () => {
    const onPressedChange = vi.fn<PressedChange>()
    await render(
      <HookToggle disabled focusableWhenDisabled onPressedChange={onPressedChange}>
        Fet
      </HookToggle>,
    )
    const toggle = page.getByRole('button', { name: /Fet/ })
    await expect.element(toggle).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(toggle, { force: true })
    expect(onPressedChange).not.toHaveBeenCalled()
  })
})

describe('server rendering', () => {
  test('renders to a string without touching the page', () => {
    const html = renderToString(
      <Toggle defaultPressed disabled focusableWhenDisabled>
        Fet
      </Toggle>,
    )
    expect(html).toBe(
      '<button class="kv-button kv-toggle" type="button" aria-disabled="true" data-disabled="" aria-pressed="true" data-pressed="">Fet</button>',
    )
  })
})

describe('types', () => {
  test('exports the hook and part types', () => {
    expectTypeOf<UseToggleResult['isPressed']>().toEqualTypeOf<boolean>()
    expectTypeOf<UseToggleResult['isDisabled']>().toEqualTypeOf<boolean>()
    expectTypeOf<UseToggleResult['isFocusVisible']>().toEqualTypeOf<boolean>()
    expectTypeOf<UseToggleOptions['pressed']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<UseToggleOptions['defaultPressed']>().toEqualTypeOf<boolean | undefined>()
    // The part's classes that @kvirn-ui/theme and your own CSS select on.
    expectTypeOf<TogglePartProps['className']>().toEqualTypeOf<'kv-button kv-toggle'>()
    // Pressed is set by `pressed` or `defaultPressed`, never by hand, and a toggle is never a submit button.
    expectTypeOf<ToggleProps>().not.toHaveProperty('aria-pressed')
    expectTypeOf<ToggleProps>().not.toHaveProperty('aria-disabled')
    expectTypeOf<ToggleProps>().not.toHaveProperty('type')
  })
})

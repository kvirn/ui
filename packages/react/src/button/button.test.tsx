import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useState } from 'react'
import type { FormEvent, ReactElement, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Icon } from '../icon/icon.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { Button } from './button.tsx'
import type { ButtonProps } from './button.tsx'
import { useButton } from './use-button.ts'
import type { ButtonPartProps, UseButtonOptions, UseButtonResult } from './use-button.ts'

// Contract: button.a11y.md.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

function SubmitForm({
  children,
  onSubmit,
}: {
  children: ReactNode
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form
      aria-label="Ansökan"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(event)
      }}
    >
      <label>
        Namn
        <input name="namn" />
      </label>
      {children}
    </form>
  )
}

describe('rendering', () => {
  test('renders a native button with type="button" by default', async () => {
    const { container } = await render(<Button>Spara</Button>)
    const button = page.getByRole('button', { name: 'Spara' })
    await expect.element(button).toHaveAttribute('type', 'button')
    await expect.element(button).not.toHaveAttribute('data-disabled')
    await expect.element(button).not.toHaveAttribute('aria-disabled')
    await expectNoA11yViolations(container)
  })

  test('passes other button props through', async () => {
    await render(
      <Button name="atgard" value="spara" title="Spara">
        Spara
      </Button>,
    )
    const button = page.getByRole('button', { name: 'Spara' })
    await expect.element(button).toHaveAttribute('name', 'atgard')
    await expect.element(button).toHaveAttribute('value', 'spara')
  })

  test('marks its part with class="kv-button" and joins a consumer class', async () => {
    await render(
      <>
        <Button>Spara</Button>
        <Button className="kv-button--primary">Skicka</Button>
      </>,
    )
    const secondary = page.getByRole('button', { name: 'Spara' })
    const primary = page.getByRole('button', { name: 'Skicka' })
    expect(secondary.element().className).toBe('kv-button')
    await expect.element(secondary).not.toHaveAttribute('data-kv')
    await expect.element(primary).toHaveClass('kv-button', 'kv-button--primary')
  })

  test('forwards its ref to the button', async () => {
    const ref = createRef<HTMLButtonElement>()
    await render(<Button ref={ref}>Spara</Button>)
    expect(ref.current).toBe(page.getByRole('button', { name: 'Spara' }).element())
  })

  test('Enter and Space activate the button and keep focus on it', async () => {
    const onClick = vi.fn<() => void>()
    await render(<Button onClick={onClick}>Spara</Button>)
    const button = page.getByRole('button', { name: 'Spara' })
    await userEvent.keyboard('{Tab}')
    await expect.element(button).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(2)
    await expect.element(button).toHaveFocus()
  })
})

describe('forms', () => {
  test('a default button does not submit its form', async () => {
    const onSubmit = vi.fn<() => void>()
    const onClick = vi.fn<() => void>()
    await render(
      <SubmitForm onSubmit={onSubmit}>
        <Button onClick={onClick}>Rensa</Button>
      </SubmitForm>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Rensa' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  test('type="submit" submits its form', async () => {
    const onSubmit = vi.fn<() => void>()
    const { container } = await render(
      <SubmitForm onSubmit={onSubmit}>
        <Button type="submit">Skicka ansökan</Button>
      </SubmitForm>,
    )
    const button = page.getByRole('button', { name: 'Skicka ansökan' })
    await expect.element(button).toHaveAttribute('type', 'submit')
    await userEvent.click(button)
    expect(onSubmit).toHaveBeenCalledTimes(1)
    await expectNoA11yViolations(container)
  })
})

describe('keyboard', () => {
  test('Tab moves focus to the button', async () => {
    await render(<Button>Spara</Button>)
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Spara' })).toHaveFocus()
  })

  test('Shift+Tab moves focus off the button', async () => {
    await render(
      <>
        <Button>Spara</Button>
        <Button>Avbryt</Button>
      </>,
    )
    await userEvent.keyboard('{Tab}{Tab}')
    await expect.element(page.getByRole('button', { name: 'Avbryt' })).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('button', { name: 'Spara' })).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('button', { name: 'Spara' })).not.toHaveFocus()
  })

  test('Space activates the button on key up', async () => {
    const onClick = vi.fn<() => void>()
    await render(<Button onClick={onClick}>Spara</Button>)
    const button = page.getByRole('button', { name: 'Spara' })
    await userEvent.keyboard('{Tab}')
    await userEvent.keyboard('{Space>}')
    expect(onClick).not.toHaveBeenCalled()
    await userEvent.keyboard('{/Space}')
    expect(onClick).toHaveBeenCalledTimes(1)
    await expect.element(button).toHaveFocus()
  })

  test('Enter on a submit button submits the form', async () => {
    const onSubmit = vi.fn<() => void>()
    await render(
      <SubmitForm onSubmit={onSubmit}>
        <Button type="submit">Skicka ansökan</Button>
      </SubmitForm>,
    )
    const button = page.getByRole('button', { name: 'Skicka ansökan' })
    await userEvent.click(page.getByRole('textbox', { name: 'Namn' }))
    await userEvent.keyboard('{Tab}')
    await expect.element(button).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onSubmit).toHaveBeenCalledTimes(1)
    await expect.element(button).toHaveFocus()
  })

  test('Enter on a default button does not submit the form', async () => {
    const onSubmit = vi.fn<() => void>()
    const onClick = vi.fn<() => void>()
    await render(
      <SubmitForm onSubmit={onSubmit}>
        <Button onClick={onClick}>Börja om</Button>
      </SubmitForm>,
    )
    const button = page.getByRole('button', { name: 'Börja om' })
    await userEvent.click(page.getByRole('textbox', { name: 'Namn' }))
    await userEvent.keyboard('{Tab}')
    await expect.element(button).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
    await expect.element(button).toHaveFocus()
  })
})

describe('disabled', () => {
  test('is natively disabled, marked with data-disabled and skipped by Tab', async () => {
    const { container } = await render(
      <>
        <Button disabled>Skicka</Button>
        <Button>Avbryt</Button>
      </>,
    )
    const disabledButton = page.getByRole('button', { name: 'Skicka' })
    await expect.element(disabledButton).toBeDisabled()
    await expect.element(disabledButton).toHaveAttribute('data-disabled', '')
    await expect.element(disabledButton).not.toHaveAttribute('aria-disabled')
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Avbryt' })).toHaveFocus()
    await expectNoA11yViolations(container)
  })

  test('a click calls no handler', async () => {
    const onClick = vi.fn<() => void>()
    await render(
      <Button disabled onClick={onClick}>
        Skicka
      </Button>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }), { force: true })
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe('focusable when disabled', () => {
  test('uses aria-disabled instead of disabled and stays in the Tab order', async () => {
    const { container } = await render(
      <Button disabled focusableWhenDisabled>
        Skicka
      </Button>,
    )
    const button = page.getByRole('button', { name: 'Skicka' })
    await expect.element(button).toHaveAttribute('aria-disabled', 'true')
    await expect.element(button).not.toHaveAttribute('disabled')
    await expect.element(button).toHaveAttribute('data-disabled', '')
    await expect.element(button).toBeDisabled()
    await userEvent.keyboard('{Tab}')
    await expect.element(button).toHaveFocus()
    await expectNoA11yViolations(container)
  })

  test('click, Enter and Space call no handler, and focus stays', async () => {
    const onClick = vi.fn<() => void>()
    await render(
      <Button disabled focusableWhenDisabled onClick={onClick}>
        Skicka
      </Button>,
    )
    const button = page.getByRole('button', { name: 'Skicka' })
    await userEvent.click(button, { force: true })
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(onClick).not.toHaveBeenCalled()
    await expect.element(button).toHaveFocus()
  })

  test('a submit button submits nothing on click or Enter', async () => {
    const onSubmit = vi.fn<() => void>()
    await render(
      <SubmitForm onSubmit={onSubmit}>
        <Button type="submit" disabled focusableWhenDisabled>
          Skicka ansökan
        </Button>
      </SubmitForm>,
    )
    const button = page.getByRole('button', { name: 'Skicka ansökan' })
    await userEvent.click(button, { force: true })
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  test('blocks implicit submission from a text field', async () => {
    const onSubmit = vi.fn<() => void>()
    await render(
      <SubmitForm onSubmit={onSubmit}>
        <Button type="submit" disabled focusableWhenDisabled>
          Skicka ansökan
        </Button>
      </SubmitForm>,
    )
    await userEvent.click(page.getByRole('textbox', { name: 'Namn' }))
    await userEvent.keyboard('Anna{Enter}')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  test('activates again once it is enabled', async () => {
    const onClick = vi.fn<() => void>()
    function Toggling() {
      const [isDisabled, setIsDisabled] = useState(true)
      return (
        <>
          <Button disabled={isDisabled} focusableWhenDisabled onClick={onClick}>
            Skicka
          </Button>
          <Button onClick={() => setIsDisabled(false)}>Aktivera</Button>
        </>
      )
    }
    await render(<Toggling />)
    await userEvent.click(page.getByRole('button', { name: 'Aktivera' }))
    const button = page.getByRole('button', { name: 'Skicka' })
    await expect.element(button).not.toHaveAttribute('aria-disabled')
    await expect.element(button).not.toHaveAttribute('data-disabled')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('busy', () => {
  test('is aria-disabled with data-busy, never native disabled, and keeps its name', async () => {
    const { container } = await render(<Button busy>Skicka ansökan</Button>)
    const button = page.getByRole('button', { name: 'Skicka ansökan' })
    await expect.element(button).toHaveAttribute('aria-disabled', 'true')
    await expect.element(button).toHaveAttribute('data-busy', '')
    await expect.element(button).not.toHaveAttribute('disabled')
    await expect.element(button).not.toHaveAttribute('aria-busy')
    await expectNoA11yViolations(container)
  })

  test('renders a decorative spinner as the first child only while busy, and the name stays the text', async () => {
    const { container, rerender } = await render(<Button busy>Skicka ansökan</Button>)
    const spinner = container.querySelector('.kv-button[data-busy] > .kv-spinner:first-child')
    expect(spinner?.getAttribute('aria-hidden')).toBe('true')
    await expect
      .element(page.getByRole('button', { name: 'Skicka ansökan', exact: true }))
      .toBeVisible()
    await rerender(<Button>Skicka ansökan</Button>)
    expect(container.querySelector('.kv-spinner')).toBeNull()
  })

  test('Tab lands on a busy button', async () => {
    await render(<Button busy>Skicka ansökan</Button>)
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Skicka ansökan' })).toHaveFocus()
  })

  test('click, Enter and Space call no handler, and focus stays', async () => {
    const onClick = vi.fn<() => void>()
    await render(
      <Button busy onClick={onClick}>
        Skicka ansökan
      </Button>,
    )
    const button = page.getByRole('button', { name: 'Skicka ansökan' })
    await userEvent.click(button, { force: true })
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(onClick).not.toHaveBeenCalled()
    await expect.element(button).toHaveFocus()
  })

  test('a busy submit button submits nothing, not even by implicit submission', async () => {
    const onSubmit = vi.fn<() => void>()
    await render(
      <SubmitForm onSubmit={onSubmit}>
        <Button type="submit" busy>
          Skicka ansökan
        </Button>
      </SubmitForm>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Skicka ansökan' }), { force: true })
    await userEvent.click(page.getByRole('textbox', { name: 'Namn' }))
    await userEvent.keyboard('Anna{Enter}')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  test('focus stays on the button when busy turns on and off', async () => {
    const onClick = vi.fn<() => void>()
    function Sending() {
      const [isBusy, setIsBusy] = useState(false)
      return (
        <Button
          busy={isBusy}
          onClick={() => {
            onClick()
            setIsBusy(true)
            setTimeout(() => setIsBusy(false), 300)
          }}
        >
          Skicka ansökan
        </Button>
      )
    }
    await render(<Sending />)
    const button = page.getByRole('button', { name: 'Skicka ansökan' })
    await userEvent.keyboard('{Tab}')
    await userEvent.keyboard('{Enter}')
    await expect.element(button).toHaveAttribute('data-busy', '')
    await expect.element(button).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
    await expect.element(button).not.toHaveAttribute('data-busy')
    await expect.element(button).toHaveFocus()
  })

  test('disabled wins: a busy disabled button is natively disabled and has no data-busy', async () => {
    await render(
      <Button busy disabled>
        Skicka ansökan
      </Button>,
    )
    const button = page.getByRole('button', { name: 'Skicka ansökan' })
    await expect.element(button).toHaveAttribute('disabled')
    await expect.element(button).not.toHaveAttribute('data-busy')
  })

  test('activates again when busy turns off', async () => {
    const onClick = vi.fn<() => void>()
    function Finishing() {
      const [isBusy, setIsBusy] = useState(true)
      return (
        <>
          <Button busy={isBusy} onClick={onClick}>
            Skicka
          </Button>
          <Button onClick={() => setIsBusy(false)}>Klart</Button>
        </>
      )
    }
    await render(<Finishing />)
    await userEvent.click(page.getByRole('button', { name: 'Klart' }))
    const button = page.getByRole('button', { name: 'Skicka' })
    await expect.element(button).not.toHaveAttribute('aria-disabled')
    await expect.element(button).not.toHaveAttribute('data-busy')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('focus visible', () => {
  test('sets data-focus-visible on keyboard focus and removes it on blur', async () => {
    await render(
      <>
        <Button>Spara</Button>
        <Button>Avbryt</Button>
      </>,
    )
    const button = page.getByRole('button', { name: 'Spara' })
    await userEvent.keyboard('{Tab}')
    await expect.element(button).toHaveAttribute('data-focus-visible', '')
    await userEvent.keyboard('{Tab}')
    await expect.element(button).not.toHaveAttribute('data-focus-visible')
  })

  test('does not set data-focus-visible on pointer focus', async () => {
    await render(<Button>Spara</Button>)
    const button = page.getByRole('button', { name: 'Spara' })
    await userEvent.click(button)
    await expect.element(button).toHaveFocus()
    await expect.element(button).not.toHaveAttribute('data-focus-visible')
  })
})

describe('icon-only button name (Plan 0009)', () => {
  function CloseIcon() {
    return <Icon name="close" />
  }

  test('warns in development when an icon-only button has no accessible name', async () => {
    await render(
      <Button>
        <CloseIcon />
      </Button>,
    )
    await expect.element(page.getByRole('button')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('no accessible name')
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('aria-label')
  })

  const namedButtons: ReadonlyArray<readonly [string, () => ReactElement]> = [
    ['aria-label', () => <Button aria-label="Stäng">{<CloseIcon />}</Button>],
    [
      'aria-labelledby',
      () => (
        <>
          <span id="close-label">Stäng</span>
          <Button aria-labelledby="close-label">{<CloseIcon />}</Button>
        </>
      ),
    ],
    ['title', () => <Button title="Stäng">{<CloseIcon />}</Button>],
    [
      'visible text',
      () => (
        <Button>
          <CloseIcon />
          Stäng
        </Button>
      ),
    ],
    [
      'visually hidden text',
      () => (
        <Button>
          <CloseIcon />
          <span className="kv-visually-hidden">Stäng</span>
        </Button>
      ),
    ],
    [
      'a labelled Icon',
      () => (
        <Button>
          <Icon name="close" label="Stäng" />
        </Button>
      ),
    ],
  ]

  test.each(namedButtons)(
    'does not warn when the name comes from %s',
    async (_source, renderButton) => {
      await render(renderButton())
      await expect.element(page.getByRole('button', { name: 'Stäng' })).toBeVisible()
      expect(consoleWarn).not.toHaveBeenCalled()
    },
  )
})

describe('handlers on a focusable disabled button', () => {
  test('a focusable disabled button blocks onClick on click, Enter and Space', async () => {
    const onClick = vi.fn<() => void>()
    await render(
      <Button disabled focusableWhenDisabled onClick={onClick}>
        Skicka
      </Button>,
    )
    const button = page.getByRole('button', { name: 'Skicka' })
    await userEvent.click(button, { force: true })
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(onClick).not.toHaveBeenCalled()
    await expect.element(button).toHaveFocus()
  })

  test('a focusable disabled submit button blocks submission, including implicit submission', async () => {
    const onSubmit = vi.fn<() => void>()
    const onClick = vi.fn<() => void>()
    await render(
      <SubmitForm onSubmit={onSubmit}>
        <Button type="submit" disabled focusableWhenDisabled onClick={onClick}>
          Skicka ansökan
        </Button>
      </SubmitForm>,
    )
    const button = page.getByRole('button', { name: 'Skicka ansökan' })
    await expect.element(button).toHaveAttribute('type', 'submit')
    await userEvent.click(button, { force: true })
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await userEvent.click(page.getByRole('textbox', { name: 'Namn' }))
    await userEvent.keyboard('Anna{Enter}')
    expect(onClick).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('useButton', () => {
  function HookButton(options: UseButtonOptions & { children: ReactNode }) {
    const { children, ...buttonOptions } = options
    const button = useButton(buttonOptions)
    return <button {...mergeProps(button.buttonProps, { className: 'egen' })}>{children}</button>
  }

  test('gives spreadable buttonProps with the same behaviour', async () => {
    const onClick = vi.fn<() => void>()
    const { container } = await render(
      <HookButton disabled focusableWhenDisabled onClick={onClick}>
        Skicka
      </HookButton>,
    )
    const button = page.getByRole('button', { name: 'Skicka' })
    await expect.element(button).toHaveAttribute('type', 'button')
    await expect.element(button).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(button, { force: true })
    expect(onClick).not.toHaveBeenCalled()
    await expectNoA11yViolations(container)
  })

  test('calls onClick when enabled', async () => {
    const onClick = vi.fn<() => void>()
    await render(<HookButton onClick={onClick}>Spara</HookButton>)
    await userEvent.click(page.getByRole('button', { name: 'Spara' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('server rendering', () => {
  test('renders to a string without touching the page', () => {
    const html = renderToString(
      <Button type="submit" disabled focusableWhenDisabled>
        Skicka
      </Button>,
    )
    expect(html).toBe(
      '<button class="kv-button" type="submit" aria-disabled="true" data-disabled="">Skicka</button>',
    )
  })
})

describe('types', () => {
  test('exports the hook and part types', () => {
    expectTypeOf<UseButtonResult['isDisabled']>().toEqualTypeOf<boolean>()
    expectTypeOf<UseButtonResult['isFocusVisible']>().toEqualTypeOf<boolean>()
    expectTypeOf<UseButtonOptions['type']>().toEqualTypeOf<
      'button' | 'submit' | 'reset' | undefined
    >()
    expectTypeOf<ButtonProps['focusableWhenDisabled']>().toEqualTypeOf<boolean | undefined>()
    // The part's class that @kvirn-ui/theme and your own CSS select on.
    expectTypeOf<ButtonPartProps['className']>().toEqualTypeOf<'kv-button'>()
    expectTypeOf<ButtonPartProps>().not.toHaveProperty('data-kv')
    // aria-disabled comes only from disabled + focusableWhenDisabled, or from busy: both block activation.
    expectTypeOf<ButtonProps>().not.toHaveProperty('aria-disabled')
  })
})

import { describe, expect, test, vi } from 'vite-plus/test'
import { Button } from '../button/button.tsx'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { Field } from '../field/field.tsx'
import { TextInput } from '../text-input/text-input.tsx'
import { InputGroup } from '../input-group/input-group.tsx'
import { OneTimeCode } from '../one-time-code/one-time-code.tsx'

// Plan 0031. Browsers match :focus-visible on a click in a text input, so the hooks track the last
// interaction themselves: a click gives data-focused only, the keyboard adds data-focus-visible.

describe('focus from a click and from the keyboard, in text inputs', () => {
  test('Input: a click sets data-focused only, Tab adds data-focus-visible', async () => {
    await render(
      <>
        <TextInput aria-label="Ett" />
        <TextInput aria-label="Två" />
      </>,
    )
    const first = page.getByRole('textbox', { name: 'Ett' })
    const second = page.getByRole('textbox', { name: 'Två' })
    await userEvent.click(first)
    await expect.element(first).toHaveFocus()
    await expect.element(first).toHaveAttribute('data-focused', '')
    await expect.element(first).not.toHaveAttribute('data-focus-visible')
    await userEvent.keyboard('{Tab}')
    await expect.element(second).toHaveFocus()
    await expect.element(second).toHaveAttribute('data-focus-visible', '')
    await expect.element(first).not.toHaveAttribute('data-focused')
  })

  test('Input: focus moved by a script after a click elsewhere shows the ring, as a screen reader’s does', async () => {
    let target: HTMLInputElement | null = null
    await render(
      <>
        <button type="button" onClick={() => target?.focus()}>
          Ändra
        </button>
        <TextInput
          aria-label="Namn"
          ref={(element) => {
            target = element
          }}
        />
      </>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Ändra' }))
    const input = page.getByRole('textbox', { name: 'Namn' })
    await expect.element(input).toHaveFocus()
    await expect.element(input).toHaveAttribute('data-focus-visible', '')
  })

  test('Input: a later focus after a click on page text shows the ring', async () => {
    await render(
      <>
        <p>Fyll i ditt namn.</p>
        <TextInput aria-label="Namn" />
      </>,
    )
    await userEvent.click(page.getByText('Fyll i ditt namn.'))
    // A screen reader or a script moves focus later, with no pointer before it.
    await new Promise((resolve) => setTimeout(resolve, 0))
    const input = page.getByRole('textbox', { name: 'Namn' })
    ;(input.element() as HTMLInputElement).focus()
    await expect.element(input).toHaveFocus()
    await expect.element(input).toHaveAttribute('data-focus-visible', '')
  })

  test('Input: a pointerdown from a real pointer before a script’s focus sets data-focused only', async () => {
    await render(<TextInput aria-label="Namn" />)
    const input = page.getByRole('textbox', { name: 'Namn' })
    document.body.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        pointerType: 'mouse',
        width: 1,
        height: 1,
        pressure: 0.5,
        detail: 1,
      }),
    )
    ;(input.element() as HTMLInputElement).focus()
    await expect.element(input).toHaveAttribute('data-focused', '')
    await expect.element(input).not.toHaveAttribute('data-focus-visible')
  })

  test('Input: a virtual pointerdown (width and height 0) from a screen reader shows the ring', async () => {
    await render(<TextInput aria-label="Namn" />)
    const input = page.getByRole('textbox', { name: 'Namn' })
    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', width: 0, height: 0 }),
    )
    ;(input.element() as HTMLInputElement).focus()
    await expect.element(input).toHaveAttribute('data-focus-visible', '')
  })

  test('Input: a pointerdown of width and height 0 on Android is a real tap, so no ring', async () => {
    const userAgent = vi
      .spyOn(navigator, 'userAgent', 'get')
      .mockReturnValue('Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile')
    try {
      await render(<TextInput aria-label="Namn" />)
      const input = page.getByRole('textbox', { name: 'Namn' })
      document.body.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerType: 'touch',
          width: 0,
          height: 0,
        }),
      )
      ;(input.element() as HTMLInputElement).focus()
      await expect.element(input).toHaveAttribute('data-focused', '')
      await expect.element(input).not.toHaveAttribute('data-focus-visible')
    } finally {
      userAgent.mockRestore()
    }
  })

  test('Input: a virtual mouse pointerdown (1 by 1, no pressure, detail 0) shows the ring', async () => {
    await render(<TextInput aria-label="Namn" />)
    const input = page.getByRole('textbox', { name: 'Namn' })
    document.body.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        pointerType: 'mouse',
        width: 1,
        height: 1,
        pressure: 0,
        detail: 0,
      }),
    )
    ;(input.element() as HTMLInputElement).focus()
    await expect.element(input).toHaveAttribute('data-focus-visible', '')
  })

  test('Input: a virtual click (detail 0, no pointerType) shows the ring when the focus follows', async () => {
    await render(<TextInput aria-label="Namn" />)
    const input = page.getByRole('textbox', { name: 'Namn' })
    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', width: 8, height: 8 }),
    )
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }))
    ;(input.element() as HTMLInputElement).focus()
    await expect.element(input).toHaveAttribute('data-focus-visible', '')
  })

  test('Button: follows the browser, so a click shows no ring and Tab does', async () => {
    await render(
      <>
        <Button>Ett</Button>
        <Button>Två</Button>
      </>,
    )
    const first = page.getByRole('button', { name: 'Ett' })
    await userEvent.click(first)
    await expect.element(first).not.toHaveAttribute('data-focus-visible')
    await userEvent.keyboard('{Tab}')
    await expect
      .element(page.getByRole('button', { name: 'Två' }))
      .toHaveAttribute('data-focus-visible', '')
  })

  test('Input: a click on the Field label is a click too', async () => {
    await render(
      <Field.Root>
        <Field.Label marker="none">Namn</Field.Label>
        <TextInput />
      </Field.Root>,
    )
    await userEvent.click(page.getByText('Namn', { exact: true }))
    const input = page.getByRole('textbox', { name: 'Namn' })
    await expect.element(input).toHaveFocus()
    await expect.element(input).toHaveAttribute('data-focused', '')
    await expect.element(input).not.toHaveAttribute('data-focus-visible')
  })

  test('InputGroup: a click in the input leaves the Root without data-focus-visible', async () => {
    await render(
      <>
        <button type="button">Före</button>
        <InputGroup.Root data-testid="root">
          <TextInput aria-label="Månadshyra i kronor" />
          <InputGroup.Addon>kr</InputGroup.Addon>
        </InputGroup.Root>
      </>,
    )
    const root = page.getByTestId('root')
    const input = page.getByRole('textbox')
    await userEvent.click(input)
    await expect.element(input).toHaveFocus()
    await expect.element(root).not.toHaveAttribute('data-focus-visible')
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await userEvent.keyboard('{Tab}')
    await expect.element(input).toHaveFocus()
    await expect.element(root).toHaveAttribute('data-focus-visible', '')
  })

  test('OneTimeCode: a click sets data-focused only, Tab adds data-focus-visible', async () => {
    await render(
      <>
        <button type="button">Före</button>
        <OneTimeCode.Root pattern="&&&&">
          <OneTimeCode.Input aria-label="Kod" />
          {[0, 1, 2, 3].map((index) => (
            <OneTimeCode.Slot key={index} index={index} />
          ))}
        </OneTimeCode.Root>
      </>,
    )
    const input = page.getByRole('textbox', { name: 'Kod' })
    await userEvent.click(input)
    await expect.element(input).toHaveFocus()
    await expect.element(input).toHaveAttribute('data-focused', '')
    await expect.element(input).not.toHaveAttribute('data-focus-visible')
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await userEvent.keyboard('{Tab}')
    await expect.element(input).toHaveAttribute('data-focus-visible', '')
  })
})

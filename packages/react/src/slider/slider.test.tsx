import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { NumberInput } from '../number-input/number-input.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Slider } from './slider.tsx'
import type { SliderProps } from './slider.tsx'
import { useSlider } from './use-slider.ts'
import type {
  SliderChangeDetails,
  SliderPartProps,
  UseSliderOptions,
  UseSliderResult,
} from './use-slider.ts'

// Contract: slider.a11y.md. The keyboard rows are in the `keyboard` block.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

describe('rendering', () => {
  test('renders a native <input type="range"> with the value text, outside a Field', async () => {
    const { container } = await render(<Slider aria-label="Volym" defaultValue={30} />)
    const control = page.getByRole('slider', { name: 'Volym' })
    await expect.element(control).toHaveAttribute('type', 'range')
    await expect.element(control).toHaveAttribute('min', '0')
    await expect.element(control).toHaveAttribute('max', '100')
    await expect.element(control).toHaveAttribute('step', '1')
    await expect.element(control).toHaveAttribute('aria-valuetext', '30')
    await expect.element(control).not.toHaveAttribute('id')
    await expect.element(control).not.toHaveAttribute('aria-describedby')
    await expect.element(control).not.toHaveAttribute('aria-invalid')
    await expect.element(control).not.toHaveAttribute('aria-required')
    await expect.element(control).not.toHaveAttribute('aria-valuenow')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('forwards its ref and native props, and has the part class kv-slider joined with a consumer’s', async () => {
    const ref = createRef<HTMLInputElement>()
    await render(
      <Slider
        ref={ref}
        aria-label="Volym"
        className="egen"
        name="volym"
        form="inställningar"
        data-egen=""
      />,
    )
    const control = page.getByRole('slider', { name: 'Volym' })
    expect(ref.current).toBe(control.element())
    await expect.element(control).toHaveClass('egen', 'kv-slider')
    await expect.element(control).toHaveAttribute('name', 'volym')
    await expect.element(control).toHaveAttribute('form', 'inställningar')
    await expect.element(control).toHaveAttribute('data-egen', '')
  })

  test('min, max and step reach the native input, and the start value is halfway', async () => {
    await render(<Slider aria-label="Avstånd" min={0} max={50} step={5} />)
    const control = page.getByRole('slider', { name: 'Avstånd' })
    await expect.element(control).toHaveAttribute('max', '50')
    await expect.element(control).toHaveAttribute('step', '5')
    expect((control.element() as HTMLInputElement).value).toBe('25')
    await expect.element(control).toHaveAttribute('aria-valuetext', '25')
  })
})

describe('aria-valuetext', () => {
  test('valueText sets aria-valuetext, and it follows each change', async () => {
    await render(
      <Slider
        aria-label="Avstånd"
        defaultValue={10}
        step={5}
        valueText={(value) => `${value} km`}
      />,
    )
    const control = page.getByRole('slider', { name: 'Avstånd' })
    await expect.element(control).toHaveAttribute('aria-valuetext', '10 km')
    control.element().focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(control).toHaveAttribute('aria-valuetext', '15 km')
  })

  test('the default text is the number formatted in the provider’s locale', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Slider aria-label="Mått" min={0} max={2} step={0.5} defaultValue={1.5} />
      </KvirnProvider>,
    )
    await expect
      .element(page.getByRole('slider', { name: 'Mått' }))
      .toHaveAttribute('aria-valuetext', '1,5')
  })

  test('a controlled slider’s text follows the value it is given', async () => {
    function Controlled() {
      const [value, setValue] = useState(40)
      return (
        <>
          <Slider
            aria-label="Volym"
            value={value}
            onValueChange={setValue}
            valueText={(percent) => `${percent} procent`}
          />
          <button type="button" onClick={() => setValue(90)}>
            Max
          </button>
        </>
      )
    }
    await render(<Controlled />)
    const control = page.getByRole('slider', { name: 'Volym' })
    await expect.element(control).toHaveAttribute('aria-valuetext', '40 procent')
    await userEvent.click(page.getByRole('button', { name: 'Max' }))
    await expect.element(control).toHaveAttribute('aria-valuetext', '90 procent')
  })
})

describe('in a Field', () => {
  test('the Field’s label is the name, and the description is the help text', async () => {
    const { container } = await render(
      <Field.Root>
        <Field.Label marker="none">Volym</Field.Label>
        <Slider name="volym" />
        <Field.HelpText>Från tyst till högst.</Field.HelpText>
      </Field.Root>,
    )
    const control = page.getByRole('slider', { name: 'Volym' })
    const id = control.element().id
    expect(id).not.toBe('')
    expect(container.querySelector('label')?.getAttribute('for')).toBe(id)
    await expect.element(control).toHaveAccessibleDescription('Från tyst till högst.')
    await expect.element(control).not.toHaveAttribute('aria-required')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('an invalid Field gives aria-invalid and the error in the description', async () => {
    const { container } = await render(
      <Field.Root invalid>
        <Field.Label marker="none">Volym</Field.Label>
        <Slider />
        <Field.HelpText>Från tyst till högst.</Field.HelpText>
        <Field.ErrorMessage>Välj ett lägre värde</Field.ErrorMessage>
      </Field.Root>,
    )
    const control = page.getByRole('slider', { name: 'Volym' })
    await expect.element(control).toHaveAttribute('aria-invalid', 'true')
    await expect.element(control).toHaveAttribute('data-invalid', '')
    await expect
      .element(control)
      .toHaveAccessibleDescription('Från tyst till högst. Error: Välj ett lägre värde')
    await expectNoA11yViolations(container)
  })

  test('a disabled Field disables the slider, and the slider’s own disabled does too', async () => {
    await render(
      <>
        <Field.Root disabled>
          <Field.Label marker="none">Ett</Field.Label>
          <Slider />
        </Field.Root>
        <Field.Root>
          <Field.Label marker="none">Två</Field.Label>
          <Slider disabled />
        </Field.Root>
      </>,
    )
    await expect.element(page.getByRole('slider', { name: 'Ett' })).toBeDisabled()
    const second = page.getByRole('slider', { name: 'Två' })
    await expect.element(second).toBeDisabled()
    await expect.element(second).toHaveAttribute('data-disabled', '')
  })

  test('a required Field gives no aria-required or data-required: a range has no required state', async () => {
    await render(
      <Field.Root required>
        <Field.Label>Volym</Field.Label>
        <Slider />
      </Field.Root>,
    )
    const control = page.getByRole('slider', { name: /Volym/ })
    await expect.element(control).not.toHaveAttribute('aria-required')
    await expect.element(control).not.toHaveAttribute('data-required')
  })

  test('keeps your own aria-describedby ids, after the Field’s', async () => {
    await render(
      <>
        <p id="extra">Mer information.</p>
        <Field.Root>
          <Field.Label marker="none">Volym</Field.Label>
          <Slider aria-describedby="extra" />
          <Field.HelpText>Från tyst till högst.</Field.HelpText>
        </Field.Root>
      </>,
    )
    await expect
      .element(page.getByRole('slider', { name: 'Volym' }))
      .toHaveAccessibleDescription('Från tyst till högst. Mer information.')
  })

  test('a Slider beside a NumberInput with aria-labelledby does not claim the Field', async () => {
    function Paired() {
      const [value, setValue] = useState(10)
      return (
        <Field.Root invalid>
          <Field.Label marker="none">
            <span id="avstånd-etikett">Avstånd i kilometer</span>
          </Field.Label>
          <Slider
            aria-labelledby="avstånd-etikett"
            aria-describedby="avstånd-hjälp"
            value={value}
            onValueChange={setValue}
            valueText={(km) => `${km} km`}
          />
          <NumberInput
            value={String(value)}
            onChange={(event) => setValue(Number(event.currentTarget.value))}
          />
          <Field.HelpText>
            <span id="avstånd-hjälp">Från 0 till 100 km.</span>
          </Field.HelpText>
          <Field.ErrorMessage>Ange ett lägre avstånd</Field.ErrorMessage>
        </Field.Root>
      )
    }
    await render(<Paired />)
    const slider = page.getByRole('slider')
    await expect.element(slider).toHaveAccessibleName('Avstånd i kilometer')
    await expect.element(slider).not.toHaveAttribute('id')
    await expect.element(slider).not.toHaveAttribute('aria-invalid')
    await expect.element(slider).not.toHaveAttribute('data-invalid')
    await expect.element(slider).toHaveAccessibleDescription('Från 0 till 100 km.')
    const numberBox = page.getByRole('textbox')
    await expect.element(numberBox).toHaveAttribute('aria-invalid', 'true')
    await userEvent.click(page.getByText('Avstånd i kilometer'))
    await expect.element(numberBox).toHaveFocus()
    slider.element().focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(numberBox).toHaveValue('11')
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a Slider with aria-labelledby may have an id inside a Field without a warning', async () => {
    await render(
      <Field.Root>
        <Field.Label marker="none">
          <span id="namn">Avstånd</span>
        </Field.Label>
        <Slider id="egen" aria-labelledby="namn" />
        <NumberInput />
      </Field.Root>,
    )
    await expect
      .element(page.getByRole('slider', { name: 'Avstånd' }))
      .toHaveAttribute('id', 'egen')
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('value', () => {
  test('uncontrolled: defaultValue is kept, and onValueChange reports a number with the reason', async () => {
    const onValueChange = vi.fn<(value: number, details: SliderChangeDetails) => void>()
    const onChange = vi.fn<(event: React.ChangeEvent<HTMLInputElement>) => void>()
    await render(
      <Slider
        aria-label="Volym"
        defaultValue={20}
        onValueChange={onValueChange}
        onChange={onChange}
      />,
    )
    const control = page.getByRole('slider', { name: 'Volym' })
    expect((control.element() as HTMLInputElement).value).toBe('20')
    control.element().focus()
    await userEvent.keyboard('{ArrowRight}')
    expect((control.element() as HTMLInputElement).value).toBe('21')
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange.mock.calls[0]?.[0]).toBe(21)
    expect(onValueChange.mock.calls[0]?.[1].reason).toBe('input')
    expect(onValueChange.mock.calls[0]?.[1].event.type).toBe('change')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  test('a controlled slider shows the value it is given', async () => {
    function Controlled() {
      const [value, setValue] = useState(10)
      return (
        <>
          <Slider aria-label="Volym" value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      )
    }
    await render(<Controlled />)
    const control = page.getByRole('slider', { name: 'Volym' })
    control.element().focus()
    await userEvent.keyboard('{End}')
    expect((control.element() as HTMLInputElement).value).toBe('100')
    await expect.element(page.getByRole('status')).toHaveTextContent('100')
  })

  test('a controlled slider stays as it is when the parent does not update value', async () => {
    const onValueChange = vi.fn<(value: number, details: SliderChangeDetails) => void>()
    await render(<Slider aria-label="Volym" value={30} onValueChange={onValueChange} />)
    const control = page.getByRole('slider', { name: 'Volym' })
    control.element().focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenCalledWith(31, expect.objectContaining({ reason: 'input' }))
    expect((control.element() as HTMLInputElement).value).toBe('30')
    await expect.element(control).toHaveAttribute('aria-valuetext', '30')
  })

  test('works in a plain form: a submit sends name=value, and reset restores defaultValue', async () => {
    let submitted: FormData | undefined
    await render(
      <form
        aria-label="Sök"
        onSubmit={(event) => {
          event.preventDefault()
          submitted = new FormData(event.currentTarget)
        }}
      >
        <Field.Root>
          <Field.Label marker="none">Avstånd</Field.Label>
          <Slider name="distance" defaultValue={20} step={5} />
        </Field.Root>
        <button type="submit">Sök</button>
        <button type="reset">Återställ</button>
      </form>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Sök' }))
    expect(submitted?.get('distance')).toBe('20')
    const control = page.getByRole('slider', { name: 'Avstånd' })
    control.element().focus()
    await userEvent.keyboard('{ArrowRight}')
    await userEvent.click(page.getByRole('button', { name: 'Sök' }))
    expect(submitted?.get('distance')).toBe('25')
    await userEvent.click(page.getByRole('button', { name: 'Återställ' }))
    expect((control.element() as HTMLInputElement).value).toBe('20')
    await expect.element(control).toHaveAttribute('aria-valuetext', '20')
  })

  test('a form library’s spread props and ref reach the native input', async () => {
    const registered: { element: HTMLInputElement | null; changes: string[] } = {
      element: null,
      changes: [],
    }
    const register = (name: string) => ({
      name,
      ref: (element: HTMLInputElement | null) => {
        registered.element = element
      },
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        registered.changes.push(event.currentTarget.value)
      },
    })
    await render(
      <Field.Root>
        <Field.Label marker="none">Volym</Field.Label>
        <Slider {...register('volym')} defaultValue={10} />
      </Field.Root>,
    )
    const control = page.getByRole('slider', { name: 'Volym' })
    expect(registered.element).toBe(control.element())
    control.element().focus()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    expect(registered.changes).toEqual(['11', '12'])
  })
})

describe('dev warnings', () => {
  test('a slider in a Field with no label warns once', async () => {
    await render(
      <Field.Root>
        <Slider />
      </Field.Root>,
    )
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('Field.Label')
  })

  test('a slider with no name at all warns once, and aria-label or aria-labelledby is a name', async () => {
    await render(<Slider />)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('accessible name')
    consoleWarn.mockClear()
    resetDevWarnings()
    await render(
      <>
        <span id="namn">Volym</span>
        <Slider aria-label="Ljud" />
        <Slider aria-labelledby="namn" />
      </>,
    )
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('an id inside a Field is ignored with a dev warning: the label stays associated', async () => {
    await render(
      <Field.Root controlId="fältet">
        <Field.Label marker="none">Volym</Field.Label>
        <Slider id="annat" />
      </Field.Root>,
    )
    await expect
      .element(page.getByRole('slider', { name: 'Volym' }))
      .toHaveAttribute('id', 'fältet')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('controlId')
  })

  test('slider-min-max: min at or above max warns once', async () => {
    await render(<Slider aria-label="Volym" min={10} max={10} />)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('min must be lower than max')
  })

  test('slider-value-out-of-range: a value outside the range warns once', async () => {
    await render(<Slider aria-label="Volym" min={0} max={50} defaultValue={80} />)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('outside min=0 and max=50')
  })
})

describe('useSlider', () => {
  test('spreads the same props on your own input', async () => {
    function Own() {
      const control = useSlider({ defaultValue: 30, name: 'volym', valueText: (v) => `${v} %` })
      return (
        <>
          <input aria-label="Egen" {...control.inputProps} />
          <output>{control.valueText}</output>
        </>
      )
    }
    await render(<Own />)
    const input = page.getByRole('slider', { name: 'Egen' })
    await expect.element(input).toHaveAttribute('name', 'volym')
    await expect.element(input).toHaveClass('kv-slider')
    await expect.element(input).toHaveAttribute('aria-valuetext', '30 %')
    input.element().focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(page.getByRole('status')).toHaveTextContent('31 %')
  })
})

describe('server rendering', () => {
  test('server markup is complete: the type, the id, the value text', () => {
    const markup = renderToString(
      <Field.Root controlId="fält">
        <Field.Label marker="none">Volym</Field.Label>
        <Slider defaultValue={30} valueText={(value) => `${value} procent`} />
      </Field.Root>,
    )
    expect(markup).toContain('type="range"')
    expect(markup).toContain('id="fält"')
    expect(markup).toContain('aria-valuetext="30 procent"')
    expect(markup).toContain('value="30"')
  })
})

describe('keyboard', () => {
  function Form() {
    return (
      <form>
        <button type="button">Före</button>
        <Slider aria-label="Ett" />
        <Slider aria-label="Två" disabled />
        <Slider aria-label="Tre" />
        <button type="button">Skicka</button>
      </form>
    )
  }

  function recordPreventedKeys() {
    const keys: string[] = []
    const listener = (event: KeyboardEvent) => {
      if (event.defaultPrevented) keys.push(event.key)
    }
    document.addEventListener('keydown', listener)
    return { keys, stop: () => document.removeEventListener('keydown', listener) }
  }

  const valueOf = (name: string) =>
    Number((page.getByRole('slider', { name }).element() as HTMLInputElement).value)

  test('Tab moves to the slider, one stop', async () => {
    await render(<Form />)
    page.getByRole('button', { name: 'Före' }).element().focus()
    await userEvent.tab()
    await expect.element(page.getByRole('slider', { name: 'Ett' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('slider', { name: 'Tre' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Skicka' })).toHaveFocus()
  })

  test('Shift+Tab moves to the previous focusable element', async () => {
    await render(<Form />)
    page.getByRole('button', { name: 'Skicka' }).element().focus()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('slider', { name: 'Tre' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('slider', { name: 'Ett' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
  })

  test('Tab skips a disabled slider', async () => {
    await render(<Form />)
    const disabled = page.getByRole('slider', { name: 'Två' })
    await expect.element(disabled).toBeDisabled()
    page.getByRole('slider', { name: 'Ett' }).element().focus()
    await userEvent.tab()
    await expect.element(disabled).not.toHaveFocus()
    await expect.element(page.getByRole('slider', { name: 'Tre' })).toHaveFocus()
  })

  test('ArrowRight and ArrowUp increase by one step', async () => {
    await render(<Slider aria-label="Ett" defaultValue={50} step={5} />)
    page.getByRole('slider', { name: 'Ett' }).element().focus()
    const prevented = recordPreventedKeys()
    await userEvent.keyboard('{ArrowRight}')
    expect(valueOf('Ett')).toBe(55)
    await userEvent.keyboard('{ArrowUp}')
    expect(valueOf('Ett')).toBe(60)
    prevented.stop()
    expect(prevented.keys).toEqual([])
  })

  test('ArrowLeft and ArrowDown decrease by one step', async () => {
    await render(<Slider aria-label="Ett" defaultValue={50} step={5} />)
    page.getByRole('slider', { name: 'Ett' }).element().focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(valueOf('Ett')).toBe(45)
    await userEvent.keyboard('{ArrowDown}')
    expect(valueOf('Ett')).toBe(40)
  })

  test('Home sets the minimum', async () => {
    await render(<Slider aria-label="Ett" defaultValue={50} min={10} max={90} />)
    page.getByRole('slider', { name: 'Ett' }).element().focus()
    await userEvent.keyboard('{Home}')
    expect(valueOf('Ett')).toBe(10)
  })

  test('End sets the maximum', async () => {
    await render(<Slider aria-label="Ett" defaultValue={50} min={10} max={90} />)
    page.getByRole('slider', { name: 'Ett' }).element().focus()
    await userEvent.keyboard('{End}')
    expect(valueOf('Ett')).toBe(90)
  })

  test('PageUp and PageDown move by a larger step', async () => {
    await render(<Slider aria-label="Ett" defaultValue={50} />)
    page.getByRole('slider', { name: 'Ett' }).element().focus()
    await userEvent.keyboard('{PageUp}')
    expect(valueOf('Ett')).toBeGreaterThan(51)
    await userEvent.keyboard('{PageDown}{PageDown}')
    expect(valueOf('Ett')).toBeLessThan(49)
  })

  test('in a right-to-left page the arrows are reversed', async () => {
    await render(
      <div dir="rtl">
        <Slider aria-label="Ett" defaultValue={50} />
      </div>,
    )
    page.getByRole('slider', { name: 'Ett' }).element().focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(valueOf('Ett')).toBe(51)
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    expect(valueOf('Ett')).toBe(49)
  })

  test('the arrows stop at the minimum and the maximum', async () => {
    await render(<Slider aria-label="Ett" defaultValue={0} />)
    page.getByRole('slider', { name: 'Ett' }).element().focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(valueOf('Ett')).toBe(0)
    await userEvent.keyboard('{End}{ArrowRight}')
    expect(valueOf('Ett')).toBe(100)
  })
})

describe('types', () => {
  test('exports the prop, state and hook types', () => {
    expectTypeOf<SliderProps['onValueChange']>().toEqualTypeOf<
      ((value: number, details: SliderChangeDetails) => void) | undefined
    >()
    expectTypeOf<SliderProps['value']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<SliderProps>().not.toHaveProperty('required')
    expectTypeOf<SliderProps>().not.toHaveProperty('type')
    expectTypeOf<UseSliderOptions['valueText']>().toEqualTypeOf<
      ((value: number) => string) | undefined
    >()
    expectTypeOf<SliderPartProps['className']>().toEqualTypeOf<'kv-slider'>()
    expectTypeOf<SliderPartProps['type']>().toEqualTypeOf<'range'>()
    expectTypeOf<UseSliderResult['inputProps']>().toEqualTypeOf<SliderPartProps>()
  })
})

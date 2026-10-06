import { Field, Slider } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/slider/slider.a11y.md?raw'
import guide from '../../../../../packages/react/src/slider/slider.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import { DistanceWithNumberInput, KeyboardSliders, sliderTextsFor } from './slider.fixture.tsx'

// Components/Form/Slider: the native <input type="range">, styled by @kvirn-ui/theme/theme.css
// (design spec docs/design/slider.md). It sits in a Field after the label. Use it for an
// approximate value; an exact one is a NumberInput, and a slider beside a NumberInput (With
// NumberInput) gives a resident both.
//
// KvirnUI holds no form state. An uncontrolled Slider keeps its number in the browser and a form
// submit sends it. A controlled Slider shows the `value` you give it and reports changes through
// `onValueChange`.

const meta = {
  title: 'Components/Form/Slider',
  component: Slider,
  argTypes: {
    value: { control: 'number', description: 'Controlled: the number from your own logic.' },
    defaultValue: {
      control: 'number',
      description: 'Uncontrolled: the browser keeps the number, and a form submit sends it.',
    },
    min: { control: 'number', description: 'The lowest value. Defaults to `0`.' },
    max: { control: 'number', description: 'The highest value. Defaults to `100`.' },
    step: { control: 'number', description: 'The distance between values. Defaults to `1`.' },
    name: { control: 'text', description: 'The `name` a form submit uses.' },
    valueText: {
      control: false,
      description:
        'The value as a screen reader speaks it, with its unit. Defaults to the number formatted in the provider’s locale.',
    },
    onValueChange: {
      control: false,
      description:
        "Reports each change with the new number and `{ reason: 'input', event }`. `onChange` still works too.",
    },
    disabled: {
      control: 'boolean',
      description:
        'Natively disabled: skipped by Tab. A disabled Field disables it too. Sets `data-disabled`.',
    },
    render: {
      control: false,
      description: 'Another element. It must still be an `<input type="range">`.',
    },
  },
  args: { name: 'volume', defaultValue: 40, disabled: false },
  globals: { locale: 'sv' },
  decorators: [
    (Story) => (
      <div className="kv-story-form">
        <Story />
      </div>
    ),
    withFormLocale,
  ],
  render: (args, { globals }) => {
    const { text, lang } = sliderTextsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Field.Label marker="none">{text.volumeLabel}</Field.Label>
        <Slider {...args} valueText={text.volumeValueText} />
      </Field.Root>
    )
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

/** The main example: a plain track and a `primary` thumb. The value is spoken with its unit. */
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const { text } = sliderTextsFor(localeOf(globals))
    const control = canvas.getByRole('slider', { name: text.volumeLabel })
    await expect(control).toHaveAttribute('type', 'range')
    await expect(control).toHaveAttribute('aria-valuetext', text.volumeValueText(40))
    await expectMinimumTargetSize(control)
  },
}

/** The help text states the ends of the range in words. It is the slider's description. */
export const WithValueText: Story = {
  render: (args, { globals }) => {
    const { text, lang } = sliderTextsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Field.Label marker="none">{text.distanceLabel}</Field.Label>
        <Slider {...args} max={50} step={5} valueText={text.distanceValueText} />
        <Field.HelpText>{text.distanceHint}</Field.HelpText>
      </Field.Root>
    )
  },
  args: { name: 'distance', defaultValue: 15 },
  play: async ({ canvas, globals }) => {
    const { text } = sliderTextsFor(localeOf(globals))
    const control = canvas.getByRole('slider', { name: text.distanceLabel })
    await expect(control).toHaveAttribute('aria-valuetext', text.distanceValueText(15))
    await expect(control).toHaveAccessibleDescription(text.distanceHint)
  },
}

/** An error from the Field: a 2px `danger` edge on the track, and the message under the control. */
export const Invalid: Story = {
  render: (args, { globals }) => {
    const { text, lang } = sliderTextsFor(localeOf(globals))
    return (
      <Field.Root invalid lang={lang}>
        <Field.Label marker="none">{text.distanceLabel}</Field.Label>
        <Slider {...args} max={50} valueText={text.distanceValueText} />
        <Field.ErrorMessage>{text.distanceTooFar}</Field.ErrorMessage>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = sliderTextsFor(localeOf(globals))
    const control = canvas.getByRole('slider', { name: text.distanceLabel })
    await expect(control).toHaveAttribute('aria-invalid', 'true')
    await expect(control).toHaveAttribute('data-invalid')
  },
}

/** Disabled: a dashed track and a muted thumb. The help text says why, never a tooltip. */
export const Disabled: Story = {
  render: (args, { globals }) => {
    const { text, lang } = sliderTextsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Field.Label marker="none">{text.radiusLabel}</Field.Label>
        <Slider {...args} disabled max={50} valueText={text.distanceValueText} />
        <Field.HelpText>{text.distanceDisabledHint}</Field.HelpText>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = sliderTextsFor(localeOf(globals))
    await expect(canvas.getByRole('slider', { name: text.radiusLabel })).toBeDisabled()
  },
}

/**
 * Pattern A: the slider and a NumberInput share one label and one value. The NumberInput owns the
 * Field, so a click on the label and the error land on the number box. The slider is named by the
 * label through `aria-labelledby`, which opts it out of the Field. Typing a number in range moves
 * the slider.
 */
export const WithNumberInput: Story = {
  parameters: showSource('slider/slider.fixture.tsx', 'DistanceWithNumberInput'),
  render: (_args, { globals }) => <DistanceWithNumberInput locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = sliderTextsFor(localeOf(globals))
    const slider = canvas.getByRole('slider', { name: text.distanceLabel })
    const numberBox = canvas.getByRole('textbox')
    await expect(slider).toHaveAccessibleDescription(text.distanceHint)
    await userEvent.clear(numberBox)
    await userEvent.type(numberBox, '30')
    await expect(slider).toHaveValue('30')
  },
}

/**
 * The fixture the keyboard tests drive. Try the keys in the Keyboard section above: Tab and
 * Shift+Tab move through each slider (the disabled one is skipped), the arrows move by a step,
 * Home and End jump to the ends, and PageUp and PageDown move by a larger step.
 */
export const Keyboard: Story = {
  parameters: showSource('slider/slider.fixture.tsx', 'KeyboardSliders'),
  render: (_args, { globals }) => <KeyboardSliders locale={localeOf(globals)} />,
}

/** A long label wraps over lines, and the slider stays inside the column. */
export const LongLabel: Story = {
  globals: { locale: 'fi' },
  decorators: [
    (Story) => (
      <div className="kv-story-narrow" data-testid="narrow">
        <Story />
      </div>
    ),
  ],
  render: (args, { globals }) => {
    const { text, lang } = sliderTextsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Field.Label marker="none">{text.longLabel}</Field.Label>
        <Slider {...args} name="distance" max={50} valueText={text.distanceValueText} />
      </Field.Root>
    )
  },
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

// Every state in one column. The RTL and ForcedColors stories render it, so a reader of either
// sees the real parts.
const renderSliderStates: NonNullable<Story['render']> = (_args, { globals }) => {
  const { text, lang } = sliderTextsFor(localeOf(globals))
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root>
        <Field.Label marker="none">{text.volumeLabel}</Field.Label>
        <Slider name="default" defaultValue={40} valueText={text.volumeValueText} />
      </Field.Root>
      <Field.Root invalid>
        <Field.Label marker="none">{text.distanceLabel}</Field.Label>
        <Slider name="invalid" max={50} defaultValue={30} valueText={text.distanceValueText} />
        <Field.ErrorMessage>{text.distanceTooFar}</Field.ErrorMessage>
      </Field.Root>
      <Field.Root disabled>
        <Field.Label marker="none">{text.radiusLabel}</Field.Label>
        <Slider name="disabled" max={50} defaultValue={10} valueText={text.distanceValueText} />
        <Field.HelpText>{text.distanceDisabledHint}</Field.HelpText>
      </Field.Root>
    </div>
  )
}

/** Staff density from 64rem: the thumb box stays at least 24px. */
export const Compact: Story = {
  render: (args, context) => <div className="kv-compact">{renderSliderStates(args, context)}</div>,
  play: async ({ canvas, globals }) => {
    const { text } = sliderTextsFor(localeOf(globals))
    await expectMinimumTargetSize(canvas.getByRole('slider', { name: text.volumeLabel }))
  },
}

/** Right to left, in English: the minimum is at the right, and the arrow keys reverse. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: renderSliderStates,
}

/** The track, the thumb, invalid and disabled stay distinguishable in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: renderSliderStates,
}

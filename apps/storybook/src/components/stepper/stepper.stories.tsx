import {
  Button,
  ErrorSummary,
  Field,
  Heading,
  KvirnProvider,
  RadioGroup,
  Stack,
  Stepper,
  TextInput,
} from '@kvirn-ui/react'
import type { StepperProps } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/stepper/stepper.a11y.md?raw'
import guide from '../../../../../packages/react/src/stepper/stepper.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { withFormLocale } from '../form/form.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Stepper: the headless Stepper, styled by @kvirn-ui/theme. One line of text under the
// page heading, so there's no focusable part and no Keyboard story. It is a position, not
// navigation: no list, no links, no live region.

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  args: { current: 2, total: 5 },
  decorators: [withFormLocale],
  argTypes: { render: { control: false }, messages: { control: false } },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Stepper>

export default meta
type Story = StoryObj<typeof meta>

function UnderHeading(args: StepperProps) {
  return (
    <Stack gap="2">
      <Heading level={1}>Which vehicle is the permit for?</Heading>
      <Stepper {...args} />
    </Stack>
  )
}

/** Directly after the page heading, as its own element. */
export const Default: Story = {
  render: (args) => <UnderHeading {...args} />,
  globals: { locale: 'en' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Step 2 of 5')).toBeVisible()
  },
}

/** With the section's name. */
export const WithName: Story = {
  args: { name: 'Your vehicle' },
  render: (args) => <UnderHeading {...args} />,
  globals: { locale: 'en' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Step 2 of 5: Your vehicle')).toBeVisible()
  },
}

/** The question is a label that is the page's h1: the Stepper follows the h1, before the control. */
export const LabelAsHeading: Story = {
  args: { name: 'Your vehicle' },
  render: (args) => (
    <Field.Root required>
      <Stack gap="2">
        <h1>
          <Field.Label className="kv-field-label--heading">Registration number</Field.Label>
        </h1>
        <Stepper {...args} />
      </Stack>
      <TextInput name="registration" />
    </Field.Root>
  ),
  globals: { locale: 'en' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Registration number' })).toBeVisible()
    await expect(canvas.getByText('Step 2 of 5: Your vehicle')).toBeVisible()
  },
}

/** The question is a legend that is the page's heading: the Stepper is inside the fieldset, after the legend. */
export const LegendAsHeading: Story = {
  args: { name: 'Permit type' },
  render: (args) => (
    <RadioGroup.Root name="permit" required>
      <RadioGroup.Legend className="kv-fieldset-legend--heading">
        How long should the permit last?
      </RadioGroup.Legend>
      <Stepper {...args} />
      <Field.Root>
        <RadioGroup.Radio value="1" />
        <Field.Label>One month</Field.Label>
      </Field.Root>
      <Field.Root>
        <RadioGroup.Radio value="12" />
        <Field.Label>One year</Field.Label>
      </Field.Root>
    </RadioGroup.Root>
  ),
  globals: { locale: 'en' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('group', { name: 'How long should the permit last?' }),
    ).toBeVisible()
    await expect(canvas.getByText('Step 2 of 5: Permit type')).toBeVisible()
  },
}

/** A wizard page (T4): error summary after a failed submit, the heading and Stepper as one pair, then the field and the button. */
export const WizardPage: Story = {
  args: { current: 3, total: 5, name: 'Adress' },
  render: (args) => (
    <Stack gap="6">
      <a href="#tillbaka">Tillbaka</a>
      <ErrorSummary.Root>
        <ErrorSummary.Title />
        <ErrorSummary.List>
          <ErrorSummary.Item>
            <ErrorSummary.Link controlId="street">Ange din gatuadress</ErrorSummary.Link>
          </ErrorSummary.Item>
        </ErrorSummary.List>
      </ErrorSummary.Root>
      <Stack gap="2">
        <Heading level={1}>Var bor du?</Heading>
        <Stepper {...args} />
      </Stack>
      <Field.Root required invalid>
        <Field.Label>Gatuadress</Field.Label>
        <TextInput id="street" name="street" autoComplete="street-address" />
        <Field.ErrorMessage>Ange din gatuadress</Field.ErrorMessage>
      </Field.Root>
      <Button type="submit">Fortsätt</Button>
    </Stack>
  ),
  globals: { locale: 'sv' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Steg 3 av 5: Adress')).toBeVisible()
  },
}

/** Finnish with a long name at 320px: it wraps and hyphenates, never truncates. */
export const LongFinnish: Story = {
  args: { current: 4, total: 5, name: 'Pysäköintitunnuksen tyyppi ja voimassaoloaika' },
  parameters: {
    viewport: {
      options: {
        reflow: { name: '320px wide', styles: { width: '320px', height: '568px' }, type: 'mobile' },
      },
    },
  },
  render: (args) => (
    <div className="kv-story-narrow">
      <Stack gap="2">
        <Heading level={1}>Minkä tunnuksen haluat?</Heading>
        <Stepper {...args} />
      </Stack>
    </div>
  ),
  globals: { locale: 'fi', viewport: { value: 'reflow', isRotated: false } },
  play: async ({ canvasElement, canvas }) => {
    await expect(window.innerWidth).toBeLessThanOrEqual(320)
    const column = canvasElement.querySelector<HTMLElement>('.kv-story-narrow')
    if (column === null) {
      throw new Error('no narrow column')
    }
    await expect(
      canvas.getByText('Vaihe 4/5: Pysäköintitunnuksen tyyppi ja voimassaoloaika'),
    ).toBeVisible()
    await expectNoHorizontalOverflow(column)
  },
}

/** Your own words: for every Stepper under a provider, and for one instance. */
export const Overrides: Story = {
  render: () => (
    <KvirnProvider
      messages={{
        stepper: {
          statusWithName: ({ current, total, name }) => `Del ${current} av ${total}, ${name}`,
        },
      }}
    >
      <Stack gap="2">
        <Stepper current={2} total={5} name="Fordonet" />
        <Stepper current={5} total={5} messages={{ status: () => 'Sista delen' }} />
      </Stack>
    </KvirnProvider>
  ),
  globals: { locale: 'sv' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Del 2 av 5, Fordonet')).toBeVisible()
    await expect(canvas.getByText('Sista delen')).toBeVisible()
  },
}

/** Right to left: the message owns the word order. */
export const RTL: Story = {
  args: { name: 'مركبتك' },
  render: (args) => (
    <div dir="rtl" lang="ar">
      <Stack gap="2">
        <Heading level={1}>لأي مركبة هذا الترخيص؟</Heading>
        <Stepper
          {...args}
          lang="ar"
          messages={{
            statusWithName: ({ current, total, name }) => `الخطوة ${current} من ${total}: ${name}`,
          }}
        />
      </Stack>
    </div>
  ),
  globals: { dir: 'rtl', locale: 'en' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/مركبتك/, { selector: 'p' })).toBeVisible()
  },
}

/** Plain text in CanvasText: nothing is carried by colour or a border. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active', locale: 'en' },
  args: { name: 'Your vehicle' },
  render: (args) => <UnderHeading {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Step 2 of 5: Your vehicle')).toBeVisible()
  },
}

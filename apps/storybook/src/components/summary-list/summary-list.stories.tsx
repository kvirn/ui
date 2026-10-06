import { Card, Heading, SummaryList } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/summary-list/summary-list.a11y.md?raw'
import guide from '../../../../../packages/react/src/summary-list/summary-list.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import { withSummaryListLocale } from './summary-list.fixture.tsx'

// Components/SummaryList: the headless SummaryList, styled by @kvirn-ui/theme/theme.css. The rows
// are the answers of a parking-permit application, in Swedish. The Change link's word is the
// library's own string and follows the locale toolbar.

const meta = {
  title: 'Components/SummaryList',
  component: SummaryList.Root,
  args: {
    children: (
      <>
        <SummaryList.Row>
          <SummaryList.Key>Namn</SummaryList.Key>
          <SummaryList.Value>Anna Svensson</SummaryList.Value>
          <SummaryList.Actions>
            <SummaryList.Change href="#namn" />
          </SummaryList.Actions>
        </SummaryList.Row>
        <SummaryList.Row>
          <SummaryList.Key>Adress</SummaryList.Key>
          <SummaryList.Value>Storgatan 12, 111 22 Kvirnby</SummaryList.Value>
          <SummaryList.Actions>
            <SummaryList.Change href="#adress" />
          </SummaryList.Actions>
        </SummaryList.Row>
        <SummaryList.Row>
          <SummaryList.Key>Registreringsnummer</SummaryList.Key>
          <SummaryList.Value>ABC 123</SummaryList.Value>
          <SummaryList.Actions>
            <SummaryList.Change href="#regnr" />
          </SummaryList.Actions>
        </SummaryList.Row>
      </>
    ),
  },
  argTypes: {
    className: {
      control: 'text',
      description:
        'Your own classes, added to `kv-summary-list`. The theme draws the rows and stacks them below `40rem`.',
    },
    render: { control: false },
  },
  decorators: [withSummaryListLocale],
  globals: { locale: 'sv' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof SummaryList.Root>

export default meta
type Story = StoryObj<typeof meta>

/** Check your answers: each row has a label, a value and a Change link named by its key. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('term')).toHaveLength(3)
    await expect(canvas.getByRole('link', { name: 'Ändra Namn' })).toHaveTextContent('Ändra')
    await expect(canvas.getByRole('link', { name: 'Ändra Registreringsnummer' })).toBeVisible()
  },
}

/** Rows without an action, such as a contact card: the value takes the room. */
export const WithoutActions: Story = {
  args: {
    children: (
      <>
        <SummaryList.Row>
          <SummaryList.Key>Telefon</SummaryList.Key>
          <SummaryList.Value>08-000 00 00</SummaryList.Value>
        </SummaryList.Row>
        <SummaryList.Row>
          <SummaryList.Key>E-post</SummaryList.Key>
          <SummaryList.Value>kontakt@kvirnby.example</SummaryList.Value>
        </SummaryList.Row>
        <SummaryList.Row>
          <SummaryList.Key>Öppettider</SummaryList.Key>
          <SummaryList.Value>Vardagar 9–16</SummaryList.Value>
        </SummaryList.Row>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('link')).toBeNull()
  },
}

/** A missing answer says so, and a value can hold several lines or links. */
export const MissingAndMultiple: Story = {
  args: {
    children: (
      <>
        <SummaryList.Row>
          <SummaryList.Key>Telefon</SummaryList.Key>
          <SummaryList.Value>Ej angivet</SummaryList.Value>
          <SummaryList.Actions>
            <SummaryList.Change href="#telefon">Lägg till</SummaryList.Change>
          </SummaryList.Actions>
        </SummaryList.Row>
        <SummaryList.Row>
          <SummaryList.Key>Bilagor</SummaryList.Key>
          <SummaryList.Value>
            <a href="#intyg">intyg.pdf</a>
            <br />
            <a href="#foto">foto-av-bilen.jpg</a>
          </SummaryList.Value>
          <SummaryList.Actions>
            <SummaryList.Change href="#bilagor" />
            <SummaryList.Change href="#bilagor-ta-bort">Ta bort</SummaryList.Change>
          </SummaryList.Actions>
        </SummaryList.Row>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Lägg till Telefon' })).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Ta bort Bilagor' })).toBeVisible()
  },
}

/** Inside a Card: a case card with its facts. The Card is the surface, the list the structure. */
export const InACard: Story = {
  render: (args) => (
    <Card.Root>
      <Card.Body>
        <Heading level={2}>Ärende 2026-0142</Heading>
        <SummaryList.Root {...args}>
          <SummaryList.Row>
            <SummaryList.Key>Status</SummaryList.Key>
            <SummaryList.Value>Under handläggning</SummaryList.Value>
          </SummaryList.Row>
          <SummaryList.Row>
            <SummaryList.Key>Inkommet</SummaryList.Key>
            <SummaryList.Value>6 oktober 2026</SummaryList.Value>
          </SummaryList.Row>
          <SummaryList.Row>
            <SummaryList.Key>Handläggare</SummaryList.Key>
            <SummaryList.Value>Parkeringsenheten</SummaryList.Value>
          </SummaryList.Row>
        </SummaryList.Root>
      </Card.Body>
    </Card.Root>
  ),
  args: { children: undefined },
}

/** The keys: Tab goes through the Change links in order and Enter follows one. */
export const Keyboard: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Ändra Namn' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Ändra Adress' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect(canvas.getByRole('link', { name: 'Ändra Namn' })).toHaveFocus()
  },
}

/** A 320px column with long Finnish words: the rows stack and nothing scrolls sideways (1.4.10). */
export const Reflow320: Story = {
  args: {
    children: (
      <>
        <SummaryList.Row>
          <SummaryList.Key>Jätehuoltomaksunpalautuspäätös</SummaryList.Key>
          <SummaryList.Value>
            Hyväksytty ja maksettu takaisin tilille FI00 0000 0000 0000 00
          </SummaryList.Value>
          <SummaryList.Actions>
            <SummaryList.Change href="#maksu" />
          </SummaryList.Actions>
        </SummaryList.Row>
        <SummaryList.Row>
          <SummaryList.Key>Osoite</SummaryList.Key>
          <SummaryList.Value>Kirkkokatu 1, 00100 Helsinki</SummaryList.Value>
          <SummaryList.Actions>
            <SummaryList.Change href="#osoite" />
          </SummaryList.Actions>
        </SummaryList.Row>
      </>
    ),
  },
  decorators: [(Story) => <div className="kv-story-narrow">{<Story />}</div>],
  globals: { locale: 'fi' },
  play: async ({ canvasElement, canvas }) => {
    const column = canvasElement.querySelector<HTMLElement>('.kv-story-narrow')
    if (column === null) {
      throw new Error('no narrow column')
    }
    await expect(canvas.getByRole('link', { name: 'Muuta Osoite' })).toBeVisible()
    await expectNoHorizontalOverflow(column)
  },
}

/** Right to left, in English: the key starts at the right and the action at the left. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Change Namn' })).toBeVisible()
  },
}

/** The row lines and the links survive forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
}

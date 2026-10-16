// kv-lang-ok-file: Reflow320 is the long Finnish word hard case under locale fi
import { Card, Heading, DefinitionList } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/definition-list/definition-list.a11y.md?raw'
import guide from '../../../../../packages/react/src/definition-list/definition-list.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import { withDefinitionListLocale } from './definition-list.fixture.tsx'

// Components/DefinitionList: the headless DefinitionList, styled by @kvirn-ui/theme/theme.css. The rows
// are the answers of a parking-permit application, in English. The Change link's word is the
// library's own string and follows the locale toolbar.

const meta = {
  title: 'Components/Data and behaviour/DefinitionList',
  component: DefinitionList.Root,
  args: {
    children: (
      <>
        <DefinitionList.Row>
          <DefinitionList.Term>Name</DefinitionList.Term>
          <DefinitionList.Description>Anna Smith</DefinitionList.Description>
          <DefinitionList.Actions>
            <DefinitionList.Change href="#name" />
          </DefinitionList.Actions>
        </DefinitionList.Row>
        <DefinitionList.Row>
          <DefinitionList.Term>Address</DefinitionList.Term>
          <DefinitionList.Description>12 High Street, 111 22 Kvirnby</DefinitionList.Description>
          <DefinitionList.Actions>
            <DefinitionList.Change href="#address" />
          </DefinitionList.Actions>
        </DefinitionList.Row>
        <DefinitionList.Row>
          <DefinitionList.Term>Registration number</DefinitionList.Term>
          <DefinitionList.Description>ABC 123</DefinitionList.Description>
          <DefinitionList.Actions>
            <DefinitionList.Change href="#regnr" />
          </DefinitionList.Actions>
        </DefinitionList.Row>
      </>
    ),
  },
  argTypes: {
    className: {
      control: 'text',
      description:
        'Your own classes, added to `kv-definition-list`. The theme draws the rows and stacks them below `40rem`.',
    },
  },
  decorators: [withDefinitionListLocale],
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof DefinitionList.Root>

export default meta
type Story = StoryObj<typeof meta>

/** Check your answers: each row has a term, a description and a Change link named by its term. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('term')).toHaveLength(3)
    await expect(canvas.getByRole('link', { name: 'Change Name' })).toHaveTextContent('Change')
    await expect(canvas.getByRole('link', { name: 'Change Registration number' })).toBeVisible()
  },
}

/** Rows without an action, such as a contact card: the description takes the room. */
export const WithoutActions: Story = {
  args: {
    children: (
      <>
        <DefinitionList.Row>
          <DefinitionList.Term>Phone</DefinitionList.Term>
          <DefinitionList.Description>08-000 00 00</DefinitionList.Description>
        </DefinitionList.Row>
        <DefinitionList.Row>
          <DefinitionList.Term>Email</DefinitionList.Term>
          <DefinitionList.Description>contact@kvirnby.example</DefinitionList.Description>
        </DefinitionList.Row>
        <DefinitionList.Row>
          <DefinitionList.Term>Opening hours</DefinitionList.Term>
          <DefinitionList.Description>Weekdays 9–16</DefinitionList.Description>
        </DefinitionList.Row>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('link')).toBeNull()
  },
}

/** A missing answer says so, and a description can hold several lines or links. */
export const MissingAndMultiple: Story = {
  args: {
    children: (
      <>
        <DefinitionList.Row>
          <DefinitionList.Term>Phone</DefinitionList.Term>
          <DefinitionList.Description>Not provided</DefinitionList.Description>
          <DefinitionList.Actions>
            <DefinitionList.Change href="#phone">Add</DefinitionList.Change>
          </DefinitionList.Actions>
        </DefinitionList.Row>
        <DefinitionList.Row>
          <DefinitionList.Term>Attachments</DefinitionList.Term>
          <DefinitionList.Description>
            <a href="#certificate">certificate.pdf</a>
            <br />
            <a href="#photo">photo-of-the-car.jpg</a>
          </DefinitionList.Description>
          <DefinitionList.Actions>
            <DefinitionList.Change href="#attachments" />
            <DefinitionList.Change href="#attachments-remove">Remove</DefinitionList.Change>
          </DefinitionList.Actions>
        </DefinitionList.Row>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Add Phone' })).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Remove Attachments' })).toBeVisible()
  },
}

/** Inside a Card: a case card with its facts. The Card is the surface, the list the structure. */
export const InACard: Story = {
  render: (args) => (
    <Card.Root>
      <Card.Body>
        <Heading as="h2">Case 2026-0142</Heading>
        <DefinitionList.Root {...args}>
          <DefinitionList.Row>
            <DefinitionList.Term>Status</DefinitionList.Term>
            <DefinitionList.Description>Under review</DefinitionList.Description>
          </DefinitionList.Row>
          <DefinitionList.Row>
            <DefinitionList.Term>Received</DefinitionList.Term>
            <DefinitionList.Description>6 October 2026</DefinitionList.Description>
          </DefinitionList.Row>
          <DefinitionList.Row>
            <DefinitionList.Term>Case officer</DefinitionList.Term>
            <DefinitionList.Description>The parking unit</DefinitionList.Description>
          </DefinitionList.Row>
        </DefinitionList.Root>
      </Card.Body>
    </Card.Root>
  ),
  args: { children: undefined },
}

/** The links: Tab goes through the Change links in order and Enter follows one. */
export const Keyboard: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Change Name' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Change Address' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect(canvas.getByRole('link', { name: 'Change Name' })).toHaveFocus()
  },
}

/** A 320px column with long Finnish words: the rows stack and nothing scrolls sideways (1.4.10). */
export const Reflow320: Story = {
  args: {
    children: (
      <>
        <DefinitionList.Row>
          <DefinitionList.Term>Jätehuoltomaksunpalautuspäätös</DefinitionList.Term>
          <DefinitionList.Description>
            Hyväksytty ja maksettu takaisin tilille FI00 0000 0000 0000 00
          </DefinitionList.Description>
          <DefinitionList.Actions>
            <DefinitionList.Change href="#maksu" />
          </DefinitionList.Actions>
        </DefinitionList.Row>
        <DefinitionList.Row>
          <DefinitionList.Term>Osoite</DefinitionList.Term>
          <DefinitionList.Description>Kirkkokatu 1, 00100 Helsinki</DefinitionList.Description>
          <DefinitionList.Actions>
            <DefinitionList.Change href="#osoite" />
          </DefinitionList.Actions>
        </DefinitionList.Row>
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

/** Right to left, in English: the term starts at the right and the action at the left. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Change Name' })).toBeVisible()
  },
}

/** The row lines and the links survive forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
}

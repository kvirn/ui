import { Button, ButtonGroup, Card } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/button-group/button-group.a11y.md?raw'
import guide from '../../../../../packages/react/src/button-group/button-group.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/ButtonGroup: a row of related buttons, styled by @kvirn-ui/theme/theme.css
// (contract: button-group.a11y.md). It has no keys of its own, so there is no Keyboard story and
// its Tab row is a component test. In a toolbar it is Toolbar.Group: see
// Components/Toolbar.

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  // Every option at its default, so the main example starts where an adopter starts.
  args: { 'aria-label': 'Ärendet' },
  // Every prop in button-group.tsx. Any other `<div>` prop passes through.
  argTypes: {
    'aria-label': {
      control: 'text',
      description:
        'The group’s name, from your translations. With a name it is a `role="group"`. Without `aria-label` or `aria-labelledby` it is a plain `<div>` with no role. Needed in a Toolbar.',
    },
    'aria-labelledby': {
      control: 'text',
      description:
        'The id of visible text that names the group, such as a heading. Use it instead of `aria-label`.',
    },
    className: {
      control: false,
      description:
        'Your own classes, added to `kv-button-group`. The theme styles the group as a row that wraps, and stacks it at full width below 40rem.',
    },
    children: { control: false, description: 'The buttons, in the order they are used.' },
    ref: { control: false, description: 'A ref to the `<div>`.' },
    render: {
      control: false,
      description:
        'Another element. Spread the props it gets: they hold the class and, with a name, the role. `state` is `{ isNamed }`.',
    },
  },
  globals: { locale: 'sv' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof ButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The main example: two buttons that act on the same case, as a named group. The primary button
 * comes first, so it is first in focus order. Every button is its own Tab stop.
 */
export const Default: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button className="kv-button--primary">Skicka</Button>
      <Button>Spara utkast</Button>
    </ButtonGroup>
  ),
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Ärendet' })
    await expect(group).not.toHaveAttribute('tabindex')
    await expect(canvas.getAllByRole('button')).toHaveLength(2)
  },
}

/**
 * A Card footer needs no name: without one the group is a plain `<div>`, so it adds no empty
 * group to the accessibility tree. If the buttons need a context their labels don't give, point
 * `aria-labelledby` at the card's heading.
 */
export const InACardFooter: Story = {
  render: () => (
    <Card.Root>
      <Card.Body className="kv-prose">
        <h2>Sophämtning</h2>
        <p>Nästa hämtning är på tisdag. Ställ ut kärlet senast klockan 06.</p>
      </Card.Body>
      <Card.Footer>
        <ButtonGroup>
          <Button className="kv-button--primary">Beställ extra tömning</Button>
          <Button>Pausa hämtningen</Button>
        </ButtonGroup>
      </Card.Footer>
    </Card.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('group')).toBeNull()
    await expect(canvas.getAllByRole('button')).toHaveLength(2)
  },
}

/** Long Finnish names wrap inside their buttons, and the group stacks them in a narrow column (1.4.10). */
export const LongFinnishLabels: Story = {
  globals: { locale: 'fi' },
  render: () => (
    <div className="kv-story-narrow" data-testid="narrow">
      <ButtonGroup aria-label="Hakemus">
        <Button className="kv-button--primary">Lähetä rakennuslupahakemus</Button>
        <Button>Tallenna rakennuslupahakemuksen luonnos</Button>
      </ButtonGroup>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Hakemus' })).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Right to left, in English: the group starts on the right, and Tab follows the DOM order. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  args: { 'aria-label': 'Application' },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button className="kv-button--primary">Send</Button>
      <Button>Save draft</Button>
    </ButtonGroup>
  ),
}

import { Card, Container, Heading } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/container/container.a11y.md?raw'
import guide from '../../../../../packages/react/src/container/container.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Container: the headless Container, styled by @kvirn-ui/theme/theme.css (DESIGN.md,
// Layout). It draws nothing, so each story outlines it with a Card.

const description = usageGuide(guide)

function Page({ title }: { title: string }) {
  return (
    <Card.Root>
      <Card.Body>
        <Heading as="h2">{title}</Heading>
        <p>Innehållet i behållaren följer ordningen i DOM, och inget blir bredare än skärmen.</p>
      </Card.Body>
    </Card.Root>
  )
}

const meta = {
  title: 'Components/Container',
  component: Container,
  args: { children: <Page title="Kvirnby kommun" /> },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['page', 'reading', 'form'],
      description:
        '`page` (default): centred, `80rem`, inline padding. `reading` `45rem` and `form` `40rem` are start-aligned with no padding.',
    },
    as: { control: false, description: 'Another element: `main`, `section` or `article`.' },
  },
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
} satisfies Meta<typeof Container>

export default meta
type Story = StoryObj<typeof meta>

/** The page: centred, at most `80rem` wide, with inline padding that grows with the screen. */
export const Default: Story = {}

/** `size="reading"`: prose and lists of results, `45rem`, at inline start. */
export const Reading: Story = {
  args: { size: 'reading', children: <Page title="Sophämtning" /> },
}

/** `size="form"`: one form, `40rem`, at inline start. */
export const Form: Story = {
  args: { size: 'form', children: <Page title="Anmäl flytt" /> },
}

/** `as` picks the element and names it: a `section` labelled by its heading. */
export const AsRegion: Story = {
  render: (args) => (
    <Container {...args} as="section" aria-labelledby="container-region-title">
      <Heading as="h2" id="container-region-title">
        Aktuellt
      </Heading>
    </Container>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('region', { name: 'Aktuellt' })).toBeVisible()
  },
}

/** A 320px column with a long Finnish word: the container never scrolls sideways (1.4.10). */
export const Reflow320: Story = {
  args: {
    children: <Page title="Jätehuoltomaksunpalautuspäätöksentarkistuslomake" />,
  },
  decorators: [(Story) => <div className="kv-story-narrow">{<Story />}</div>],
  globals: { locale: 'fi' },
  play: async ({ canvasElement }) => {
    const column = canvasElement.querySelector<HTMLElement>('.kv-story-narrow')
    if (column === null) {
      throw new Error('no narrow column')
    }
    await expectNoHorizontalOverflow(column)
  },
}

/** Right to left: the start-aligned measures sit at the right. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  args: { size: 'reading', children: <Page title="Waste collection" /> },
}

/** The outline survives forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
}

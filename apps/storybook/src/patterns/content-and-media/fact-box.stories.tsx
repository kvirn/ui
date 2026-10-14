import { en } from '@kvirn-ui/i18n/en'
import { DefinitionList, Heading, KvirnProvider, Link, List } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import contract from '../../../../../packages/patterns/src/content-and-media/fact-box/fact-box.a11y.md?raw'
import { expect } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Content and media/Fact box (docs/design/storybook-patterns-t5.md S16).
// Story-only: `kv-inset` and shipped parts, so it has no pattern.

const description = `Key facts set apart from the text. A \`div.kv-inset\` with a \`Heading\` that states what the facts are about ("Facts: preschool fees"), then the facts as a \`List\` (short, parallel facts) or a \`DefinitionList\` (a name and a value each). It is not an \`aside\`: no landmark, so a screen reader finds it in reading order (R2). Choose the heading \`as\` for the page's outline (R1). Anything with legal or money consequences is an \`Alert.Warning\`, not a fact box.

## Parts and gaps

Parts used: \`kv-inset\`, \`Heading\`, \`List.Root\`, \`DefinitionList.Root\`, \`Link.Root\`. No gap.
`

const meta = {
  title: 'Patterns/Content and media/Fact box',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Facts as a list. */
export const FactList: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-prose">
        <p>The fee depends on your household income.</p>
        <div className="kv-inset">
          <Heading as="h2" size="heading-4">
            Facts: preschool fees
          </Heading>
          <List.Root>
            <List.Item>The fee is at most 1,645 kronor a month.</List.Item>
            <List.Item>The second child pays two thirds.</List.Item>
            <List.Item>The third child pays one third.</List.Item>
          </List.Root>
        </div>
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Facts: preschool fees' })).toBeVisible()
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3)
    await expect(canvas.queryByRole('complementary')).toBeNull()
  },
}

/** Facts as a definition list: a name and a value each. */
export const FactDefinitionList: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-prose">
        <div className="kv-inset">
          <Heading as="h2" size="heading-4">
            Facts: Hillside preschool
          </Heading>
          <DefinitionList.Root>
            <DefinitionList.Row>
              <DefinitionList.Term>Children</DefinitionList.Term>
              <DefinitionList.Description>64</DefinitionList.Description>
            </DefinitionList.Row>
            <DefinitionList.Row>
              <DefinitionList.Term>Open</DefinitionList.Term>
              <DefinitionList.Description>6:30 to 17:30</DefinitionList.Description>
            </DefinitionList.Row>
            <DefinitionList.Row>
              <DefinitionList.Term>Meals</DefinitionList.Term>
              <DefinitionList.Description>Breakfast, lunch and a snack</DefinitionList.Description>
            </DefinitionList.Row>
          </DefinitionList.Root>
        </div>
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('term')).toHaveLength(3)
    await expect(canvas.getAllByRole('definition')).toHaveLength(3)
  },
}

/** With a link; its text makes sense alone. */
export const WithLink: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-prose">
        <div className="kv-inset">
          <Heading as="h2" size="heading-4">
            Facts: preschool fees
          </Heading>
          <List.Root>
            <List.Item>The fee is at most 1,645 kronor a month.</List.Item>
            <List.Item>
              <Link.Root href="#calculator">Calculate your fee</Link.Root>
            </List.Item>
          </List.Root>
        </div>
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Calculate your fee' })).toBeVisible()
  },
}

/** 320px: facts wrap; nothing scrolls sideways. */
export const Narrow: Story = {
  ...FactDefinitionList,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 80rem: the box keeps the reading measure. */
export const Wide: Story = {
  ...FactList,
  globals: { ...wideGlobals },
}

/** Try the keys: Tab reaches only the link; the box adds no Tab stop. */
export const Keyboard: Story = { ...WithLink }

/** Right to left: the bar moves to the start. */
export const RTL: Story = {
  ...FactList,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: the box keeps a visible edge. */
export const ForcedColors: Story = {
  ...FactList,
  globals: { forcedColors: 'active' },
}

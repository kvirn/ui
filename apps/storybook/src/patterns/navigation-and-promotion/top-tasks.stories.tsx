import { kvirnbyTopTasks, kvirnbyTopTasksFinnish, type TopTask } from '@kvirn-ui/patterns/fixtures'
import { Grid, Heading, Link } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import contract from '../../../../../packages/patterns/src/navigation-and-promotion/top-tasks/top-tasks.a11y.md?raw'
import { expect, userEvent } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Navigation and promotion/Top tasks (docs/design/storybook-patterns-t5.md S15).
// Story-only: a heading and a grid of links are shipped parts, so it has no pattern.

const description = `The tasks residents do most, in one list. A \`Heading\` for the group, then a [Grid](?path=/docs/components-grid--docs) rendered as a \`ul\` (\`kv-grid--fit-sm\`) so the count is announced, each item one \`Link\` whose text is a verb phrase that makes sense alone. Six to eight tasks: more is a menu, not top tasks. The cells wrap their text and never truncate it. Choose the heading level for the page's outline (rule R1). The list is not a \`nav\` landmark (rule R2). Copy the story's code and replace the text.

## Parts and gaps

Parts used: \`Heading\`, \`Grid.Root as="ul"\`, \`Grid.Item as="li"\`, \`Link\`. No gap.
`

const meta = {
  title: 'Patterns/Navigation and promotion/Top tasks',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    layout: 'padded',
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function TopTasks({ tasks, lang }: { tasks: readonly TopTask[]; lang?: string }) {
  return (
    <section aria-labelledby="top-tasks-heading" lang={lang}>
      <Heading as="h2" size="heading-3" id="top-tasks-heading">
        {/* kv-lang-ok: a Finnish passage that sets lang (3.1.2) */}
        {lang === 'fi' ? 'Yleisimmät asiat' : 'Top tasks'}
      </Heading>
      <Grid.Root as="ul" className="kv-grid--fit-sm kv-grid--gap-4">
        {tasks.map((task) => (
          <Grid.Item as="li" key={task.href}>
            <Link.Root href={task.href}>{task.label}</Link.Root>
          </Grid.Item>
        ))}
      </Grid.Root>
    </section>
  )
}

/** Six tasks. */
export const Six: Story = {
  globals: { ...wideGlobals },
  render: () => <TopTasks tasks={kvirnbyTopTasks.slice(0, 6)} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('list')).toBeVisible()
    await expect(canvas.getAllByRole('listitem')).toHaveLength(6)
    await expect(canvas.getAllByRole('link')).toHaveLength(6)
  },
}

/** Eight tasks: the most a list of top tasks holds. */
export const Eight: Story = {
  globals: { ...wideGlobals },
  render: () => <TopTasks tasks={kvirnbyTopTasks} />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('link')).toHaveLength(8)
  },
}

/** Long Finnish task names wrap and are never truncated; the group is marked `lang="fi"` (3.1.2). */
export const LongFinnish: Story = {
  globals: { ...narrowGlobals },
  render: () => <TopTasks tasks={kvirnbyTopTasksFinnish} lang="fi" />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getAllByRole('link')).toHaveLength(6)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 320px: one column, nothing scrolls sideways. */
export const Narrow: Story = {
  ...Eight,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 80rem: several columns, the DOM order is the reading order. */
export const Wide: Story = {
  ...Eight,
  globals: { ...wideGlobals },
}

/** Try the keys: Tab moves through the links in reading order, Enter follows one. */
export const Keyboard: Story = {
  ...Six,
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Apply for a preschool place' })).toHaveFocus()
    await userEvent.tab()
    await expect(
      canvas.getByRole('link', { name: 'Book a time at the recycling centre' }),
    ).toHaveFocus()
  },
}

/** Right to left: the columns start at the right and the order follows. */
export const RTL: Story = {
  ...Eight,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: every link keeps its underline and a visible focus ring. */
export const ForcedColors: Story = {
  ...Eight,
  globals: { forcedColors: 'active' },
}

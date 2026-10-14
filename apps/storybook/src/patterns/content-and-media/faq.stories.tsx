import { en } from '@kvirn-ui/i18n/en'
import { Accordion, Heading, KvirnProvider, Link, List } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import contract from '../../../../../packages/patterns/src/content-and-media/faq/faq.a11y.md?raw'
import type { ReactNode } from 'react'
import { expect, userEvent } from 'storybook/test'
import {
  expectAnimationsSettled,
  expectNoHorizontalOverflow,
} from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Content and media/FAQ (docs/design/storybook-patterns-t5.md S13).
// Story-only: a heading and an Accordion are shipped parts, so it has no pattern.

const description = `Questions a resident opens one by one. A \`Heading\` for the group, then an [Accordion](?path=/docs/components-disclosure-accordion--docs) where each question is the trigger inside a heading one level below the group's, and the answer is \`kv-prose\` in the panel. Choose \`level\` for the page's outline (rule R1: no skipped level, stop at \`h3\` on resident pages). Every trigger is a Tab stop, Enter or Space opens it. Answers are in the page when it is printed or searched (\`hiddenUntilFound\`). It is not a landmark and not a component of its own: copy the story's code and replace the text. Do not hide the only copy of something every resident must read.

## Parts and gaps

Parts used: \`Heading\`, \`Accordion.Root\`, \`Accordion.Item\`, \`Accordion.Heading\`, \`Accordion.Trigger\`, \`Accordion.Panel\`, \`Link\`, \`List\`. No gap.
`

const meta = {
  title: 'Patterns/Content and media/FAQ',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const questions = [
  ['Who can get a place?', 'Every child from the age of one whose guardians live in Kvirnby.'],
  ['When can my child start?', 'Within four months of the date you ask for.'],
  ['How much does it cost?', 'The fee depends on household income and is capped.'],
  ['Can I change my application?', 'Yes, until the offer is made.'],
  ['What if I move?', 'Tell us on My pages and the queue date stays.'],
  ['Who looks after my child?', 'Teachers and childcare workers, in small groups.'],
  ['Are meals included?', 'Yes. Tell us about allergies when you accept the place.'],
  ['How do I end the place?', 'Give three months of notice on My pages.'],
]

function Faq({ count, children }: { count: number; children?: ReactNode }) {
  return (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en">
        <Heading as="h2" size="heading-3">
          Questions and answers
        </Heading>
        <Accordion.Root>
          {questions.slice(0, count).map(([question, answer]) => (
            <Accordion.Item key={question}>
              <Accordion.Heading level={3}>
                <Accordion.Trigger>{question}</Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <div className="kv-prose">
                  <p>{answer}</p>
                </div>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
          {children}
        </Accordion.Root>
      </div>
    </KvirnProvider>
  )
}

/** Three items, closed. */
export const Three: Story = {
  render: () => <Faq count={3} />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(3)
    const trigger = canvas.getByRole('button', { name: 'Who can get a place?' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  },
}

/** Eight items. */
export const Eight: Story = {
  render: () => <Faq count={8} />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('button')).toHaveLength(8)
  },
}

/** An answer with a list and a link. */
export const PanelWithListAndLink: Story = {
  render: () => (
    <Faq count={2}>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>What do I need to apply?</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <div className="kv-prose">
            <p>Have these ready:</p>
            <List.Root>
              <List.Item>your e-identification</List.Item>
              <List.Item>your child&apos;s date of birth</List.Item>
              <List.Item>the date you want the place from</List.Item>
            </List.Root>
            <p>
              <Link.Root href="#apply">Apply for a preschool place</Link.Root>
            </p>
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    </Faq>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'What do I need to apply?' }))
    await expectAnimationsSettled()
    await expect(canvas.getByRole('list')).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Apply for a preschool place' })).toBeVisible()
  },
}

/** A long question wraps and is never truncated. */
export const LongQuestion: Story = {
  render: () => (
    <Faq count={1}>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>
            What happens to my child&apos;s place if we move to another municipality in the middle
            of the school year and we have not yet been offered a new place?
          </Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <div className="kv-prose">
            <p>The place ends after three months. Contact us before you move.</p>
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    </Faq>
  ),
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 320px: triggers stack full width; nothing scrolls sideways. */
export const Narrow: Story = {
  ...Three,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 80rem: the list keeps its measure. */
export const Wide: Story = {
  ...Three,
  globals: { ...wideGlobals },
}

/** Try the keys: Tab to a question, Enter or Space opens it, Tab goes on to the next question or into the answer. */
export const Keyboard: Story = { ...Narrow }

/** Right to left: the chevron mirrors to the start. */
export const RTL: Story = {
  ...Three,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: triggers keep a border and the open state is not colour alone. */
export const ForcedColors: Story = {
  ...Three,
  globals: { forcedColors: 'active' },
}

import { kvirnbyOpeningWeek } from '@kvirn-ui/patterns/fixtures'
import { en } from '@kvirn-ui/i18n/en'
import { Alert, DefinitionList, Heading, KvirnProvider } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'
import contract from '../../../../../packages/patterns/src/places-and-contacts/opening-hours/opening-hours.a11y.md?raw'

// Patterns/Places and contacts/Opening hours (docs/design/storybook-patterns-t5.md S6).
// Story-only: a heading and a definition list are shipped parts, so it has no pattern.

const description = `Know when a place is open, and the exceptions. A \`Heading\` and a [DefinitionList](?path=/docs/components-data-and-behaviour-definitionlist--docs): one row for each run of days, written in full ("Monday to Thursday"), with the times as the value. It is a \`dl\`, not a table: there is one dimension and nothing to scroll at 320px. Today is marked with "(today)" after the day, as text, never by colour alone. An exception is a \`kv-inset\` with its own heading; a place that is closed today says so in an \`Alert.Warning\` before the list. Visiting hours and phone hours are separate \`h3\` blocks.

## Parts and gaps

Parts used: \`Heading\`, \`DefinitionList\`, \`Alert.Warning\`, the \`kv-inset\` class. No gap.
`

const meta = {
  title: 'Patterns/Places and contacts/Opening hours',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Week({ markToday = false }: { markToday?: boolean }) {
  return (
    <DefinitionList.Root>
      {kvirnbyOpeningWeek.map((day) => (
        <DefinitionList.Row key={day.days}>
          <DefinitionList.Term>
            {day.days}
            {markToday && day.today ? ' (today)' : ''}
          </DefinitionList.Term>
          <DefinitionList.Description>{day.hours}</DefinitionList.Description>
        </DefinitionList.Row>
      ))}
    </DefinitionList.Root>
  )
}

/** A normal week; today is marked in words. */
export const Default: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-prose">
        <Heading as="h2" size="heading-3">
          Opening hours
        </Heading>
        <Week markToday />
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2, name: 'Opening hours' })).toBeVisible()
    await expect(canvas.getByText('Monday (today)')).toBeVisible()
    await expect(canvas.getByText('Saturday and Sunday')).toBeVisible()
  },
}

/** An exception: an inset with its own heading, after the normal week. */
export const WithException: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-prose">
        <Heading as="h2" size="heading-3">
          Opening hours
        </Heading>
        <Week />
        <div className="kv-inset">
          <Heading as="h3" size="heading-4">
            Different hours
          </Heading>
          <p>
            On <time dateTime="2026-12-24">24 December</time> the office is closed. On{' '}
            <time dateTime="2026-12-23">23 December</time> it closes at 12.00.
          </p>
        </div>
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 3, name: 'Different hours' })).toBeVisible()
  },
}

/** Closed today: the warning comes first and says it in words. */
export const ClosedToday: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-prose">
        <Heading as="h2" size="heading-3">
          Opening hours
        </Heading>
        <Alert.Warning>
          <Alert.Title as="p">Closed today</Alert.Title>
          <Alert.Body>
            <p>
              The office is closed today because of a staff meeting. It opens again tomorrow at
              8.00.
            </p>
          </Alert.Body>
        </Alert.Warning>
        <Week />
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Closed today', { selector: 'p' })).toBeVisible()
  },
}

/** Visiting hours and phone hours, each under its own `h3`. */
export const VisitingAndPhoneHours: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-prose">
        <Heading as="h2" size="heading-3">
          Opening hours
        </Heading>
        <Heading as="h3" size="heading-4">
          Visiting hours
        </Heading>
        <Week markToday />
        <Heading as="h3" size="heading-4">
          Phone hours
        </Heading>
        <DefinitionList.Root>
          <DefinitionList.Row>
            <DefinitionList.Term>Monday to Thursday</DefinitionList.Term>
            <DefinitionList.Description>9.00–11.00</DefinitionList.Description>
          </DefinitionList.Row>
          <DefinitionList.Row>
            <DefinitionList.Term>Friday</DefinitionList.Term>
            <DefinitionList.Description>Closed</DefinitionList.Description>
          </DefinitionList.Row>
        </DefinitionList.Root>
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(2)
  },
}

/** 320px: the rows stack; nothing scrolls sideways. */
export const Narrow: Story = {
  ...WithException,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 80rem: the block keeps the reading measure. */
export const Wide: Story = {
  ...Default,
  globals: { ...wideGlobals },
}

/** Right to left: the rows start at the right. */
export const RTL: Story = {
  ...WithException,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: the inset and the warning keep a border; today is still marked in words. */
export const ForcedColors: Story = {
  ...ClosedToday,
  globals: { forcedColors: 'active' },
}

import { Badge, Container, DefinitionList, Heading, Link, List, Stack } from '@kvirn-ui/react'
import { kvirnbyEvents } from '@kvirn-ui/patterns/fixtures'
import type { EventItem } from '@kvirn-ui/patterns/fixtures'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'
import { DateText, ExampleProvider, TimeSpan } from './news-events-support.tsx'
import contract from '../../../../../packages/patterns/src/news-events-and-notices/event-list/event-list.a11y.md?raw'

// Patterns/News, events and notices/Event list (docs/design/storybook-patterns-t5.md S9).
// Story-only: a recipe from `List`, `Heading`, `Link`, `DefinitionList`, `Badge` and `<time>`.

const description = `Find an event by date. Built like the News list, with the facts in a [DefinitionList](?path=/docs/components-content-definition-list--docs): when, where and cost. Status is words first: a cancelled event starts its title with "Cancelled:" and adds a \`danger\` [Badge](?path=/docs/components-content-badge--docs); a moved event says the new date in words; a fully booked event says so in text. A closed or unavailable action is text, never a dimmed link (R9). Dates and times are \`<time dateTime>\` written with \`useFormat\`.

## Parts and gaps

Parts used: \`Heading\`, \`Link\`, \`List\`, \`DefinitionList\`, \`Badge\`, \`Stack\`, native \`time\`, \`kv-empty-state\`. No gap.
`

const meta = {
  title: 'Patterns/News, events and notices/Event list',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function EventEntry({ event }: { event: EventItem }) {
  const cancelled = event.status === 'cancelled'
  return (
    <List.Item>
      <Stack className="kv-stack--gap-2">
        <Heading as="h3" size="heading-4">
          <Link.Root href={event.href}>
            {cancelled ? `Cancelled: ${event.title}` : event.title}
          </Link.Root>
        </Heading>
        {cancelled ? <Badge variant="danger">Cancelled</Badge> : null}
        {event.status === 'moved' && event.movedTo !== undefined ? (
          <p>
            <Badge variant="warning">Moved</Badge> Moved to <DateText iso={event.movedTo} />
          </p>
        ) : null}
        {event.status === 'fullyBooked' ? <p>Fully booked</p> : null}
        <DefinitionList.Root>
          <DefinitionList.Row>
            <DefinitionList.Term>When</DefinitionList.Term>
            <DefinitionList.Description>
              <TimeSpan startsAt={event.startsAt} endsAt={event.endsAt} />
            </DefinitionList.Description>
          </DefinitionList.Row>
          <DefinitionList.Row>
            <DefinitionList.Term>Where</DefinitionList.Term>
            <DefinitionList.Description>{event.where}</DefinitionList.Description>
          </DefinitionList.Row>
          <DefinitionList.Row>
            <DefinitionList.Term>Cost</DefinitionList.Term>
            <DefinitionList.Description>{event.cost}</DefinitionList.Description>
          </DefinitionList.Row>
        </DefinitionList.Root>
      </Stack>
    </List.Item>
  )
}

function Events({ statuses }: { statuses: readonly EventItem['status'][] }) {
  return (
    <ExampleProvider>
      <Container size="reading">
        <Stack className="kv-stack--gap-6">
          <Heading as="h2" size="heading-3">
            Upcoming events
          </Heading>
          <List.Root className="kv-list--gap-8">
            {kvirnbyEvents
              .filter((event) => statuses.includes(event.status))
              .map((event) => (
                <EventEntry key={event.href} event={event} />
              ))}
          </List.Root>
        </Stack>
      </Container>
    </ExampleProvider>
  )
}

/** Upcoming events, with the facts under each title. */
export const Upcoming: Story = {
  globals: { ...wideGlobals },
  render: () => <Events statuses={['upcoming']} />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(2)
  },
}

/** Cancelled: "Cancelled:" first in the title, plus a Badge in words. */
export const Cancelled: Story = {
  globals: { ...wideGlobals },
  render: () => <Events statuses={['cancelled']} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: /^Cancelled: / })).toBeVisible()
  },
}

/** Moved: the new date in words. */
export const Moved: Story = {
  globals: { ...wideGlobals },
  render: () => <Events statuses={['moved']} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/Moved to/)).toBeVisible()
  },
}

/** Fully booked: text, not a dimmed link. */
export const FullyBooked: Story = {
  globals: { ...wideGlobals },
  render: () => <Events statuses={['fullyBooked']} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Fully booked')).toBeVisible()
  },
}

/** Every status in one list. */
export const AllStates: Story = {
  globals: { ...wideGlobals },
  render: () => <Events statuses={['upcoming', 'cancelled', 'moved', 'fullyBooked']} />,
}

/** No events: say what is missing and what to do. */
export const Empty: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <ExampleProvider>
      <Container size="reading">
        <div className="kv-empty-state">
          <Heading as="h2" size="heading-3" className="kv-empty-state-title">
            There are no upcoming events
          </Heading>
          <p className="kv-empty-state-body">
            Check back soon, or read the <Link.Root href="#news">latest news</Link.Root>.
          </p>
        </div>
      </Container>
    </ExampleProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('list')).toBeNull()
  },
}

/** 320px: the facts stack and wrap; nothing scrolls sideways. */
export const Narrow: Story = {
  globals: { ...narrowGlobals },
  render: () => <Events statuses={['upcoming', 'cancelled', 'moved', 'fullyBooked']} />,
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Tab goes from event link to event link in reading order. */
export const Keyboard: Story = { ...AllStates }

/** Right to left. */
export const RTL: Story = {
  ...AllStates,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}

/** Forced colours: the Badge keeps a border and the status is in words. */
export const ForcedColors: Story = {
  ...AllStates,
  globals: { forcedColors: 'active', ...wideGlobals },
}

import { en } from '@kvirn-ui/i18n/en'
import { kvirnbyCaseBadgeVariants, kvirnbyCases } from '@kvirn-ui/patterns/fixtures'
import type { KvirnbyCase } from '@kvirn-ui/patterns/fixtures'
import {
  Badge,
  Card,
  DefinitionList,
  Grid,
  Heading,
  KvirnProvider,
  Link,
  useFormat,
} from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'
import contract from '../../../../../packages/patterns/src/my-pages/case-card/case-card.a11y.md?raw'

// Patterns/My pages/Case card (docs/design/storybook-patterns-t5.md S12).
// Story-only: every part is shipped. The My pages content type holds the same JSX.

const description = `One case: what, where it stands, what I must do. A \`Grid.Root as="ul"\` of one column holds a \`Card.Root as="li"\` per case, so the count is announced (R3). The card's \`Heading\` holds the one \`Link\` (R4: no clickable card). Under it a \`Badge\` with the status word, the next step in a sentence, and a \`DefinitionList\` with the case number, when it was sent and the last change; dates are \`<time dateTime>\` written by \`useFormat\` (R7).

Status is in words and a Badge, never colour alone (R9). A case the resident must act on is \`warning\` and the text starts "Action needed:" and says what. The recipe fixes no heading level (R1): it is \`h3\` under an \`h2\` "Your cases" here.

## Parts and gaps

Parts used: \`Grid.Root\`, \`Card.Root\`, \`Card.Body\`, \`Heading\`, \`Link\`, \`Badge\`, \`DefinitionList\`. No gap.
`

const meta = {
  title: 'Patterns/My pages/Case card',
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

function CaseCards({ items }: { items: readonly KvirnbyCase[] }) {
  const format = useFormat()
  const date = (isoDate: string) => (
    <time dateTime={isoDate}>
      {format.date(new Date(isoDate), { dateStyle: 'long', timeZone: 'UTC' })}
    </time>
  )
  return (
    <div lang="en" className="kv-stack">
      <Heading as="h2" size="heading-3">
        Your cases
      </Heading>
      <Grid.Root as="ul" className="kv-grid--cols-1">
        {items.map((item) => (
          <Card.Root as="li" key={item.number}>
            <Card.Body className="kv-prose">
              <Heading as="h3" size="heading-4">
                <Link.Root href={item.href}>{item.title}</Link.Root>
              </Heading>
              <p>
                <Badge variant={kvirnbyCaseBadgeVariants[item.status]}>{item.statusLabel}</Badge>
              </p>
              <p>
                {item.status === 'action-needed' ? <strong>Action needed: </strong> : null}
                {item.nextStep}
              </p>
              <DefinitionList.Root>
                <DefinitionList.Row>
                  <DefinitionList.Term>Case number</DefinitionList.Term>
                  <DefinitionList.Description>{item.number}</DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Sent</DefinitionList.Term>
                  <DefinitionList.Description>{date(item.sent)}</DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Last change</DefinitionList.Term>
                  <DefinitionList.Description>{date(item.lastChange)}</DefinitionList.Description>
                </DefinitionList.Row>
              </DefinitionList.Root>
            </Card.Body>
          </Card.Root>
        ))}
      </Grid.Root>
    </div>
  )
}

function render(...statuses: KvirnbyCase['status'][]) {
  return () => (
    <KvirnProvider locale="en" messages={en}>
      <CaseCards items={kvirnbyCases.filter((item) => statuses.includes(item.status))} />
    </KvirnProvider>
  )
}

/** Received: we have it, nothing to do yet. */
export const Received: Story = {
  render: render('received'),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Received')).toBeVisible()
    await expect(canvas.getAllByRole('listitem')).toHaveLength(1)
  },
}

/** In progress. */
export const InProgress: Story = {
  render: render('in-progress'),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('In progress')).toBeVisible()
  },
}

/** Action needed: the status word, "Action needed:" and what to do are all text. */
export const ActionNeeded: Story = {
  render: render('action-needed'),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Action needed:')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Application for a preschool place' }),
    ).toBeVisible()
  },
}

/** Decided. */
export const Decided: Story = {
  render: render('decided'),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Decided')).toBeVisible()
  },
}

/** Closed. */
export const Closed: Story = {
  render: render('closed'),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Closed')).toBeVisible()
  },
}

/** All five in one list: the count is announced, and each card has one link. */
export const AllStates: Story = {
  render: render('received', 'in-progress', 'action-needed', 'decided', 'closed'),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(5)
    for (const item of canvasElement.querySelectorAll('li')) {
      await expect(item.querySelectorAll(':scope > div a, :scope a')).toHaveLength(1)
    }
  },
}

/** 320px: one column; nothing scrolls sideways. */
export const Narrow: Story = {
  ...AllStates,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 80rem. */
export const Wide: Story = {
  ...AllStates,
  globals: { ...wideGlobals },
}

/** Try the keys: Tab visits one link per card, in the order on screen. */
export const Keyboard: Story = {
  ...AllStates,
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expect(
      canvas.getByRole('link', { name: 'Application for a preschool place' }),
    ).toHaveFocus()
    await userEvent.tab()
    await expect(
      canvas.getByRole('link', { name: 'Building permit for a garden shed' }),
    ).toHaveFocus()
  },
}

/** Right to left. */
export const RTL: Story = {
  ...AllStates,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: the status stays in words, with the Badge's edge. */
export const ForcedColors: Story = {
  ...ActionNeeded,
  globals: { forcedColors: 'active' },
}

import { en } from '@kvirn-ui/i18n/en'
import { Address, Card, Heading, KvirnProvider, Link, DefinitionList } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Places and contacts/Contact card (docs/design/storybook-patterns.md sections 3 and 6).
// Story-only: a card with a heading and a definition list is shipped parts, so it has no pattern.

const description = `Who to contact: a [Card](?path=/docs/components-content-card--docs) with a heading, the unit that answers and a [DefinitionList](?path=/docs/components-data-and-behaviour-definitionlist--docs) of labelled rows, such as phone, email and phone hours, and an [Address](?path=/docs/components-content-address--docs) for the visiting address. It is not a landmark, and it is not a component of its own: copy the story's code and replace the text. For a phone number or an email address that is a link, put a \`Link\` in the value with its own \`tel:\` or \`mailto:\` \`href\`. A row you leave out is not drawn.

## Parts and gaps

Parts used: \`Card\`, \`Heading\`, \`DefinitionList\`, \`Address\`, \`Link\`. No gap.
`

const meta = {
  title: 'Patterns/Places and contacts/Contact card',
  globals: { locale: 'en' },
  parameters: {
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** All four rows. */
export const Default: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en">
        <Card.Root>
          <Card.Body className="kv-prose">
            <Heading as="h2" size="heading-3">
              Contact us
            </Heading>
            <p>Preschool office</p>
            <DefinitionList.Root>
              <DefinitionList.Row>
                <DefinitionList.Term>Phone</DefinitionList.Term>
                <DefinitionList.Description>
                  <Link.Root href="tel:+4681234567">08-123 45 67</Link.Root>
                </DefinitionList.Description>
              </DefinitionList.Row>
              <DefinitionList.Row>
                <DefinitionList.Term>Email</DefinitionList.Term>
                <DefinitionList.Description>
                  <Link.Root href="mailto:preschool@kvirnby.example">
                    preschool@kvirnby.example
                  </Link.Root>
                </DefinitionList.Description>
              </DefinitionList.Row>
              <DefinitionList.Row>
                <DefinitionList.Term>Phone hours</DefinitionList.Term>
                <DefinitionList.Description>Mon–Thu 9–11 am</DefinitionList.Description>
              </DefinitionList.Row>
              <DefinitionList.Row>
                <DefinitionList.Term>Visiting address</DefinitionList.Term>
                <DefinitionList.Description>
                  <Address>
                    Main Street 1
                    <br />
                    123 45 Kvirnby
                  </Address>
                </DefinitionList.Description>
              </DefinitionList.Row>
            </DefinitionList.Root>
          </Card.Body>
        </Card.Root>
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2, name: 'Contact us' })).toBeVisible()
    await expect(canvas.getAllByRole('link')).toHaveLength(2)
  },
}

/** Only the rows there is something to say about. */
export const PhoneOnly: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en">
        <Card.Root>
          <Card.Body className="kv-prose">
            <Heading as="h3" size="heading-3">
              Questions about fees
            </Heading>
            <DefinitionList.Root>
              <DefinitionList.Row>
                <DefinitionList.Term>Phone</DefinitionList.Term>
                <DefinitionList.Description>
                  <Link.Root href="tel:+46812345678">08-123 456 78, switchboard</Link.Root>
                </DefinitionList.Description>
              </DefinitionList.Row>
            </DefinitionList.Root>
          </Card.Body>
        </Card.Root>
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 3 })).toBeVisible()
    await expect(canvas.getAllByRole('link')).toHaveLength(1)
  },
}

/** 320px: the rows stack; nothing scrolls sideways. */
export const Narrow: Story = {
  ...Default,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 80rem: the card keeps the form measure and does not stretch. */
export const Wide: Story = {
  ...Default,
  globals: { ...wideGlobals },
}

/** Right to left: the rows start at the right. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: the card keeps its border and links are `LinkText`. */
export const ForcedColors: Story = {
  ...Default,
  globals: { forcedColors: 'active' },
}

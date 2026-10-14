import { kvirnbyAccessFacts } from '@kvirn-ui/patterns/fixtures'
import { en } from '@kvirn-ui/i18n/en'
import { Address, Alert, DefinitionList, Heading, KvirnProvider, Link } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'
import contract from '../../../../../packages/patterns/src/places-and-contacts/address-and-visit/address-and-visit.a11y.md?raw'

// Patterns/Places and contacts/Address and visit (docs/design/storybook-patterns-t5.md S6).
// Story-only: shipped parts composed, so it has no pattern. No map and no embed (rule 7).

const description = `Get there, and know the building's access. A \`Heading\`, an [Address](?path=/docs/components-content-address--docs), one \`Link\` for directions in a map service the adopter names (a plain link out, no embed and no third-party request on load) and a [DefinitionList](?path=/docs/components-data-and-behaviour-definitionlist--docs) of access facts: entrance, parking for disabled people, hearing loop, lift and bus stop. State a fact as a statement; leave out a fact you cannot confirm. An entrance that is closed is said in an \`Alert.Warning\` before the facts, never by dimming a link.

## Parts and gaps

Parts used: \`Heading\`, \`Address\`, \`Link\`, \`DefinitionList\`, \`Alert.Warning\`. No gap.
`

const meta = {
  title: 'Patterns/Places and contacts/Address and visit',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Directions() {
  return (
    <p>
      <Link.Root href="https://maps.example/kvirnby-town-hall">
        Directions to Town Hall in Example Maps
      </Link.Root>
    </p>
  )
}

function AccessFacts({ facts = kvirnbyAccessFacts }: { facts?: typeof kvirnbyAccessFacts }) {
  return (
    <DefinitionList.Root>
      {facts.map((fact) => (
        <DefinitionList.Row key={fact.term}>
          <DefinitionList.Term>{fact.term}</DefinitionList.Term>
          <DefinitionList.Description>{fact.description}</DefinitionList.Description>
        </DefinitionList.Row>
      ))}
    </DefinitionList.Root>
  )
}

/** The address, a directions link and the access facts. */
export const Default: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-prose">
        <Heading as="h2" size="heading-3">
          Visit us
        </Heading>
        <Address>
          Town Hall
          <br />
          Main Street 1
          <br />
          123 45 Kvirnby
        </Address>
        <Directions />
        <Heading as="h3" size="heading-4">
          Access
        </Heading>
        <AccessFacts />
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2, name: 'Visit us' })).toBeVisible()
    await expect(canvas.getByRole('link', { name: /Directions to Town Hall/ })).toBeVisible()
    await expect(canvas.getByText('Hearing loop')).toBeVisible()
  },
}

/** No access facts known: the address and the link are enough. */
export const WithoutAccessFacts: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-prose">
        <Heading as="h2" size="heading-3">
          Visit us
        </Heading>
        <Address>
          Library
          <br />
          Station Road 4
          <br />
          123 45 Kvirnby
        </Address>
        <Directions />
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('dl')).toBeNull()
  },
}

/** The step-free entrance is closed: said in words before the facts, with the way round. */
export const EntranceClosed: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-prose">
        <Heading as="h2" size="heading-3">
          Visit us
        </Heading>
        <Alert.Warning>
          <Alert.Title as="p">Main entrance closed</Alert.Title>
          <Alert.Body>
            <p>
              The main entrance is closed until <time dateTime="2026-11-02">2 November</time> for
              repairs. Use the side entrance on Garden Lane, which is level and has an automatic
              door.
            </p>
          </Alert.Body>
        </Alert.Warning>
        <Address>
          Town Hall
          <br />
          Main Street 1
          <br />
          123 45 Kvirnby
        </Address>
        <Directions />
        <AccessFacts facts={kvirnbyAccessFacts.slice(1)} />
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Main entrance closed', { exact: false })).toBeVisible()
    await expect(canvas.queryByText('Entrance')).toBeNull()
  },
}

/** A long address wraps; it is never truncated. */
export const LongAddress: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-prose">
        <Heading as="h2" size="heading-3">
          Visit us
        </Heading>
        <Address>
          Kvirnby municipality, Department of Children and Education, Preschool Office
          <br />
          Hillside Preschool, Old Mill Road 128 B, Entrance C, 2nd floor
          <br />
          123 45 Kvirnby
        </Address>
        <Directions />
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/Entrance C, 2nd floor/)).toBeVisible()
  },
}

/** 320px: the long address wraps; nothing scrolls sideways. */
export const Narrow: Story = {
  ...LongAddress,
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

/** Tab reaches the directions link, the one focusable part; Shift+Tab leaves it. */
export const Keyboard: Story = {
  ...Default,
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: /Directions to Town Hall/ })
    await userEvent.tab()
    await expect(link).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect(link).not.toHaveFocus()
  },
}

/** Right to left: the address and the rows start at the right. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: the link is `LinkText` and the warning keeps its border. */
export const ForcedColors: Story = {
  ...EntranceClosed,
  globals: { forcedColors: 'active' },
}

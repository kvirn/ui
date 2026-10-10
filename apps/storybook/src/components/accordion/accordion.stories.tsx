import { Accordion } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/accordion/accordion.a11y.md?raw'
import guide from '../../../../../packages/react/src/accordion/accordion.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  CompactAccordion,
  EnglishAccordion,
  FinnishAccordion,
  FindableAccordion,
  KeyboardAccordion,
  ListAccordion,
  RegionPanels,
  SeveralOpen,
} from './accordion.fixture.tsx'

// Components/Accordion: a list of disclosures with headings (APG Accordion, contract:
// accordion.a11y.md), styled by @kvirn-ui/theme/theme.css. Accordion has no library strings: the
// questions and the answers are the story's own, in sv by default.

const description = usageGuide(guide)

const meta = {
  title: 'Components/Content/Accordion',
  component: Accordion.Root,
  args: { hiddenUntilFound: false },
  // Every prop of Accordion.Root in accordion.tsx. The props of the other parts (`level` on a
  // Heading, the options of an Item, `region` on a Panel) are in the API section below.
  argTypes: {
    hiddenUntilFound: {
      control: 'boolean',
      description:
        'The default for every item: a closed panel is `hidden="until-found"`, so find-in-page reveals it. An item can set its own. Default `false`.',
    },
    className: {
      control: 'text',
      description:
        'Your own classes, added to `kv-accordion`. `kv-compact` on a container makes the rows 32px from 64rem.',
    },
    as: {
      control: false,
      description: 'Another element for the Root (`ul`, `ol`) or an Item (`li`), as a string.',
    },
    ref: { control: false, description: 'The root’s `<div>`.' },
  },
  globals: { locale: 'sv' },
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
} satisfies Meta<typeof Accordion.Root>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The main example: three questions, each a heading with a button, under an `h2` of the page (so
 * level 3). Every trigger is a Tab stop, and more than one answer can be open. The one option of
 * the root is a control below.
 */
export const Default: Story = {
  render: (args) => (
    <Accordion.Root {...args}>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Hur ansöker jag om bygglov?</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>
            Du ansöker på <a href="/mina-sidor">Mina sidor</a>. Ha ritningar och en situationsplan
            till hands.
          </p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Vad kostar det?</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>Avgiften beror på byggnadens storlek. Vi räknar ut den när ansökan har kommit in.</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Hur länge tar handläggningen?</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>Du får besked inom tio veckor från att ansökan är komplett.</p>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  ),
  play: async ({ canvas, userEvent }) => {
    const headings = canvas.getAllByRole('heading', { level: 3 })
    await expect(headings).toHaveLength(3)
    const trigger = canvas.getByRole('button', { name: 'Vad kostar det?' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expectMinimumTargetSize(trigger)
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByText(/Avgiften beror/)).toBeVisible()
  },
}

/**
 * The fixture the keyboard tests drive: a button before, three triggers (the first open, with a
 * link) and a button after. Try the keys in the Keyboard section above: every trigger is a Tab
 * stop, Enter and Space toggle one item, and the arrow keys, Home and End do nothing here.
 */
export const Keyboard: Story = {
  parameters: showSource('accordion/accordion.fixture.tsx', 'KeyboardAccordion'),
  render: () => <KeyboardAccordion />,
  play: async ({ canvas, userEvent }) => {
    const first = canvas.getByRole('button', { name: 'Hur ansöker jag?' })
    first.focus()
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Logga in på Mina sidor' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Vad kostar det?' })).toHaveFocus()
  },
}

/** Independent items: two start open, and opening the third closes neither. */
export const SeveralOpenAtOnce: Story = {
  parameters: showSource('accordion/accordion.fixture.tsx', 'SeveralOpen'),
  render: () => <SeveralOpen />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Telefon' }))
    for (const name of ['Öppettider', 'Adress', 'Telefon']) {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute('aria-expanded', 'true')
    }
  },
}

/** `region` makes a panel a landmark named by its trigger. APG advises it for about six panels or fewer. */
export const Regions: Story = {
  parameters: showSource('accordion/accordion.fixture.tsx', 'RegionPanels'),
  render: () => <RegionPanels />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('region', { name: 'Sophämtning' })).toBeVisible()
  },
}

/**
 * `hiddenUntilFound` on the root: search the page for "återvinningscentralen" and a browser that
 * supports `hidden="until-found"` opens the answer on the match.
 */
export const FindInPage: Story = {
  parameters: showSource('accordion/accordion.fixture.tsx', 'FindableAccordion'),
  render: () => <FindableAccordion />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Var lämnar jag grovsopor?' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  },
}

/** A list through `as` (`ul` and `li`), with a disabled item that stays a Tab stop. */
export const AsAList: Story = {
  parameters: showSource('accordion/accordion.fixture.tsx', 'ListAccordion'),
  render: () => <ListAccordion />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2)
    await expect(canvas.getByRole('button', { name: 'Beslut' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  },
}

/** Long Finnish compounds wrap inside the trigger in a 320px column, and the chevron stays at the inline end. */
export const NarrowFinnishText: Story = {
  globals: { locale: 'fi' },
  parameters: showSource('accordion/accordion.fixture.tsx', 'FinnishAccordion'),
  render: () => (
    <div className="kv-story-narrow" data-testid="narrow">
      <FinnishAccordion />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /Rakennuslupahakemuksen/ })).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Inside `kv-compact` the rows are 32px high from 64rem, and every trigger is still at least 24 × 24 (2.5.8). */
export const CompactDensity: Story = {
  parameters: showSource('accordion/accordion.fixture.tsx', 'CompactAccordion'),
  render: () => <CompactAccordion />,
  play: async ({ canvas }) => {
    for (const trigger of canvas.getAllByRole('button')) {
      await expectMinimumTargetSize(trigger)
    }
  },
}

/** Right to left, in English: the text starts at the right and the chevrons are at the left. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('accordion/accordion.fixture.tsx', 'EnglishAccordion'),
  render: () => <EnglishAccordion />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'How do I apply?' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  },
}

/**
 * Forced colours: the hairlines are `CanvasText`, the chevrons are `currentColor` and the focus
 * ring is `Highlight`. The state is the shape of the chevron.
 */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: showSource('accordion/accordion.fixture.tsx', 'SeveralOpen'),
  render: () => <SeveralOpen />,
}

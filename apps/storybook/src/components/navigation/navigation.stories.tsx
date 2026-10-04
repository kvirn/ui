import { Icon, Link, Navigation } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/navigation/navigation.a11y.md?raw'
import guide from '../../../../../packages/react/src/navigation/navigation.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Navigation: the headless Navigation, styled by @kvirn-ui/theme/theme.css (design
// spec docs/design/navigation.md). navigation.e2e.ts runs its keyboard rows against Keyboard, and
// its axe, reflow and landmark checks against the other stories, so their play functions only read.
// Navigation has no library strings: the labels and links are the story's own, in sv by default.

// The Docs page opens with the package docs: how to use it, and how to build your own.
const description = usageGuide(guide)

const meta = {
  title: 'Components/Navigation',
  component: Navigation.Root,
  args: { label: 'Huvudmeny' },
  argTypes: {
    label: {
      control: 'text',
      description:
        'The navigation’s accessible name, set as `aria-label`: `Huvudmeny`. Required, or give `aria-labelledby` instead. A dev warning fires without a name, and when two navigations share one.',
    },
    className: {
      control: 'text',
      description:
        'Your own classes, added to `kv-navigation`. `kv-compact` makes the rows 32px for staff tools. The theme has no other modifier: the look comes from the parts.',
    },
    'aria-labelledby': {
      control: false,
      description:
        'The id of a visible heading that names the navigation. Preferred over `label` where a heading exists.',
    },
    render: {
      control: false,
      description: 'Another element. Root must stay a `<nav>`, or the landmark is gone.',
    },
    ref: { control: false, description: 'The rendered `<nav>`.' },
  },
  globals: { locale: 'sv' },
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
  decorators: [
    (Story) => (
      <div className="kv-story-surface">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Navigation.Root>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The main example: every part, two levels and the current page. `Navigation.List` inside a
 * `Navigation.Item` is the second level. `current="page"` on the Link marks the current page.
 */
export const Default: Story = {
  render: ({ label, className }) => (
    <Navigation.Root label={label} className={className}>
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="#start">Start</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#bygga-och-bo">Bygga och bo</Link.Root>
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#bygglov" current="page">
                Bygglov
              </Link.Root>
            </Navigation.Item>
            <Navigation.Item>
              <Link.Root href="#bygga-om">Bygga om</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#om-oss">Om oss</Link.Root>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  ),
  play: async ({ canvas }) => {
    const navigation = canvas.getByRole('navigation', { name: 'Huvudmeny' })
    await expect(within(navigation).getAllByRole('list')).toHaveLength(2)
    await expect(within(navigation).getByRole('link', { name: 'Bygglov' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(within(navigation).getByRole('link', { name: 'Start' })).not.toHaveAttribute(
      'aria-current',
    )
  },
}

/**
 * The fixture the keyboard tests drive: a link before the navigation, the navigation with a
 * nested list, and a link after it. Try the keys in the Keyboard section above: Tab and Shift+Tab
 * move through the links in DOM order, nested ones included, and Enter follows the focused one.
 * The arrow keys do nothing: it is a list of links, not a menu.
 */
export const Keyboard: Story = {
  render: ({ label }) => (
    <>
      <p>
        <Link.Root href="#innehall">Hoppa till innehållet</Link.Root>
      </p>
      <Navigation.Root label={label}>
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#start">Start</Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#bygga-och-bo">Bygga och bo</Link.Root>
            <Navigation.List>
              <Navigation.Item>
                <Link.Root href="#bygglov">Bygglov</Link.Root>
              </Navigation.Item>
            </Navigation.List>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#om-oss">Om oss</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
      <p>
        <Link.Root href="#kontakt">Kontakta oss</Link.Root>
      </p>
      <h2 id="innehall">Innehåll</h2>
      <h2 id="om-oss">Om oss</h2>
      <h2 id="kontakt">Kontakt</h2>
    </>
  ),
}

/**
 * Where a visible heading names the navigation, point `aria-labelledby` at it and leave `label`
 * out: the visible name and the accessible name are the same text.
 */
export const LabelledByHeading: Story = {
  args: { label: undefined },
  render: () => (
    <>
      <h2 id="avsnitt">I det här avsnittet</h2>
      <Navigation.Root aria-labelledby="avsnitt">
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#bygglov" current="page">
              Bygglov
            </Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#bygga-om">Bygga om</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
    </>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'I det här avsnittet' })).toBeVisible()
  },
}

/** Two navigations on a page each have their own name, so a screen reader's landmark list tells them apart. */
export const TwoNavigations: Story = {
  decorators: [
    (Story) => (
      <div style={{ display: 'grid', gap: '1rem' }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <Navigation.Root label="Huvudmeny">
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#start">Start</Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#bygga-och-bo">Bygga och bo</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
      <Navigation.Root label="Sidfot">
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#kontakt">Kontakt</Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#tillganglighet">Tillgänglighetsredogörelse</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
    </>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('navigation')).toHaveLength(2)
    await expect(canvas.getByRole('navigation', { name: 'Huvudmeny' })).toBeVisible()
    await expect(canvas.getByRole('navigation', { name: 'Sidfot' })).toBeVisible()
  },
}

/**
 * A service link keeps its own look inside a navigation: the item rules skip
 * `kv-link--service`. One per view.
 */
export const WithServiceLink: Story = {
  render: ({ label }) => (
    <Navigation.Root label={label}>
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="#start">Start</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#bygglov" current="page">
            Bygglov
          </Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#ansok" className="kv-link--service">
            <Link.Icon>
              <Icon name="arrow-forward" size={6} />
            </Link.Icon>
            Ansök om bygglov
          </Link.Root>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  ),
  play: async ({ canvas }) => {
    const service = canvas.getByRole('link', { name: 'Ansök om bygglov' })
    await expect(service).toHaveClass('kv-link--service')
    await expectMinimumTargetSize(service)
  },
}

/** `kv-compact` for staff tools: 32px rows, never under 24 × 24 (2.5.8). */
export const CompactDensity: Story = {
  args: { className: 'kv-compact' },
  render: ({ label, className }) => (
    <Navigation.Root label={label} className={className}>
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="#arenden" current="page">
            Ärenden
          </Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#kunder">Kunder</Link.Root>
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#nya-kunder">Nya kunder</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  ),
  play: async ({ canvas }) => {
    const links = canvas.getAllByRole('link')
    await expect(links).toHaveLength(3)
    for (const link of links) {
      await expectMinimumTargetSize(link)
    }
    await expect(links[0]).toHaveAttribute('aria-current', 'page')
  },
}

/** A long Finnish label wraps inside a narrow column instead of overflowing (1.4.10). */
export const LongFinnishText: Story = {
  args: { label: 'Päävalikko' },
  decorators: [
    (Story) => (
      <div className="kv-story-narrow" data-testid="narrow">
        <Story />
      </div>
    ),
  ],
  render: ({ label }) => (
    <Navigation.Root label={label} lang="fi">
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="#alku">Alku</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#rakentaminen">Rakentaminen ja asuminen</Link.Root>
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#rakennuslupa" current="page">
                Rakennus- ja toimenpidelupahakemuksen liitteet
              </Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'Päävalikko' })).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Right to left, in English: the current bar and the nested indent sit at the inline end. */
export const RTL: Story = {
  args: { label: 'Main menu' },
  globals: { dir: 'rtl', locale: 'en' },
  render: ({ label }) => (
    <Navigation.Root label={label}>
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="#start">Start</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#building">Building and living</Link.Root>
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#permit" current="page">
                Building permit
              </Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Building permit' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  },
}

/** The marker for forced colours. The e2e suite checks the real emulation. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: ({ label }) => (
    <Navigation.Root label={label}>
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="#start">Start</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#bygga-och-bo">Bygga och bo</Link.Root>
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#bygglov" current="page">
                Bygglov
              </Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  ),
}

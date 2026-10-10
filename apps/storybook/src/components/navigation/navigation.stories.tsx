import { Icon, Link, Navigation } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/navigation/navigation.a11y.md?raw'
import guide from '../../../../../packages/react/src/navigation/navigation.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties } from 'react'
import { expect, waitFor, within } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  AppRoot,
  CollapsedNavigation,
  FinnishHorizontalNavigation,
  GroupedNavigation,
  HorizontalNavigation,
  NavigationOrientations,
  RoutedNavigation,
  StaffNavigation,
  UnlistedPageNavigation,
} from './navigation.fixture.tsx'

// Components/Navigation: the headless Navigation, styled by @kvirn-ui/theme/theme.css (design
// specs docs/design/navigation.md and docs/design/navigation-link-options.md). Their play
// functions only read (FocusVisible tabs onto the link to check the ring). Navigation has no library strings: the labels and links are the
// story's own, in sv by default.

// The Docs page opens with the package docs: how to use it, and how to build your own.
const description = usageGuide(guide)

// Where a story sits is the preview and not part of the example, so it is set here and not in
// "Show code". `parameters.surface`: `sidebar` (the default) is a 15rem panel like the docs
// sidebar, `band` is a full-width header band for a horizontal bar, and `both` is a band that
// stacks a bar over a list. The Default story moves to the band when its className control is
// the horizontal class.
const stackedSurface: CSSProperties = { display: 'grid', gap: '2rem', justifyItems: 'start' }

function surfaceClassName(parameters: Record<string, unknown>, className: string | undefined) {
  const isBand =
    parameters['surface'] === 'band' ||
    parameters['surface'] === 'both' ||
    (className ?? '').includes('kv-navigation--horizontal')
  return isBand ? 'kv-story-surface kv-story-surface--wide' : 'kv-story-surface'
}

const meta = {
  title: 'Components/Navigation/Navigation',
  component: Navigation.Root,
  args: { label: 'Huvudmeny' },
  argTypes: {
    label: {
      control: 'text',
      description:
        'The navigation’s accessible name, set as `aria-label`: `Huvudmeny`. Required, or give `aria-labelledby` instead. A dev warning fires without a name, and when two navigations share one.',
    },
    className: {
      control: 'select',
      options: [undefined, 'kv-navigation--horizontal', 'kv-compact'],
      description:
        'Joins `kv-navigation`. The theme styles `kv-navigation--horizontal`, which lays the top level out as a row that wraps (one level: a nested list stays a column), and `kv-compact`, which makes the rows 32px from 64rem for staff tools. There is no `orientation` prop: the links are plain Tab stops, so the layout changes no keys.',
    },
    'aria-labelledby': {
      control: false,
      description:
        'The id of a visible heading that names the navigation. Preferred over `label` where a heading exists.',
    },
    ref: { control: false, description: 'The rendered `<nav>`.' },
  },
  globals: { locale: 'sv' },
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
  decorators: [
    (Story, { args, parameters }) => (
      <div
        className={surfaceClassName(parameters, args.className)}
        style={parameters['surface'] === 'both' ? stackedSurface : undefined}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Navigation.Root>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The main example: every part, two levels and the current page, as a vertical list. A
 * `Navigation.List` inside a `Navigation.Item` is the second level, and `current="page"` on the
 * Link marks the current page: the only link with `aria-current`, never an ancestor. The theme
 * draws the page as a solid fill and the ancestor Bygga och bo as the trail. Pick
 * `kv-navigation--horizontal` or `kv-compact` in the className control.
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
    const current = within(navigation).getByRole('link', { name: 'Bygglov' })
    await expect(current).toHaveAttribute('aria-current', 'page')
    await expect(current).toHaveAttribute('data-current', '')
    // The ancestor is the trail, which is only drawn: it has no aria-current.
    for (const name of ['Start', 'Bygga och bo', 'Bygga om', 'Om oss']) {
      const link = within(navigation).getByRole('link', { name })
      await expect(link).not.toHaveAttribute('aria-current')
      await expect(link).not.toHaveAttribute('data-current')
    }
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
 * `className="kv-navigation--horizontal"` on the root lays the top level out as a row that
 * wraps: a bar of plain links for a page header. It is a class and not a prop, because the links
 * are still plain Tab stops in DOM order and the arrow keys still do nothing. One level per bar:
 * a nested list stays a column under its item, so give a section's sub-links a second
 * `Navigation` with its own name. Flyouts and collapsing are NavigationMenu.
 */
export const Horizontal: Story = {
  parameters: {
    ...showSource('navigation/navigation.fixture.tsx', 'HorizontalNavigation'),
    surface: 'band',
  },
  render: () => <HorizontalNavigation />,
  play: async ({ canvas }) => {
    const navigation = canvas.getByRole('navigation', { name: 'Huvudmeny' })
    const links = within(navigation).getAllByRole('link')
    await expect(links).toHaveLength(5)
    // 2.5.8: every link in the row is at least 24 × 24 CSS px.
    for (const link of links) {
      await expectMinimumTargetSize(link)
    }
    await expect(within(navigation).getByRole('link', { name: 'Bygga och bo' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  },
}

/**
 * A staff tree four levels deep: the trail. The current page is a solid fill, and every ancestor
 * of it is the quiet fill in bold, so a user in a long CMS menu finds the section they are in
 * without counting indents. The theme finds the ancestors itself. Only the page has
 * `aria-current`: the trail is visual, and the nesting of the lists carries the hierarchy for
 * assistive technology.
 */
export const ActiveTrail: Story = {
  parameters: showSource('navigation/navigation.fixture.tsx', 'StaffNavigation'),
  render: () => <StaffNavigation />,
  play: async ({ canvas }) => {
    const navigation = canvas.getByRole('navigation', { name: 'Handläggning' })
    // Exactly one current link, and it is the page.
    await expect(navigation.querySelectorAll('[aria-current]')).toHaveLength(1)
    await expect(
      within(navigation).getByRole('link', { name: 'Under handläggning' }),
    ).toHaveAttribute('aria-current', 'page')
    // None of its ancestors has it.
    for (const name of ['Ärenden', 'Bygglov']) {
      await expect(within(navigation).getByRole('link', { name })).not.toHaveAttribute(
        'aria-current',
      )
    }
  },
}

/**
 * Collapse a group with `hidden`, never by unmounting it: its links leave the Tab sequence and
 * the accessibility tree, they stay in the DOM, and the default theme keeps the group collapsed.
 * The toggle that opens a group is yours. The page is inside the first collapsed group, so the
 * deepest item shown, Bygga och bo, carries `current`: a link inside a hidden group never does.
 */
export const CollapsedGroups: Story = {
  parameters: showSource('navigation/navigation.fixture.tsx', 'CollapsedNavigation'),
  render: () => <CollapsedNavigation />,
  play: async ({ canvas }) => {
    const navigation = canvas.getByRole('navigation', { name: 'Huvudmeny' })
    // Both groups are still in the DOM, and hidden: no one can reach their links.
    await expect(navigation.querySelectorAll('.kv-navigation-list[hidden] a')).toHaveLength(4)
    await expect(
      within(navigation).queryByRole('link', { name: 'Bygglov' }),
    ).not.toBeInTheDocument()
    // One current link, the deepest item shown.
    await expect(navigation.querySelectorAll('[aria-current]')).toHaveLength(1)
    await expect(within(navigation).getByRole('link', { name: 'Bygga och bo' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  },
}

/**
 * Group links under a `Navigation.Label` in the item that holds the list: the label names that
 * list for a screen reader ("Komponenter, list, 3 items"). It is plain text in `text-muted`, not a
 * heading and not a link, so it is no Tab stop and can't be mistaken for a link.
 */
export const GroupLabels: Story = {
  parameters: showSource('navigation/navigation.fixture.tsx', 'GroupedNavigation'),
  render: () => <GroupedNavigation />,
  play: async ({ canvas }) => {
    const navigation = canvas.getByRole('navigation', { name: 'Dokumentation' })
    const components = within(navigation).getByRole('list', { name: 'Komponenter' })
    await expect(within(components).getAllByRole('link')).toHaveLength(3)
    await expect(within(navigation).getByRole('list', { name: 'Grunder' })).toBeVisible()
    await expect(within(navigation).queryByRole('heading')).not.toBeInTheDocument()
    await expect(
      within(navigation).queryByRole('link', { name: 'Komponenter' }),
    ).not.toBeInTheDocument()
    await expect(navigation.querySelectorAll('.kv-navigation-label[tabindex]')).toHaveLength(0)
  },
}

/** A group label is long and Finnish at 320px: it wraps and the sidebar never scrolls sideways (1.4.10). */
export const LongFinnishGroupLabel: Story = {
  decorators: [
    (Story) => (
      <div className="kv-story-narrow" data-testid="narrow">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Navigation.Root label="Päävalikko" lang="fi">
      <Navigation.List>
        <Navigation.Item>
          <Navigation.Label>Rakentaminen, ympäristö ja kiinteistöasiat</Navigation.Label>
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#rakennuslupa">Rakennus- ja toimenpidelupahakemukset</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('list', { name: 'Rakentaminen, ympäristö ja kiinteistöasiat' }),
    ).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Group labels in right-to-left: the label's text starts at the right, lined up with the links. */
export const GroupLabelsRTL: Story = {
  globals: { dir: 'rtl' },
  parameters: showSource('navigation/navigation.fixture.tsx', 'GroupedNavigation'),
  render: () => <GroupedNavigation />,
}

/** Forced colours: the label is `CanvasText`, a plain label beside the links. */
export const GroupLabelsForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: showSource('navigation/navigation.fixture.tsx', 'GroupedNavigation'),
  render: () => <GroupedNavigation />,
}

/**
 * When the page the reader is on is not a menu item, such as a permit case, mark the deepest item
 * shown with `current`: it gives `aria-current="true"`, and the navigation still has exactly one
 * current link. Ancestors of a listed page never get it, and the trail above it is drawn by the
 * theme.
 */
export const PageNotInTheMenu: Story = {
  parameters: showSource('navigation/navigation.fixture.tsx', 'UnlistedPageNavigation'),
  render: () => <UnlistedPageNavigation />,
  play: async ({ canvas }) => {
    const navigation = canvas.getByRole('navigation', { name: 'Huvudmeny' })
    await expect(navigation.querySelectorAll('[aria-current]')).toHaveLength(1)
    await expect(within(navigation).getByRole('link', { name: 'Bygglov' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(
      within(navigation).getByRole('link', { name: 'Bygga och bo' }),
    ).not.toHaveAttribute('aria-current')
  },
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

/**
 * `kv-compact` for staff tools, on a list and on a bar: 32px rows from 64rem, never under
 * 24 × 24 (2.5.8). Put it on the root, or on any container around it.
 */
export const CompactDensity: Story = {
  parameters: { surface: 'both' },
  render: ({ label }) => (
    <>
      <Navigation.Root label={label} className="kv-compact">
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
      <Navigation.Root label="Verktyg" className="kv-compact kv-navigation--horizontal">
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#sok">Sök</Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#rapporter" current>
              Rapporter
            </Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#installningar">Inställningar</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
    </>
  ),
  play: async ({ canvas }) => {
    const links = canvas.getAllByRole('link')
    await expect(links).toHaveLength(6)
    for (const link of links) {
      await expectMinimumTargetSize(link)
    }
    await expect(canvas.getByRole('link', { name: 'Ärenden' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(canvas.getByRole('link', { name: 'Rapporter' })).toHaveAttribute(
      'aria-current',
      'true',
    )
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

/**
 * A long Finnish label in a horizontal bar: an item is as wide as its label up to the width of
 * the row, and a label wider than the row wraps inside its pill. The bar never scrolls sideways
 * (1.4.10).
 */
export const HorizontalLongFinnishText: Story = {
  globals: { locale: 'fi' },
  parameters: {
    ...showSource('navigation/navigation.fixture.tsx', 'FinnishHorizontalNavigation'),
    surface: 'band',
  },
  decorators: [
    (Story) => (
      <div className="kv-story-narrow" data-testid="narrow">
        <Story />
      </div>
    ),
  ],
  render: () => <FinnishHorizontalNavigation />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'Päävalikko' })).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
    for (const link of canvas.getAllByRole('link')) {
      await expectMinimumTargetSize(link)
    }
  },
}

/**
 * Keyboard focus shows a 2px ring (2.4.7, 2.4.13). Tab onto the current page: the ring sits
 * outside its fill, so the two are not mistaken for each other. Tab on, and the ring is on a
 * plain item.
 */
export const FocusVisible: Story = {
  render: ({ label }) => (
    <Navigation.Root label={label}>
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="#oversikt" current="page">
            Översikt
          </Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#ansok">Ansök</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#kontakta-oss">Kontakta oss</Link.Root>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  ),
  play: async ({ canvas, userEvent }) => {
    const current = canvas.getByRole('link', { name: 'Översikt' })
    await userEvent.tab()
    await expect(current).toHaveFocus()
    await waitFor(() => expect(current).toHaveAttribute('data-focus-visible'))
    // Focus Visible (2.4.7): a focused link shows an indicator.
    await expect(getComputedStyle(current).outlineStyle).not.toBe('none')
    const next = canvas.getByRole('link', { name: 'Ansök' })
    await userEvent.tab()
    await expect(next).toHaveFocus()
    await expect(getComputedStyle(next).outlineStyle).not.toBe('none')
  },
}

/**
 * Register your router's link once, on the provider: every Link in a navigation then renders it,
 * and the router handles the click. `current` comes from the router's pathname. The mock router
 * here stands in for your own (`NextLink`, TanStack Router's link).
 */
export const RouterLink: Story = {
  parameters: showSource('navigation/navigation.fixture.tsx', 'AppRoot', 'RoutedNavigation'),
  render: () => (
    <AppRoot>
      <RoutedNavigation />
    </AppRoot>
  ),
  play: async ({ canvas }) => {
    const start = canvas.getByRole('link', { name: 'Start' })
    await expect(start).toHaveAttribute('data-router-link', '')
    await expect(start).toHaveAttribute('aria-current', 'page')
  },
}

/**
 * Right to left, in English: a bar starts at the right, and the nested indent sits at the inline
 * start. The trail and the current page look the same as left to right.
 */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: {
    ...showSource('navigation/navigation.fixture.tsx', 'NavigationOrientations'),
    surface: 'both',
  },
  render: () => <NavigationOrientations locale="en" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'In progress' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(canvas.getByRole('link', { name: 'Building and living' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  },
}

/**
 * Forced colours, both orientations and the trail: the fills drop, the current item keeps a
 * straight `LinkText` bar (at the start of a list item, under the label in a bar), and the trail
 * keeps its weight. This story sets forced colours for review, and the display-mode sweep
 * (`E2E_BROWSERS=sweep`) checks it with real emulation.
 */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: {
    ...showSource('navigation/navigation.fixture.tsx', 'NavigationOrientations'),
    surface: 'both',
  },
  render: () => <NavigationOrientations locale="sv" />,
}

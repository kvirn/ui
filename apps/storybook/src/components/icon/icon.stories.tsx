import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { sv } from '@kvirn-ui/i18n/sv'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { allIcons } from '../../icons.tsx'
import { mapIcons } from '@kvirn-ui/map'
import { Icon, KvirnProvider, useFormat } from '@kvirn-ui/react'
import { richTextIconNames, ToolbarIcon } from '@kvirn-ui/rich-text'
import contract from '../../../../../packages/react/src/icon/icon.a11y.md?raw'
import guide from '../../../../../packages/react/src/icon/icon.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import { providerLocaleOf } from '../form/form.fixture.tsx'
import {
  ArrowButtons,
  ButtonsWithIcons,
  collectionDate,
  ColorVariants,
  DecorativeAndMeaningfulIcons,
  FixedIcons,
  HeroiconsOneOff,
  HeroiconsRegistered,
  IconFromDrawing,
  IconsInRunningText,
  IconsInTextButtonAndLink,
  isIconFixtureLocale,
  LibraryIcons,
  LongFinnishLabel,
  LucideOneOff,
  LucideRegistered,
  MirroredIcons,
  MoreButtons,
  OwnSvgIcons,
  RegistryEntries,
  ShadowIsland,
  SizeScaleIcons,
  StatusAlerts,
  textsFor,
  UnknownNameIcon,
  UnstyledIcons,
} from './icon.fixture.tsx'
import type { IconProps } from '@kvirn-ui/react'
import type { IconFixtureLocale } from './icon.fixture.tsx'

// Components/Icon: the headless Icon and the registered library icons, styled by @kvirn-ui/theme/theme.css
// (design spec docs/design/icon.md §6.6). The keyboard rows are proved in icon.test.tsx, so the
// play functions only read. RTL mirroring is proven by the `data-mirror-in-rtl` plays of RTL and
// LibraryIconsViaTheRegistry, and by icon.test.tsx.

const catalogs: Record<string, KvirnMessages> = { sv, fi, nb, nn, en }

const localeOf = (globals: Record<string, unknown>): IconFixtureLocale => {
  const locale = globals['locale']
  return isIconFixtureLocale(locale) ? locale : 'en'
}

/** The pixel sizes the controls offer. */
const sizeOptions = ['16', '20', '24', '32', '48', '96'] as const

/** The `name` form of `IconProps`, which the controls drive: `IconProps` is a union, so its args are `never`. */
type IconArgs = Omit<IconProps, 'name' | 'icon' | 'as' | 'children'> & {
  iconName: keyof typeof allIcons
}

const meta = {
  title: 'Components/Content/Icon',
  component: Icon,
  // `IconProps` is a union (`name`, `icon`, `as` or children): the controls drive the `name`
  // form, with every icon the Storybook registry holds (`apps/storybook/src/icons.tsx`).
  args: { iconName: 'search' },
  render: ({ iconName, ...args }) => <Icon name={iconName} {...args} />,
  argTypes: {
    // The `iconName` control below is shown as `name`: one row, with the picker.
    name: { control: false, table: { disable: true } },
    iconName: {
      name: 'name',
      control: 'select',
      options: Object.keys(allIcons),
      description:
        'The name of a registered icon from `@kvirn-ui/icons`. Without a registration, pass the drawing as `icon={search}` instead. Mirrors in RTL when the drawing is directional.',
    },
    icon: {
      control: false,
      description:
        'A drawing from `@kvirn-ui/icons` or a component, with no registration: `icon={search}`. With `name` too, a registered `name` wins and `icon` is the fallback.',
      table: { type: { summary: 'IconRegistryEntry' } },
    },
    size: {
      control: 'select',
      options: sizeOptions,
      description: 'The size in pixels, as a string. The theme sets it in rem with a class.',
    },
    label: {
      control: 'text',
      description:
        'Makes the icon an image with this name. Leave it out when text next to the icon says the same.',
    },
    variant: {
      control: 'select',
      options: [
        undefined,
        'primary',
        'secondary',
        'accent',
        'muted',
        'info',
        'success',
        'warning',
        'danger',
      ],
      description:
        'The colour, from the theme: adds `kv-icon--<variant>`. Without it the icon follows the text colour. It decorates and never replaces words or changes the name.',
    },
    className: {
      control: 'select',
      options: [undefined, 'kv-icon--stroke-1', 'kv-icon--stroke-1-5', 'kv-icon--stroke-2'],
      description:
        "Joins the component's own classes. The theme styles the stroke classes `kv-icon--stroke-1`, `kv-icon--stroke-1-5` and `kv-icon--stroke-2` (the library draws 1.5).",
    },
    mirrorInRtl: {
      control: 'boolean',
      description: 'Flips the icon in right-to-left text. Directional names set it themselves.',
    },
    as: {
      control: false,
      description:
        "Your own component for the `<svg>`. It gets Icon's props as plain props and must spread them.",
    },
    children: { control: false, description: 'Your own shapes, with Icon as the `<svg>`.' },
  } as NonNullable<Meta<IconArgs>['argTypes']>, // `icon`, `as` and `children` are documented but not controllable
  globals: { locale: 'en' },
  // Library strings follow the locale toolbar, like an app's provider would. A locale without
  // a translated fixture shows English, so its catalog is English too.
  decorators: [
    (Story, { globals }) => {
      const locale = localeOf(globals)
      const catalogLocale = textsFor(locale).isFallback ? 'en' : locale
      return (
        <KvirnProvider
          icons={allIcons}
          locale={providerLocaleOf(catalogLocale)}
          messages={catalogs[catalogLocale] ?? en}
        >
          <Story />
        </KvirnProvider>
      )
    },
  ],
  parameters: {
    a11yContract: contract,
    docs: {
      description: {
        component: `${usageGuide(guide)}\n\nThe full icon set is in [Icons/Library](?path=/docs/icons-library--docs).`,
      },
    },
  },
} satisfies Meta<IconArgs>

export default meta
type Story = StoryObj<IconArgs>

const hiddenCatalog = { docs: { canvas: { sourceState: 'none' } } } as const

/** The default size is `'20'`, 1.25rem. With no `label`, an icon is decorative: hidden from AT. */
export const Default: Story = {
  parameters: {
    docs: {
      source: {
        // The controls drive `iconName`, which isn't an Icon prop: print what an adopter writes.
        transform: (_code: string, { args }: { args: Record<string, unknown> }) => {
          const props = Object.entries(args)
            .filter(([key, value]) => key !== 'iconName' && value !== undefined && value !== '')
            .map(([key, value]) =>
              typeof value === 'string' ? ` ${key}="${value}"` : ` ${key}={${String(value)}}`,
            )
          return `<Icon name="${String(args['iconName'])}"${props.join('')} />`
        },
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const svg = canvasElement.querySelector('svg')
    await expect(svg).not.toBeNull()
    await expect(svg).toHaveAttribute('aria-hidden', 'true')
    await expect(svg).toHaveClass('kv-icon--size-20')
    await expect(canvas.queryByRole('img')).toBeNull()
  },
}

/**
 * No registration: pass the drawing from `@kvirn-ui/icons` as `icon`. Only this icon is bundled,
 * which is the route for code that renders outside a provider.
 */
export const WithoutRegistration: Story = {
  parameters: showSource('icon/icon.fixture.tsx', 'IconFromDrawing'),
  render: () => <IconFromDrawing />,
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg')
    await expect(svg).toHaveAttribute('aria-hidden', 'true')
    await expect(svg?.children.length).toBeGreaterThan(0)
  },
}

const mapIconNames = Object.keys(mapIcons) as (keyof typeof mapIcons)[]

/** Every icon the Map draws, read from `mapIcons`: the default marker pin and the control arrows. */
export const MapSet: Story = {
  parameters: hiddenCatalog,
  render: () => (
    <ul className="kv-story-icon-gallery">
      {mapIconNames.map((name) => (
        <li key={name} className="kv-story-icon-cell">
          <span className="kv-story-icon-row">
            <Icon icon={mapIcons[name]} size="16" />
            <Icon icon={mapIcons[name]} size="20" />
            <Icon icon={mapIcons[name]} size="24" />
          </span>
          <code>{name}</code>
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvas }) => {
    const cells = within(canvas.getByRole('list')).getAllByRole('listitem')
    await expect(cells).toHaveLength(mapIconNames.length)
    for (const [index, cell] of cells.entries()) {
      const name = mapIconNames[index]
      if (name === undefined) {
        continue
      }
      await expect(within(cell).getByText(name)).toBeVisible()
      const icons = cell.querySelectorAll('svg')
      await expect(icons).toHaveLength(3)
      for (const icon of icons) {
        await expect(icon).toHaveAttribute('aria-hidden', 'true')
      }
    }
    await expect(canvas.queryByRole('img')).toBeNull()
  },
}

/** Every icon the rich text editor draws, read from `richTextIconNames`, so none is missing. */
export const RichTextSet: Story = {
  parameters: hiddenCatalog,
  render: () => (
    <ul className="kv-story-icon-gallery">
      {richTextIconNames.map((name) => (
        <li key={name} className="kv-story-icon-cell">
          <span className="kv-story-icon-row">
            <ToolbarIcon name={name} />
          </span>
          <code>{name}</code>
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvas }) => {
    const cells = within(canvas.getByRole('list')).getAllByRole('listitem')
    await expect(cells).toHaveLength(richTextIconNames.length)
    for (const [index, cell] of cells.entries()) {
      const name = richTextIconNames[index]
      if (name === undefined) {
        continue
      }
      await expect(within(cell).getByText(name)).toBeVisible()
      await expect(cell.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    }
    await expect(canvas.queryByRole('img')).toBeNull()
  },
}

/** Text styles that show the capital-height guide: the icon is centred on the capitals. */
const textStyles = [
  { id: 'body', className: 'kv-story-text-body' },
  { id: 'body-large', className: 'kv-story-text-body-large' },
  { id: 'heading-2', className: 'kv-story-text-heading-2' },
] as const

const iconSizes = ['16', '20', '24', '32'] as const

function sizesBlock(locale: IconFixtureLocale, testId: string) {
  const { text } = textsFor(locale)
  const format = useFormat()
  return (
    <div className="kv-story-icon-sizes" data-testid={testId}>
      {textStyles.map((style) => (
        <section key={style.id} aria-label={style.id}>
          <p>
            <code>{style.id}</code>
          </p>
          {iconSizes.map((size) => (
            <p key={size} className={`kv-story-text-guide ${style.className}`}>
              <code>{size}</code> {text.text.collection(collectionDate(format))}{' '}
              <Icon name="calendar" size={size} />
            </p>
          ))}
        </section>
      ))}
    </div>
  )
}

const sizeScale = [
  '12',
  '14',
  '16',
  '20',
  '24',
  '28',
  '32',
  '40',
  '48',
  '56',
  '64',
  '80',
  '96',
] as const

/**
 * The size scale: `size` is the pixel size as a string, and the theme turns it into rem with
 * `kv-icon--size-<px>`. Another size is a class you add, never a prop.
 */
export const SizeScale: Story = {
  decorators: [
    (Story) => (
      <div className="kv-story-icon-row">
        <Story />
      </div>
    ),
  ],
  parameters: showSource('icon/icon.fixture.tsx', 'SizeScaleIcons'),
  render: () => <SizeScaleIcons />,
  play: async ({ canvasElement }) => {
    for (const size of sizeScale) {
      const icon = canvasElement.querySelector(`svg.kv-icon--size-${size}`)
      await expect(icon).not.toBeNull()
      await expect(icon).toHaveAttribute('width', `${Number(size) / 16}rem`)
      await expect(icon).not.toHaveAttribute('data-size')
    }
  },
}

/**
 * Sizes 16, 20, 24 and 32 inline in three text styles. A size is rem, so it follows the root font
 * size and not the text; the lines mark the baseline and the capital height. Below, the same at 200%.
 * A review aid for the alignment, so it has no code: the code is `<Icon name="calendar" size="16" />`.
 */
export const SizesNextToText: Story = {
  parameters: hiddenCatalog,
  render: (_args, { globals }) => (
    <>
      {sizesBlock(localeOf(globals), 'sizes-body')}
      <div className="kv-story-text-200 kv-story-section">
        {sizesBlock(localeOf(globals), 'sizes-200')}
      </div>
    </>
  ),
  play: async ({ canvas }) => {
    for (const testId of ['sizes-body', 'sizes-200']) {
      const block = canvas.getByTestId(testId)
      for (const size of iconSizes) {
        await expect(block.querySelectorAll(`svg.kv-icon--size-${size}`)).toHaveLength(3)
      }
    }
  },
}

/**
 * Icon at the start, at the end and alone, in secondary, primary, danger and disabled, in
 * comfortable and `kv-compact` density. An icon-only button is named by its `aria-label`, and
 * is square. A long Finnish label wraps next to its icon.
 */
export const InButtons: Story = {
  parameters: showSource(
    'icon/icon.fixture.tsx',
    'ButtonsWithIcons',
    'MoreButtons',
    'LongFinnishLabel',
  ),
  render: () => (
    <>
      <section className="kv-story-section" aria-label="comfortable">
        <ButtonsWithIcons />
      </section>
      <section className="kv-story-section kv-compact" aria-label="compact">
        <ButtonsWithIcons />
      </section>
      <section className="kv-story-section" aria-label="more">
        <MoreButtons />
      </section>
      <section className="kv-story-section" aria-label="narrow">
        <div className="kv-story-narrow">
          <LongFinnishLabel />
        </div>
      </section>
    </>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getAllByRole('button', { name: 'Close' })).toHaveLength(8)
    await expect(canvas.getAllByRole('button', { name: 'Search' })).toHaveLength(2)
    await expect(canvas.getAllByRole('button', { name: 'Copy' })).toHaveLength(2)
    for (const button of canvasElement.querySelectorAll('.kv-button--icon-only')) {
      // The name is the button's, and the icon is its only child, hidden from AT.
      await expect(button.children).toHaveLength(1)
      await expect(button.textContent).toBe('')
      await expect(button.querySelector(':scope > svg')).toHaveAttribute('aria-hidden', 'true')
    }
    // DOM order is start and end: the icon comes first in one button, last in the other.
    const addChild = canvas.getAllByRole('button', { name: 'Add another child' })[0]
    await expect(addChild?.firstElementChild).toBe(addChild?.querySelector('svg'))
    const next = canvas.getAllByRole('button', { name: 'Continue' })[0]
    await expect(next?.lastElementChild).toBe(next?.querySelector('svg'))
    await expect(
      // kv-lang-ok: Finnish locale story
      canvas.getAllByRole('button', { name: 'Lataa päätös PDF-tiedostona' }),
    ).toHaveLength(1)
  },
}

/**
 * The four status icons differ in shape (a square, a circle, a triangle and an octagon), and
 * each alert comes with its status in words. Then a greyscale copy: the shapes alone
 * carry the difference (1.4.1). The icon is the Alert's own.
 */
export const StatusWithText: Story = {
  parameters: showSource('icon/icon.fixture.tsx', 'StatusAlerts'),
  render: () => (
    <div className="kv-story-columns">
      <div className="kv-story-status-lines">
        <StatusAlerts />
      </div>
      <div className="kv-story-greyscale">
        <div className="kv-story-status-lines">
          <StatusAlerts />
        </div>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    for (const word of ['Good to know', 'Done', 'Warning', 'Error']) {
      // Two copies of each alert, and the status word is its title (after the alert's own
      // status prefix in the accessible name).
      await expect(
        canvas.getAllByRole('heading', { name: (name) => name.endsWith(word) }),
      ).toHaveLength(2)
    }
  },
}

/** Inherited colour, then each `variant` an icon may use (design spec §6.3). */
export const Colors: Story = {
  decorators: [
    (Story) => (
      <div className="kv-story-icon-row">
        <Story />
      </div>
    ),
  ],
  parameters: showSource('icon/icon.fixture.tsx', 'ColorVariants'),
  render: () => <ColorVariants />,
  play: async ({ canvasElement }) => {
    const icons = canvasElement.querySelectorAll('svg')
    await expect(icons).toHaveLength(6)
    await expect(icons[0]?.hasAttribute('color')).toBe(false)
    await expect(icons[0]?.getAttribute('class')).not.toMatch(/kv-icon--(muted|danger|primary)/)
    for (const [index, variant] of ['muted', 'danger', 'success', 'warning', 'primary'].entries()) {
      await expect(icons[index + 1]).toHaveClass(`kv-icon--${variant}`)
    }
  },
}

/**
 * A decorative icon sits next to text that says the same, and is hidden from AT. An icon with a
 * `label` is an image with that name, from your own translations.
 */
export const DecorativeAndMeaningful: Story = {
  decorators: [
    (Story) => (
      <div className="kv-story-columns">
        <Story />
      </div>
    ),
  ],
  parameters: showSource('icon/icon.fixture.tsx', 'DecorativeAndMeaningfulIcons'),
  render: () => <DecorativeAndMeaningfulIcons />,
  play: async ({ canvas, canvasElement }) => {
    const logo = canvas.getByRole('img', { name: 'Exempelby municipality' })
    await expect(logo).not.toHaveAttribute('aria-hidden')
    // Only the logo is in the accessibility tree: the calendar icon is hidden.
    await expect(canvas.getAllByRole('img')).toHaveLength(1)
    await expect(canvasElement.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(1)
  },
}

/**
 * `dir="rtl"`: the five directional icons flip, and a check, a search and a chevron down don't.
 * A Button with the arrow at its end, and a pagination-like row, point the right way.
 */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('icon/icon.fixture.tsx', 'MirroredIcons', 'FixedIcons', 'ArrowButtons'),
  render: () => (
    <>
      <div className="kv-story-columns">
        <section className="kv-story-icon-row" aria-label="mirrors">
          <MirroredIcons />
        </section>
        <section className="kv-story-icon-row" aria-label="stays">
          <FixedIcons />
        </section>
      </div>
      <div className="kv-story-section">
        <ArrowButtons />
      </div>
    </>
  ),
  play: async ({ canvas }) => {
    const mirrors = canvas.getByRole('region', { name: 'mirrors' }).querySelectorAll('svg')
    await expect(mirrors).toHaveLength(5)
    for (const icon of mirrors) {
      await expect(icon).toHaveAttribute('data-mirror-in-rtl')
    }
    for (const icon of canvas.getByRole('region', { name: 'stays' }).querySelectorAll('svg')) {
      await expect(icon).not.toHaveAttribute('data-mirror-in-rtl')
    }
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Next' })).toBeVisible()
  },
}

/**
 * The registry's `{ component, mirrorInRtl }` form sets the flip per name, `mirrorInRtl` on an
 * Icon wins over it, `iconDefaults.size` sizes every Icon below, and a nested provider adds icons
 * and changes only the fields it sets. The row is right to left.
 */
export const RegistryEntriesAndDefaults: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('icon/icon.fixture.tsx', 'RegistryEntries'),
  decorators: [
    (Story) => (
      <div className="kv-story-icon-row">
        <Story />
      </div>
    ),
  ],
  render: () => <RegistryEntries />,
  play: async ({ canvasElement }) => {
    const [entryNoFlip, instanceFlips, defaultSize, ownSize, nestedDelete, nestedKeepsParent] =
      canvasElement.querySelectorAll('svg')
    await expect(entryNoFlip).not.toHaveAttribute('data-mirror-in-rtl')
    await expect(instanceFlips).toHaveAttribute('data-mirror-in-rtl')
    // iconDefaults.size is '24' (1.5rem) until an icon sets its own.
    await expect(defaultSize).toHaveAttribute('width', '1.5rem')
    await expect(ownSize).toHaveAttribute('width', '1rem')
    // The nested provider adds `delete` and its stroke, keeps the parent's size and `search`.
    await expect(nestedDelete).toHaveAttribute('width', '1.5rem')
    await expect(nestedKeepsParent).toHaveAttribute('width', '1.5rem')
    await expect(nestedKeepsParent).toHaveClass('lucide-search')
  },
}

/**
 * A name that isn't registered, with no `icon`, renders an empty, decorative `<svg>` at the right size,
 * and warns once in development. In an app that registers its icon types, the type checker rejects the name. It
 * shows what a typo does (the layout holds, nothing is drawn), not code to copy.
 */
export const UnknownName: Story = {
  parameters: showSource('icon/icon.fixture.tsx', 'UnknownNameIcon'),
  render: () => <UnknownNameIcon />,
  play: async ({ canvasElement }) => {
    const icon = canvasElement.querySelector('svg')
    await expect(icon).toHaveAttribute('aria-hidden', 'true')
    await expect(icon).toHaveAttribute('width', '1.5rem')
    await expect(icon).toHaveAttribute('viewBox', '0 0 24 24')
    await expect(icon?.children).toHaveLength(0)
  },
}

/**
 * Icons in text, in a Button and in a Link, with a hard-coded red colour set on the plain icons, next to one with `variant="danger"`. In forced colours the system colour
 * wins, so they can't vanish.
 */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  decorators: [
    (Story) => (
      <div className="kv-story-hard-coded-icons">
        <style>
          {'.kv-story-hard-coded-icons .kv-icon:not(.kv-icon--danger) { color: #c00; }'}
        </style>
        <Story />
      </div>
    ),
  ],
  parameters: showSource('icon/icon.fixture.tsx', 'IconsInTextButtonAndLink'),
  render: () => <IconsInTextButtonAndLink />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getAllByRole('button')).toHaveLength(1)
    await expect(canvas.getAllByRole('link')).toHaveLength(1)
    await expect(canvasElement.querySelectorAll('svg.kv-icon--danger')).toHaveLength(3)
  },
}

/**
 * Your own SVG: `children` with a `viewBox`, and `as` with a component, with a label or
 * without. An SVGR-style component stands in for an imported `.svg` file.
 */
export const YourOwnSvg: Story = {
  decorators: [
    (Story) => (
      <div className="kv-story-icon-row">
        <Story />
      </div>
    ),
  ],
  parameters: showSource('icon/icon.fixture.tsx', 'OwnSvgIcons'),
  render: () => <OwnSvgIcons />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelectorAll('svg')).toHaveLength(3)
    // Only the one with a label is an image.
    await expect(canvas.getAllByRole('img')).toHaveLength(1)
    await expect(canvas.getByRole('img', { name: 'Exempelby municipality' })).toBeVisible()
  },
}

/**
 * Lucide: `pnpm add lucide-react`, then pass the component as `icon`. Icon's `size`,
 * `label` and `className` replace Lucide's own, so there is nothing to
 * repeat on the component. The second block registers the icons once with `defineIcons`, so
 * `<Icon name>` and every KvirnUI component that draws an icon use Lucide's.
 * Lucide draws its own 2 stroke. To add names of your own,
 * augment `Register` (see the Icon guide).
 */
export const Lucide: Story = {
  parameters: showSource('icon/icon.fixture.tsx', 'LucideOneOff', 'LucideRegistered'),
  render: () => (
    <>
      <div className="kv-story-icon-row">
        <LucideOneOff />
      </div>
      <LucideRegistered />
    </>
  ),
  play: async ({ canvas, canvasElement }) => {
    const icons = canvasElement.querySelectorAll('svg')
    await expect(icons).toHaveLength(5)
    // The one-off icons: Icon's size wins over Lucide's 24, and only the labelled one is an image.
    await expect(icons[0]).toHaveClass('lucide-search')
    await expect(icons[0]).toHaveAttribute('width', '1.25rem')
    await expect(icons[1]).toHaveAttribute('width', '1.5rem')
    await expect(icons[2]).toHaveAttribute('aria-hidden', 'true')
    await expect(canvas.getByRole('img', { name: 'Search' })).toBeVisible()
    // The registry: the same names, Lucide's drawings, decorative next to the button text.
    await expect(icons[3]).toHaveClass('lucide-search')
    await expect(icons[4]).toHaveClass('lucide-arrow-right')
    await expect(icons[4]).toHaveAttribute('data-mirror-in-rtl')
    await expect(canvas.getByRole('button', { name: 'Search' })).toBeVisible()
  },
}

/**
 * Heroicons: `pnpm add @heroicons/react`, then pass the component as `icon`. Heroicons marks
 * its icons `aria-hidden` itself: a `label` on Icon removes that and makes the icon an image.
 * The second block registers the icons once, so `<Icon name>` and every KvirnUI component that
 * draws an icon use Heroicons'. To add names of your own, augment `Register` (see the
 * Icon guide).
 */
export const Heroicons: Story = {
  parameters: showSource('icon/icon.fixture.tsx', 'HeroiconsOneOff', 'HeroiconsRegistered'),
  render: () => (
    <>
      <div className="kv-story-icon-row">
        <HeroiconsOneOff />
      </div>
      <HeroiconsRegistered />
    </>
  ),
  play: async ({ canvas, canvasElement }) => {
    const icons = canvasElement.querySelectorAll('svg')
    await expect(icons).toHaveLength(5)
    await expect(icons[0]).toHaveAttribute('data-slot', 'icon')
    await expect(icons[0]).toHaveAttribute('width', '1.25rem')
    await expect(icons[1]).toHaveAttribute('width', '1.5rem')
    await expect(icons[2]).toHaveAttribute('aria-hidden', 'true')
    // Heroicons' own aria-hidden is gone once there is a label.
    await expect(icons[0]).not.toHaveAttribute('aria-hidden')
    await expect(canvas.getByRole('img', { name: 'Search' })).toBeVisible()
    await expect(icons[3]).toHaveAttribute('data-slot', 'icon')
    await expect(icons[4]).toHaveAttribute('data-mirror-in-rtl')
    await expect(canvas.getByRole('button', { name: 'Search' })).toBeVisible()
  },
}

/**
 * Registered over the library's icons, another library's drawing replaces the name's icon for every
 * component, with the same `size` and `color`. A plain component carries no direction, so
 * `arrow-forward` is registered as `{ component, mirrorInRtl: true }` to keep flipping (design spec §4.2).
 * The first row is the library's own drawings, the second the registered ones.
 */
export const LibraryIconsViaTheRegistry: Story = {
  parameters: showSource('icon/icon.fixture.tsx', 'LibraryIcons'),
  render: () => (
    <>
      <section className="kv-story-icon-row" aria-label="Library">
        <Icon name="close" size="24" variant="primary" />
        <Icon name="delete" size="24" variant="primary" />
        <Icon name="warning" size="24" variant="primary" />
        <Icon name="arrow-forward" size="24" variant="primary" />
      </section>
      <section className="kv-story-icon-row kv-story-section" aria-label="Registered">
        <LibraryIcons />
      </section>
    </>
  ),
  play: async ({ canvas }) => {
    const library = canvas.getByRole('region', { name: 'Library' }).querySelectorAll('svg')
    const registered = canvas.getByRole('region', { name: 'Registered' }).querySelectorAll('svg')
    await expect(library).toHaveLength(4)
    for (const [index, libraryIcon] of library.entries()) {
      const registeredIcon = registered[index]
      // Same props, another drawing: the other library's shapes replace the library's.
      await expect(registeredIcon?.innerHTML).not.toBe(libraryIcon.innerHTML)
      // The libraries turn `color` into their own stroke or fill, so the size is the check.
      await expect(registeredIcon).toHaveAttribute('width', '1.5rem')
    }
    await expect(canvas.getByRole('img', { name: 'Exempelby municipality' })).toBeVisible()
    const button = canvas.getByRole('button', { name: 'Continue' })
    await expect(button.querySelector('svg')).toHaveAttribute('data-mirror-in-rtl')
  },
}

/** A calendar icon in running text, and a link to a new tab: the icon after the notice. */
export const InRunningTextAndLinks: Story = {
  decorators: [
    (Story) => (
      <div className="kv-story-narrow" data-testid="narrow">
        <Story />
      </div>
    ),
  ],
  parameters: showSource('icon/icon.fixture.tsx', 'IconsInRunningText'),
  render: () => <IconsInRunningText />,
  play: async ({ canvas }) => {
    // The new-tab notice is part of the link's name. The icon adds nothing.
    await expect(
      canvas.getByRole('link', { name: 'Read the guide (opens in a new tab)' }),
    ).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/**
 * Without the theme (here: in a shadow root, where `theme.css` doesn't reach): sizes still
 * work, because they are attributes. Colour, alignment, mirroring and the icon-only
 * square need the theme, or your own CSS for `[data-mirror-in-rtl]`.
 */
export const Unstyled: Story = {
  parameters: showSource('icon/icon.fixture.tsx', 'UnstyledIcons'),
  render: () => (
    <ShadowIsland dir="rtl">
      <UnstyledIcons />
    </ShadowIsland>
  ),
  play: async ({ canvasElement }) => {
    const root = [...canvasElement.querySelectorAll('div')].find(
      (host) => host.shadowRoot !== null,
    )?.shadowRoot
    await expect(root).not.toBeNull()
    const icons = root?.querySelectorAll('svg') ?? []
    await expect(icons).toHaveLength(5)
    // The size is an attribute, so it works without the theme.
    await expect(icons[0]).toHaveAttribute('width', '1rem')
    await expect(icons[1]).toHaveAttribute('width', '1.25rem')
    await expect(icons[2]).toHaveAttribute('width', '1.5rem')
    // The flag is there for your own CSS. Nothing flips it here.
    await expect(icons[3]).toHaveAttribute('data-mirror-in-rtl')
  },
}

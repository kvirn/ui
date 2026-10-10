import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { se } from '@kvirn-ui/i18n/se'
import { sv } from '@kvirn-ui/i18n/sv'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { Button, ButtonGroup, Icon, KvirnProvider, Link, useFormat } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/icon/icon.a11y.md?raw'
import guide from '../../../../../packages/react/src/icon/icon.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import { providerLocaleOf } from '../form/form.fixture.tsx'
import {
  builtInIconNames,
  buttonMatrix,
  collectionDate,
  HeroiconsOneOff,
  HeroiconsRegistered,
  isIconFixtureLocale,
  isMirroredIcon,
  LibraryIcons,
  LucideOneOff,
  LucideRegistered,
  mirroredIconNames,
  moreButtons,
  MunicipalityMark,
  SquareMark,
  narrowButtons,
  RegistryEntries,
  StatusAlerts,
  statusKinds,
  textsFor,
  UnstyledIcons,
} from './icon.fixture.tsx'
import type { BuiltInIconName, IconName, IconProps } from '@kvirn-ui/react'
import type { IconFixtureLocale } from './icon.fixture.tsx'

// Components/Icon: the headless Icon and the built-in set, styled by @kvirn-ui/theme/theme.css
// (design spec docs/design/icon.md §6.6). The keyboard rows are proved in icon.test.tsx, so the
// play functions only read. RTL mirroring is proven by the `data-mirror-in-rtl` plays of RTL and
// LibraryIconsViaTheRegistry, and by icon.test.tsx.

const catalogs: Record<string, KvirnMessages> = { sv, fi, nb, nn, se, en }

const localeOf = (globals: Record<string, unknown>): IconFixtureLocale => {
  const locale = globals['locale']
  return isIconFixtureLocale(locale) ? locale : 'sv'
}

/** Steps of the size scale, and the lengths a string gives, as written in the props table. */
const sizeOptions = [4, 5, 6, 8, 12, 32, '2em', '1.5rem', '20px'] as const

/** The `name` form of `IconProps`, which the controls drive: `IconProps` is a union, so its args are `never`. */
type IconArgs = Omit<IconProps, 'name' | 'icon' | 'as' | 'children'> & {
  name: BuiltInIconName
}

const meta = {
  title: 'Components/Content/Icon',
  component: Icon,
  // `IconProps` is a union (`name`, `icon`, `as` or children): the controls drive the `name`
  // form, the common one once icons are registered.
  args: { name: 'search' },
  argTypes: {
    name: {
      control: 'select',
      options: builtInIconNames,
      description: 'A built-in or registered icon. Mirrors in RTL when the name is directional.',
    },
    icon: {
      control: false,
      description: 'A component from an icon library: `icon={Search}`. It needs no registration.',
    },
    size: {
      control: 'select',
      options: sizeOptions,
      description: 'A step of the size scale (a step is a quarter of an `em`), or a CSS length.',
    },
    strokeWidth: {
      control: { type: 'number', min: 1, max: 3, step: 0.25 },
      description: 'The stroke width. Default: `iconDefaults.strokeWidth`, then 1.5.',
    },
    color: {
      control: 'text',
      description: 'Sets `currentColor`. A token works: `var(--kv-color-danger)`.',
    },
    fill: { control: 'text', description: 'The SVG `fill`. A token works.' },
    stroke: { control: 'text', description: 'The SVG `stroke`. A token works.' },
    label: {
      control: 'text',
      description:
        'Makes the icon an image with this name. Leave it out when text next to the icon says the same.',
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
  globals: { locale: 'sv' },
  // Library strings follow the locale toolbar, like an app's provider would. A locale without
  // a translated fixture shows English, so its catalog is English too.
  decorators: [
    (Story, { globals }) => {
      const locale = localeOf(globals)
      const catalogLocale = textsFor(locale).lang === 'en' ? 'en' : locale
      return (
        <KvirnProvider
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
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<IconArgs>

export default meta
type Story = StoryObj<IconArgs>

const iconNamed = (name: string): string => `icon-${name}`

/** The default size is step 5, 1.25em. With no `label`, an icon is decorative: hidden from AT. */
export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    const svg = canvasElement.querySelector('svg')
    await expect(svg).not.toBeNull()
    await expect(svg).toHaveAttribute('aria-hidden', 'true')
    await expect(svg).toHaveAttribute('data-size', '5')
    await expect(canvas.queryByRole('img')).toBeNull()
  },
}

/**
 * Every built-in icon, read from the package's own set, so none is missing: its name as text,
 * the drawing at sizes 4, 5 and 6, and whether it flips in right-to-left text (the five
 * directional ones do). The drawings are decorative, and the name is what a screen reader reads.
 */
export const BuiltInSet: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <ul className="kv-story-icon-gallery" lang={lang}>
        {builtInIconNames.map((name) => (
          <li key={name} className="kv-story-icon-cell" data-testid={iconNamed(name)}>
            <span className="kv-story-icon-row">
              <Icon name={name} size={4} />
              <Icon name={name} size={5} />
              <Icon name={name} size={6} />
            </span>
            <code>{name}</code>
            <span>{isMirroredIcon(name) ? text.gallery.mirrors : text.gallery.doesNotMirror}</span>
          </li>
        ))}
      </ul>
    )
  },
  play: async ({ canvas }) => {
    const { text } = textsFor('sv')
    const cells = within(canvas.getByRole('list')).getAllByRole('listitem')
    await expect(cells).toHaveLength(builtInIconNames.length)
    for (const [index, cell] of cells.entries()) {
      const name = builtInIconNames[index]
      if (name === undefined) {
        continue
      }
      // The name is the text, and the three drawings are decorative.
      await expect(within(cell).getByText(name)).toBeVisible()
      await expect(
        within(cell).getByText(
          isMirroredIcon(name) ? text.gallery.mirrors : text.gallery.doesNotMirror,
        ),
      ).toBeVisible()
      const icons = cell.querySelectorAll('svg')
      await expect(icons).toHaveLength(3)
      for (const icon of icons) {
        await expect(icon).toHaveAttribute('aria-hidden', 'true')
        await expect(icon.hasAttribute('data-mirror-in-rtl')).toBe(isMirroredIcon(name))
      }
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

const iconSizes = [4, 5, 6, 8] as const

function sizesBlock(locale: IconFixtureLocale, testId: string) {
  const { text, lang } = textsFor(locale)
  const format = useFormat()
  return (
    <div className="kv-story-icon-sizes" data-testid={testId} lang={lang}>
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
  0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 12, 16, 20, 24, 32, 48, 64,
] as const

/** String sizes are CSS lengths, not steps: `'48px'` is 48 pixels, and `'2rem'` ignores the text size. */
const sizeLengths = ['20px', '1.5rem', '48px'] as const

/**
 * The size scale of Tailwind's `size-*`: a step is a quarter of an `em`, so `4` is 1em. A string
 * is a CSS length instead (`'48px'`, `'1.5rem'`), and a bare number is never pixels.
 */
export const SizeScale: Story = {
  render: () => (
    <ul className="kv-story-inline-list">
      {sizeScale.map((size) => (
        <li key={size} className="kv-story-icon-row">
          <Icon name="info" size={size} />
          <code>{size}</code>
        </li>
      ))}
      {sizeLengths.map((size) => (
        <li key={size} className="kv-story-icon-row">
          <Icon name="info" size={size} />
          <code>{`'${size}'`}</code>
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('svg[data-size]')).toHaveLength(sizeScale.length)
    // A length has no step, and is the svg's width and height as written.
    for (const size of sizeLengths) {
      const icon = canvasElement.querySelector(`svg[width="${size}"]`)
      await expect(icon).not.toBeNull()
      await expect(icon).toHaveAttribute('height', size)
      await expect(icon).not.toHaveAttribute('data-size')
    }
  },
}

/**
 * Sizes 4, 5, 6 and 8 inline in three text styles. A step is `em` (step × 0.25em), so it grows
 * with the text; the lines mark the baseline and the capital height. Below, the same at 200%.
 */
export const SizesNextToText: Story = {
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
        await expect(block.querySelectorAll(`svg[data-size="${size}"]`)).toHaveLength(3)
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
  render: (_args, { globals }) => {
    const locale = localeOf(globals)
    return (
      <>
        <section className="kv-story-section" aria-label="kv-button">
          {buttonMatrix(locale)}
        </section>
        <section className="kv-story-section kv-compact" aria-label="kv-compact">
          {buttonMatrix(locale)}
        </section>
        <section className="kv-story-section" aria-label="more">
          {moreButtons(locale)}
        </section>
        <section className="kv-story-section" aria-label="kv-button-group">
          {narrowButtons()}
        </section>
      </>
    )
  },
  play: async ({ canvas, canvasElement }) => {
    const { text } = textsFor('sv')
    // Four groups in two densities.
    const closeButtons = canvas.getAllByRole('button', { name: text.button.close })
    await expect(closeButtons).toHaveLength(8)
    await expect(canvas.getAllByRole('button', { name: text.button.search })).toHaveLength(8)
    for (const button of canvasElement.querySelectorAll('.kv-button--icon-only')) {
      // The name is the button's, and the icon is its only child, hidden from AT.
      await expect(button.children).toHaveLength(1)
      await expect(button.textContent).toBe('')
      await expect(button.querySelector(':scope > svg')).toHaveAttribute('aria-hidden', 'true')
    }
    // DOM order is start and end: the icon comes first in one button, last in the other.
    const addChild = canvas.getAllByRole('button', { name: text.button.addChild })[0]
    await expect(addChild?.firstElementChild).toBe(addChild?.querySelector('svg'))
    const next = canvas.getAllByRole('button', { name: text.button.continue })[0]
    await expect(next?.lastElementChild).toBe(next?.querySelector('svg'))
    await expect(
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
  render: (_args, { globals }) => {
    const locale = localeOf(globals)
    return (
      <div className="kv-story-columns">
        <StatusAlerts locale={locale} />
        <div className="kv-story-greyscale" data-testid="greyscale">
          <StatusAlerts locale={locale} />
        </div>
      </div>
    )
  },
  play: async ({ canvas }) => {
    const { text } = textsFor('sv')
    for (const status of statusKinds) {
      // Two copies of each alert, and the status word is its title (after the alert's own
      // status prefix in the accessible name).
      await expect(
        canvas.getAllByRole('heading', {
          name: (name) => name.endsWith(text.status[status].word),
        }),
      ).toHaveLength(2)
    }
  },
}

/** Inherited colour, then `color` set to each token an icon may use (design spec §6.3). */
export const Colors: Story = {
  render: () => (
    <ul className="kv-story-inline-list">
      <li className="kv-story-icon-row">
        <Icon name="info" size={6} />
        <code>inherited</code>
      </li>
      {(
        [
          'text-muted',
          'danger',
          'success',
          'warning',
          'primary',
        ] as const satisfies readonly string[]
      ).map((token) => (
        <li key={token} className="kv-story-icon-row">
          <Icon name="info" size={6} color={`var(--kv-color-${token})`} />
          <code>{token}</code>
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvasElement }) => {
    const icons = canvasElement.querySelectorAll('svg')
    await expect(icons).toHaveLength(6)
    await expect(icons[0]?.hasAttribute('color')).toBe(false)
    await expect(icons[2]).toHaveAttribute('color', 'var(--kv-color-danger)')
  },
}

/**
 * A token works in `color`, `fill` and `stroke`: each channel takes `var(--kv-color-danger)`.
 */
export const TokenChannels: Story = {
  render: () => (
    <ul className="kv-story-inline-list">
      <li className="kv-story-icon-row">
        <Icon name="info" size={6} color="var(--kv-color-danger)" />
        <code>color</code>
      </li>
      <li className="kv-story-icon-row">
        <Icon name="info" size={6} fill="var(--kv-color-danger)" />
        <code>fill</code>
      </li>
      <li className="kv-story-icon-row">
        <Icon name="info" size={6} stroke="var(--kv-color-danger)" />
        <code>stroke</code>
      </li>
    </ul>
  ),
  play: async ({ canvasElement }) => {
    const icons = canvasElement.querySelectorAll('svg')
    await expect(icons).toHaveLength(3)
    await expect(icons[0]).toHaveAttribute('color', 'var(--kv-color-danger)')
    await expect(icons[1]).toHaveAttribute('fill', 'var(--kv-color-danger)')
    await expect(icons[2]).toHaveAttribute('stroke', 'var(--kv-color-danger)')
  },
}

/**
 * A decorative icon sits next to text that says the same, and is hidden from AT. An icon with a
 * `label` is an image with that name, from your own translations.
 */
export const DecorativeAndMeaningful: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    const format = useFormat()
    return (
      <div className="kv-story-columns" lang={lang}>
        <div className="kv-story-panel">
          <p>
            <Icon name="calendar" /> {text.text.collection(collectionDate(format))}
          </p>
        </div>
        <div className="kv-story-panel">
          <p>
            <Icon as={MunicipalityMark} size={48} label={text.label.logo} />
          </p>
          <p>
            <output data-testid="accessible-name" />
          </p>
        </div>
      </div>
    )
  },
  play: async ({ canvas, canvasElement }) => {
    const { text } = textsFor('sv')
    const logo = canvas.getByRole('img', { name: text.label.logo })
    await expect(logo).not.toHaveAttribute('aria-hidden')
    // Only the logo is in the accessibility tree: the calendar icon is hidden.
    await expect(canvas.getAllByRole('img')).toHaveLength(1)
    await expect(canvasElement.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(1)
    // Print the name the tree gives it.
    const printout = canvas.getByTestId('accessible-name')
    printout.textContent = logo.getAttribute('aria-label')
    await expect(printout).toHaveTextContent(text.label.logo)
  },
}

const strokeWidths = [1, 1.5, 2] as const

/** `iconDefaults.strokeWidth` 1, 1.5 (the built-in default) and 2 on the full set at 16px. */
export const StrokeWidths: Story = {
  render: () => (
    <>
      {strokeWidths.map((strokeWidth) => (
        <section
          key={strokeWidth}
          className="kv-story-section"
          data-testid={`stroke-${strokeWidth}`}
        >
          <p>
            <code>iconDefaults={`{{ strokeWidth: ${strokeWidth} }}`}</code>
          </p>
          <KvirnProvider iconDefaults={{ strokeWidth }}>
            <div className="kv-story-icon-strip">
              {builtInIconNames.map((name) => (
                <Icon key={name} name={name} size={4} />
              ))}
            </div>
          </KvirnProvider>
        </section>
      ))}
    </>
  ),
  play: async ({ canvas }) => {
    for (const strokeWidth of strokeWidths) {
      const icons = canvas.getByTestId(`stroke-${strokeWidth}`).querySelectorAll('svg')
      await expect(icons).toHaveLength(builtInIconNames.length)
      for (const icon of icons) {
        await expect(icon).toHaveAttribute('stroke-width', String(strokeWidth))
      }
    }
  },
}

/**
 * `dir="rtl"`: the five directional icons flip, and a check, a search and a chevron down don't.
 * A Button with the arrow at its end, and a pagination-like row, point the right way.
 */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => {
    const { text } = textsFor('en')
    return (
      <>
        <div className="kv-story-columns">
          <ul className="kv-story-icon-strip" data-testid="mirrors">
            {mirroredIconNames.map((name) => (
              <li key={name} className="kv-story-icon-cell">
                <Icon name={name} size={6} />
                <code>{name}</code>
                <span>{text.gallery.mirrors}</span>
              </li>
            ))}
          </ul>
          <ul className="kv-story-icon-strip" data-testid="stays">
            {(['check', 'search', 'chevron-down'] as const).map((name) => (
              <li key={name} className="kv-story-icon-cell">
                <Icon name={name} size={6} />
                <code>{name}</code>
                <span>{text.gallery.doesNotMirror}</span>
              </li>
            ))}
          </ul>
        </div>
        <ButtonGroup className="kv-story-section">
          <Button className="kv-button--primary">
            {text.button.continue}
            <Icon name="arrow-forward" />
          </Button>
        </ButtonGroup>
        <nav className="kv-story-section kv-button-group" aria-label="Pagination">
          <Button>
            <Icon name="chevron-back" />
            {text.pagination.previous}
          </Button>
          <Button>
            {text.pagination.next}
            <Icon name="chevron-forward" />
          </Button>
        </nav>
      </>
    )
  },
  play: async ({ canvas }) => {
    const { text } = textsFor('en')
    const mirrors = canvas.getByTestId('mirrors').querySelectorAll('svg')
    await expect(mirrors).toHaveLength(mirroredIconNames.length)
    for (const icon of mirrors) {
      await expect(icon).toHaveAttribute('data-mirror-in-rtl')
    }
    for (const icon of canvas.getByTestId('stays').querySelectorAll('svg')) {
      await expect(icon).not.toHaveAttribute('data-mirror-in-rtl')
    }
    await expect(canvas.getByRole('button', { name: text.button.continue })).toBeVisible()
    await expect(canvas.getByRole('button', { name: text.pagination.next })).toBeVisible()
  },
}

/**
 * The registry's `{ component, mirrorInRtl }` form sets the flip per name, `mirrorInRtl` on an
 * Icon wins over it, `iconDefaults.size` sizes every Icon below, and a nested provider adds icons
 * and changes only the fields it sets. The row is right to left.
 */
export const RegistryEntriesAndDefaults: Story = {
  parameters: showSource('icon/icon.fixture.tsx', 'RegistryEntries'),
  render: (_args, { globals }) => <RegistryEntries locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const iconIn = (testId: string) => canvas.getByTestId(testId).querySelector('svg')
    await expect(iconIn('entry-says-no-flip')).not.toHaveAttribute('data-mirror-in-rtl')
    await expect(iconIn('instance-flips')).toHaveAttribute('data-mirror-in-rtl')
    // iconDefaults.size is 6 (1.5em) until an icon sets its own.
    await expect(iconIn('default-size')).toHaveAttribute('width', '1.5em')
    await expect(iconIn('own-size')).toHaveAttribute('width', '1em')
    // The nested provider adds `delete` and its stroke, keeps the parent's size and `search`.
    await expect(iconIn('nested-delete')).toHaveAttribute('stroke-width', '2')
    await expect(iconIn('nested-delete')).toHaveAttribute('width', '1.5em')
    await expect(iconIn('nested-keeps-parent')).toHaveAttribute('width', '1.5em')
    await expect(iconIn('nested-keeps-parent')).toHaveClass('lucide-search')
  },
}

/**
 * A name that isn't built in or registered renders an empty, decorative `<svg>` at the right size,
 * and warns once in development. The type checker rejects the name, so this story casts it: it
 * shows what a typo does (the layout holds, nothing is drawn), not code to copy.
 */
export const UnknownName: Story = {
  render: () => (
    <p>
      Spara <Icon name={'delte' as IconName} size={6} />
    </p>
  ),
  play: async ({ canvasElement }) => {
    const icon = canvasElement.querySelector('svg')
    await expect(icon).toHaveAttribute('aria-hidden', 'true')
    await expect(icon).toHaveAttribute('width', '1.5em')
    await expect(icon).toHaveAttribute('viewBox', '0 0 24 24')
    await expect(icon?.children).toHaveLength(0)
  },
}

/** Colours that a theme would otherwise leave to the author: hard-coded and from a token. */
const hardCodedRed = '#c00'

/**
 * Icons with `color`, `fill` and `stroke` set to a hard-coded red, and to a token, in text, in
 * a Button and in a Link. In forced colours the theme turns them into the system colour, so
 * they can't vanish.
 */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    const colorProps = [
      ['color', { color: hardCodedRed }],
      ['fill', { fill: hardCodedRed }],
      ['stroke', { stroke: hardCodedRed }],
      ['token', { color: 'var(--kv-color-danger)' }],
    ] as const
    return (
      <div lang={lang} data-testid="forced">
        {colorProps.map(([prop, iconProps]) => (
          <div
            key={prop}
            className="kv-story-section kv-story-icon-row"
            data-testid={`forced-${prop}`}
          >
            <code>{prop}</code>
            <p>
              <Icon name="warning" {...iconProps} /> {text.status.warning.word}
            </p>
            <Button>
              <Icon name="add" {...iconProps} />
              {text.button.addChild}
            </Button>
            <Link.Root href="#guide">
              <Icon name="external" {...iconProps} /> {text.text.guide}
            </Link.Root>
          </div>
        ))}
      </div>
    )
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('button')).toHaveLength(4)
    await expect(canvas.getAllByRole('link')).toHaveLength(4)
  },
}

/**
 * Your own SVG: `children` with a `viewBox`, and `as` with a component, with a label or
 * without. An SVGR-style component stands in for an imported `.svg` file.
 */
export const YourOwnSvg: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <ul className="kv-story-inline-list" lang={lang}>
        <li>
          <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" size={6} strokeWidth={1.5}>
            <path d="M5 12h14M12 5v14" />
          </Icon>
        </li>
        <li>
          <Icon as={MunicipalityMark} size={6} label={text.label.logo} />
        </li>
        <li>
          <Icon as={SquareMark} size={6} />
        </li>
      </ul>
    )
  },
  play: async ({ canvas, canvasElement }) => {
    const { text } = textsFor('sv')
    await expect(canvasElement.querySelectorAll('svg')).toHaveLength(3)
    // Only the one with a label is an image.
    await expect(canvas.getAllByRole('img')).toHaveLength(1)
    await expect(canvas.getByRole('img', { name: text.label.logo })).toBeVisible()
  },
}

/**
 * Lucide: `pnpm add lucide-react`, then pass the component as `icon`. Icon's `size`, `color`,
 * `strokeWidth`, `label` and `className` replace Lucide's own, so there is nothing to
 * repeat on the component. The second block registers the icons once with `defineIcons`, so
 * `<Icon name>` and every KvirnUI component that draws a built-in icon use Lucide's.
 * Library defaults such as Lucide's 2 stroke go in `iconDefaults`. To add names of your own,
 * augment `Register` (see the Icon guide).
 */
export const Lucide: Story = {
  parameters: showSource('icon/icon.fixture.tsx', 'LucideOneOff', 'LucideRegistered'),
  render: (_args, { globals }) => (
    <>
      <LucideOneOff locale={localeOf(globals)} />
      <LucideRegistered locale={localeOf(globals)} />
    </>
  ),
  play: async ({ canvas, canvasElement }) => {
    const { text } = textsFor('sv')
    const icons = canvasElement.querySelectorAll('svg')
    await expect(icons).toHaveLength(5)
    // The one-off icons: Icon's size wins over Lucide's 24, and only the labelled one is an image.
    await expect(icons[0]).toHaveClass('lucide-search')
    await expect(icons[0]).toHaveAttribute('width', '1.25em')
    await expect(icons[1]).toHaveAttribute('width', '1.5em')
    await expect(icons[2]).toHaveAttribute('aria-hidden', 'true')
    await expect(canvas.getByRole('img', { name: text.button.search })).toBeVisible()
    // The registry: the same names, Lucide's drawings, decorative next to the button text.
    await expect(icons[3]).toHaveClass('lucide-search')
    await expect(icons[4]).toHaveClass('lucide-arrow-right')
    await expect(icons[4]).toHaveAttribute('data-mirror-in-rtl')
    await expect(canvas.getByRole('button', { name: text.button.search })).toBeVisible()
  },
}

/**
 * Heroicons: `pnpm add @heroicons/react`, then pass the component as `icon`. Heroicons marks
 * its icons `aria-hidden` itself: a `label` on Icon removes that and makes the icon an image.
 * The second block registers the icons once, so `<Icon name>` and every KvirnUI component that
 * draws a built-in icon use Heroicons'. To add names of your own, augment `Register` (see the
 * Icon guide).
 */
export const Heroicons: Story = {
  parameters: showSource('icon/icon.fixture.tsx', 'HeroiconsOneOff', 'HeroiconsRegistered'),
  render: (_args, { globals }) => (
    <>
      <HeroiconsOneOff locale={localeOf(globals)} />
      <HeroiconsRegistered locale={localeOf(globals)} />
    </>
  ),
  play: async ({ canvas, canvasElement }) => {
    const { text } = textsFor('sv')
    const icons = canvasElement.querySelectorAll('svg')
    await expect(icons).toHaveLength(5)
    await expect(icons[0]).toHaveAttribute('data-slot', 'icon')
    await expect(icons[0]).toHaveAttribute('width', '1.25em')
    await expect(icons[1]).toHaveAttribute('width', '1.5em')
    await expect(icons[2]).toHaveAttribute('aria-hidden', 'true')
    // Heroicons' own aria-hidden is gone once there is a label.
    await expect(icons[0]).not.toHaveAttribute('aria-hidden')
    await expect(canvas.getByRole('img', { name: text.button.search })).toBeVisible()
    await expect(icons[3]).toHaveAttribute('data-slot', 'icon')
    await expect(icons[4]).toHaveAttribute('data-mirror-in-rtl')
    await expect(canvas.getByRole('button', { name: text.button.search })).toBeVisible()
  },
}

/**
 * Registered over the built-ins, a library's drawing replaces the built-in one for every
 * component, with the same `size` and `color`. A plain component under `arrow-forward` still
 * mirrors in right-to-left text, because mirroring belongs to the name (design spec §4.2).
 */
export const LibraryIconsViaTheRegistry: Story = {
  parameters: showSource('icon/icon.fixture.tsx', 'LibraryIcons'),
  render: (_args, { globals }) => <LibraryIcons locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    for (const name of ['close', 'delete', 'warning', 'arrow-forward']) {
      const builtIn = canvas.getByTestId(`built-in-${name}`).querySelector('svg')
      const registered = canvas.getByTestId(`registered-${name}`).querySelector('svg')
      // Same props, another drawing: the library's shapes replace the built-in ones.
      await expect(registered?.innerHTML).not.toBe(builtIn?.innerHTML)
      // The libraries turn `color` into their own stroke or fill, so the size is the check.
      await expect(registered).toHaveAttribute('width', '1.5em')
    }
    await expect(canvas.getByRole('img', { name: textsFor('sv').text.label.logo })).toBeVisible()
    await expect(canvas.getByTestId('overridden-arrow')).toHaveAttribute('data-mirror-in-rtl')
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
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    const format = useFormat()
    return (
      <>
        <p lang={lang}>
          <Icon name="calendar" size={4} /> {text.text.collection(collectionDate(format))}
        </p>
        <p lang={lang}>
          <Link.Root href="https://www.digg.se/" target="_blank">
            {text.text.guide} <Link.NewTabNotice /> <Icon name="external" size={4} />
          </Link.Root>
        </p>
      </>
    )
  },
  play: async ({ canvas }) => {
    const { text } = textsFor('sv')
    // The new-tab notice is part of the link's name. The icon adds nothing.
    await expect(
      canvas.getByRole('link', { name: `${text.text.guide} (öppnas i en ny flik)` }),
    ).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/**
 * Without the theme (here: in a shadow root, where `theme.css` doesn't reach): sizes and
 * colours still work, because they are attributes. Alignment, mirroring and the icon-only
 * square need the theme, or your own CSS for `[data-mirror-in-rtl]`.
 */
export const Unstyled: Story = {
  parameters: showSource('icon/icon.fixture.tsx', 'UnstyledIcons'),
  render: (_args, { globals }) => <UnstyledIcons locale={localeOf(globals)} />,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-testid="unstyled"]')?.shadowRoot
    await expect(root).not.toBeNull()
    const icons = root?.querySelectorAll('svg') ?? []
    await expect(icons).toHaveLength(5)
    // The size is an attribute, so it works without the theme.
    await expect(icons[0]).toHaveAttribute('width', '1em')
    await expect(icons[1]).toHaveAttribute('width', '1.25em')
    await expect(icons[2]).toHaveAttribute('color', 'var(--kv-color-success)')
    // The flag is there for your own CSS. Nothing flips it here.
    await expect(icons[3]).toHaveAttribute('data-mirror-in-rtl')
  },
}

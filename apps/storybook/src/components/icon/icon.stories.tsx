import { TrashIcon } from '@heroicons/react/24/outline'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { se } from '@kvirn-ui/i18n/se'
import { sv } from '@kvirn-ui/i18n/sv'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { Button, defineIcons, Icon, KvirnProvider, Link } from '@kvirn-ui/react'
import type { BuiltInIconName, IconName, IconProps } from '@kvirn-ui/react'
import { Warning as PhosphorWarning } from '@phosphor-icons/react'
import contract from '../../../../../packages/react/src/icon/icon.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowRight, X as LucideClose } from 'lucide-react'
import { expect, within } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  builtInIconNames,
  ButtonMatrix,
  CollectionDate,
  isIconFixtureLocale,
  isMirroredIcon,
  mirroredIconNames,
  MoreButtons,
  MunicipalityMark,
  NarrowButtons,
  ShadowIsland,
  StatusLines,
  statusKinds,
  textsFor,
} from './icon.fixture.tsx'
import type { IconFixtureLocale } from './icon.fixture.tsx'

// Components/Icon: the headless Icon and the built-in set, styled by @kvirn-ui/theme/theme.css
// (design spec docs/design/icon.md §6.6). icon.e2e.ts runs its keyboard
// row, forced-colours, reflow, RTL and text-resize checks against InButtons, ForcedColors, RTL,
// SizesNextToText and InRunningTextAndLinks, so their play functions only read.

const catalogs: Record<string, KvirnMessages> = { sv, fi, nb, nn, se, en }

const localeOf = (globals: Record<string, unknown>): IconFixtureLocale => {
  const locale = globals['locale']
  return isIconFixtureLocale(locale) ? locale : 'sv'
}

/** The sizes the steps and a pixel number give, as written in the props table. */
const sizeOptions = ['sm', 'md', 'lg', 16, 32, '2em', '1.5rem', '20px'] as const

/**
 * `IconProps` is a union (`name`, or `render` and children), and Storybook's args can't hold a
 * union. The controls are for the `name` form, the common one once icons are registered.
 */
type IconArgs = Omit<IconProps, 'name' | 'render' | 'children'> & { name: BuiltInIconName }

/** `Icon` for the controls and the Docs page: the same component, with plain args. */
function NamedIcon(args: IconArgs) {
  return <Icon {...args} />
}
NamedIcon.displayName = 'Icon'

const meta = {
  title: 'Components/Icon',
  component: NamedIcon,
  args: { name: 'search' },
  argTypes: {
    name: { control: 'select', options: builtInIconNames },
    size: { control: 'select', options: sizeOptions },
    strokeWidth: { control: { type: 'number', min: 1, max: 3, step: 0.25 } },
    color: {
      control: 'text',
      description: 'Sets `currentColor`. A token works: `var(--kv-color-danger)`.',
    },
    fill: { control: 'text' },
    stroke: { control: 'text' },
    label: {
      control: 'text',
      description:
        'Makes the icon an image with this name. Leave it out when text next to the icon says the same.',
    },
    mirrorInRtl: { control: 'boolean' },
  },
  globals: { locale: 'sv' },
  // Library strings follow the locale toolbar, like an app's provider would. A locale without
  // a translated fixture shows English, so its catalog is English too.
  decorators: [
    (Story, { globals }) => {
      const locale = localeOf(globals)
      const catalogLocale = textsFor(locale).lang === 'en' ? 'en' : locale
      return (
        <KvirnProvider locale={catalogLocale} messages={catalogs[catalogLocale] ?? en}>
          <Story />
        </KvirnProvider>
      )
    },
  ],
  parameters: { a11yContract: contract },
} satisfies Meta<IconArgs>

export default meta
type Story = StoryObj<typeof meta>

const iconNamed = (name: string): string => `icon-${name}`

/** The default size is `md`, 1.25em. With no `label`, an icon is decorative: hidden from AT. */
export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    const svg = canvasElement.querySelector('svg')
    await expect(svg).not.toBeNull()
    await expect(svg).toHaveAttribute('aria-hidden', 'true')
    await expect(svg).toHaveAttribute('data-size', 'md')
    await expect(canvas.queryByRole('img')).toBeNull()
  },
}

/** Every built-in icon at `sm`, `md` and `lg`, with the five that flip in right-to-left text. */
export const BuiltInSet: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <ul className="kv-story-icon-gallery" lang={lang}>
        {builtInIconNames.map((name) => (
          <li key={name} className="kv-story-icon-cell" data-testid={iconNamed(name)}>
            <span className="kv-story-icon-row">
              <Icon name={name} size="sm" />
              <Icon name={name} size="md" />
              <Icon name={name} size="lg" />
            </span>
            <code>{name}</code>
            {isMirroredIcon(name) ? <span>{text.gallery.mirrors}</span> : null}
          </li>
        ))}
      </ul>
    )
  },
  play: async ({ canvas }) => {
    const cells = within(canvas.getByRole('list')).getAllByRole('listitem')
    await expect(cells).toHaveLength(builtInIconNames.length)
    for (const [index, cell] of cells.entries()) {
      const name = builtInIconNames[index]
      if (name === undefined) {
        continue
      }
      // The name is the text, and the three drawings are decorative.
      await expect(within(cell).getByText(name)).toBeVisible()
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

const iconSizes = ['sm', 'md', 'lg', 32] as const

function SizesBlock({ locale, testId }: { locale: IconFixtureLocale; testId: string }) {
  const { text, lang, formatLocale } = textsFor(locale)
  return (
    <div className="kv-story-icon-sizes" data-testid={testId} lang={lang}>
      {textStyles.map((style) => (
        <section key={style.id} aria-label={style.id}>
          <p>
            <code>{style.id}</code>
          </p>
          {iconSizes.map((size) => (
            <p key={size} className={`kv-story-text-guide ${style.className}`}>
              <code>{size}</code>{' '}
              {text.text.collection(<CollectionDate formatLocale={formatLocale} />)}{' '}
              <Icon name="calendar" size={size} />
            </p>
          ))}
        </section>
      ))}
    </div>
  )
}

/**
 * `sm`, `md`, `lg` and `32` (px) inline in three text styles. The steps are `em`, so they grow
 * with the text; the lines mark the baseline and the capital height. Below, the same at 200%.
 */
export const SizesNextToText: Story = {
  render: (_args, { globals }) => (
    <>
      <SizesBlock locale={localeOf(globals)} testId="sizes-body" />
      <div className="kv-story-text-200 kv-story-section">
        <SizesBlock locale={localeOf(globals)} testId="sizes-200" />
      </div>
    </>
  ),
  play: async ({ canvas }) => {
    for (const testId of ['sizes-body', 'sizes-200']) {
      const block = canvas.getByTestId(testId)
      for (const size of ['sm', 'md', 'lg']) {
        await expect(block.querySelectorAll(`svg[data-size="${size}"]`)).toHaveLength(3)
      }
      // The pixel size is a number: no step, so no `data-size`.
      await expect(block.querySelectorAll('svg:not([data-size])')).toHaveLength(3)
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
          <ButtonMatrix locale={locale} />
        </section>
        <section className="kv-story-section kv-compact" aria-label="kv-compact">
          <ButtonMatrix locale={locale} />
        </section>
        <section className="kv-story-section" aria-label="more">
          <MoreButtons locale={locale} />
        </section>
        <section className="kv-story-section" aria-label="kv-button-group">
          <NarrowButtons />
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
 * each comes with its status in words. On the canvas and on the `-subtle` panels, then a
 * greyscale copy: the shapes alone carry the difference (1.4.1).
 */
export const StatusWithText: Story = {
  render: (_args, { globals }) => {
    const locale = localeOf(globals)
    return (
      <div className="kv-story-columns">
        <StatusLines locale={locale} />
        <StatusLines locale={locale} panels />
        <div className="kv-story-greyscale" data-testid="greyscale">
          <StatusLines locale={locale} panels />
        </div>
      </div>
    )
  },
  play: async ({ canvas }) => {
    const { text } = textsFor('sv')
    for (const status of statusKinds) {
      // Three copies of each line, and none of them has a name of its own to be read twice.
      await expect(canvas.getAllByText(`${text.status[status].word}:`)).toHaveLength(3)
    }
    await expect(canvas.queryByRole('img')).toBeNull()
  },
}

/** Inherited colour, then `color` set to each token an icon may use (design spec §6.3). */
export const Colors: Story = {
  render: () => (
    <ul className="kv-story-inline-list">
      <li className="kv-story-icon-row">
        <Icon name="info" size="lg" />
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
          <Icon name="info" size="lg" color={`var(--kv-color-${token})`} />
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
 * A decorative icon sits next to text that says the same, and is hidden from AT. An icon with a
 * `label` is an image with that name, from your own translations.
 */
export const DecorativeAndMeaningful: Story = {
  render: (_args, { globals }) => {
    const { text, lang, formatLocale } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-columns" lang={lang}>
        <div className="kv-story-panel">
          <p>
            <Icon name="calendar" />{' '}
            {text.text.collection(<CollectionDate formatLocale={formatLocale} />)}
          </p>
        </div>
        <div className="kv-story-panel">
          <p>
            <Icon render={<MunicipalityMark />} size={48} label={text.label.logo} />
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
                <Icon key={name} name={name} size="sm" />
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
                <Icon name={name} size="lg" />
                <code>{name}</code>
                <span>{text.gallery.mirrors}</span>
              </li>
            ))}
          </ul>
          <ul className="kv-story-icon-strip" data-testid="stays">
            {(['check', 'search', 'chevron-down'] as const).map((name) => (
              <li key={name} className="kv-story-icon-cell">
                <Icon name={name} size="lg" />
                <code>{name}</code>
                <span>{text.gallery.doesNotMirror}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="kv-story-section kv-button-group">
          <Button className="kv-button--primary">
            {text.button.continue}
            <Icon name="arrow-forward" />
          </Button>
        </div>
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

/** Colours that a theme would otherwise leave to the author: hard-coded and from a token. */
const hardCodedRed = '#c00'

/**
 * Icons with `color`, `fill` and `stroke` set to a hard-coded red, and to a token, in text, in
 * a Button and in a Link. In forced colours the theme turns them into the system colour, so
 * they can't vanish. The e2e suite checks it with real emulation.
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
 * Your own SVG: `children` with a `viewBox`, `render` with an element, and `render` with a
 * function. An SVGR-style component stands in for an imported `.svg` file.
 */
export const YourOwnSvg: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <ul className="kv-story-inline-list" lang={lang}>
        <li>
          <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" size="lg" strokeWidth={1.5}>
            <path d="M5 12h14M12 5v14" />
          </Icon>
        </li>
        <li>
          <Icon render={<MunicipalityMark />} size="lg" label={text.label.logo} />
        </li>
        <li>
          <Icon
            size="lg"
            render={(props) => (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
                <rect x="5" y="5" width="14" height="14" rx="2" />
              </svg>
            )}
          />
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
 * Registered over the built-ins, a library's drawing replaces the built-in one for every
 * component, with the same `size` and `color`. A plain component under `arrow-forward` still
 * mirrors in right-to-left text, because mirroring belongs to the name (design spec §4.2).
 */
const libraryIcons = defineIcons({
  close: LucideClose,
  delete: TrashIcon,
  warning: PhosphorWarning,
  'arrow-forward': ArrowRight,
  logo: MunicipalityMark,
})

/** `logo` isn't built in, and this story doesn't augment `Register` for the whole app. */
const logoName = 'logo' as IconName

const overridden = ['close', 'delete', 'warning', 'arrow-forward'] as const

export const LibraryIconsViaTheRegistry: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div lang={lang}>
        <ul className="kv-story-icon-strip" data-testid="registry">
          {overridden.map((name) => (
            <li key={name} className="kv-story-icon-cell">
              <span className="kv-story-icon-row" data-testid={`built-in-${name}`}>
                <Icon name={name} size="lg" color="var(--kv-color-primary)" />
                <code>{name}</code>
              </span>
              <KvirnProvider icons={libraryIcons}>
                <span className="kv-story-icon-row" data-testid={`registered-${name}`}>
                  <Icon name={name} size="lg" color="var(--kv-color-primary)" />
                  <code>{name}</code>
                </span>
              </KvirnProvider>
            </li>
          ))}
          <li className="kv-story-icon-cell">
            <KvirnProvider icons={libraryIcons}>
              <Icon name={logoName} size="lg" label={text.label.logo} />
            </KvirnProvider>
            <code>logo</code>
          </li>
        </ul>
        <div dir="rtl" className="kv-story-section">
          <KvirnProvider icons={libraryIcons}>
            <Button>
              {text.button.continue}
              <Icon name="arrow-forward" data-testid="overridden-arrow" />
            </Button>
          </KvirnProvider>
        </div>
      </div>
    )
  },
  play: async ({ canvas }) => {
    for (const name of overridden) {
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
  render: (_args, { globals }) => {
    const { text, lang, formatLocale } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-narrow" data-testid="narrow" lang={lang}>
        <p>
          <Icon name="calendar" size="sm" />{' '}
          {text.text.collection(<CollectionDate formatLocale={formatLocale} />)}
        </p>
        <p>
          <Link.Root href="https://www.digg.se/" target="_blank">
            {text.text.guide} <Link.NewTabNotice /> <Icon name="external" size="sm" />
          </Link.Root>
        </p>
      </div>
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
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <ShadowIsland data-testid="unstyled" dir="rtl" lang={lang}>
        <p>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Icon key={size} name="check" size={size} color="var(--kv-color-success)" />
          ))}
        </p>
        <p>
          <Icon name="arrow-forward" size="lg" />
        </p>
        <p>
          <Button aria-label={text.button.close}>
            <Icon name="close" />
          </Button>
        </p>
      </ShadowIsland>
    )
  },
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

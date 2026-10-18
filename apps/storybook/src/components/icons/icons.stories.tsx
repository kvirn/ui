import { allIcons, iconNames } from '@kvirn-ui/icons/all'
import { Button, Icon, KvirnProvider, Progress } from '@kvirn-ui/react'
import catalog from '../../../../../packages/icons/catalog.json'
import mirroredNames from '../../../../../packages/icons/mirror-in-rtl.json'
import contract from '../../../../../packages/react/src/icon/icon.a11y.md?raw'
import type { IconSize, IconVariant } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { showSource } from '../../docs-source.ts'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Content/Icon library: the drawn set in @kvirn-ui/icons, registered through the
// provider. The variant control is the Icon's own prop; the stroke control picks a class.

const sizeOptions = [
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
] as const satisfies readonly IconSize[]

const variants = [
  'primary',
  'secondary',
  'accent',
  'muted',
  'info',
  'success',
  'warning',
  'danger',
] as const satisfies readonly IconVariant[]

const variantOptions = ['none', ...variants] as const

const strokeOptions = ['1', '1.5', '2'] as const

const strokeClasses = {
  '1': 'kv-icon--stroke-1',
  '1.5': undefined,
  '2': 'kv-icon--stroke-2',
} as const

interface IconLibraryArgs {
  name: (typeof iconNames)[number]
  size: IconSize
  variant: (typeof variantOptions)[number]
  stroke: (typeof strokeOptions)[number]
  label: string
}

const styleProps = ({ variant, stroke }: Pick<IconLibraryArgs, 'variant' | 'stroke'>) => ({
  variant: variant === 'none' ? undefined : variant,
  className: strokeClasses[stroke],
})

// The galleries show the whole set, not an example, so they have no "Show code".
const hiddenCatalog = { docs: { canvas: { sourceState: 'none' } } } as const

const groups = catalog.categories.map((category) => ({
  ...category,
  icons: catalog.icons.filter(
    (icon) => icon.category === category.id && iconNames.includes(icon.name as never),
  ),
}))

// Storybook reads exports statically, so a category gets a story below by hand: AllIcons fails
// when a category with drawn icons has none (and the list names one with no drawn icon).
const categoriesWithStory = [
  'direction',
  'actions',
  'status',
  'interface',
  'text-editing',
  'tables-data',
  'documents',
  'communication',
  'people',
  'time',
  'maps-places',
  'money',
  'care-education',
  'mobility-environment',
  'safety-civic',
  'leisure-culture',
  'access-language',
  'social',
]

const meta = {
  title: 'Icons/Library',
  args: { name: iconNames[0], size: '20', variant: 'none', stroke: '1.5', label: '' },
  argTypes: {
    name: { control: 'select', options: iconNames, description: 'An icon from the library.' },
    size: {
      control: 'select',
      options: sizeOptions,
      description: 'The size in pixels, as a string.',
    },
    variant: {
      control: 'select',
      options: variantOptions,
      description:
        'The icon colour, from the theme. None follows the text colour. It never replaces words.',
    },
    stroke: {
      control: 'select',
      options: strokeOptions,
      description:
        'The line weight. 1.5 is the drawing and adds no class; 1 and 2 add `kv-icon--stroke-1` and `kv-icon--stroke-2`.',
    },
    label: {
      control: 'text',
      description:
        'Makes the icon an image with this name. Empty means decorative. A meaningful icon is at least 20px (icon.md §6.1): use size 20 or larger with a label.',
    },
  },
  decorators: [
    (Story) => (
      <KvirnProvider icons={allIcons}>
        <Story />
      </KvirnProvider>
    ),
  ],
  parameters: {
    a11yContract: contract,
    docs: {
      description: {
        component:
          'The drawn icon set of @kvirn-ui/icons, registered with `KvirnProvider icons={allIcons}`. Apps that name only the icons they use import them one by one from the package root instead. The 289 icons are drawn and checked by tests and agents. Recognition tests, a native-speaker review of the labels (sv, fi, nb, nn, en), checks with real assistive technology and a sensitivity review are not done yet. Copy a name from the galleries into `<Icon name="…" />`.',
      },
    },
  },
} satisfies Meta<IconLibraryArgs>

export default meta
type Story = StoryObj<IconLibraryArgs>

/** One icon. With no label it is decorative and hidden from assistive technology. */
export const Default: Story = {
  render: ({ name, size, variant, stroke, label }) => (
    <Icon
      name={name}
      size={size}
      label={label || undefined}
      variant={variant === 'none' ? undefined : variant}
      className={strokeClasses[stroke]}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const svg = canvasElement.querySelector('svg')
    await expect(svg).not.toBeNull()
    if (args.label) {
      await expect(svg).toHaveAttribute('aria-label', args.label)
    } else {
      await expect(svg).toHaveAttribute('aria-hidden', 'true')
    }
  },
}

/** Every icon in the library, each with its name as text. The drawings are decorative. */
export const AllIcons: Story = {
  parameters: hiddenCatalog,
  argTypes: { name: { control: false }, label: { control: false } },
  render: ({ size, variant, stroke }) => (
    <ul role="list" className="kv-story-icon-gallery">
      {iconNames.map((name) => (
        <li key={name} className="kv-story-icon-cell">
          <Icon name={name} size={size} {...styleProps({ variant, stroke })} />
          <code>{name}</code>
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvas }) => {
    const drawnNames = catalog.icons
      .filter((icon) => icon.status === 'drawn')
      .map((icon) => icon.name)
    await expect(drawnNames.filter((name) => !iconNames.includes(name as never))).toEqual([])
    await expect(iconNames.filter((name) => !drawnNames.includes(name))).toEqual([])
    for (const group of groups) {
      await expect(categoriesWithStory.includes(group.id) || group.icons.length === 0).toBe(true)
      await expect(!categoriesWithStory.includes(group.id) || group.icons.length > 0).toBe(true)
    }
    const cells = within(canvas.getByRole('list')).getAllByRole('listitem')
    await expect(cells).toHaveLength(iconNames.length)
    for (const [index, cell] of cells.entries()) {
      await expect(within(cell).getByText(iconNames[index] ?? '')).toBeVisible()
      await expect(cell.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    }
  },
}

const variantIcons: Partial<Record<(typeof variants)[number], string>> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'error',
}

/**
 * Every variant with its name as text: a colour never replaces words (1.4.1). The first item is
 * the default, which follows the text colour. Rows at stroke 1, 1.5 and 2.
 */
export const Variants: Story = {
  parameters: hiddenCatalog,
  argTypes: { name: { control: false }, variant: { control: false }, label: { control: false } },
  render: ({ name, size }) => (
    <div>
      {strokeOptions.map((stroke) => (
        <section key={stroke} aria-labelledby={`icon-variants-stroke-${stroke}`}>
          <h4 id={`icon-variants-stroke-${stroke}`}>Stroke {stroke}</h4>
          <ul role="list" className="kv-story-icon-gallery">
            {['none', ...variants].map((variant) => (
              <li key={variant} className="kv-story-icon-cell">
                <Icon
                  name={variantIcons[variant as keyof typeof variantIcons] ?? name}
                  size={size}
                  {...styleProps({ variant: variant as IconLibraryArgs['variant'], stroke })}
                />
                <code>{variant === 'none' ? 'default' : variant}</code>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    for (const stroke of strokeOptions) {
      const section = within(canvas.getByRole('region', { name: `Stroke ${stroke}` }))
      await expect(section.getAllByRole('listitem')).toHaveLength(variantOptions.length)
      await expect(section.getByText('default')).toBeVisible()
      for (const variant of variants) {
        await expect(section.getByText(variant)).toBeVisible()
      }
    }
    const svgs = canvasElement.querySelectorAll('svg')
    await expect(svgs).toHaveLength(variantOptions.length * strokeOptions.length)
    for (const svg of svgs) {
      await expect(svg).toHaveAttribute('aria-hidden', 'true')
    }
    for (const variant of variants) {
      await expect(canvasElement.querySelectorAll(`svg.kv-icon--${variant}`)).toHaveLength(
        strokeOptions.length,
      )
    }
  },
}

function categoryStory(categoryId: string): Story {
  const group = groups.find((candidate) => candidate.id === categoryId)!
  return {
    name: group.title,
    parameters: hiddenCatalog,
    argTypes: { name: { control: false }, label: { control: false } },
    render: ({ size, variant, stroke }) => (
      <section aria-labelledby={`icon-category-${group.id}`}>
        <h4 id={`icon-category-${group.id}`}>
          {group.title} ({group.icons.length})
        </h4>
        <p>{group.description}</p>
        {group.id === 'social' ? (
          <p>Use these marks at 20px and up, beside the network's name.</p>
        ) : null}
        <ul role="list" className="kv-story-icon-gallery">
          {group.icons.map((icon) => (
            <li key={icon.name} className="kv-story-icon-cell">
              <Icon name={icon.name} size={size} {...styleProps({ variant, stroke })} />
              <code>{icon.name}</code>
              {icon.mirrorInRtl ? <small>mirrors in RTL</small> : null}
            </li>
          ))}
        </ul>
      </section>
    ),
    play: async ({ canvas, canvasElement }) => {
      const heading = canvas.getByRole('heading', { level: 4 })
      await expect(heading).toHaveTextContent(`${group.title} (${group.icons.length})`)
      await expect(canvas.getAllByRole('listitem')).toHaveLength(group.icons.length)
      for (const icon of group.icons) {
        await expect(canvas.getByText(icon.name)).toBeVisible()
      }
      await expect(canvas.queryAllByText('mirrors in RTL')).toHaveLength(
        group.icons.filter((icon) => icon.mirrorInRtl).length,
      )
      for (const svg of canvasElement.querySelectorAll('svg')) {
        await expect(svg).toHaveAttribute('aria-hidden', 'true')
      }
    },
  }
}

export const DirectionAndMovement: Story = categoryStory('direction')
export const Actions: Story = categoryStory('actions')
export const StatusAndFeedback: Story = categoryStory('status')
export const InterfaceControls: Story = categoryStory('interface')
export const TextEditing: Story = categoryStory('text-editing')
export const TablesAndData: Story = categoryStory('tables-data')
export const DocumentsAndFiles: Story = categoryStory('documents')
export const Communication: Story = categoryStory('communication')
export const PeopleAndIdentity: Story = categoryStory('people')
export const TimeAndDate: Story = categoryStory('time')
export const MapsAndPlaces: Story = categoryStory('maps-places')
export const MoneyAndPayments: Story = categoryStory('money')
export const CareHealthAndEducation: Story = categoryStory('care-education')
export const MobilityAndEnvironment: Story = categoryStory('mobility-environment')
export const SafetyLawAndCivicLife: Story = categoryStory('safety-civic')
export const LeisureCultureAndCommunity: Story = categoryStory('leisure-culture')
export const LanguageAndAccess: Story = categoryStory('access-language')
export const SocialMedia: Story = categoryStory('social')

/** Right to left: the icons that point along the reading direction flip, the rest keep their drawing. */
export const Rtl: Story = {
  parameters: hiddenCatalog,
  globals: { dir: 'rtl', locale: 'en' },
  argTypes: { name: { control: false }, label: { control: false } },
  render: ({ size, variant, stroke }) => (
    <ul role="list" className="kv-story-icon-gallery">
      {mirroredNames.map((name) => (
        <li key={name} className="kv-story-icon-cell">
          <Icon name={name} size={size} {...styleProps({ variant, stroke })} />
          <code>{name}</code>
          <small>mirrors in RTL</small>
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvas, canvasElement }) => {
    const catalogMirrored = catalog.icons
      .filter((icon) => icon.mirrorInRtl)
      .map((icon) => icon.name)
    await expect([...mirroredNames].sort()).toEqual(catalogMirrored.sort())
    await expect(canvas.getAllByRole('listitem')).toHaveLength(mirroredNames.length)
    const svgs = [...canvasElement.querySelectorAll('svg')]
    await expect(svgs).toHaveLength(mirroredNames.length)
    for (const svg of svgs) {
      await expect(svg).toHaveAttribute('aria-hidden', 'true')
      await expect(svg).toHaveAttribute('data-mirror-in-rtl')
    }
  },
}

const spinner = 'spinner'

const expectDecorative = async (
  canvas: { queryByRole: (role: string) => unknown },
  svgs: Iterable<Element>,
) => {
  for (const svg of svgs) {
    await expect(svg).toHaveAttribute('aria-hidden', 'true')
  }
  await expect(canvas.queryByRole('progressbar')).toBeNull()
}

/**
 * The `spinner` icon is a still three-quarter arc. Add the class `kv-animate-spinner` for a loading
 * state and the arc crawls around the circle, only without `prefers-reduced-motion`; otherwise it
 * rests. It is decorative and `aria-hidden`, so words always sit beside it. The app, not the
 * library, offers a way to stop motion that lasts over 5 seconds (WCAG 2.2.2). Button, Progress and
 * toast use the CSS `kv-spinner`, not this icon.
 */
export const LoadingSpinner: Story = {
  parameters: hiddenCatalog,
  argTypes: { name: { control: false }, label: { control: false } },
  render: ({ size, variant, stroke }) => {
    const props = styleProps({ variant, stroke })
    const animated = [props.className, 'kv-animate-spinner'].filter(Boolean).join(' ')
    return (
      <div>
        <section aria-labelledby="spinner-sizes">
          <h4 id="spinner-sizes">Sizes</h4>
          <ul role="list" className="kv-story-icon-gallery">
            {sizeOptions.map((option) => (
              <li key={option} className="kv-story-icon-cell">
                <Icon name={spinner} size={option} variant={props.variant} className={animated} />
                <code>{option}px</code>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="spinner-still">
          <h4 id="spinner-still">At rest</h4>
          <p>Without the class: the rest state, and what reduced motion shows.</p>
          <ul role="list" className="kv-story-icon-gallery">
            {sizeOptions.map((option) => (
              <li key={option} className="kv-story-icon-cell">
                <Icon name={spinner} size={option} {...props} />
                <code>{option}px</code>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="spinner-context">
          <h4 id="spinner-context">In context</h4>
          <div className="kv-story-icon-cell">
            <div data-testid="progress-line">
              <Progress.Root label="Checking your details" delayMilliseconds={0}>
                <Icon name={spinner} size={size} variant={props.variant} className={animated} />
                <Progress.Label />
              </Progress.Root>
            </div>
            <div data-testid="busy-button">
              <Button busy>Send application</Button>
              <Progress.Root
                label="Sending your application"
                delayMilliseconds={0}
                announce={false}
              >
                <Progress.Label />
              </Progress.Root>
            </div>
          </div>
        </section>
        <section aria-labelledby="spinner-long-label">
          <h4 id="spinner-long-label">Long label</h4>
          <div className="kv-story-narrow" data-testid="narrow">
            <div className="kv-progress">
              <Icon name={spinner} size={size} variant={props.variant} className={animated} />
              <p className="kv-progress-label">
                Your application is being checked against the register and sent to the municipality,
                which can take a little while
              </p>
            </div>
          </div>
        </section>
      </div>
    )
  },
  play: async ({ canvas, canvasElement }) => {
    const sizes = within(canvas.getByRole('region', { name: 'Sizes' }))
    const rest = within(canvas.getByRole('region', { name: 'At rest' }))
    for (const size of sizeOptions) {
      await expect(sizes.getByText(`${size}px`)).toBeVisible()
      await expect(rest.getByText(`${size}px`)).toBeVisible()
    }
    const spinnerArc = 'path[pathLength="100"][stroke-dasharray="75 25"]'
    const spinnerIcons = [
      ...canvas.getByRole('region', { name: 'Sizes' }).querySelectorAll('svg'),
      ...canvas.getByRole('region', { name: 'At rest' }).querySelectorAll('svg'),
    ]
    await expect(spinnerIcons).toHaveLength(sizeOptions.length * 2)
    for (const svg of spinnerIcons) {
      await expect(svg).toHaveClass('kv-icon')
      await expect(svg.querySelector(`:scope > ${spinnerArc}`)).not.toBeNull()
    }

    const lineElement = canvas.getByTestId('progress-line')
    const line = within(lineElement)
    await expect(line.getByText('Checking your details')).toBeVisible()
    const progressRoot = lineElement.querySelector('.kv-progress')
    const lineIcon = lineElement.querySelector('svg.kv-icon')
    await expect(lineIcon?.parentElement).toBe(progressRoot)
    await expect(lineIcon?.querySelector(`:scope > ${spinnerArc}`)).not.toBeNull()
    await expect(
      lineIcon?.compareDocumentPosition(
        progressRoot?.querySelector('.kv-progress-label') as Node,
      ) ?? 0,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    await expect(lineElement.querySelector('.kv-spinner')).toBeNull()
    await expectDecorative(canvas, lineElement.querySelectorAll('svg'))

    const busy = canvas.getByTestId('busy-button')
    const button = within(busy).getByRole('button', { name: 'Send application' })
    await expect(button).toHaveAttribute('aria-disabled', 'true')
    await expect(within(busy).getAllByText('Sending your application')[0]).toBeVisible()
    await expect(busy.querySelectorAll('svg')).toHaveLength(0)
    await expect(busy.querySelectorAll('.kv-spinner')).toHaveLength(1)
    await expect(button.querySelector(':scope > .kv-spinner')).toHaveAttribute(
      'aria-hidden',
      'true',
    )

    const longLabel = canvas.getByRole('region', { name: 'Long label' })
    await expect(within(longLabel).getByText(/Your application is being checked/)).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))

    await expectDecorative(canvas, canvasElement.querySelectorAll('svg'))
  },
}

function LoadingSpinnerRtlExample() {
  return (
    <div className="kv-progress">
      <Icon name="spinner" size="20" className="kv-animate-spinner" />
      <p className="kv-progress-label">Loading</p>
    </div>
  )
}

/** Right to left: the icon stays at the inline start, on the right, and does not mirror. */
export const LoadingSpinnerRtl: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  argTypes: {
    name: { control: false },
    label: { control: false },
    size: { control: false },
    variant: { control: false },
    stroke: { control: false },
  },
  parameters: showSource('icons/icons.stories.tsx', 'LoadingSpinnerRtlExample'),
  render: () => <LoadingSpinnerRtlExample />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Loading')).toBeVisible()
    await expectDecorative(canvas, canvasElement.querySelectorAll('svg'))
  },
}

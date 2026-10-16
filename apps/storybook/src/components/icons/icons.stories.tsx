import { allIcons, iconNames } from '@kvirn-ui/icons/all'
import { Icon, KvirnProvider } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/icon/icon.a11y.md?raw'
import type { IconName, IconSize } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

// Components/Content/Icon library: the drawn set in @kvirn-ui/icons, registered through the
// provider. The Icon takes no colour prop, so the colour control sets the text colour of a
// story-only wrapper, as the Icon stories' Colors does.

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

const colorOptions = ['current', 'primary', 'text-muted', 'danger', 'success', 'warning'] as const

interface IconLibraryArgs {
  name: (typeof iconNames)[number]
  size: IconSize
  color: (typeof colorOptions)[number]
  label: string
}

const colorStyle = (color: IconLibraryArgs['color']) =>
  color === 'current' ? undefined : { color: `var(--kv-color-${color})` }

const meta = {
  title: 'Components/Content/Icon library',
  args: { name: iconNames[0], size: '20', color: 'current', label: '' },
  argTypes: {
    name: { control: 'select', options: iconNames, description: 'An icon from the library.' },
    size: {
      control: 'select',
      options: sizeOptions,
      description: 'The size in pixels, as a string.',
    },
    color: {
      control: 'select',
      options: colorOptions,
      description:
        'Story only: the text colour of a wrapper. The icon draws in the colour it inherits.',
    },
    label: {
      control: 'text',
      description: 'Makes the icon an image with this name. Empty means decorative.',
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
          'The drawn icon set of @kvirn-ui/icons, registered with `KvirnProvider icons={allIcons}`. Apps that name only the icons they use import them one by one from the package root instead.',
      },
    },
  },
} satisfies Meta<IconLibraryArgs>

export default meta
type Story = StoryObj<IconLibraryArgs>

/** One icon. With no label it is decorative and hidden from assistive technology. */
export const Default: Story = {
  render: ({ name, size, color, label }) => (
    <span style={colorStyle(color)}>
      <Icon name={name as IconName} size={size} label={label || undefined} />
    </span>
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
  argTypes: { name: { control: false }, label: { control: false } },
  render: ({ size, color }) => (
    <ul role="list" className="kv-story-icon-gallery">
      {iconNames.map((name) => (
        <li key={name} className="kv-story-icon-cell">
          <span style={colorStyle(color)}>
            <Icon name={name as IconName} size={size} />
          </span>
          <code>{name}</code>
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvas }) => {
    const cells = within(canvas.getByRole('list')).getAllByRole('listitem')
    await expect(cells).toHaveLength(iconNames.length)
    for (const [index, cell] of cells.entries()) {
      await expect(within(cell).getByText(iconNames[index] ?? '')).toBeVisible()
      await expect(cell.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    }
  },
}

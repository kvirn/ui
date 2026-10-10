import { Breadcrumb } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/breadcrumb/breadcrumb.a11y.md?raw'
import guide from '../../../../../packages/react/src/breadcrumb/breadcrumb.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import { withLocale } from './breadcrumb.fixture.tsx'

// Components/Breadcrumb: the headless Breadcrumb, styled by @kvirn-ui/theme/theme.css (brief B4 in
// docs/design/municipality-reference-site.md). The landmark's name is the library's own string and
// follows the locale toolbar: `Du är här` in sv. The links go nowhere (#), so a play function
// that presses Enter stays on the page.

const meta = {
  title: 'Components/Navigation/Breadcrumb',
  component: Breadcrumb.Root,
  argTypes: {
    label: {
      control: 'text',
      description:
        'The trail’s accessible name, set as `aria-label`. Replaces the message `breadcrumb.label` (`Du är här`).',
    },
  },
  args: {
    children: (
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#barn">Barn och utbildning</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Current>Förskola</Breadcrumb.Current>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    ),
  },
  decorators: [withLocale],
  globals: { locale: 'sv' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Breadcrumb.Root>

export default meta
type Story = StoryObj<typeof meta>

/** Start, a level up and the current page as text. The separators are drawn by the theme and never read. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const navigation = canvas.getByRole('navigation', { name: 'Du är här' })
    await expect(navigation).toBeVisible()
    await expect(canvas.getByText('Förskola')).toHaveAttribute('aria-current', 'page')
    await expect(canvas.getAllByRole('link')).toHaveLength(2)
    for (const link of canvas.getAllByRole('link')) {
      await expectMinimumTargetSize(link)
    }
  },
}

/** Try the keys: Tab goes through the two links and leaves the trail (the current page is no stop). */
export const Keyboard: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Start' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Barn och utbildning' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect(canvas.getByRole('link', { name: 'Start' })).toHaveFocus()
  },
}

/** Your own name for the landmark. A custom string is yours to translate. */
export const CustomLabel: Story = {
  args: { label: 'Sökväg' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'Sökväg' })).toBeVisible()
  },
}

/** A deep trail never collapses into "…": it wraps onto the next line. */
export const LongTrail: Story = {
  args: {
    children: (
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#bygga">Bygga, bo och miljö</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#bygglov">Bygglov och anmälan</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#attefall">
            Attefallshus och andra mindre byggnader
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Current>Ansök om bygglov för ett komplementbostadshus</Breadcrumb.Current>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('link')).toHaveLength(4)
  },
}

/** A 320px column with a long Finnish compound: the trail wraps and nothing scrolls sideways (1.4.10). */
export const Reflow320: Story = {
  args: {
    children: (
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#alku">Etusivu</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#jate">Jätehuolto ja kierrätys</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Current>Jätehuoltomaksunpalautuspäätöksentarkistuslomake</Breadcrumb.Current>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    ),
  },
  decorators: [(Story) => <div className="kv-story-narrow">{<Story />}</div>],
  globals: { locale: 'fi' },
  play: async ({ canvasElement, canvas }) => {
    const column = canvasElement.querySelector<HTMLElement>('.kv-story-narrow')
    if (column === null) {
      throw new Error('no narrow column')
    }
    await expect(canvas.getByRole('navigation', { name: 'Olet tässä' })).toBeVisible()
    await expectNoHorizontalOverflow(column)
  },
}

/** Right to left: the trail starts at the right and the chevron separators mirror. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  args: {
    children: (
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#children">Children and education</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Current>Preschool</Breadcrumb.Current>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'You are here' })).toBeVisible()
  },
}

/** Forced colours: system colours, the separators in `CanvasText` and the links in `LinkText`. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
}

import { ApplicationLogo, SiteHeader } from '@kvirn-ui/patterns'
import { kvirnbyMark } from '@kvirn-ui/patterns/fixtures'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import contract from '../../../../../packages/patterns/src/site-chrome/application-logo/application-logo.a11y.md?raw'

// Patterns/Site chrome/Application logo: the link to the start page, first in the Site header.
// Each story is the code an adopter copies: literal JSX, literal text.

const description = `The link to the start page: the mark, the organisation's or service's name as text, and an optional slogan. The link's name is the name alone; the slogan is read after it as its description. The mark is decorative (\`alt=""\`).

Use it first in the Site header's \`Masthead\`, and wherever the start page should be one step away. It takes the colour of what it sits on, so it needs no variant on a canvas or on the primary Site header.

## API

| Part | Element | Props |
| ---- | ------- | ----- |
| \`ApplicationLogo.Root\` | \`<a href>\` | \`href\`, \`current\` (\`page\` on the start page), \`as\` (a router link) |
| \`ApplicationLogo.Logo\` | \`<img alt="">\` | \`src\`. Decorative: the name is the text beside it |
| \`ApplicationLogo.Name\` | \`<span>\` | The name as children: the link's name |
| \`ApplicationLogo.Slogan\` | \`<span>\` | A short slogan as children: the link's description |

The pattern has no strings of its own. Each part is also a flat export (\`ApplicationLogoRoot\`, …).

## Parts and gaps

Parts used: \`Link\`. No gap.
`

const meta = {
  title: 'Patterns/Site chrome/Application logo',
  component: ApplicationLogo.Root,
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
  },
} satisfies Meta<typeof ApplicationLogo.Root>

export default meta
type Story = StoryObj<typeof meta>

/** The mark and the name. */
export const Default: Story = {
  render: () => (
    <ApplicationLogo.Root href="#start">
      <ApplicationLogo.Logo src={kvirnbyMark} />
      <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
    </ApplicationLogo.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Kvirnby municipality' })).toBeVisible()
    await expect(canvas.queryByRole('img')).toBeNull()
  },
}

/** A slogan under the name: the link's description, not part of its name. */
export const WithSlogan: Story = {
  render: () => (
    <ApplicationLogo.Root href="#start">
      <ApplicationLogo.Logo src={kvirnbyMark} />
      <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
      <ApplicationLogo.Slogan>Where the river meets the hills</ApplicationLogo.Slogan>
    </ApplicationLogo.Root>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'Kvirnby municipality' }),
    ).toHaveAccessibleDescription('Where the river meets the hills')
  },
}

/** The name alone, for a service without a mark. */
export const NameOnly: Story = {
  render: () => (
    <ApplicationLogo.Root href="#start">
      <ApplicationLogo.Name>Parking permits</ApplicationLogo.Name>
    </ApplicationLogo.Root>
  ),
}

/** On the start page: `current="page"`, so the link says it is the page you are on. */
export const CurrentPage: Story = {
  render: () => (
    <ApplicationLogo.Root href="#start" current="page">
      <ApplicationLogo.Logo src={kvirnbyMark} />
      <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
    </ApplicationLogo.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Kvirnby municipality' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  },
}

/** On the primary Site header: it takes the band's `on-primary`, and the header sets its size. */
export const OnPrimaryBand: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <SiteHeader.Root variant="primary">
      <SiteHeader.Masthead>
        <ApplicationLogo.Root href="#start">
          <ApplicationLogo.Logo src={kvirnbyMark} />
          <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
          <ApplicationLogo.Slogan>Where the river meets the hills</ApplicationLogo.Slogan>
        </ApplicationLogo.Root>
      </SiteHeader.Masthead>
    </SiteHeader.Root>
  ),
}

/** Try the keys (see Keyboard above): Tab moves focus to the link, Enter follows it. */
export const Keyboard: Story = {
  render: () => (
    <ApplicationLogo.Root href="#start">
      <ApplicationLogo.Logo src={kvirnbyMark} />
      <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
    </ApplicationLogo.Root>
  ),
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Kvirnby municipality' })).toHaveFocus()
  },
}

/** Right to left: the mark is at the right, the name and slogan follow it. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => (
    <ApplicationLogo.Root href="#start">
      <ApplicationLogo.Logo src={kvirnbyMark} />
      <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
      <ApplicationLogo.Slogan>Where the river meets the hills</ApplicationLogo.Slogan>
    </ApplicationLogo.Root>
  ),
}

/** Forced colours: the link is `LinkText`. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: () => (
    <ApplicationLogo.Root href="#start">
      <ApplicationLogo.Logo src={kvirnbyMark} />
      <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
      <ApplicationLogo.Slogan>Where the river meets the hills</ApplicationLogo.Slogan>
    </ApplicationLogo.Root>
  ),
}

import { LanguageLinks } from '@kvirn-ui/patterns'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import contract from '../../../../../packages/patterns/src/site-chrome/language-links/language-links.a11y.md?raw'
import { chromeViewports, narrowGlobals } from '../patterns-story-support.tsx'

// Patterns/Site chrome/Language links (docs/design/storybook-patterns.md section 5.4). This is the
// one chrome story that shows another language: the link text is written in its own language.

const description = `The same page in another language or format: a horizontal \`Navigation\` named by its \`label\`, each language written in itself, with \`lang\` and \`hrefLang\`, and the current one marked with \`aria-current="true"\`. Easy read and Sign language sit in the same row for the residents who look for them there.

Use it in the Site header, and wherever a page can be read in another language. There are no flags, no select, no auto-redirect and no machine translation (third-party requests, rule 7). A page that is not translated links to the other language's start page and says so in that language ("English (start page)").

## API

| Part | Element | Props |
| ---- | ------- | ----- |
| \`LanguageLinks.Root\` | \`<nav>\` | \`label\` (required): its name, in the page's language. Other \`<nav>\` props |
| \`LanguageLinks.Link\` | \`<li>\` with \`<a href>\` | \`href\`, \`lang\` (the link text's language), \`hrefLang\` (the target's), \`current\` (the page's language now, one at most), \`as\` |

The pattern has no strings of its own. Each part is also a flat export (\`LanguageLinksRoot\`, \`LanguageLinksLink\`).

## Parts and gaps

Parts used: \`Navigation\`, \`Link\`. No gap.
`

const meta = {
  title: 'Patterns/Site chrome/Language links',
  component: LanguageLinks.Root,
  args: { label: 'Language' },
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof LanguageLinks.Root>

export default meta
type Story = StoryObj<typeof meta>

/** The main example: English is current; Svenska, Easy read and Sign language are links. */
export const Default: Story = {
  render: () => (
    <div lang="en">
      <LanguageLinks.Root label="Language">
        <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
          Svenska
        </LanguageLinks.Link>
        <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
          English
        </LanguageLinks.Link>
        <LanguageLinks.Link href="#easy-read">Easy read</LanguageLinks.Link>
        <LanguageLinks.Link href="#sign-language">Sign language</LanguageLinks.Link>
      </LanguageLinks.Root>
    </div>
  ),
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'Language' })
    await expect(nav.querySelectorAll('[aria-current]')).toHaveLength(1)
    await expect(canvas.getByRole('link', { name: 'English' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(canvas.getByRole('link', { name: 'Svenska' })).toHaveAttribute('lang', 'sv')
  },
}

/** Narrow: the row wraps; nothing scrolls sideways. */
export const Narrow: Story = {
  globals: { ...narrowGlobals },
  render: () => (
    <div lang="en">
      <LanguageLinks.Root label="Language">
        <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
          Svenska
        </LanguageLinks.Link>
        <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
          English
        </LanguageLinks.Link>
        <LanguageLinks.Link href="#easy-read">Easy read</LanguageLinks.Link>
        <LanguageLinks.Link href="#sign-language">Sign language</LanguageLinks.Link>
      </LanguageLinks.Root>
    </div>
  ),
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'Language' })
    await expect(nav.querySelectorAll('[aria-current]')).toHaveLength(1)
    await expect(canvas.getByRole('link', { name: 'English' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(canvas.getByRole('link', { name: 'Svenska' })).toHaveAttribute('lang', 'sv')
  },
}

/**
 * A page with no translation: the Swedish link goes to the Swedish start page and its text says
 * so, in Swedish.
 */
export const NotTranslated: Story = {
  render: () => (
    <div lang="en">
      <LanguageLinks.Root label="Language">
        <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
          Svenska (startsida)
        </LanguageLinks.Link>
        <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
          English
        </LanguageLinks.Link>
      </LanguageLinks.Root>
    </div>
  ),
}

/** Try the keys (see Keyboard above): Tab and Shift+Tab move through the links in order. */
export const Keyboard: Story = {
  render: () => (
    <div lang="en">
      <LanguageLinks.Root label="Language">
        <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
          Svenska
        </LanguageLinks.Link>
        <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
          English
        </LanguageLinks.Link>
        <LanguageLinks.Link href="#easy-read">Easy read</LanguageLinks.Link>
        <LanguageLinks.Link href="#sign-language">Sign language</LanguageLinks.Link>
      </LanguageLinks.Root>
    </div>
  ),
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'Language' })
    await expect(nav.querySelectorAll('[aria-current]')).toHaveLength(1)
    await expect(canvas.getByRole('link', { name: 'English' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(canvas.getByRole('link', { name: 'Svenska' })).toHaveAttribute('lang', 'sv')
  },
}

/** Right to left: the row starts at the right. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => (
    <div lang="en">
      <LanguageLinks.Root label="Language">
        <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
          Svenska
        </LanguageLinks.Link>
        <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
          English
        </LanguageLinks.Link>
      </LanguageLinks.Root>
    </div>
  ),
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'Language' })
    await expect(nav.querySelectorAll('[aria-current]')).toHaveLength(1)
    await expect(canvas.getByRole('link', { name: 'English' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(canvas.getByRole('link', { name: 'Svenska' })).toHaveAttribute('lang', 'sv')
  },
}

/** Forced colours: links are `LinkText` and the current language keeps its bar. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: () => (
    <div lang="en">
      <LanguageLinks.Root label="Language">
        <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
          Svenska
        </LanguageLinks.Link>
        <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
          English
        </LanguageLinks.Link>
        <LanguageLinks.Link href="#easy-read">Easy read</LanguageLinks.Link>
        <LanguageLinks.Link href="#sign-language">Sign language</LanguageLinks.Link>
      </LanguageLinks.Root>
    </div>
  ),
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'Language' })
    await expect(nav.querySelectorAll('[aria-current]')).toHaveLength(1)
    await expect(canvas.getByRole('link', { name: 'English' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(canvas.getByRole('link', { name: 'Svenska' })).toHaveAttribute('lang', 'sv')
  },
}

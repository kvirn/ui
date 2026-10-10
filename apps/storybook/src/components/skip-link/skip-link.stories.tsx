import { Link, SkipLink } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/skip-link/skip-link.a11y.md?raw'
import guide from '../../../../../packages/react/src/skip-link/skip-link.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { expect, userEvent } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'

// Components/SkipLink: the headless SkipLink, styled by @kvirn-ui/theme. It is hidden until it has
// focus, so every story is a fixture: a skip link, a header with a wordmark link and the main
// content. Press Tab in the canvas to reveal it. The ids start with the story's name: an id is
// unique on a page, and a Docs page shows every story in one document. The library's own string
// follows the locale toolbar.

const meta = {
  title: 'Components/Navigation/SkipLink',
  component: SkipLink,
  args: { href: '#default-main' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof SkipLink>

export default meta
type Story = StoryObj<typeof meta>

function Fixture({
  prefix,
  children,
  mainProps,
}: {
  prefix: string
  children?: ReactNode
  mainProps?: { tabIndex: number }
}) {
  return (
    <div>
      <SkipLink href={`#${prefix}-main`}>{children}</SkipLink>
      <header>
        <Link.Root href="/">Kommunen</Link.Root>
      </header>
      <main id={`${prefix}-main`} {...mainProps}>
        <h1>Bygglov</h1>
        <p>
          <Link.Root href="/avgifter">Avgifter</Link.Root>
        </p>
      </main>
    </div>
  )
}

// The test runner's frame can't take the hash navigation of a followed link (it closes the browser
// connection), so the play functions that press Enter stop the jump. The focus move is the link's.
function keepFrameStill(link: HTMLElement) {
  link.addEventListener('click', (event) => event.preventDefault())
}

async function expectHidden(link: HTMLElement) {
  await expect(link.getBoundingClientRect().width).toBeLessThanOrEqual(1)
}

async function expectShown(link: HTMLElement) {
  await expect(link.getBoundingClientRect().width).toBeGreaterThan(1)
}

/** Press Tab: the link is the first stop, and appears in the flow of the page, above the header. */
export const Default: Story = {
  render: () => <Fixture prefix="default" />,
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: /Skip to main content|Hoppa till|Siirry|Gå til/ })
    await expectHidden(link)
    await userEvent.tab()
    await expect(link).toHaveFocus()
    await expectShown(link)
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Kommunen' })).toHaveFocus()
    await expectHidden(link)
  },
}

/**
 * Try the keys: Tab reveals the link, Enter moves focus to the main content (it is given
 * `tabindex="-1"` until it loses focus), and the next Tab continues in it. Shift+Tab leaves the
 * page. Space is not handled: the page scrolls, as with any link.
 */
export const Keyboard: Story = {
  render: () => <Fixture prefix="keyboard" />,
  play: async ({ canvas }) => {
    keepFrameStill(
      canvas.getByRole('link', { name: /Skip to main content|Hoppa till|Siirry|Gå til/ }),
    )
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await expect(canvas.getByRole('main')).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Avgifter' })).toHaveFocus()
  },
}

/** Your own text replaces the message. Its language is yours to set. */
export const CustomLabel: Story = {
  render: () => (
    <Fixture prefix="custom-label">
      <span lang="sv">Hoppa till innehållet</span>
    </Fixture>
  ),
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Hoppa till innehållet' })).toHaveFocus()
  },
}

/** The target is `<main>`, which isn't focusable by itself: the link makes it a focus target. */
export const TargetNotFocusable: Story = {
  render: () => <Fixture prefix="not-focusable" />,
  play: async ({ canvas }) => {
    const main = canvas.getByRole('main')
    keepFrameStill(
      canvas.getByRole('link', { name: /Skip to main content|Hoppa till|Siirry|Gå til/ }),
    )
    await expect(main).not.toHaveAttribute('tabindex')
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await expect(main).toHaveFocus()
    await expect(main).toHaveAttribute('tabindex', '-1')
  },
}

/** A target the page made focusable is left as it is. */
export const TargetAlreadyFocusable: Story = {
  render: () => <Fixture prefix="focusable" mainProps={{ tabIndex: 0 }} />,
  play: async ({ canvas }) => {
    keepFrameStill(
      canvas.getByRole('link', { name: /Skip to main content|Hoppa till|Siirry|Gå til/ }),
    )
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await expect(canvas.getByRole('main')).toHaveFocus()
    await expect(canvas.getByRole('main')).toHaveAttribute('tabindex', '0')
  },
}

/** Right to left: the link appears at the start, which is the right edge. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <Fixture prefix="rtl" />,
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Skip to main content' })).toHaveFocus()
  },
}

/** Forced colours: the system link colour on Canvas and a Highlight ring, with no background to rely on. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: () => <Fixture prefix="forced-colors" />,
  play: async () => {
    await userEvent.tab()
  },
}

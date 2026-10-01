import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

// Storybook's own orientation page (docs/design/storybook-presentation.md §4). Plain React,
// so no addon-docs dependency. Maintainer tooling in English, like the toolbar titles.

function AboutThisStorybook() {
  return (
    <main data-kv-prose="">
      <h1>About this Storybook</h1>

      <h2>What’s here</h2>
      <ul>
        <li>
          <strong>Foundation</strong> is what everything is built on: the colours, type, spacing,
          prose and theming of <code>theme.css</code>, read live from the page, and the provider,{' '}
          <code>KvirnProvider</code>.
        </li>
        <li>
          <strong>Components</strong> are the headless components, one set of stories each.
        </li>
      </ul>
      <p>
        Every story is styled by the default theme, <code>@kvirn-ui/theme/theme.css</code>, as
        described in <code>DESIGN.md</code>. The components themselves ship no CSS. The theme styles
        the attributes they render, such as <code>data-kv=&quot;button&quot;</code> and{' '}
        <code>data-disabled</code>, and variants you set yourself, such as{' '}
        <code>data-variant=&quot;primary&quot;</code>.
      </p>

      <h2>Toolbars</h2>
      <ul>
        <li>
          <strong>Locale</strong> changes the component strings.
        </li>
        <li>
          <strong>Direction</strong> switches between left-to-right and right-to-left.
        </li>
        <li>
          <strong>Theme</strong> selects one of the four themes, or follows the system.{' '}
          <strong>None (unstyled)</strong> removes <code>theme.css</code>, to show the components as
          they ship.
        </li>
        <li>
          <strong>Forced colors</strong> only marks a story. Real emulation runs in the{' '}
          <code>chromium-forced-colors</code> end-to-end project.
        </li>
      </ul>

      <h2>What the tests check</h2>
      <ul>
        <li>
          axe runs on every story, and a violation fails <code>vp test run</code>. The fixed theme
          stories (Light, Dark and the two high-contrast ones) are the gate for colour contrast. The
          Theme toolbar is for exploring.
        </li>
        <li>
          axe can’t check hover, pressed, forced colours or reading order. Check those by hand, or
          in the end-to-end tests. A failing check is fixed in the theme or the component, never by
          turning off a rule.
        </li>
      </ul>

      <h2>Where the contracts are</h2>
      <p>
        Each component’s accessibility contract is in{' '}
        <code>packages/react/src/&lt;name&gt;/&lt;name&gt;.a11y.md</code>. The visual rules are in{' '}
        <code>DESIGN.md</code>, the theme in <code>packages/theme/theme.css</code> and the design
        specs in <code>docs/design/</code>.
      </p>

      <h2>Manual assistive-technology testing</h2>
      <p>
        Pending for every component. Nothing in this Storybook shows that a screen reader has been
        tested.
      </p>
      <p>
        The Storybook interface around the stories is third-party software. Its own accessibility is
        outside KvirnUI’s contract.
      </p>
    </main>
  )
}

const meta = {
  title: 'Introduction/About this Storybook',
  component: AboutThisStorybook,
  globals: { locale: 'en' },
} satisfies Meta<typeof AboutThisStorybook>

export default meta

export const About: StoryObj<typeof meta> = {
  name: 'About this Storybook',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent(
      'About this Storybook',
    )
    await expect(
      canvas.getByRole('heading', { name: 'Manual assistive-technology testing' }),
    ).toBeVisible()
  },
}

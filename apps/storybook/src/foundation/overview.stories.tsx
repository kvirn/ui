import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { expect, within } from 'storybook/test'
import { FoundationPage, storyHref } from './foundation-helpers.tsx'
import { storyIdOf } from './typography-helpers.tsx'

// Foundation/Overview (docs/design/foundations-and-prose.md §6.6): what the foundation is, the
// attributes a consumer sets, and a link to every Foundation page with what it answers.
// Maintainer text in English, written in prose.

/** Every Foundation page, in the spec's order, with the question it answers. */
const foundationPages: readonly { title: string; label: string; answers: string }[] = [
  {
    title: 'Foundation/Colors/Palette',
    label: 'Colors: Palette',
    answers:
      'What each step of the role scales is in hex, its default hue, and how white and black text measure on it.',
  },
  {
    title: 'Foundation/Colors/Semantic tokens',
    label: 'Colors: Semantic tokens',
    answers: 'Which palette step each semantic token uses, in all four themes at once.',
  },
  {
    title: 'Foundation/Colors/Text on surface',
    label: 'Colors: Text on surface',
    answers: 'Whether a text colour may be used on a background in a theme, with measured ratios.',
  },
  {
    title: 'Foundation/Typography/Type scale',
    label: 'Typography: Type scale',
    answers: 'The size, weight, line height, tracking and features of every type role.',
  },
  {
    title: 'Foundation/Typography/Prose',
    label: 'Typography: Prose',
    answers: 'How data-kv-prose sets an article from a CMS or Markdown, in every mode.',
  },
  {
    title: 'Foundation/Spacing',
    label: 'Spacing',
    answers: 'The spacing scale in rem and px, and the prose spacing tokens.',
  },
  {
    title: 'Foundation/Radius',
    label: 'Radius',
    answers: 'Each corner radius, and what it’s used for.',
  },
  {
    title: 'Foundation/Borders and elevation',
    label: 'Borders and elevation',
    answers: 'Border widths, hairlines against control borders, and the five elevation levels.',
  },
  {
    title: 'Foundation/Focus ring',
    label: 'Focus ring',
    answers: 'How the focus ring looks, and how it measures, on each background.',
  },
  {
    title: 'Foundation/Motion',
    label: 'Motion',
    answers: 'The durations and easing, and what reduced motion turns off.',
  },
  {
    title: 'Foundation/Density',
    label: 'Density',
    answers: 'Comfortable and compact controls side by side, with their measured sizes.',
  },
  {
    title: 'Foundation/Theming',
    label: 'Theming',
    answers:
      'How to rebrand by overriding one role scale, and a live check that the result still passes.',
  },
  {
    title: 'Foundation/Layout',
    label: 'Layout',
    answers: 'The breakpoints, the reading columns and the 320px reflow rule.',
  },
  {
    title: 'Foundation/KvirnProvider',
    label: 'KvirnProvider',
    answers: 'How the provider sets the locale, the theme and the messages.',
  },
]

const consumerAttributes: readonly { attribute: string; description: ReactNode }[] = [
  {
    attribute: 'data-variant',
    description: (
      <>
        On a Button: <code>primary</code> for the one main action in a view, <code>danger</code> for
        a destructive one.
      </>
    ),
  },
  {
    attribute: 'data-kv-nav',
    description: 'On a list of Links in a labelled nav: navigation items instead of inline links.',
  },
  {
    attribute: 'data-kv-button-group',
    description: 'Around buttons: a row that stacks at full width on narrow screens.',
  },
  {
    attribute: 'data-kv-density',
    description: (
      <>
        <code>compact</code> on any container: 32px controls for staff tools, back to 44px below
        64rem.
      </>
    ),
  },
  {
    attribute: 'data-kv-prose',
    description: (
      <>
        Around content you don’t control, such as an article from a CMS. <code>large</code> is the
        18px size for long resident-facing text.
      </>
    ),
  },
  {
    attribute: 'data-kv-lead',
    description: 'On the first paragraph of a prose article: one step larger than the body.',
  },
  {
    attribute: 'data-kv-not-prose',
    description: 'Inside prose, around anything prose shouldn’t style. It keeps only its spacing.',
  },
  {
    attribute: 'data-kv-scroll-region',
    description: (
      <>
        Around a wide table, with <code>aria-labelledby</code> pointing at the caption and{' '}
        <code>tabindex=&quot;0&quot;</code>, so keyboard users can scroll it.
      </>
    ),
  },
]

function Overview(): ReactNode {
  return (
    <FoundationPage title="Foundation">
      <p>
        The foundation is what every component and block is built on: the default theme,{' '}
        <code>@kvirn-ui/theme/theme.css</code>. The components ship no CSS. The theme styles the
        attributes they render, such as <code>data-kv=&quot;button&quot;</code>, and the attributes
        you set yourself. Every page here reads its values live from the theme on this page, so an
        override shows up.
      </p>

      <h2>Pages</h2>
      <ul>
        {foundationPages.map((page) => (
          <li key={page.title}>
            <a href={storyHref(storyIdOf(page.title))} target="_top">
              {page.label}
            </a>
            : {page.answers}
          </li>
        ))}
      </ul>

      <h2>Two tiers of colour</h2>
      <p>
        The palette is role scales of raw colour steps, such as <code>--kv-neutral-500</code> and{' '}
        <code>--kv-primary-500</code>: neutral, primary, secondary, accent, danger, success and
        warning. They&apos;re named for their role, not their hue. Semantic tokens, such as{' '}
        <code>--kv-color-text</code>, point at the steps, and differ in each of the four themes:
        light, dark and their high-contrast versions. Components only use semantic tokens.
      </p>
      <p>
        To rebrand, override the 11 steps of one scale on <code>:root</code>, such as{' '}
        <code>--kv-primary-*</code> with your brand&apos;s colours, and every theme follows. A
        swapped scale can break contrast, so run <code>checkThemeCss()</code> on your customised
        copy, or check the Theming and Text on surface pages, which measure live.
      </p>

      <h2>Tokens that aren’t colours</h2>
      <p>
        Type roles (<code>--kv-font-&lt;role&gt;-*</code>), spacing (<code>--kv-space-*</code>),
        radius, border and indicator widths, the focus ring, motion durations and easing, control
        sizes for each density, and the prose tokens (<code>--kv-prose-*</code>). Apart from the
        shadows, which the dark themes don’t use, they are the same in every theme.
      </p>

      <h2>Attributes you set</h2>
      <dl>
        {consumerAttributes.map(({ attribute, description }) => (
          <div key={attribute}>
            <dt>
              <code>{attribute}</code>
            </dt>
            <dd>{description}</dd>
          </div>
        ))}
      </dl>

      <h2>Your CSS wins</h2>
      <p>
        Everything in <code>theme.css</code> is inside <code>@layer kv</code>, so any CSS you write
        outside a layer wins, whatever its specificity. Prose rules have zero specificity, so a
        component’s own rules win inside prose too.
      </p>

      <h2>Check what you change</h2>
      <p>
        After changing colours, run <code>vp run theme:check</code>, or call{' '}
        <code>checkThemeCss()</code> from <code>@kvirn-ui/theme</code>. It measures every contrast
        pair in use in all four themes: 4.5:1 for text and 3:1 for borders and focus rings, and 7:1
        for text in the high-contrast themes.
      </p>

      <h2>Your part in prose</h2>
      <p>Prose styles what you write, but it can’t make the content accessible on its own:</p>
      <ul>
        <li>Don’t skip heading levels.</li>
        <li>Write alt text for images.</li>
        <li>
          Give each table a <code>caption</code>, and <code>th</code> elements with{' '}
          <code>scope</code>.
        </li>
        <li>Caption videos, and don’t autoplay them.</li>
        <li>Write link text that makes sense on its own.</li>
        <li>
          Set <code>lang</code> on passages in another language.
        </li>
      </ul>
    </FoundationPage>
  )
}

const meta = {
  title: 'Foundation/Overview',
  component: Overview,
  globals: { locale: 'en' },
} satisfies Meta<typeof Overview>

export default meta

export const OverviewStory: StoryObj<typeof meta> = {
  name: 'Overview',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('Foundation')
    for (const page of foundationPages) {
      const link = canvas.getByRole('link', { name: page.label })
      await expect(link).toHaveAttribute('href', storyHref(storyIdOf(page.title)))
      // Opens the page in Storybook itself, not inside the preview frame.
      await expect(link).toHaveAttribute('target', '_top')
    }
    await expect(canvas.getByRole('link', { name: 'Colors: Text on surface' })).toHaveAttribute(
      'href',
      './?path=/story/foundation-colors-text-on-surface',
    )
  },
}

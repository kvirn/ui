import { Button } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  isThemeLoaded,
  readProperty,
  ScrollTable,
  ThemeMissingNotice,
  useLiveValue,
} from './foundation-helpers.tsx'
import { themeTokenNames, TokenPage } from './tokens-helpers.tsx'

// Foundation/Motion (docs/design/foundations-and-prose.md §6.6): the durations and the
// easing, read live, and a demo that moves only when the user asks (2.2.2), and never under
// reduced motion (2.3.3). Nothing on this page autoplays.

const motionTokens = themeTokenNames(/^--kv-(?:duration|easing)-/)

const motionUses: Record<string, string> = {
  '--kv-duration-fast': 'Hover and press: colour and border changes on buttons and links',
  '--kv-duration-medium': 'Popups and disclosures',
  '--kv-duration-slow': 'Dialogs and page-level changes',
  '--kv-easing-standard': 'Every transition: it starts quickly and settles gently',
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

function readMotion(page: HTMLElement) {
  if (!isThemeLoaded(page)) {
    return null
  }
  return {
    isReduced: page.ownerDocument.defaultView?.matchMedia(reducedMotionQuery).matches === true,
    medium: readProperty(page, '--kv-duration-medium'),
    tokens: motionTokens.map((token) => ({ token, value: readProperty(page, token) })),
  }
}

/** APG Disclosure: a button with aria-expanded shows and hides a panel. */
function MotionDemo({ medium }: { medium: string | undefined }): ReactNode {
  const [isOpen, setIsOpen] = useState(false)
  const panelId = useId()
  return (
    <div data-kv-not-prose="">
      <div data-kv-button-group="">
        <Button
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((open) => !open)}
        >
          Show example panel
        </Button>
      </div>
      <div id={panelId} className="kv-story-motion-panel" hidden={!isOpen}>
        An example panel. It fades and slides in over the medium duration
        {medium === undefined ? '' : `, ${medium}`}, or appears at once with reduced motion. It
        closes at once.
      </div>
    </div>
  )
}

function MotionPage(): ReactNode {
  const [pageRef, values] = useLiveValue<ReturnType<typeof readMotion>, HTMLElement>(readMotion)
  return (
    <TokenPage title="Motion" pageRef={pageRef}>
      <p>
        Motion is short and only explains a change. It runs only when the user has no preference for
        reduced motion: every transition in theme.css sits inside{' '}
        <code>@media (prefers-reduced-motion: no-preference)</code>, so with reduced motion on,
        every change is instant. Nothing moves on its own: no autoplay, no parallax, nothing that
        flashes, and nothing longer than 5 seconds without a pause control (2.2.2).
      </p>
      {values === null ? <ThemeMissingNotice /> : null}
      {values ? (
        <>
          <ScrollTable caption="Motion tokens">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Value</th>
                <th scope="col">Use</th>
              </tr>
            </thead>
            <tbody>
              {values.tokens.map(({ token, value }) => (
                <tr key={token}>
                  <th scope="row">
                    <code>{token}</code>
                  </th>
                  <td>
                    <code>{value ?? 'Not defined'}</code>
                  </td>
                  <td>{motionUses[token] ?? 'Not described in DESIGN.md'}</td>
                </tr>
              ))}
            </tbody>
          </ScrollTable>

          <h2>Try it</h2>
          <p>
            {values.isReduced
              ? 'Reduced motion is on: changes are instant.'
              : 'Reduced motion is off: the panel fades and slides in.'}{' '}
            Turn on reduced motion in your operating system to compare.
          </p>
          <MotionDemo medium={values.medium} />
        </>
      ) : null}
    </TokenPage>
  )
}

const meta = {
  title: 'Foundation/Motion',
  render: () => <MotionPage />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Motion: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const view = canvasElement.ownerDocument.defaultView
    const isReduced = view?.matchMedia(reducedMotionQuery).matches === true
    await waitFor(() =>
      expect(
        canvas.getByText(isReduced ? /Reduced motion is on/ : /Reduced motion is off/),
      ).toBeVisible(),
    )
    await expect(canvas.getByRole('rowheader', { name: '--kv-duration-medium' })).toBeVisible()

    // Nothing is shown, or moving, until the user asks.
    const button = canvas.getByRole('button', { name: 'Show example panel' })
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    const panelId = button.getAttribute('aria-controls') ?? ''
    const panel = canvasElement.ownerDocument.getElementById(panelId)
    if (panel === null) {
      throw new Error('aria-controls points at no element')
    }
    await expect(panel).not.toBeVisible()

    await userEvent.click(button)
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    // It fades in from opacity 0 over the medium duration, so it's visible once that ends.
    await waitFor(() => expect(panel).toBeVisible())
    const medium = readProperty(canvasElement, '--kv-duration-medium') ?? ''
    // The browser reports 180ms as 0.18s. Under reduced motion there's no transition at all.
    await expect(getComputedStyle(panel).transitionDuration).toContain(
      isReduced ? '0s' : `${Number.parseFloat(medium) / 1000}s`,
    )

    await userEvent.click(button)
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(panel).not.toBeVisible()
  },
}

import { Button, Link } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId } from 'react'
import type { ReactNode } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  formatRatio,
  isForcedColors,
  isThemeLoaded,
  ratioOf,
  readColor,
  ScrollTable,
  scrollRegionTabIndex,
  Swatch,
  ThemeMissingNotice,
  useLiveValue,
} from './foundation-helpers.tsx'
import {
  ContrastResult,
  fixedThemeStory,
  ForcedColorsNotice,
  readTokenText,
  TokenPage,
} from './tokens-helpers.tsx'

// Foundation/Focus ring (docs/design/foundations-and-prose.md §6.6): the ring on a Button, a
// Link and a scroll region, on each background it's used on, with its live ratio. The
// specimens are the real components with data-focus-visible set, so the ring always shows.

const backgrounds = ['canvas', 'surface', 'surface-raised', 'primary-subtle'] as const
type Background = (typeof backgrounds)[number]

const nonTextMinimum = 3

function readFocusRing(page: HTMLElement) {
  if (!isThemeLoaded(page)) {
    return null
  }
  const ring = readColor(page, '--kv-color-focus-ring')
  return {
    isForcedColors: isForcedColors(page),
    ring,
    width: readTokenText(page, '--kv-focus-ring-width'),
    offset: readTokenText(page, '--kv-focus-ring-offset'),
    onBackground: Object.fromEntries(
      backgrounds.map((background) => [
        background,
        ratioOf(ring, readColor(page, `--kv-color-${background}`)),
      ]),
    ) as Record<Background, number | undefined>,
    onPrimary: ratioOf(ring, readColor(page, '--kv-color-primary')),
  }
}

const ratioText = (ratio: number | undefined) =>
  ratio === undefined ? 'can’t be measured' : formatRatio(ratio)

/** A small table in a scroll region, shown focused. */
function FocusedScrollRegion({ background }: { background: Background }): ReactNode {
  const captionId = useId()
  return (
    <section
      className="kv-scroll-region"
      data-focus-visible=""
      aria-labelledby={captionId}
      tabIndex={scrollRegionTabIndex}
    >
      <table>
        <caption id={captionId}>Fees, on {background}</caption>
        <thead>
          <tr>
            <th scope="col">Permit</th>
            <th scope="col">Fee (SEK)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Parking</th>
            <td>800</td>
          </tr>
        </tbody>
      </table>
    </section>
  )
}

function BackgroundPanel({
  background,
  ratio,
}: {
  background: Background
  ratio: number | undefined
}): ReactNode {
  const headingId = useId()
  return (
    <section
      aria-labelledby={headingId}
      className="kv-story-panel"
      style={{ backgroundColor: `var(--kv-color-${background})` }}
    >
      <h3 id={headingId}>On {background}</h3>
      <p>
        <code>focus-ring</code> on <code>{background}</code>: {ratioText(ratio)}. Minimum 3:1.{' '}
        <ContrastResult ratio={ratio} minimum={nonTextMinimum} />
      </p>
      <div className="kv-button-group">
        <Button data-focus-visible="">Save draft</Button>
      </div>
      <p>
        <Link href="#focus-ring-try" data-focus-visible="">
          Read the guidance
        </Link>
      </p>
      <FocusedScrollRegion background={background} />
    </section>
  )
}

function FocusRingPage(): ReactNode {
  const [pageRef, values] = useLiveValue<ReturnType<typeof readFocusRing>, HTMLElement>(
    readFocusRing,
  )
  return (
    <TokenPage title="Focus ring" pageRef={pageRef}>
      <p>
        Every focusable component gets the same ring: 2px solid <code>focus-ring</code>, 2px outside
        the element, following its radius. It shows for keyboard focus only (
        <code>:focus-visible</code>, or <code>data-focus-visible</code> from the component), and it
        is restyled, never removed (2.4.7, 2.4.13).
      </p>
      {values === null ? <ThemeMissingNotice /> : null}
      {values ? (
        <>
          <ScrollTable caption="Focus ring tokens">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  <code>--kv-color-focus-ring</code>
                </th>
                <td>
                  {values.ring === undefined ? (
                    'Can’t measure'
                  ) : (
                    <>
                      <Swatch color={values.ring} />
                      {values.ring}
                    </>
                  )}
                </td>
              </tr>
              <tr>
                <th scope="row">
                  <code>--kv-focus-ring-width</code>
                </th>
                <td>{values.width ?? 'Not defined'}</td>
              </tr>
              <tr>
                <th scope="row">
                  <code>--kv-focus-ring-offset</code>
                </th>
                <td>{values.offset ?? 'Not defined'}</td>
              </tr>
            </tbody>
          </ScrollTable>

          <h2>On each background</h2>
          <p>
            A Button, a Link and a scroll region, drawn focused on every background the ring is used
            on. The ring needs 3:1 against the background next to it.
          </p>
          {values.isForcedColors ? <ForcedColorsNotice /> : null}
          <div className="kv-story-columns">
            {backgrounds.map((background) => (
              <BackgroundPanel
                key={background}
                background={background}
                ratio={values.onBackground[background]}
              />
            ))}
          </div>

          <h2>On a filled button</h2>
          <p>
            <code>focus-ring</code> on <code>primary</code> is {ratioText(values.onPrimary)} here,
            so a ring drawn on the fill could vanish. That’s why the ring sits 2px outside the
            element, against the page: on <code>canvas</code> it’s{' '}
            {ratioText(values.onBackground.canvas)}.
          </p>
          <div className="kv-button-group">
            <Button className="kv-button--primary" data-focus-visible="">
              Send application
            </Button>
          </div>

          <h2 id="focus-ring-try">Try it with the keyboard</h2>
          <p>
            The examples above always show the ring. These two are live: press Tab to reach them,
            and the ring appears. Click one with a mouse, and no ring shows.
          </p>
          <div className="kv-button-group">
            <Button>Try the button</Button>
          </div>
          <p>
            <Link href="#focus-ring-try">Try the link</Link>
          </p>
        </>
      ) : null}
    </TokenPage>
  )
}

const meta = {
  title: 'Foundation/Focus ring',
  render: () => <FocusRingPage />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const ringStyle = { outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '2px' }

async function checkFocusRing(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  for (const background of backgrounds) {
    const panel = within(await canvas.findByRole('region', { name: `On ${background}` }))
    await waitFor(() => expect(panel.getByText(/Minimum 3:1\. Passes$/)).toBeVisible())
    await expect(panel.getByRole('button', { name: 'Save draft' })).toHaveStyle(ringStyle)
    await expect(panel.getByRole('link', { name: 'Read the guidance' })).toHaveStyle(ringStyle)
    await expect(panel.getByRole('region', { name: `Fees, on ${background}` })).toHaveStyle(
      ringStyle,
    )
  }
  await expect(canvas.getByRole('button', { name: 'Send application' })).toHaveStyle(ringStyle)
}

export const CurrentTheme: Story = {
  name: 'Current theme',
  play: async ({ canvasElement }) => {
    await checkFocusRing(canvasElement)
    const canvas = within(canvasElement)
    const liveButton = canvas.getByRole('button', { name: 'Try the button' })
    const liveLink = canvas.getByRole('link', { name: 'Try the link' })
    // Before any focus, the live examples show no ring. A real pointer click showing none is
    // tested in button.test.tsx: a play function's synthetic click doesn't count as pointer
    // input for the browser's :focus-visible heuristic.
    await expect(liveButton).not.toHaveAttribute('data-focus-visible')
    await expect(liveButton).toHaveStyle({ outlineStyle: 'none' })
    await userEvent.click(liveButton)
    await expect(liveButton).toHaveFocus()
    // Keyboard focus shows it.
    await userEvent.tab()
    await expect(liveLink).toHaveFocus()
    await waitFor(() => expect(liveLink).toHaveAttribute('data-focus-visible'))
    await expect(liveLink).toHaveStyle(ringStyle)
    await userEvent.tab({ shift: true })
    await expect(liveButton).toHaveFocus()
    await waitFor(() => expect(liveButton).toHaveAttribute('data-focus-visible'))
    await expect(liveButton).toHaveStyle(ringStyle)
  },
}
export const Light: Story = fixedThemeStory('light', checkFocusRing)
export const Dark: Story = fixedThemeStory('dark', checkFocusRing)
export const LightHighContrast: Story = fixedThemeStory('light-contrast', checkFocusRing)
export const DarkHighContrast: Story = fixedThemeStory('dark-contrast', checkFocusRing)

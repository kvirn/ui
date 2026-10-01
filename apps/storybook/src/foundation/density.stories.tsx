import { Button, Link } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId } from 'react'
import type { ReactNode } from 'react'
import { expect, waitFor, within } from 'storybook/test'
import {
  isThemeLoaded,
  ScrollTable,
  ThemeMissingNotice,
  useLiveValue,
} from './foundation-helpers.tsx'
import { formatPixels, readTokenText, themeTokenNames, TokenPage } from './tokens-helpers.tsx'

// Foundation/Density (docs/design/foundations-and-prose.md §6.6): comfortable and compact side
// by side, with each control's measured height, and compact's return to 44px below 64rem.

const densities = ['comfortable', 'compact'] as const
type Density = (typeof densities)[number]

const densityTitles: Record<Density, string> = {
  comfortable: 'Comfortable (default)',
  compact: 'Compact',
}

const controlTokens = themeTokenNames(/^--kv-control-/)
const compactQuery = '(width >= 64rem)'

const blockSize = (element: Element | null): number | undefined =>
  element === null ? undefined : element.getBoundingClientRect().height

function readDensity(page: HTMLElement) {
  if (!isThemeLoaded(page)) {
    return null
  }
  const view = page.ownerDocument.defaultView
  const panels = Object.fromEntries(
    densities.map((density) => {
      const panel = page.querySelector(`[data-story-density="${density}"]`)
      return [
        density,
        {
          button: blockSize(panel?.querySelector("[data-kv='button']") ?? null),
          navItem: blockSize(panel?.querySelector("[data-kv-nav] [data-kv='link']") ?? null),
          tokens: Object.fromEntries(
            controlTokens.map((token) => [
              token,
              (panel === null ? undefined : readTokenText(panel, token)) ?? 'Not defined',
            ]),
          ),
        },
      ]
    }),
  ) as Record<
    Density,
    { button?: number | undefined; navItem?: number | undefined; tokens: Record<string, string> }
  >
  return {
    viewportWidth: view?.innerWidth,
    isCompactActive: view?.matchMedia(compactQuery).matches === true,
    panels,
  }
}

const sizeText = (pixels: number | undefined) =>
  pixels === undefined ? 'not measured yet' : formatPixels(Math.round(pixels))

function DensityPanel({
  density,
  button,
  navItem,
}: {
  density: Density
  button: number | undefined
  navItem: number | undefined
}): ReactNode {
  const headingId = useId()
  const title = densityTitles[density]
  return (
    <section
      aria-labelledby={headingId}
      className="kv-story-panel"
      data-story-density={density}
      data-kv-density={density === 'compact' ? 'compact' : undefined}
    >
      <h3 id={headingId}>{title}</h3>
      <p>
        Measured here: buttons {sizeText(button)}, navigation items {sizeText(navItem)} tall.
      </p>
      <div data-kv-button-group="">
        <Button data-variant="primary">Save</Button>
        <Button>Cancel</Button>
      </div>
      <nav aria-label={`${title} example`}>
        <ul data-kv-nav="">
          <li>
            <Link href={`#${headingId}`} current="page">
              Applications
            </Link>
          </li>
          <li>
            <Link href={`#${headingId}`}>Decisions</Link>
          </li>
        </ul>
      </nav>
    </section>
  )
}

function DensityPage(): ReactNode {
  const [pageRef, values] = useLiveValue<ReturnType<typeof readDensity>, HTMLElement>(readDensity)
  return (
    <TokenPage title="Density" pageRef={pageRef}>
      <p>
        Comfortable is the default and needs no attribute. Set{' '}
        <code>data-kv-density=&quot;compact&quot;</code> on a container for 32px controls with 14px
        labels. Below 64rem (1024px at the default text size) touch is likely, so compact returns to
        comfortable: 44px controls with 16px labels.
      </p>
      {values === null ? <ThemeMissingNotice /> : null}
      {values ? (
        <>
          <p>
            This viewport is{' '}
            {values.viewportWidth === undefined
              ? 'of unknown width'
              : `${values.viewportWidth}px wide`}
            , so compact is{' '}
            {values.isCompactActive
              ? 'active here.'
              : 'not active here: both examples show comfortable sizes.'}
          </p>
          <div className="kv-story-columns">
            {densities.map((density) => (
              <DensityPanel
                key={density}
                density={density}
                button={values.panels[density].button}
                navItem={values.panels[density].navItem}
              />
            ))}
          </div>

          <h2>Tokens</h2>
          <ScrollTable caption="Control tokens, measured in each example">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Comfortable</th>
                <th scope="col">Compact</th>
              </tr>
            </thead>
            <tbody>
              {controlTokens.map((token) => (
                <tr key={token}>
                  <th scope="row">
                    <code>{token}</code>
                  </th>
                  <td>{values.panels.comfortable.tokens[token]}</td>
                  <td>{values.panels.compact.tokens[token]}</td>
                </tr>
              ))}
            </tbody>
          </ScrollTable>

          <h2>When to use each</h2>
          <ScrollTable caption="Densities, from DESIGN.md">
            <thead>
              <tr>
                <th scope="col">Density</th>
                <th scope="col">Control height</th>
                <th scope="col">Label</th>
                <th scope="col">Smallest target</th>
                <th scope="col">Use</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Comfortable (default)</th>
                <td>44px</td>
                <td>
                  <code>label</code> (16px)
                </td>
                <td>44×44px</td>
                <td>
                  Everything resident-facing, and every primary action. Meets 2.5.5 Target Size
                  (Enhanced)
                </td>
              </tr>
              <tr>
                <th scope="row">Compact</th>
                <td>32px</td>
                <td>
                  <code>label-compact</code> (14px)
                </td>
                <td>24×24px</td>
                <td>
                  Staff tools, tables, toolbars, and the docs site chrome at 64rem and wider. Meets
                  2.5.8 only
                </td>
              </tr>
            </tbody>
          </ScrollTable>
        </>
      ) : null}
    </TokenPage>
  )
}

const meta = {
  title: 'Foundation/Density',
  render: () => <DensityPage />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Density: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const isWide = canvasElement.ownerDocument.defaultView?.matchMedia(compactQuery).matches
    for (const density of densities) {
      const panel = await canvas.findByRole('region', { name: densityTitles[density] })
      const controls = [
        ...within(panel).getAllByRole('button'),
        ...within(panel).getAllByRole('link'),
      ]
      for (const control of controls) {
        const height = control.getBoundingClientRect().height
        if (density === 'compact' && isWide === true) {
          await expect(height).toBeGreaterThanOrEqual(32)
          await expect(height).toBeLessThan(44)
        } else {
          // Comfortable, and compact below 64rem, where touch is likely.
          await expect(height).toBeGreaterThanOrEqual(44)
        }
      }
      // The page states the measured height in text.
      const [button] = within(panel).getAllByRole('button')
      const expected = formatPixels(Math.round(button?.getBoundingClientRect().height ?? 0))
      await waitFor(() =>
        expect(within(panel).getByText(new RegExp(`buttons ${expected},`))).toBeVisible(),
      )
    }
  },
}

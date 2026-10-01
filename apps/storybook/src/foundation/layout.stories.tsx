import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { expect, waitFor, within } from 'storybook/test'
import { readProperty, ScrollTable, useLiveValue } from './foundation-helpers.tsx'
import { formatPixels, TokenPage } from './tokens-helpers.tsx'

// Foundation/Layout (docs/design/foundations-and-prose.md §6.6): the breakpoints with the
// current viewport in text, the reading columns as outlined boxes measured live, and the
// 320px reflow rule (1.4.10). Media queries can't read custom properties, so the breakpoints
// are reference points from DESIGN.md, not tokens. The prose measure is a token.

const breakpoints = [
  {
    width: '40rem',
    changes: 'Button groups change from stacked, full-width buttons to a row.',
  },
  {
    width: '64rem',
    changes:
      'Compact density turns on. Below it, touch is likely and controls stay 44px. A sidebar can show instead of a disclosure.',
  },
  {
    width: '80rem',
    changes: 'A reference point for wide layouts. Nothing in theme.css changes here yet.',
  },
] as const

const columns = [
  { id: 'forms', label: 'Forms', width: '40rem' },
  { id: 'prose', label: 'Prose for residents', width: '45rem' },
  { id: 'measure', label: 'Prose measure, --kv-prose-measure', width: 'var(--kv-prose-measure)' },
] as const

function readLayout(page: HTMLElement) {
  const view = page.ownerDocument.defaultView
  const root = page.ownerDocument.documentElement
  const rootFontSize = Number.parseFloat(getComputedStyle(root).fontSize)
  return {
    viewportWidth: view?.innerWidth,
    rootFontSize,
    breakpoints: breakpoints.map(({ width }) => ({
      width,
      pixels: Number.parseFloat(width) * rootFontSize,
      isMatching: view?.matchMedia(`(width >= ${width})`).matches === true,
    })),
    columns: Object.fromEntries(
      columns.map(({ id }) => [
        id,
        page.querySelector(`[data-story-column="${id}"]`)?.getBoundingClientRect().width,
      ]),
    ) as Record<(typeof columns)[number]['id'], number | undefined>,
    measure: readProperty(page, '--kv-prose-measure'),
    hasPageScroll: root.scrollWidth > root.clientWidth,
  }
}

function LayoutPage(): ReactNode {
  const [pageRef, values] = useLiveValue<ReturnType<typeof readLayout>, HTMLElement>(readLayout)
  const viewportText =
    values?.viewportWidth === undefined
      ? 'This viewport’s width isn’t known yet.'
      : `This viewport is ${values.viewportWidth}px wide, or ${Number(
          (values.viewportWidth / values.rootFontSize).toFixed(2),
        )}rem at a ${formatPixels(values.rootFontSize)} root text size.`
  return (
    <TokenPage title="Layout" pageRef={pageRef}>
      <p>
        Everything sits on a 4px grid, mobile first. The breakpoints are content-driven, with three
        reference points. They’re in rem, so they follow the user’s text size: at 200% text, 64rem
        is reached at twice the width.
      </p>

      <h2>Breakpoints</h2>
      <p>{viewportText}</p>
      <ScrollTable caption="Breakpoints">
        <thead>
          <tr>
            <th scope="col">Breakpoint</th>
            <th scope="col">px at this text size</th>
            <th scope="col">Applies now</th>
            <th scope="col">What changes at or above it</th>
          </tr>
        </thead>
        <tbody>
          {breakpoints.map(({ width, changes }, index) => {
            const measured = values?.breakpoints[index]
            return (
              <tr key={width}>
                <th scope="row">{width}</th>
                <td>
                  {measured === undefined ? 'Not measured yet' : formatPixels(measured.pixels)}
                </td>
                <td>
                  {measured === undefined ? 'Not measured yet' : measured.isMatching ? 'Yes' : 'No'}
                </td>
                <td>{changes}</td>
              </tr>
            )
          })}
        </tbody>
      </ScrollTable>

      <h2>Reading columns</h2>
      <p>
        Resident-facing services use a single column: at most 40rem for forms and 45rem for prose,
        one question or one topic per page. Prose lines stop at the measure, 60 to 75 characters.
        Each box is that column’s maximum width. On a narrow screen it shrinks to fit.
      </p>
      <div data-kv-not-prose="" style={{ display: 'grid', gap: 'var(--kv-space-4)' }}>
        {columns.map(({ id, label, width }) => {
          const measured = values?.columns[id]
          return (
            <div
              key={id}
              data-story-column={id}
              style={{
                boxSizing: 'border-box',
                inlineSize: '100%',
                maxInlineSize: width,
                padding: 'var(--kv-space-3) var(--kv-space-4)',
                border: 'var(--kv-border-width) dashed var(--kv-color-border-control)',
                borderRadius: 'var(--kv-radius-md)',
              }}
            >
              <strong>{label}</strong>: at most{' '}
              {width.startsWith('var(') ? (values?.measure ?? 'not defined') : width}
              {measured === undefined ? '' : `, ${formatPixels(Math.round(measured))} wide here`}.
            </div>
          )
        })}
      </div>

      <h2>Reflow at 320px</h2>
      <p>
        Everything works at 320 CSS px wide, and at 400% zoom, without scrolling sideways (1.4.10).
        The one exception is a data table, which scrolls inside its own labelled, focusable region (
        <code>data-kv-scroll-region</code>). Nothing that contains text gets a fixed width: Finnish
        and Northern Sámi can be 30 to 50% longer than English, so buttons and labels wrap.
      </p>
      {values ? (
        <p>
          {values.hasPageScroll
            ? 'This page scrolls sideways at this width: that is a defect.'
            : 'This page doesn’t scroll sideways at this width.'}
        </p>
      ) : null}
    </TokenPage>
  )
}

const meta = {
  title: 'Foundation/Layout',
  render: () => <LayoutPage />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Layout: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const view = canvasElement.ownerDocument.defaultView
    const width = view?.innerWidth ?? 0
    await waitFor(() =>
      expect(canvas.getByText(new RegExp(`^This viewport is ${width}px wide`))).toBeVisible(),
    )
    // Each breakpoint says, in text, whether it applies at this width.
    for (const { width: breakpoint } of breakpoints) {
      const row = canvas.getByRole('rowheader', { name: breakpoint }).closest('tr')
      if (row === null) {
        throw new Error(`No row for ${breakpoint}`)
      }
      const isMatching = view?.matchMedia(`(width >= ${breakpoint})`).matches === true
      await expect(within(row).getByRole('cell', { name: isMatching ? 'Yes' : 'No' })).toBeVisible()
    }
    // The columns never exceed their maximum, and the page never scrolls sideways.
    const rootFontSize = Number.parseFloat(
      getComputedStyle(canvasElement.ownerDocument.documentElement).fontSize,
    )
    const forms = canvasElement.querySelector('[data-story-column="forms"]')
    await expect(forms?.getBoundingClientRect().width).toBeLessThanOrEqual(40 * rootFontSize)
    await expect(canvas.getByText('This page doesn’t scroll sideways at this width.')).toBeVisible()
  },
}

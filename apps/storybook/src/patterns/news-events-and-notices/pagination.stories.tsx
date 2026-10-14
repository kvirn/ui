import { Pagination } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'
import { ExampleProvider } from './news-events-support.tsx'
import contract from '../../../../../packages/patterns/src/news-events-and-notices/pagination/pagination.a11y.md?raw'

// Patterns/News, events and notices/Pagination (docs/design/storybook-patterns-t5.md S9).
// Story-only: the shipped Pagination, with the first and last page links kept.

const description = `Move through a long list. Every page is a real URL, so Back, a bookmark and "open in new tab" work. Keep the first and last page and the pages next to the current one, with \`Pagination.Ellipsis\` for each gap; leave Previous and Next out (not disabled) on the first and last page. From \`40rem\` the total is the last page link; below it the numbers collapse to Previous, the status and Next, so always render \`Pagination.Status\`. The \`nav\` is named by the library ("Pages"), distinct from the main navigation (R2). Focus is never moved by the component; the app's route handling moves it after a client-side navigation.

## Parts and gaps

Parts used: \`Pagination.Root\`, \`List\`, \`Item\`, \`Link\`, \`Previous\`, \`Next\`, \`Ellipsis\`, \`Status\`. No gap.
`

const meta = {
  title: 'Patterns/News, events and notices/Pagination',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function pagesToShow(current: number, total: number): (number | 'gap')[] {
  const wanted = new Set([1, total, current - 1, current, current + 1])
  const numbers = [...wanted].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b)
  const shown: (number | 'gap')[] = []
  numbers.forEach((page, index) => {
    const previous = numbers[index - 1]
    if (previous !== undefined && page - previous > 1) shown.push('gap')
    shown.push(page)
  })
  return shown
}

function Pages({ current, total }: { current: number; total: number }) {
  return (
    <ExampleProvider>
      <Pagination.Root>
        <Pagination.List>
          {current > 1 ? (
            <Pagination.Item>
              <Pagination.Previous href={`?page=${current - 1}`} />
            </Pagination.Item>
          ) : null}
          {pagesToShow(current, total).map((page, index) => (
            <Pagination.Item key={page === 'gap' ? `gap-${index}` : page}>
              {page === 'gap' ? (
                <Pagination.Ellipsis />
              ) : (
                <Pagination.Link page={page} href={`?page=${page}`} current={page === current} />
              )}
            </Pagination.Item>
          ))}
          <Pagination.Item>
            <Pagination.Status page={current} total={total} />
          </Pagination.Item>
          {current < total ? (
            <Pagination.Item>
              <Pagination.Next href={`?page=${current + 1}`} />
            </Pagination.Item>
          ) : null}
        </Pagination.List>
      </Pagination.Root>
    </ExampleProvider>
  )
}

/** First page: no Previous. */
export const First: Story = {
  globals: { ...wideGlobals },
  render: () => <Pages current={1} total={9} />,
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('link', { name: 'Previous page' })).toBeNull()
    await expect(canvas.getByRole('link', { name: 'Page 9' })).toBeVisible()
  },
}

/** A middle page with gaps on both sides; the current page is a link with `aria-current`. */
export const MiddleWithGaps: Story = {
  globals: { ...wideGlobals },
  render: () => <Pages current={5} total={9} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Page 5' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(canvas.getAllByText('…')).toHaveLength(2)
  },
}

/** Last page: no Next. */
export const Last: Story = {
  globals: { ...wideGlobals },
  render: () => <Pages current={9} total={9} />,
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('link', { name: 'Next page' })).toBeNull()
  },
}

/** Two pages. */
export const TwoPages: Story = {
  globals: { ...wideGlobals },
  render: () => <Pages current={1} total={2} />,
}

/** 320px: Previous, the status and Next; the total is in the status. */
export const Narrow: Story = {
  globals: { ...narrowGlobals },
  render: () => <Pages current={5} total={9} />,
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Tab moves through every link in order, the current page included; the gap and status are no stops. */
export const Keyboard: Story = {
  globals: { ...wideGlobals },
  render: () => <Pages current={5} total={9} />,
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Previous page' })).toHaveFocus()
  },
}

/** Right to left: the arrows mirror; DOM order is unchanged. */
export const RTL: Story = {
  ...MiddleWithGaps,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}

/** Forced colours: the current page keeps a shape that is not colour alone. */
export const ForcedColors: Story = {
  ...MiddleWithGaps,
  globals: { forcedColors: 'active', ...wideGlobals },
}

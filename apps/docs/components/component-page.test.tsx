import { KvirnProvider } from '@kvirn-ui/react'
import { describe, expect, test } from 'vite-plus/test'
import { render } from 'vitest-browser-react'
import { ComponentPage } from './component-page.tsx'
import { componentPages } from './site-sections.ts'

// Plan 0100 G1, component-gallery.md §3.5: the one-line job is data, written once, and the page's
// lead starts with it.
const pageSources = import.meta.glob('./*-page.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const componentPageTitles = (Object.values(pageSources) as string[]).flatMap((source) =>
  [...source.matchAll(/<ComponentPage\s+title="([^"]+)"/g)].map((match) => match[1] ?? ''),
)

describe('component page summaries', () => {
  test('every component page has a one-sentence summary ending in a full stop', () => {
    const notOneSentence = componentPages
      .filter((page) => !/^[^.!?]+\.$/.test(page.summary))
      .map((page) => page.label)
    expect(notOneSentence).toEqual([])
  })

  test('every title used with ComponentPage resolves to a listed page', () => {
    const labels = componentPages.map((page) => page.label)
    expect(componentPageTitles).toHaveLength(labels.length)
    expect(componentPageTitles.filter((title) => !labels.includes(title))).toEqual([])
  })

  test('the lead paragraph starts with the summary and continues with the rest of the lead', async () => {
    const button = componentPages.find((page) => page.label === 'Button')!
    const screen = await render(
      <KvirnProvider locale="en">
        <ComponentPage title="Button" lead="The rest." status="alpha" />
      </KvirnProvider>,
    )
    await expect.element(screen.getByText(`${button.summary} The rest.`)).toBeInTheDocument()
  })

  test('a page without a listed entry renders its lead alone', async () => {
    const screen = await render(
      <KvirnProvider locale="en">
        <ComponentPage title="Not listed" lead="Only the lead." status="alpha" />
      </KvirnProvider>,
    )
    await expect.element(screen.getByText('Only the lead.', { exact: true })).toBeInTheDocument()
  })
})

import { KvirnProvider } from '@kvirn-ui/react'
import { describe, expect, test } from 'vite-plus/test'
import { render } from 'vitest-browser-react'
import { ComponentPage } from './component-page.tsx'
import { messages } from '../messages/en.ts'
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

describe('component page facts', () => {
  const facts = messages.docs.facts
  const renderPage = (props: Partial<Parameters<typeof ComponentPage>[0]> = {}) =>
    render(
      <KvirnProvider locale="en">
        <ComponentPage title="Tabs" status="alpha-candidate" {...props} />
      </KvirnProvider>,
    )
  const factsList = () => document.querySelector('dl')!
  const termsOf = () => [...factsList().querySelectorAll('dt')].map((term) => term.textContent)

  test('the facts are Status, Package and Testing with assistive technology, which is pending', async () => {
    await renderPage()
    expect(termsOf()).toEqual([messages.docs.status.label, facts.package, facts.atTesting])
    expect(factsList().textContent).toContain(messages.docs.status.alphaCandidate)
    expect(factsList().textContent).toContain('@kvirn-ui/react')
    expect(factsList().textContent).toContain(facts.pending)
  })

  test('a page that names its pattern gets a Pattern fact, and the package can be changed', async () => {
    await renderPage({ pattern: 'APG Tabs', packageName: '@kvirn-ui/patterns' })
    expect(termsOf()).toContain(facts.pattern)
    expect(factsList().textContent).toContain('APG Tabs')
    expect(factsList().textContent).toContain('@kvirn-ui/patterns')
  })

  test('the status sentence follows the facts unless the component is stable', async () => {
    const screen = await renderPage()
    await expect
      .element(screen.getByText(messages.docs.status.alphaCandidateText))
      .toBeInTheDocument()
    await screen.unmount()
    const stable = await renderPage({ status: 'stable' })
    expect(stable.getByText(messages.docs.status.stableText).query()).toBeNull()
  })
})

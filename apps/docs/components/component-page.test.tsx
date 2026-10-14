import { KvirnProvider } from '@kvirn-ui/react'
import { describe, expect, test } from 'vite-plus/test'
import { render } from 'vitest-browser-react'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { parseContract } from '../lib/contract-parser.ts'
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

  test('the facts are Status and, when the page names its pattern, Pattern', async () => {
    await renderPage({ pattern: 'APG Tabs' })
    expect(termsOf()).toEqual([messages.docs.status.label, facts.pattern])
    expect(factsList().textContent).toContain(messages.docs.status.alphaCandidate)
    expect(factsList().textContent).toContain('APG Tabs')
  })

  test('a page that gives no pattern has the Status fact alone', async () => {
    await renderPage()
    expect(termsOf()).toEqual([messages.docs.status.label])
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

describe('component page sections', () => {
  const contracts = import.meta.glob('../../../packages/react/src/button/button.a11y.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  })

  test('the h2s are Accessibility, Keyboard, Known issues, then API reference, and the contents match', async () => {
    const contract = parseContract(Object.values(contracts)[0] as string, 'button.a11y.md')
    const screen = await render(
      <KvirnProvider locale="en">
        <ComponentPage
          title="Button"
          status="alpha"
          contract={<ContractSectionsView contract={contract} />}
          contractSections={contractSectionList(contract)}
          api={<p>Props.</p>}
        />
      </KvirnProvider>,
    )
    const sections = messages.docs.contract.sections
    const headingIds = [...document.querySelectorAll('h2[id]')]
      .map((heading) => heading.id)
      .filter((id) => id !== 'contents-title')
    expect(headingIds).toEqual(['accessibility', 'keyboard', 'known-issues', 'api'])
    expect(document.getElementById('known-issues')?.textContent).toContain(sections.knownIssues)
    const contents = [...document.querySelectorAll('nav a[href^="#"]')].map((link) =>
      link.getAttribute('href'),
    )
    const h2Contents = contents.filter(
      (href) => document.getElementById(href?.slice(1) ?? '')?.tagName === 'H2',
    )
    expect(h2Contents).toEqual(headingIds.map((id) => `#${id}`))
    await expect
      .element(screen.getByText(messages.docs.contract.accessibility.testingIntro))
      .toBeInTheDocument()
  })

  test('a relative link in a contract renders as a link with its href', async () => {
    const contract = parseContract(Object.values(contracts)[0] as string, 'button.a11y.md')
    await render(
      <KvirnProvider locale="en">
        <ContractSectionsView contract={contract} />
      </KvirnProvider>,
    )
    const link = [...document.querySelectorAll('a')].find(
      (anchor) => anchor.getAttribute('href') === '/foundation/theming#moving-indicators',
    )
    expect(link?.textContent).toBe('Moving indicators and WCAG 2.2.2')
  })

  test("a note given for a contract section renders after that section's content", async () => {
    const contract = parseContract(Object.values(contracts)[0] as string, 'button.a11y.md')
    const sectionId = contract.accessibility[0]?.id ?? ''
    await render(
      <KvirnProvider locale="en">
        <ContractSectionsView
          contract={contract}
          notes={{
            [sectionId]: <p data-testid="section-note">Read this first</p>,
            keyboard: <p data-testid="keyboard-note">Keys</p>,
          }}
        />
      </KvirnProvider>,
    )
    const isInsideSection = (headingId: string, testId: string) => {
      const headings = [...document.querySelectorAll('h2, h3')]
      const heading = document.getElementById(headingId)!
      const nextHeading = headings[headings.indexOf(heading) + 1]
      const note = document.querySelector(`[data-testid="${testId}"]`)!
      const after = heading.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING
      const before =
        nextHeading === undefined ||
        note.compareDocumentPosition(nextHeading) & Node.DOCUMENT_POSITION_FOLLOWING
      return Boolean(after && before)
    }
    expect(isInsideSection(sectionId, 'section-note')).toBe(true)
    expect(isInsideSection('keyboard', 'keyboard-note')).toBe(true)
  })

  test('a note for a section the contract does not render is a developer error', () => {
    const contract = {
      ...parseContract(Object.values(contracts)[0] as string, 'button.a11y.md'),
      knownIssues: [],
    }
    expect(() =>
      ContractSectionsView({ contract, notes: { 'known-issues': 'Never shown' } }),
    ).toThrow(/known-issues/)
  })
})

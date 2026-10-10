import '@kvirn-ui/theme/theme.css'
import { KvirnProvider } from '@kvirn-ui/react'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { describe, expect, test } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import ContentTypesIndexPage from '../app/content-types/page.tsx'
import { ContentTypePage } from './content-type-page.tsx'
import { contentTypePages } from './site-sections.ts'

const renderIndex = () =>
  render(
    <KvirnProvider locale="en">
      <ContentTypesIndexPage />
    </KvirnProvider>,
  )

describe('Content types index', () => {
  test('one h1 and a lead that says a content type is everything in between', async () => {
    await renderIndex()
    expect(page.getByRole('heading', { level: 1 }).elements()).toHaveLength(1)
    await expect
      .element(page.getByText('everything in between', { exact: false }))
      .toBeInTheDocument()
  })

  test('lists the four content types, each linking to its page', async () => {
    await renderIndex()
    expect(contentTypePages).toHaveLength(4)
    for (const contentType of contentTypePages) {
      await expect
        .element(page.getByRole('link', { name: contentType.label, exact: true }))
        .toHaveAttribute('href', contentType.href)
    }
  })

  test('has no axe violations', async () => {
    const { container } = await renderIndex()
    await expect.element(page.getByRole('link', { name: 'Subpage' })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})

describe('ContentTypePage', () => {
  const renderItem = () =>
    render(
      <KvirnProvider locale="en">
        <ContentTypePage slug="content-page" />
      </KvirnProvider>,
    )

  test('one h1 named by the type, with the summary as the lead', async () => {
    await renderItem()
    const headings = page.getByRole('heading', { level: 1 })
    expect(headings.elements()).toHaveLength(1)
    await expect.element(headings).toHaveTextContent('Content page')
    const summary = contentTypePages.find((entry) => entry.label === 'Content page')!.summary
    await expect.element(page.getByText(summary)).toBeInTheDocument()
  })

  test('says the type is only the part between the header and the footer', async () => {
    await renderItem()
    await expect
      .element(page.getByText('only the part between the header and the footer', { exact: false }))
      .toBeInTheDocument()
  })

  test('has no axe violations', async () => {
    const { container } = await renderItem()
    await expect.element(page.getByRole('heading', { level: 1 })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})

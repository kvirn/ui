import { KvirnProvider } from '@kvirn-ui/react'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { describe, expect, test } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { PageContents } from '../page-contents.tsx'
import { componentGroups } from '../site-sections.ts'
import { Gallery } from './gallery.tsx'

const groups = [
  {
    id: 'actions',
    label: 'Actions',
    items: [
      { href: '/components/button', label: 'Button', summary: 'Does something.' },
      {
        href: '/components/link',
        label: 'Link',
        summary: 'Goes somewhere.',
        preview: <svg focusable="false" viewBox="0 0 160 100" />,
      },
    ],
  },
  {
    id: 'forms',
    label: 'Forms',
    items: [{ href: '/components/field', label: 'Field', summary: 'Labels an input.' }],
  },
  { id: 'empty', label: 'Empty', items: [] },
]

const renderGallery = () =>
  render(
    <KvirnProvider>
      <h1>Components</h1>
      <Gallery groups={groups} />
    </KvirnProvider>,
  )

describe('Gallery', () => {
  test('the page keeps one h1 and each group is an h2 with its id', async () => {
    await renderGallery()
    expect(page.getByRole('heading', { level: 1 }).elements()).toHaveLength(1)
    const headings = page.getByRole('heading', { level: 2 })
    await expect.element(headings.first()).toHaveTextContent('Actions')
    expect(headings.elements().map((element) => element.id)).toEqual(['actions', 'forms'])
  })

  test('a group without items renders no heading', async () => {
    await renderGallery()
    await expect.element(page.getByRole('heading', { name: 'Empty' })).not.toBeInTheDocument()
  })

  test('each group is a list with one item per page', async () => {
    await renderGallery()
    expect(page.getByRole('list').elements()).toHaveLength(2)
    expect(page.getByRole('listitem').elements()).toHaveLength(3)
  })

  test('each card has one link named by the page label, in an h3', async () => {
    await renderGallery()
    for (const item of groups.flatMap((group) => group.items)) {
      const card = page.getByRole('listitem').filter({ hasText: item.summary })
      const links = card.getByRole('link')
      expect(links.elements()).toHaveLength(1)
      await expect.element(links).toHaveAccessibleName(item.label)
      await expect.element(links).toHaveAttribute('href', item.href)
      await expect.element(card.getByRole('heading', { level: 3 })).toHaveTextContent(item.label)
      await expect.element(card.getByText(item.summary)).toBeInTheDocument()
    }
  })

  test('the preview sits inside the link and is hidden from assistive technology', async () => {
    const { container } = await renderGallery()
    const link = page.getByRole('link', { name: 'Link' }).element()
    const preview = link.querySelector('svg')
    expect(preview).not.toBeNull()
    expect(preview?.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(container.querySelectorAll('a a, a button')).toHaveLength(0)
  })

  test('a card without a preview has no picture box', async () => {
    await renderGallery()
    const link = page.getByRole('link', { name: 'Button' }).element()
    expect(link.querySelector('[aria-hidden]')).toBeNull()
  })

  test('has no axe violations', async () => {
    const { container } = await renderGallery()
    await expect.element(page.getByRole('link', { name: 'Button' })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})

describe('the Components index', () => {
  test('no two links with different targets share a name (2.4.4)', async () => {
    const index = componentGroups.map((group) => ({
      id: group.id,
      label: group.label,
      items: group.pages.map((entry) => ({ ...entry })),
    }))
    const { container } = await render(
      <KvirnProvider>
        <PageContents sections={index} />
        <Gallery groups={index} />
      </KvirnProvider>,
    )
    const targets = new Map<string, Set<string>>()
    for (const link of container.querySelectorAll('a')) {
      const name = (link.textContent ?? '').trim()
      targets.set(name, (targets.get(name) ?? new Set()).add(link.getAttribute('href') ?? ''))
    }
    const clashes = [...targets].filter(([, hrefs]) => hrefs.size > 1).map(([name]) => name)
    expect(clashes).toEqual([])
  })
})

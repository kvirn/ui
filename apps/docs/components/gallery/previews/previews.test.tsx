import { KvirnProvider } from '@kvirn-ui/react'
import { describe, expect, test } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { componentPages } from '../../site-sections.ts'
import { Gallery } from '../gallery.tsx'
import { galleryPreviews } from './index.ts'

const entries = Object.entries(galleryPreviews)

describe('galleryPreviews', () => {
  test('every key is the slug of a component page', () => {
    const slugs = componentPages.map((componentPage) => componentPage.href.split('/').at(-1))
    for (const [slug] of entries) expect(slugs).toContain(slug)
  })

  test('every preview is a decorative svg of the shared size with no text', async () => {
    expect(entries.length).toBeGreaterThan(0)
    const failing: string[] = []
    for (const [slug, preview] of entries) {
      const { container, unmount } = await render(<div>{preview}</div>)
      const svg = container.querySelector('svg')
      const decorative =
        svg?.getAttribute('aria-hidden') === 'true' &&
        svg.getAttribute('focusable') === 'false' &&
        svg.getAttribute('viewBox') === '0 0 160 100' &&
        container.querySelectorAll('title, text, tspan').length === 0
      if (!decorative) failing.push(slug)
      await unmount()
    }
    expect(failing).toEqual([])
  })

  test('the Gallery renders a registered preview inside the one link of its card', async () => {
    const [slug] = entries[0] ?? []
    const { container } = await render(
      <KvirnProvider>
        <Gallery
          groups={[
            {
              id: 'actions',
              label: 'Actions',
              items: [
                {
                  href: `/components/${slug}`,
                  label: 'Thing',
                  summary: 'Does a thing.',
                  preview: galleryPreviews[slug ?? ''],
                },
              ],
            },
          ]}
        />
      </KvirnProvider>,
    )
    const links = page.getByRole('link', { name: 'Thing' })
    expect(links.elements()).toHaveLength(1)
    expect(links.element().querySelector('svg')).not.toBeNull()
    expect(container.querySelectorAll('a a, a button')).toHaveLength(0)
  })
})

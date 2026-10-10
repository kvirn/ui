import { describe, expect, test } from 'vite-plus/test'
import { render } from 'vitest-browser-react'
import { componentPages } from '../../site-sections.ts'
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
        container.querySelectorAll('title, text, tspan').length === 0
      if (!decorative) failing.push(slug)
      await unmount()
    }
    expect(failing).toEqual([])
  })
})

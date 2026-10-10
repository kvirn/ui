import { describe, expect, test } from 'vite-plus/test'

const pageSources = import.meta.glob('./prose-page.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
})

describe('Prose page use cases', () => {
  test('the page has seven use cases, and inset text, steps and images and media are three of them', () => {
    const source = Object.values(pageSources).join('') as string
    const ids = [...source.matchAll(/<UseCase\s+id="([^"]+)"/g)].map((match) => match[1])
    expect(ids).toHaveLength(7)
    expect(ids).toEqual(expect.arrayContaining(['inset-text', 'steps', 'images-and-media']))
  })
})

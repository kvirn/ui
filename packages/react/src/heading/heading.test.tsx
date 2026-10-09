import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, test, vi } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Heading } from './heading.tsx'
import type { HeadingTag } from './heading.tsx'
import { useHeading } from './use-heading.ts'

// Contract: heading.a11y.md.

describe('Heading', () => {
  test.each([
    ['h1', 1],
    ['h2', 2],
    ['h3', 3],
    ['h4', 4],
    ['h5', 5],
    ['h6', 6],
  ] satisfies [HeadingTag, number][])('as %s renders that element', async (tag, level) => {
    await render(<Heading as={tag}>Kontakta oss</Heading>)
    const heading = page.getByRole('heading', { level, name: 'Kontakta oss' })
    expect(heading.element().tagName).toBe(tag.toUpperCase())
  })

  test('adds only its classes, no role or ARIA, and passes attributes and the ref through', async () => {
    const ref = createRef<HTMLHeadingElement>()
    await render(
      <Heading as="h2" id="kontakt" lang="en" ref={ref}>
        Contact us
      </Heading>,
    )
    const element = page.getByRole('heading').element()
    expect(element.getAttributeNames().sort()).toEqual(['class', 'id', 'lang'])
    expect(ref.current).toBe(element)
  })

  test('the part and size classes, apart from the level: every level defaults to its own size, h1 to h6, and a consumer class joins', async () => {
    await render(
      <>
        <Heading as="h1">Ett</Heading>
        <Heading as="h3" size="display">
          Tre
        </Heading>
        <Heading as="h4">Fyra</Heading>
        <Heading as="h2" size="heading-3" className="annat">
          Två
        </Heading>
      </>,
    )
    const classOf = (name: string) => page.getByRole('heading', { name }).element().className
    expect(classOf('Ett')).toBe('kv-heading kv-heading--heading-1')
    expect(classOf('Tre')).toBe('kv-heading kv-heading--display')
    expect(classOf('Fyra')).toBe('kv-heading kv-heading--heading-4')
    expect(classOf('Två')).toBe('annat kv-heading kv-heading--heading-3')
    await expect.element(page.getByRole('heading', { name: 'Tre', level: 3 })).toBeVisible()
  })

  test('useHeading gives the element and the size', () => {
    expect(useHeading({ level: 5 })).toMatchObject({ element: 'h5', size: 'heading-5' })
    expect(useHeading({ level: 6 }).size).toBe('heading-6')
    expect(useHeading({ level: 2, size: 'display' })).toMatchObject({
      element: 'h2',
      size: 'display',
    })
  })

  test('a heading renders the same element on the server', () => {
    expect(renderToString(<Heading as="h2">Kontakta oss</Heading>)).toContain('<h2')
  })

  test('an element outside h1 to h6 warns once and falls back to h2', async () => {
    resetDevWarnings()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const notAllowed = 'legend' as HeadingTag
    await render(<Heading as={notAllowed}>Kontakta oss</Heading>)
    expect(page.getByRole('heading', { level: 2 }).element().tagName).toBe('H2')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]?.[0])).toContain('Heading as="legend"')
    warn.mockRestore()
  })

  test('has no axe violations', async () => {
    const { container } = await render(
      <main>
        <Heading as="h1">Tjänster</Heading>
        <Heading as="h2">Kontakta oss</Heading>
      </main>,
    )
    await expect.element(page.getByRole('heading', { level: 2 })).toBeVisible()
    await expectNoA11yViolations(container)
  })
})

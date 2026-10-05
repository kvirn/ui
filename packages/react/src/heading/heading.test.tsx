import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { describe, expect, test } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { Heading } from './heading.tsx'
import type { HeadingLevel } from './heading.tsx'
import { useHeading } from './use-heading.ts'

// Contract: heading.a11y.md.

describe('Heading', () => {
  test.each([1, 2, 3, 4, 5, 6] satisfies HeadingLevel[])(
    'level %i renders that element',
    async (level) => {
      await render(<Heading level={level}>Kontakta oss</Heading>)
      const heading = page.getByRole('heading', { level, name: 'Kontakta oss' })
      expect(heading.element().tagName).toBe(`H${level}`)
    },
  )

  test('adds only its classes, no role or ARIA, and passes attributes and the ref through', async () => {
    const ref = createRef<HTMLHeadingElement>()
    await render(
      <Heading level={2} id="kontakt" lang="en" ref={ref}>
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
        <Heading level={1}>Ett</Heading>
        <Heading level={3} size="display">
          Tre
        </Heading>
        <Heading level={4}>Fyra</Heading>
        <Heading level={2} size="heading-3" className="annat">
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

  test('render changes the element and the function form reads the level', async () => {
    await render(
      <>
        <Heading level={3} render={<p data-testid="element" />}>
          Text
        </Heading>
        <Heading
          level={4}
          render={(props, state) => (
            <p {...props} data-testid="function" data-level={state.level} />
          )}
        >
          Text
        </Heading>
      </>,
    )
    expect(page.getByTestId('element').element().tagName).toBe('P')
    expect(page.getByTestId('function').element().getAttribute('data-level')).toBe('4')
    expect(page.getByTestId('function').element().hasAttribute('data-size')).toBe(false)
  })

  test('has no axe violations', async () => {
    const { container } = await render(
      <main>
        <Heading level={1}>Tjänster</Heading>
        <Heading level={2}>Kontakta oss</Heading>
      </main>,
    )
    await expect.element(page.getByRole('heading', { level: 2 })).toBeVisible()
    await expectNoA11yViolations(container)
  })
})

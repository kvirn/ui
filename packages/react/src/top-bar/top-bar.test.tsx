import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { mergeProps } from '../merge-props/merge-props.ts'
import { readAloud } from '@kvirn-ui/testing/read-aloud'
import { createRef } from 'react'
import { describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { Button } from '../button/button.tsx'
import { Link } from '../link/link.tsx'
import { Navigation } from '../navigation/navigation.tsx'
import { TopBar } from './top-bar.tsx'
import type { TopBarProps } from './top-bar.tsx'
import { useTopBar } from './use-top-bar.ts'
import type { TopBarPartProps, UseTopBarOptions, UseTopBarResult } from './use-top-bar.ts'

// Contract: top-bar.a11y.md. The 24px target and 48px band checks are measured in the Storybook
// stories (`expectTopBarTargetSizes`), where the theme is loaded.

function ReferenceBar({ variant }: UseTopBarOptions) {
  return (
    <>
      {/* Unstyled links: a 24px minimum keeps them clear of axe's target-size rule (2.5.8). The real size is measured in the stories, with the theme. */}
      <style>{'a { display: inline-block; min-block-size: 24px; }'}</style>
      <TopBar variant={variant} data-testid="top-bar">
        <p>
          Kvirnby kommun. <Link.Root href="#senaste">Latest news</Link.Root>
        </p>
        <Navigation.Root label="Verktyg" className="kv-navigation--horizontal">
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#dokumentation" current>
                Documentation
              </Link.Root>
            </Navigation.Item>
            <Navigation.Item>
              <Link.Root href="#github">GitHub</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Root>
      </TopBar>
    </>
  )
}

describe('rendering', () => {
  test('the root is a plain div with no role, and the Navigation inside it is the landmark', async () => {
    await render(
      <main>
        <ReferenceBar />
      </main>,
    )
    const bar = page.getByTestId('top-bar').element()
    expect(bar.localName).toBe('div')
    expect(
      bar.getAttributeNames().filter((name) => name === 'role' || name.startsWith('aria-')),
    ).toEqual([])
    expect(bar.hasAttribute('tabindex')).toBe(false)
    expect(page.getByRole('navigation').elements()).toHaveLength(1)
    expect(page.getByRole('navigation', { name: 'Verktyg' }).element().parentElement).toBe(bar)
    expect(page.getByRole('banner').elements()).toHaveLength(0)
  })

  test('renders its children in DOM order and no text of its own', async () => {
    await render(<ReferenceBar />)
    const bar = page.getByTestId('top-bar').element()
    expect(bar.firstElementChild).toBe(page.getByRole('paragraph').element())
    expect(bar.lastElementChild).toBe(page.getByRole('navigation').element())
    expect(bar.textContent).toBe('Kvirnby kommun. Latest newsDocumentationGitHub')
  })

  test('forwards its ref and passes attributes through', async () => {
    const ref = createRef<HTMLDivElement>()
    await render(
      <TopBar ref={ref} id="verktygsfalt" data-testid="top-bar">
        Text
      </TopBar>,
    )
    const bar = page.getByTestId('top-bar')
    expect(ref.current).toBe(bar.element())
    await expect.element(bar).toHaveAttribute('id', 'verktygsfalt')
  })

  test('TopBar is a flat single element with its own display name', () => {
    expect(TopBar.displayName).toBe('TopBar')
  })
})

describe('variant', () => {
  test.each([
    [undefined, 'kv-top-bar'],
    ['primary', 'kv-top-bar kv-top-bar--primary'],
    ['secondary', 'kv-top-bar kv-top-bar--secondary'],
    ['accent', 'kv-top-bar kv-top-bar--accent'],
  ] as const)('variant %s renders the class "%s"', async (variant, className) => {
    await render(<ReferenceBar variant={variant} />)
    expect(page.getByTestId('top-bar').element().className).toBe(className)
  })

  test('a variant adds no role, ARIA or data attribute', async () => {
    await render(<ReferenceBar variant="accent" />)
    const names = page.getByTestId('top-bar').element().getAttributeNames()
    expect(names.sort()).toEqual(['class', 'data-testid'])
  })

  test('a consumer className joins the bar’s class instead of replacing it', async () => {
    await render(
      <TopBar variant="secondary" className="annat" data-testid="top-bar">
        Text
      </TopBar>,
    )
    await expect
      .element(page.getByTestId('top-bar'))
      .toHaveClass('kv-top-bar', 'kv-top-bar--secondary', 'annat')
  })
})

describe('keyboard', () => {
  function KeyboardBar({ onActivate }: { onActivate?: () => void }) {
    return (
      <TopBar variant="primary">
        <p>
          Kvirnby kommun. <Link.Root href="#senaste">Latest news</Link.Root>
        </p>
        <Navigation.Root label="Verktyg" className="kv-navigation--horizontal">
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#dokumentation" current>
                Documentation
              </Link.Root>
            </Navigation.Item>
            <Navigation.Item>
              <Link.Root href="#github">GitHub</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Root>
        <Button className="kv-button--link" onClick={onActivate}>
          Display settings
        </Button>
      </TopBar>
    )
  }

  const itemNames = ['Latest news', 'Documentation', 'GitHub', 'Display settings']

  test('Tab moves through the bar items in DOM order', async () => {
    await render(<KeyboardBar />)
    for (const name of itemNames) {
      await userEvent.keyboard('{Tab}')
      await expect
        .element(page.getByRole(name === 'Display settings' ? 'button' : 'link', { name }))
        .toHaveFocus()
    }
  })

  test('Shift+Tab moves back through the bar items', async () => {
    await render(<KeyboardBar />)
    for (let step = 0; step < itemNames.length; step++) {
      await userEvent.keyboard('{Tab}')
    }
    await expect.element(page.getByRole('button', { name: 'Display settings' })).toHaveFocus()
    for (const name of itemNames.toReversed().slice(1)) {
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
      await expect.element(page.getByRole('link', { name })).toHaveFocus()
    }
  })

  test('Enter follows a link', async () => {
    await render(<KeyboardBar />)
    window.location.hash = ''
    await userEvent.keyboard('{Tab}{Tab}{Tab}')
    await expect.element(page.getByRole('link', { name: 'GitHub' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(window.location.hash).toBe('#github')
    await expect.element(page.getByRole('link', { name: 'GitHub' })).toHaveFocus()
  })

  test('Enter or Space activates a link-look button', async () => {
    const onActivate = vi.fn<() => void>()
    await render(<KeyboardBar onActivate={onActivate} />)
    const button = page.getByRole('button', { name: 'Display settings' })
    await userEvent.keyboard('{Tab}{Tab}{Tab}{Tab}')
    await expect.element(button).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onActivate).toHaveBeenCalledTimes(1)
    await userEvent.keyboard(' ')
    expect(onActivate).toHaveBeenCalledTimes(2)
    await expect.element(button).toHaveFocus()
  })

  test('the bar handles no key itself: arrows, Home and End move nothing', async () => {
    await render(<KeyboardBar />)
    await userEvent.keyboard('{Tab}')
    const first = page.getByRole('link', { name: 'Latest news' })
    await expect.element(first).toHaveFocus()
    for (const key of [
      '{ArrowRight}',
      '{ArrowLeft}',
      '{ArrowDown}',
      '{ArrowUp}',
      '{End}',
      '{Home}',
    ]) {
      await userEvent.keyboard(key)
      await expect.element(first).toHaveFocus()
    }
  })
})

describe('axe', () => {
  test.each([undefined, 'primary', 'secondary', 'accent'] as const)(
    'has no axe violations with variant %s',
    async (variant) => {
      const { container } = await render(
        <main>
          <ReferenceBar variant={variant} />
        </main>,
      )
      await expect.element(page.getByRole('navigation', { name: 'Verktyg' })).toBeVisible()
      await expectNoA11yViolations(container)
    },
  )
})

describe('useTopBar', () => {
  test('maps each variant to its class, and none to the base class', () => {
    expect(useTopBar().topBarProps.className).toBe('kv-top-bar')
    expect(useTopBar({ variant: undefined }).topBarProps.className).toBe('kv-top-bar')
    expect(useTopBar({ variant: 'primary' }).topBarProps.className).toBe(
      'kv-top-bar kv-top-bar--primary',
    )
    expect(useTopBar({ variant: 'secondary' }).topBarProps.className).toBe(
      'kv-top-bar kv-top-bar--secondary',
    )
    expect(useTopBar({ variant: 'accent' }).topBarProps.className).toBe(
      'kv-top-bar kv-top-bar--accent',
    )
  })

  test('returns the same frozen props every time', () => {
    const result = useTopBar({ variant: 'accent' })
    expect(useTopBar({ variant: 'accent' })).toBe(result)
    expect(Object.isFrozen(result)).toBe(true)
    expect(Object.isFrozen(result.topBarProps)).toBe(true)
  })

  test('works on your own element and merges with your props', async () => {
    function OwnBar() {
      const topBar = useTopBar({ variant: 'accent' })
      return (
        <div {...mergeProps({ className: 'annat', 'data-testid': 'own' }, topBar.topBarProps)}>
          Text
        </div>
      )
    }
    await render(<OwnBar />)
    await expect
      .element(page.getByTestId('own'))
      .toHaveClass('kv-top-bar', 'kv-top-bar--accent', 'annat')
  })
})

describe('read aloud', () => {
  test('the bar reads in DOM order with no phrase of its own, the navigation by its label, the current tool as the current item, a link-look button as a button', async () => {
    const { container } = await render(
      <main>
        <TopBar>
          <p>Kvirnby kommun.</p>
          <Navigation.Root label="Verktyg" className="kv-navigation--horizontal">
            <Navigation.List>
              <Navigation.Item>
                <Link.Root href="#dokumentation" current>
                  Documentation
                </Link.Root>
              </Navigation.Item>
            </Navigation.List>
          </Navigation.Root>
          <Button className="kv-button--link">Display settings</Button>
        </TopBar>
      </main>,
    )
    const phrases = await readAloud(container)
    expect(phrases).toContain('navigation, Verktyg')
    expect(phrases).toContain('link, Documentation, current item')
    expect(phrases).toContain('button, Display settings')
    expect(phrases.some((phrase) => /banner|region|group/.test(phrase))).toBe(false)
    expect(phrases.indexOf('navigation, Verktyg')).toBeLessThan(
      phrases.indexOf('button, Display settings'),
    )
  })
})

describe('server rendering', () => {
  test('renders to a string without touching the page', () => {
    expect(renderToString(<TopBar variant="accent">Text</TopBar>)).toBe(
      '<div class="kv-top-bar kv-top-bar--accent">Text</div>',
    )
  })
})

describe('types', () => {
  test('exports the part, option and result types', () => {
    expectTypeOf<UseTopBarOptions['variant']>().toEqualTypeOf<
      'primary' | 'secondary' | 'accent' | undefined
    >()
    expectTypeOf<UseTopBarResult['topBarProps']>().toEqualTypeOf<TopBarPartProps>()
    expectTypeOf<TopBarProps>().toHaveProperty('variant')
    expectTypeOf<TopBarProps>().toHaveProperty('className')
  })
})

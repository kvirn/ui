import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { Button } from '../button/button.tsx'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Link } from '../link/link.tsx'
import {
  SidebarLayout,
  SidebarLayoutContent,
  SidebarLayoutRoot,
  SidebarLayoutSidebar,
} from './sidebar-layout.tsx'
import type { SidebarLayoutRootProps, SidebarLayoutState } from './sidebar-layout.tsx'
import { useSidebarLayout } from './use-sidebar-layout.ts'
import type {
  SidebarLayoutPartProps,
  UseSidebarLayoutOptions,
  UseSidebarLayoutResult,
} from './use-sidebar-layout.ts'

// Contract: sidebar-layout.a11y.md.

const parts = [
  ['Root', SidebarLayout.Root, 'kv-sidebar-layout'],
  ['Sidebar', SidebarLayout.Sidebar, 'kv-sidebar-layout-sidebar'],
  ['Content', SidebarLayout.Content, 'kv-sidebar-layout-content'],
] as const

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

function ArticlePage() {
  return (
    <SidebarLayout.Root>
      <SidebarLayout.Sidebar render={<nav aria-label="I det här avsnittet" />}>
        <Link.Root href="#avfall">Avfall</Link.Root>
        <Link.Root href="#vatten">Vatten</Link.Root>
      </SidebarLayout.Sidebar>
      <SidebarLayout.Content render={<main />}>
        <h1>Sophämtning</h1>
        <Button>Beställ extra tömning</Button>
      </SidebarLayout.Content>
    </SidebarLayout.Root>
  )
}

describe('rendering', () => {
  test.each(parts)(
    'SidebarLayout.%s renders one <div> with its part class',
    async (_name, Part, className) => {
      await render(
        <SidebarLayout.Root>
          <Part data-testid="part">Innehåll</Part>
        </SidebarLayout.Root>,
      )
      const part = page.getByTestId('part').element()
      expect(part.tagName).toBe('DIV')
      expect(part.className).toBe(className)
      expect(part.textContent).toBe('Innehåll')
    },
  )

  test('sidebarWidth "md" is the default and adds no modifier', async () => {
    await render(<SidebarLayout.Root data-testid="root" />)
    expect(page.getByTestId('root').element().className).toBe('kv-sidebar-layout')
  })

  test('sidebarWidth "sm" adds only its modifier class', async () => {
    await render(<SidebarLayout.Root sidebarWidth="sm" data-testid="root" />)
    expect(page.getByTestId('root').element().className).toBe(
      'kv-sidebar-layout kv-sidebar-layout--sidebar-sm',
    )
  })

  test('sidebarWidth is not passed on to the element', async () => {
    await render(<SidebarLayout.Root sidebarWidth="sm" data-testid="root" />)
    await expect.element(page.getByTestId('root')).not.toHaveAttribute('sidebarwidth')
  })

  test('adds no role, ARIA, tabindex, inert or data attribute', async () => {
    const { container } = await render(
      <SidebarLayout.Root>
        <SidebarLayout.Sidebar>Sida</SidebarLayout.Sidebar>
        <SidebarLayout.Content>Innehåll</SidebarLayout.Content>
      </SidebarLayout.Root>,
    )
    const layoutElements = [
      ...container.querySelectorAll(
        '.kv-sidebar-layout, .kv-sidebar-layout-sidebar, .kv-sidebar-layout-content',
      ),
    ]
    expect(layoutElements).toHaveLength(3)
    for (const element of layoutElements) {
      const attributeNames = element.getAttributeNames()
      expect(
        attributeNames.filter(
          (name) => name === 'role' || name.startsWith('aria-') || name.startsWith('data-'),
        ),
      ).toEqual([])
      expect(attributeNames).not.toContain('tabindex')
      expect(attributeNames).not.toContain('inert')
    }
  })

  test('Content is not <main> by default', async () => {
    await render(
      <SidebarLayout.Root>
        <SidebarLayout.Content>Innehåll</SidebarLayout.Content>
      </SidebarLayout.Root>,
    )
    expect(page.getByRole('main').elements()).toHaveLength(0)
  })

  test.each(parts)('SidebarLayout.%s passes attributes through', async (_name, Part) => {
    await render(
      <SidebarLayout.Root>
        <Part data-testid="part" id="del" lang="fi" aria-label="Osa" title="Otsikko" />
      </SidebarLayout.Root>,
    )
    const part = page.getByTestId('part')
    await expect.element(part).toHaveAttribute('id', 'del')
    await expect.element(part).toHaveAttribute('lang', 'fi')
    await expect.element(part).toHaveAttribute('aria-label', 'Osa')
    await expect.element(part).toHaveAttribute('title', 'Otsikko')
  })

  test.each(parts)(
    'SidebarLayout.%s keeps its own class when a className or a render element adds others',
    async (_name, Part, className) => {
      await render(
        <SidebarLayout.Root>
          <Part className="fran-prop" render={<section className="annat" data-testid="part" />} />
        </SidebarLayout.Root>,
      )
      await expect.element(page.getByTestId('part')).toHaveClass(className, 'fran-prop', 'annat')
    },
  )

  test.each(parts)(
    'SidebarLayout.%s keeps its own class when a render element’s className is empty',
    async (_name, Part, className) => {
      await render(
        <SidebarLayout.Root>
          <Part render={<section className="" data-testid="part" />} />
        </SidebarLayout.Root>,
      )
      expect(page.getByTestId('part').element().className).toBe(className)
    },
  )

  test('the named exports are the compound parts', () => {
    expect(SidebarLayoutRoot).toBe(SidebarLayout.Root)
    expect(SidebarLayoutSidebar).toBe(SidebarLayout.Sidebar)
    expect(SidebarLayoutContent).toBe(SidebarLayout.Content)
  })

  test('is server safe: renderToString gives the elements with their classes and children', () => {
    const html = renderToString(
      <SidebarLayout.Root>
        <SidebarLayout.Sidebar>Sida</SidebarLayout.Sidebar>
        <SidebarLayout.Content>Innehåll</SidebarLayout.Content>
      </SidebarLayout.Root>,
    )
    expect(html).toBe(
      '<div class="kv-sidebar-layout"><div class="kv-sidebar-layout-sidebar">Sida</div><div class="kv-sidebar-layout-content">Innehåll</div></div>',
    )
  })
})

describe('render and ref', () => {
  test('Sidebar as <nav aria-label> is a named navigation landmark', async () => {
    const { container } = await render(<ArticlePage />)
    await expect
      .element(page.getByRole('navigation', { name: 'I det här avsnittet' }))
      .toBeVisible()
    await expect.element(page.getByRole('main')).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test.each(parts)('SidebarLayout.%s forwards its ref to the element', async (_name, Part) => {
    const ref = createRef<HTMLElement>()
    await render(
      <SidebarLayout.Root>
        <Part ref={ref} data-testid="part" />
      </SidebarLayout.Root>,
    )
    expect(ref.current).toBe(page.getByTestId('part').element())
  })

  test('a function receives the part props with the class and the ref, and an empty state', async () => {
    const seenStates: SidebarLayoutState[] = []
    const ref = createRef<HTMLElement>()
    await render(
      <SidebarLayout.Root
        ref={ref}
        render={(rootProps, state) => {
          seenStates.push(state)
          return <aside {...rootProps} data-testid="root" />
        }}
      />,
    )
    const root = page.getByTestId('root')
    await expect.element(root).toHaveClass('kv-sidebar-layout')
    expect(ref.current).toBe(root.element())
    expect(seenStates.at(-1)).toEqual({})
  })
})

describe('keyboard', () => {
  test('is not a Tab stop and keeps the children in DOM order', async () => {
    await render(<ArticlePage />)
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('link', { name: 'Avfall' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('link', { name: 'Vatten' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Beställ extra tömning' })).toHaveFocus()
  })

  test('Shift+Tab walks the children in reverse DOM order', async () => {
    await render(<ArticlePage />)
    page.getByRole('button', { name: 'Beställ extra tömning' }).element().focus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('link', { name: 'Vatten' })).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('link', { name: 'Avfall' })).toHaveFocus()
  })
})

describe('parts outside Root', () => {
  test.each([
    ['Sidebar', SidebarLayout.Sidebar],
    ['Content', SidebarLayout.Content],
  ] as const)('SidebarLayout.%s warns once, and still renders', async (name, Part) => {
    await render(
      <>
        <Part data-testid="first" />
        <Part data-testid="second" />
      </>,
    )
    await expect.element(page.getByTestId('first')).toBeInTheDocument()
    const warnings = consoleWarn.mock.calls.filter(([message]) =>
      String(message).includes(`SidebarLayout.${name} is outside`),
    )
    expect(warnings).toHaveLength(1)
  })

  test('parts inside a Root do not warn', async () => {
    await render(<ArticlePage />)
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('useSidebarLayout', () => {
  test('the default and "md" give the base class, "sm" adds its modifier', () => {
    expect(useSidebarLayout().rootProps.className).toBe('kv-sidebar-layout')
    expect(useSidebarLayout({ sidebarWidth: 'md' }).rootProps.className).toBe('kv-sidebar-layout')
    expect(useSidebarLayout({ sidebarWidth: 'sm' }).rootProps.className).toBe(
      'kv-sidebar-layout kv-sidebar-layout--sidebar-sm',
    )
  })

  test('the part props carry only the part class', () => {
    const layout = useSidebarLayout()
    expect(layout.sidebarProps).toEqual({ className: 'kv-sidebar-layout-sidebar' })
    expect(layout.contentProps).toEqual({ className: 'kv-sidebar-layout-content' })
  })

  test('returns the same frozen objects every time', () => {
    const first = useSidebarLayout({ sidebarWidth: 'sm' })
    expect(useSidebarLayout({ sidebarWidth: 'sm' })).toBe(first)
    for (const frozen of [first, first.rootProps, first.sidebarProps, first.contentProps]) {
      expect(Object.isFrozen(frozen)).toBe(true)
    }
  })

  test('spreads on the consumer’s elements', async () => {
    function HookLayout() {
      const layout = useSidebarLayout()
      return (
        <div {...layout.rootProps} data-testid="root">
          <aside {...layout.sidebarProps} aria-label="Egen" />
          <div {...layout.contentProps} />
        </div>
      )
    }
    await render(<HookLayout />)
    await expect.element(page.getByTestId('root')).toHaveClass('kv-sidebar-layout')
    await expect.element(page.getByRole('complementary', { name: 'Egen' })).toBeInTheDocument()
  })

  test('the exported option, props and result types fit together', () => {
    expectTypeOf<SidebarLayoutRootProps>().toExtend<UseSidebarLayoutOptions>()
    expectTypeOf<ReturnType<typeof useSidebarLayout>>().toEqualTypeOf<UseSidebarLayoutResult>()
    expectTypeOf<UseSidebarLayoutResult['sidebarProps']>().toExtend<SidebarLayoutPartProps>()
  })
})

describe('accessibility', () => {
  test('has no axe violations as an article page', async () => {
    const { container } = await render(<ArticlePage />)
    await expect.element(page.getByRole('main')).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('RTL: the sidebar stays first in DOM order', async () => {
    await render(
      <div dir="rtl" lang="ar">
        <SidebarLayout.Root data-testid="root">
          <SidebarLayout.Sidebar data-testid="sidebar">قائمة</SidebarLayout.Sidebar>
          <SidebarLayout.Content data-testid="content">محتوى</SidebarLayout.Content>
        </SidebarLayout.Root>
      </div>,
    )
    const [first, second] = page.getByTestId('root').element().children
    expect(first).toBe(page.getByTestId('sidebar').element())
    expect(second).toBe(page.getByTestId('content').element())
  })
})

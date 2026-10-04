import { TrashIcon } from '@heroicons/react/24/outline'
import { Trash as PhosphorTrash } from '@phosphor-icons/react'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { ArrowRight, Trash2 } from 'lucide-react'
import { createRef } from 'react'
import type { ComponentType, ReactElement, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { Button } from '../button/button.tsx'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import type { KvirnProviderProps } from '../provider/kvirn-provider.tsx'
import { builtInIconNames } from './built-in-icons.tsx'
import type { BuiltInIconName } from './built-in-icons.tsx'
import { Icon } from './icon.tsx'
import type { IconProps, IconState } from './icon.tsx'
import { defineIcons } from './icon-registry.ts'
import type { IconComponent, IconName, IconNameOf, IconsOf } from './icon-registry.ts'
import { useIcon } from './use-icon.ts'
import type { IconPartProps, UseIconOptions, UseIconResult } from './use-icon.ts'

// Contract: icon.a11y.md. Plan 0009.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const libraryIcons = defineIcons({
  'lucide-trash': Trash2,
  'heroicons-trash': TrashIcon,
  'phosphor-trash': PhosphorTrash,
  'arrow-next': { component: ArrowRight, mirrorInRtl: true },
})

type LibraryIconName = keyof typeof libraryIcons

/**
 * `<Icon>` for the names above. An app registers its names once with `Register`; this test
 * file doesn't, so that the package's own types stay unaugmented.
 */
function RegisteredIcon({
  name,
  ...otherProps
}: Omit<IconProps, 'name' | 'render' | 'children'> & { name: LibraryIconName }) {
  return <Icon {...otherProps} name={name as IconName} />
}

const firstBuiltInName: BuiltInIconName = 'close'

function svgIn(container: HTMLElement): SVGSVGElement {
  const svg = container.querySelector('svg')
  if (svg === null) {
    throw new Error('No <svg> rendered')
  }
  return svg
}

async function renderIcon(element: ReactElement, providerProps: KvirnProviderProps = {}) {
  const { container } = await render(
    <KvirnProvider icons={libraryIcons} {...providerProps}>
      {element}
    </KvirnProvider>,
  )
  return svgIn(container)
}

describe('built-in icons', () => {
  test('the set is the 24 icons of the design spec, in its order', () => {
    expect(builtInIconNames).toEqual([
      'chevron-down',
      'chevron-up',
      'chevron-back',
      'chevron-forward',
      'arrow-back',
      'arrow-forward',
      'external',
      'close',
      'menu',
      'search',
      'add',
      'check',
      'info',
      'success',
      'warning',
      'error',
      'calendar',
      'upload',
      'download',
      'document',
      'delete',
      'language',
      'eye',
      'eye-off',
    ])
  })

  test('only the five horizontal-direction icons mirror in RTL', async () => {
    const { container } = await render(
      <>
        {builtInIconNames.map((name) => (
          <Icon key={name} name={name} data-name={name} />
        ))}
      </>,
    )
    const mirrored = [...container.querySelectorAll('svg[data-mirror-in-rtl]')].map((svg) =>
      svg.getAttribute('data-name'),
    )
    expect(mirrored).toEqual([
      'chevron-back',
      'chevron-forward',
      'arrow-back',
      'arrow-forward',
      'external',
    ])
  })

  test('shapes set no attributes of their own, so every prop reaches every stroke', async () => {
    const { container } = await render(
      <>
        {builtInIconNames.map((name) => (
          <Icon key={name} name={name} />
        ))}
      </>,
    )
    for (const shape of container.querySelectorAll('svg *')) {
      expect(shape.tagName).toBe('path')
      expect(shape.getAttributeNames()).toEqual(['d'])
    }
  })

  test.each(builtInIconNames)('%s renders without a provider, decorative', async (name) => {
    const { container } = await render(<Icon name={name} />)
    const svg = svgIn(container)
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.children.length).toBeGreaterThan(0)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('are drawn in outline style with currentColor', async () => {
    const svg = svgIn((await render(<Icon name={firstBuiltInName} />)).container)
    expect(svg.getAttribute('fill')).toBe('none')
    expect(svg.getAttribute('stroke')).toBe('currentColor')
    expect(svg.getAttribute('stroke-width')).toBe('1.5')
  })

  test('an app registration with the same name replaces a built-in', async () => {
    const svg = await renderIcon(<Icon name={firstBuiltInName} />, {
      icons: defineIcons({ [firstBuiltInName]: Trash2 }),
    })
    expect(svg.classList.contains('lucide')).toBe(true)
  })
})

describe('registry', () => {
  test('name renders the registered component', async () => {
    const svg = await renderIcon(<RegisteredIcon name="lucide-trash" />)
    expect(svg.classList.contains('lucide-trash-2')).toBe(true)
  })

  test('a nested provider merges its icons over the parent’s by name', async () => {
    const { container } = await render(
      <KvirnProvider icons={libraryIcons}>
        <KvirnProvider icons={defineIcons({ 'lucide-trash': TrashIcon })}>
          <span data-testid="inner">
            <RegisteredIcon name="lucide-trash" />
            <RegisteredIcon name="phosphor-trash" />
          </span>
        </KvirnProvider>
      </KvirnProvider>,
    )
    const [replaced, inherited] = container.querySelectorAll('svg')
    expect(replaced?.getAttribute('data-slot')).toBe('icon')
    expect(inherited?.getAttribute('viewBox')).toBe('0 0 256 256')
  })

  test('iconDefaults apply below the instance props, and merge by field when nested', async () => {
    const { container } = await render(
      <KvirnProvider icons={libraryIcons} iconDefaults={{ strokeWidth: 1.5, size: 'lg' }}>
        <KvirnProvider iconDefaults={{ size: 'sm' }}>
          <RegisteredIcon name="lucide-trash" />
          <RegisteredIcon name="lucide-trash" strokeWidth={3} size={32} />
        </KvirnProvider>
      </KvirnProvider>,
    )
    const [fromDefaults, fromProps] = container.querySelectorAll('svg')
    expect(fromDefaults?.getAttribute('stroke-width')).toBe('1.5')
    expect(fromDefaults?.getAttribute('width')).toBe('1em')
    expect(fromDefaults?.getAttribute('data-size')).toBe('sm')
    expect(fromProps?.getAttribute('stroke-width')).toBe('3')
    expect(fromProps?.getAttribute('width')).toBe('32')
    expect(fromProps?.hasAttribute('data-size')).toBe(false)
  })

  test("the entry's mirrorInRtl applies, and the instance prop overrides it", async () => {
    const { container } = await render(
      <KvirnProvider icons={libraryIcons}>
        <RegisteredIcon name="arrow-next" />
        <RegisteredIcon name="arrow-next" mirrorInRtl={false} />
        <RegisteredIcon name="lucide-trash" mirrorInRtl />
      </KvirnProvider>,
    )
    const [fromEntry, overridden, fromProp] = container.querySelectorAll('svg')
    expect(fromEntry?.hasAttribute('data-mirror-in-rtl')).toBe(true)
    expect(overridden?.hasAttribute('data-mirror-in-rtl')).toBe(false)
    expect(fromProp?.hasAttribute('data-mirror-in-rtl')).toBe(true)
  })

  test("a plain override of a built-in name keeps the built-in's mirroring", async () => {
    const { container } = await render(
      <KvirnProvider
        icons={defineIcons({
          'arrow-forward': ArrowRight,
          'chevron-forward': { component: ArrowRight, mirrorInRtl: false },
        })}
      >
        <Icon name="arrow-forward" />
        <Icon name="chevron-forward" />
      </KvirnProvider>,
    )
    const [plain, explicit] = container.querySelectorAll('svg')
    expect(plain?.classList.contains('lucide')).toBe(true)
    expect(plain?.hasAttribute('data-mirror-in-rtl')).toBe(true)
    expect(explicit?.hasAttribute('data-mirror-in-rtl')).toBe(false)
  })

  test('an unknown name renders an empty, sized, hidden <svg> and warns once', async () => {
    const unknownName = 'not-registered' as IconName
    const { container } = await render(
      <>
        <Icon name={unknownName} />
        <Icon name={unknownName} size="lg" />
      </>,
    )
    const [first, second] = container.querySelectorAll('svg')
    expect(first?.children).toHaveLength(0)
    expect(first?.getAttribute('aria-hidden')).toBe('true')
    // Without a viewBox, a replaced element's default height (150px) could apply.
    expect(first?.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(first?.getAttribute('width')).toBe('1.25em')
    expect(second?.getAttribute('width')).toBe('1.5em')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('"not-registered"')
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('defineIcons')
  })

  test('defineIcons returns its entries, frozen', () => {
    const icons = defineIcons({ trash: Trash2 })
    expect(icons.trash).toBe(Trash2)
    expect(Object.isFrozen(icons)).toBe(true)
  })
})

describe('attributes', () => {
  test.each([
    ['sm', '1em'],
    ['md', '1.25em'],
    ['lg', '1.5em'],
  ] as const)('size="%s" is %s wide and high, with data-size', async (size, length) => {
    const svg = await renderIcon(<RegisteredIcon name="lucide-trash" size={size} />)
    expect(svg.getAttribute('width')).toBe(length)
    expect(svg.getAttribute('height')).toBe(length)
    expect(svg.getAttribute('data-size')).toBe(size)
  })

  test('the default size is md', async () => {
    const svg = await renderIcon(<RegisteredIcon name="lucide-trash" />)
    expect(svg.getAttribute('width')).toBe('1.25em')
    expect(svg.getAttribute('data-size')).toBe('md')
  })

  test.each([
    [16, '16'],
    ['1rem', '1rem'],
    ['20px', '20px'],
    ['2em', '2em'],
  ] as const)('size={%j} is used as the length', async (size, length) => {
    const svg = await renderIcon(<RegisteredIcon name="lucide-trash" size={size} />)
    expect(svg.getAttribute('width')).toBe(length)
    expect(svg.getAttribute('height')).toBe(length)
    expect(svg.hasAttribute('data-size')).toBe(false)
  })

  test('the default size grows with the text it sits in (1.4.4)', async () => {
    const { container } = await render(
      <p style={{ fontSize: '16px' }}>
        <RegisteredIcon name="lucide-trash" />
        <span style={{ fontSize: '32px' }}>
          <RegisteredIcon name="lucide-trash" />
        </span>
      </p>,
      { wrapper: ({ children }) => <KvirnProvider icons={libraryIcons}>{children}</KvirnProvider> },
    )
    const [normal, large] = container.querySelectorAll('svg')
    const normalWidth = normal?.getBoundingClientRect().width ?? 0
    const largeWidth = large?.getBoundingClientRect().width ?? 0
    expect(normalWidth).toBeGreaterThan(0)
    expect(largeWidth / normalWidth).toBeCloseTo(2, 1)
  })

  test('values are attributes, never inline style (strict CSP)', async () => {
    const svg = await renderIcon(
      <RegisteredIcon
        name="lucide-trash"
        size="lg"
        strokeWidth={2}
        color="red"
        fill="blue"
        stroke="green"
      />,
    )
    expect(svg.hasAttribute('style')).toBe(false)
    expect(svg.getAttribute('stroke-width')).toBe('2')
    expect(svg.getAttribute('fill')).toBe('blue')
    expect(svg.getAttribute('stroke')).toBe('green')
  })

  test('className joins the part class and the library’s own', async () => {
    const svg = await renderIcon(<RegisteredIcon name="lucide-trash" className="my-icon" />)
    expect(svg.classList.contains('kv-icon')).toBe(true)
    expect(svg.classList.contains('my-icon')).toBe(true)
    expect(svg.classList.contains('lucide')).toBe(true)
  })

  test('forwards its ref to the <svg>', async () => {
    const ref = createRef<SVGSVGElement>()
    const svg = await renderIcon(<RegisteredIcon name="lucide-trash" ref={ref} />)
    expect(ref.current).toBe(svg)
  })

  test('renders the same attributes on the server', () => {
    const html = renderToString(
      <KvirnProvider icons={libraryIcons}>
        <RegisteredIcon name="lucide-trash" size="sm" color="currentColor" />
      </KvirnProvider>,
    )
    // The provider adds its two empty live regions after the icon, and they carry inline styles.
    const svg = html.slice(0, html.indexOf('</svg>') + '</svg>'.length)
    expect(svg).toMatch(/class="[^"]*\blucide\b[^"]*"/)
    expect(svg).toContain('width="1em"')
    expect(svg).toContain('aria-hidden="true"')
    expect(svg).not.toContain('style=')
  })
})

describe('library compatibility (Plan 0009, Background)', () => {
  test.each(['lucide-trash', 'heroicons-trash', 'phosphor-trash'] as const)(
    '%s takes size and color from Icon',
    async (name) => {
      const svg = await renderIcon(<RegisteredIcon name={name} size={32} color="rgb(200, 0, 0)" />)
      expect(svg.getAttribute('width')).toBe('32')
      expect(svg.getAttribute('height')).toBe('32')
      // Each library routes color its own way (stroke, the color attribute, fill), and every
      // one ends up drawing in it.
      const painted = [svg, ...svg.querySelectorAll('path')].some((element) => {
        const style = getComputedStyle(element)
        return [style.color, style.stroke, style.fill].includes('rgb(200, 0, 0)')
      })
      expect(painted).toBe(true)
    },
  )

  test.each(['lucide-trash', 'heroicons-trash'] as const)(
    '%s takes strokeWidth from Icon',
    async (name) => {
      const svg = await renderIcon(<RegisteredIcon name={name} strokeWidth={1} />)
      expect(svg.getAttribute('stroke-width')).toBe('1')
    },
  )

  test.each(['lucide-trash', 'heroicons-trash'] as const)(
    '%s takes fill and stroke from Icon',
    async (name) => {
      const svg = await renderIcon(
        <RegisteredIcon name={name} fill="rgb(1, 2, 3)" stroke="rgb(4, 5, 6)" />,
      )
      const path = svg.querySelector('path')
      expect(path && getComputedStyle(path).fill).toBe('rgb(1, 2, 3)')
      expect(path && getComputedStyle(path).stroke).toBe('rgb(4, 5, 6)')
    },
  )

  test('the color attribute sets currentColor for the shapes', async () => {
    const svg = await renderIcon(<RegisteredIcon name="heroicons-trash" color="rgb(0, 0, 200)" />)
    const path = svg.querySelector('path')
    expect(path && getComputedStyle(path).stroke).toBe('rgb(0, 0, 200)')
  })

  test('a CSS custom property works as a colour', async () => {
    const { container } = await render(
      <div style={{ ['--test-colour' as string]: 'rgb(0, 128, 0)' }}>
        <RegisteredIcon name="heroicons-trash" color="var(--test-colour)" />
      </div>,
      { wrapper: ({ children }) => <KvirnProvider icons={libraryIcons}>{children}</KvirnProvider> },
    )
    const path = svgIn(container).querySelector('path')
    expect(path && getComputedStyle(path).stroke).toBe('rgb(0, 128, 0)')
  })
})

describe('accessibility', () => {
  test.each(['lucide-trash', 'heroicons-trash', 'phosphor-trash'] as const)(
    '%s is decorative by default: aria-hidden, no role',
    async (name) => {
      const svg = await renderIcon(<RegisteredIcon name={name} />)
      expect(svg.getAttribute('aria-hidden')).toBe('true')
      expect(svg.hasAttribute('role')).toBe(false)
      expect(svg.hasAttribute('aria-label')).toBe(false)
    },
  )

  test.each(['lucide-trash', 'heroicons-trash', 'phosphor-trash'] as const)(
    '%s with a label is an image with that name, never hidden',
    async (name) => {
      await renderIcon(<RegisteredIcon name={name} label="Varning" />)
      const image = page.getByRole('img', { name: 'Varning' })
      await expect.element(image).toBeVisible()
      await expect.element(image).not.toHaveAttribute('aria-hidden')
    },
  )

  test('a built-in icon with a label is an image with that name', async () => {
    await render(<Icon name={firstBuiltInName} label="Stäng" />)
    await expect.element(page.getByRole('img', { name: 'Stäng' })).toBeVisible()
  })

  test('is never focusable', async () => {
    const svg = await renderIcon(<RegisteredIcon name="lucide-trash" label="Radera" />)
    expect(svg.hasAttribute('tabindex')).toBe(false)
    svg.focus()
    expect(document.activeElement).not.toBe(svg)
  })

  test('next to a Button label, the button is named by its text only', async () => {
    await renderIcon(
      <Button>
        <RegisteredIcon name="lucide-trash" />
        Radera
      </Button>,
    )
    await expect.element(page.getByRole('button', { name: 'Radera', exact: true })).toBeVisible()
  })

  test('no axe violations: decorative, labelled, in a Button, icon-only Button', async () => {
    const { container } = await render(
      <KvirnProvider icons={libraryIcons}>
        <main>
          <p>
            <RegisteredIcon name="heroicons-trash" /> Dekorativ
          </p>
          <p>
            <RegisteredIcon name="phosphor-trash" label="Papperskorg" />
          </p>
          <Button>
            <RegisteredIcon name="lucide-trash" />
            Radera
          </Button>
          <Button className="kv-button--icon-only" aria-label="Radera ansökan">
            <RegisteredIcon name="lucide-trash" />
          </Button>
        </main>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('button', { name: 'Radera ansökan' })).toBeVisible()
    await expectNoA11yViolations(container)
  })
})

describe('one-off icons without the registry', () => {
  test('children: Icon is the <svg>', async () => {
    const { container } = await render(
      <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M5 12h14" />
      </Icon>,
    )
    const svg = svgIn(container)
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.querySelector('path')?.getAttribute('d')).toBe('M5 12h14')
  })

  test('render element: a library component gets the part props', async () => {
    const { container } = await render(<Icon render={<TrashIcon />} label="Radera" size="sm" />)
    const svg = svgIn(container)
    expect(svg.getAttribute('data-slot')).toBe('icon')
    expect(svg.getAttribute('width')).toBe('1em')
    await expect.element(page.getByRole('img', { name: 'Radera' })).toBeVisible()
  })

  test('render function: spreads the props and reads the state', async () => {
    const { container } = await render(
      <Icon
        label="Varning"
        render={(iconProps, state) => (
          <svg {...iconProps} data-decorative={String(state.isDecorative)} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
          </svg>
        )}
      />,
    )
    const svg = svgIn(container)
    expect(svg.getAttribute('data-decorative')).toBe('false')
    expect(svg.getAttribute('role')).toBe('img')
  })
})

describe('useIcon', () => {
  function HookProbe(options: UseIconOptions) {
    const icon = useIcon(options)
    const IconComponent = icon.component
    return IconComponent === undefined ? (
      <svg {...icon.iconProps} />
    ) : (
      <IconComponent {...icon.iconProps} />
    )
  }

  test('returns the props and the registered component for a name', async () => {
    const svg = await renderIcon(
      <HookProbe
        name={'lucide-trash' satisfies LibraryIconName as IconName}
        label="Radera"
        size="lg"
      />,
    )
    expect(svg.classList.contains('lucide-trash-2')).toBe(true)
    expect(svg.getAttribute('width')).toBe('1.5em')
    await expect.element(page.getByRole('img', { name: 'Radera' })).toBeVisible()
  })

  test('without a name, there is no component', () => {
    expectTypeOf<UseIconResult['component']>().toEqualTypeOf<IconComponent | undefined>()
  })
})

describe('types', () => {
  test('built-in names type-check without a registration', () => {
    expectTypeOf<BuiltInIconName>().toExtend<IconName>()
    expectTypeOf<'not-an-icon'>().not.toExtend<IconName>()
  })

  test('a registration adds its names', () => {
    type Registered = IconNameOf<{ icons: typeof libraryIcons }>
    expectTypeOf<'lucide-trash'>().toExtend<Registered>()
    expectTypeOf<BuiltInIconName>().toExtend<Registered>()
    expectTypeOf<'lucide-trsh'>().not.toExtend<Registered>()
    expectTypeOf<IconsOf<{}>>().toEqualTypeOf<{}>()
  })

  test('Lucide, Heroicons and Phosphor components are icon components', () => {
    expectTypeOf(Trash2).toExtend<IconComponent>()
    expectTypeOf(TrashIcon).toExtend<IconComponent>()
    expectTypeOf(PhosphorTrash).toExtend<IconComponent>()
    expectTypeOf<ComponentType<{ href: string }>>().not.toExtend<IconComponent>()
  })

  test('name, render and children are exclusive', () => {
    expectTypeOf<{ name: BuiltInIconName; render: ReactElement }>().not.toExtend<IconProps>()
    expectTypeOf<{ name: BuiltInIconName; children: ReactNode }>().not.toExtend<IconProps>()
  })

  test('the accessible name only comes from label', () => {
    expectTypeOf<{ 'aria-label': string }>().not.toExtend<IconProps>()
    expectTypeOf<{ 'aria-hidden': true }>().not.toExtend<IconProps>()
    expectTypeOf<{ role: 'img' }>().not.toExtend<IconProps>()
  })

  test('sizes are steps, numbers or typed lengths', () => {
    expectTypeOf<{ size: '1rem' }>().toExtend<UseIconOptions>()
    expectTypeOf<{ size: 'large' }>().not.toExtend<UseIconOptions>()
  })

  test('the part props and state', () => {
    expectTypeOf<IconPartProps['className']>().toEqualTypeOf<'kv-icon'>()
    expectTypeOf<IconState>().toEqualTypeOf<{ isDecorative: boolean }>()
  })
})

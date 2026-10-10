import { TrashIcon } from '@heroicons/react/24/outline'
import { Trash as PhosphorTrash } from '@phosphor-icons/react'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { ArrowRight, Trash2 } from 'lucide-react'
import { createRef } from 'react'
import type { ComponentType, ElementType, ReactElement, ReactNode, SVGProps } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { Button } from '../button/button.tsx'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import type { KvirnProviderProps } from '../provider/kvirn-provider.tsx'
import { builtInIconNames } from './built-in-icons.tsx'
import type { BuiltInIconName } from './built-in-icons.tsx'
import { Icon } from './icon.tsx'
import type { IconProps } from './icon.tsx'
import { defineIcons } from './icon-registry.ts'
import type { IconComponent, IconName, IconNameOf, IconsOf } from './icon-registry.ts'
import { useIcon } from './use-icon.ts'
import type { IconPartProps, IconSize, UseIconOptions, UseIconResult } from './use-icon.ts'

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
}: Omit<IconProps, 'name' | 'icon' | 'as' | 'children'> & {
  name: LibraryIconName
}) {
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

  test('are drawn in currentColor, so they follow the text colour', async () => {
    const svg = svgIn((await render(<Icon name={firstBuiltInName} />)).container)
    expect(svg.getAttribute('stroke')).toBe('currentColor')
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
      <KvirnProvider icons={libraryIcons} iconDefaults={{ size: '24' }}>
        <KvirnProvider iconDefaults={{ size: '16' }}>
          <RegisteredIcon name="lucide-trash" />
          <RegisteredIcon name="lucide-trash" size="32" />
        </KvirnProvider>
      </KvirnProvider>,
    )
    const [fromDefaults, fromProps] = container.querySelectorAll('svg')
    expect(fromDefaults?.getAttribute('width')).toBe('1rem')
    expect(fromDefaults?.classList.contains('kv-icon--size-16')).toBe(true)
    expect(fromProps?.getAttribute('width')).toBe('2rem')
    expect(fromProps?.classList.contains('kv-icon--size-32')).toBe(true)
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
        <Icon name={unknownName} size="24" />
      </>,
    )
    const [first, second] = container.querySelectorAll('svg')
    expect(first?.children).toHaveLength(0)
    expect(first?.getAttribute('aria-hidden')).toBe('true')
    // Without a viewBox, a replaced element's default height (150px) could apply.
    expect(first?.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(first?.getAttribute('width')).toBe('1.25rem')
    expect(second?.getAttribute('width')).toBe('1.5rem')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('"not-registered"')
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('defineIcons')
  })

  test('an unknown name with a label is still an image with that name, and warns', async () => {
    const { container } = await render(<Icon name={'not-registered' as IconName} label="Okänd" />)
    const svg = svgIn(container)
    expect(svg.children).toHaveLength(0)
    expect(svg.getAttribute('role')).toBe('img')
    expect(svg.getAttribute('aria-label')).toBe('Okänd')
    expect(svg.hasAttribute('aria-hidden')).toBe(false)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('"not-registered"')
  })

  test.each(['constructor', 'toString', '__proto__'])(
    'name="%s" is not found on the prototype: it renders the placeholder and warns',
    async (inherited) => {
      const { container } = await render(<Icon name={inherited as IconName} />)
      const svg = svgIn(container)
      expect(svg.children).toHaveLength(0)
      expect(svg.getAttribute('aria-hidden')).toBe('true')
      expect(svg.getAttribute('width')).toBe('1.25rem')
      expect(consoleWarn).toHaveBeenCalledTimes(1)
      expect(consoleWarn.mock.calls[0]?.[0]).toContain(`"${inherited}"`)
    },
  )

  test('defineIcons returns its entries, frozen', () => {
    const icons = defineIcons({ trash: Trash2 })
    expect(icons.trash).toBe(Trash2)
    expect(Object.isFrozen(icons)).toBe(true)
  })
})

describe('attributes', () => {
  test.each([
    ['12', '0.75rem'],
    ['14', '0.875rem'],
    ['16', '1rem'],
    ['20', '1.25rem'],
    ['24', '1.5rem'],
    ['28', '1.75rem'],
    ['32', '2rem'],
    ['40', '2.5rem'],
    ['48', '3rem'],
    ['56', '3.5rem'],
    ['64', '4rem'],
    ['80', '5rem'],
    ['96', '6rem'],
  ] as const)(
    'size="%s" is a pixel size: the class kv-icon--size-%s, and %s wide and high',
    async (size, length) => {
      const svg = await renderIcon(<RegisteredIcon name="lucide-trash" size={size} />)
      expect(svg.getAttribute('class')).toContain(`kv-icon kv-icon--size-${size}`)
      expect(svg.getAttribute('width')).toBe(length)
      expect(svg.getAttribute('height')).toBe(length)
    },
  )

  test("the default size is '20' (1.25rem)", async () => {
    const svg = await renderIcon(<RegisteredIcon name="lucide-trash" />)
    expect(svg.classList.contains('kv-icon--size-20')).toBe(true)
    expect(svg.getAttribute('width')).toBe('1.25rem')
  })

  test('the size is never a data attribute (data-* is state, not a choice)', async () => {
    const svg = await renderIcon(<RegisteredIcon name="lucide-trash" size="24" />)
    expect(svg.hasAttribute('data-size')).toBe(false)
  })

  test('values are attributes, never inline style (strict CSP)', async () => {
    const svg = await renderIcon(<RegisteredIcon name="lucide-trash" size="24" label="Radera" />)
    expect(svg.hasAttribute('style')).toBe(false)
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
        <RegisteredIcon name="lucide-trash" size="16" />
      </KvirnProvider>,
    )
    // The provider adds its two empty live regions after the icon, and they carry inline styles.
    const svg = html.slice(0, html.indexOf('</svg>') + '</svg>'.length)
    expect(svg).toMatch(/class="[^"]*\blucide\b[^"]*"/)
    expect(svg).toContain('width="1rem"')
    expect(svg).toContain('kv-icon--size-16')
    expect(svg).toContain('aria-hidden="true"')
    expect(svg).not.toContain('style=')
  })
})

describe('library compatibility (Plan 0009, Background)', () => {
  test.each(['lucide-trash', 'heroicons-trash', 'phosphor-trash'] as const)(
    '%s takes its size from Icon',
    async (name) => {
      const svg = await renderIcon(<RegisteredIcon name={name} size="32" />)
      expect(svg.getAttribute('width')).toBe('2rem')
      expect(svg.getAttribute('height')).toBe('2rem')
    },
  )
})

describe('keyboard', () => {
  const isFocusOnIcon = () => document.activeElement?.closest('svg') != null

  function IconsAmongStops() {
    return (
      <>
        <Icon name={firstBuiltInName} label="Stäng" />
        <Button>
          <Icon name={firstBuiltInName} />
          Radera
        </Button>
        <a href="#ansok">
          Ansök <Icon name={firstBuiltInName} />
        </a>
      </>
    )
  }

  test('Tab never stops on an icon', async () => {
    const { container } = await render(<IconsAmongStops />)
    expect(container.querySelectorAll('svg[tabindex]')).toHaveLength(0)
    for (let stop = 0; stop <= 2; stop += 1) {
      await userEvent.keyboard('{Tab}')
      expect(isFocusOnIcon()).toBe(false)
    }
  })

  test('Shift+Tab never stops on an icon', async () => {
    const { container } = await render(<IconsAmongStops />)
    expect(container.querySelectorAll('svg[tabindex]')).toHaveLength(0)
    for (let stop = 0; stop <= 2; stop += 1) {
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
      expect(isFocusOnIcon()).toBe(false)
    }
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
      <Icon viewBox="0 0 24 24">
        <path d="M5 12h14" />
      </Icon>,
    )
    const svg = svgIn(container)
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.querySelector('path')?.getAttribute('d')).toBe('M5 12h14')
  })

  test('as: a component gets the part props, and Icon’s own options do not reach it by name', async () => {
    const received: SVGProps<SVGSVGElement>[] = []
    function MunicipalityMark(props: SVGProps<SVGSVGElement>) {
      received.push(props)
      return <TrashIcon {...props} />
    }
    const { container } = await render(<Icon as={MunicipalityMark} label="Radera" size="16" />)
    const svg = svgIn(container)
    expect(svg.getAttribute('data-slot')).toBe('icon')
    expect(svg.getAttribute('width')).toBe('1rem')
    expect(received.at(-1)).not.toHaveProperty('size')
    expect(received.at(-1)).not.toHaveProperty('label')
    await expect.element(page.getByRole('img', { name: 'Radera' })).toBeVisible()
  })
})

describe('icon prop: a component reference (Plan 0044)', () => {
  test.each([
    ['Lucide', Trash2],
    ['Heroicons', TrashIcon],
  ] as const)(
    "%s: Icon's size wins over the library's own, with no registry",
    async (_library, component) => {
      // No provider: `icon` needs no registration.
      const { container } = await render(<Icon icon={component} size="24" />)
      const svg = svgIn(container)
      expect(svg.getAttribute('width')).toBe('1.5rem')
      expect(svg.getAttribute('height')).toBe('1.5rem')
      expect(svg.classList.contains('kv-icon--size-24')).toBe(true)
    },
  )

  test.each([
    ['Lucide', Trash2],
    ['Heroicons', TrashIcon],
  ] as const)('%s: decorative by default, hidden and with no role', async (_library, component) => {
    const { container } = await render(<Icon icon={component} />)
    const svg = svgIn(container)
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.hasAttribute('role')).toBe(false)
    expect(svg.hasAttribute('aria-label')).toBe(false)
  })

  test.each([
    ['Lucide', Trash2],
    ['Heroicons', TrashIcon],
  ] as const)(
    "%s: a label makes it an image with that name, and the library's own aria-hidden is gone",
    async (_library, component) => {
      await render(<Icon icon={component} label="Radera" />)
      const image = page.getByRole('img', { name: 'Radera' })
      await expect.element(image).toBeVisible()
      await expect.element(image).not.toHaveAttribute('aria-hidden')
    },
  )

  test("Phosphor: Icon's size wins, it is decorative, and a label makes it an image", async () => {
    const { container } = await render(<Icon icon={PhosphorTrash} size="24" />)
    const svg = svgIn(container)
    expect(svg.getAttribute('width')).toBe('1.5rem')
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    await render(<Icon icon={PhosphorTrash} label="Radera" />)
    await expect.element(page.getByRole('img', { name: 'Radera' })).toBeVisible()
  })

  test("className joins the part class and the library's own", async () => {
    const { container } = await render(<Icon icon={Trash2} className="own-class" />)
    const svg = svgIn(container)
    expect(svg.classList.contains('kv-icon')).toBe(true)
    expect(svg.classList.contains('own-class')).toBe(true)
    expect(svg.classList.contains('lucide-trash-2')).toBe(true)
  })

  test('other SVG attributes and a ref reach the <svg>', async () => {
    const ref = createRef<SVGSVGElement>()
    const { container } = await render(<Icon icon={Trash2} data-testid="probe" ref={ref} />)
    const svg = svgIn(container)
    expect(svg.getAttribute('data-testid')).toBe('probe')
    expect(ref.current).toBe(svg)
  })

  test('mirroring is not set by icon: only the explicit mirrorInRtl prop sets it', async () => {
    const { container } = await render(
      <>
        <Icon icon={ArrowRight} data-name="plain" />
        <Icon icon={ArrowRight} mirrorInRtl data-name="mirrored" />
      </>,
    )
    const flagged = [...container.querySelectorAll('svg[data-mirror-in-rtl]')].map((svg) =>
      svg.getAttribute('data-name'),
    )
    expect(flagged).toEqual(['mirrored'])
  })

  test('a component is not looked up in the registry: no unknown-name warning', async () => {
    await render(<Icon icon={Trash2} />)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('no axe violations: decorative and labelled Lucide and Heroicons icons', async () => {
    const { container } = await render(
      <main>
        <p>
          <Icon icon={Trash2} /> Dekorativ
        </p>
        <p>
          <Icon icon={TrashIcon} label="Papperskorg" />
        </p>
        <Button>
          <Icon icon={TrashIcon} />
          Radera
        </Button>
      </main>,
    )
    await expect.element(page.getByRole('img', { name: 'Papperskorg' })).toBeVisible()
    await expectNoA11yViolations(container)
  })
})

describe('exclusive name, icon, as and children (Plan 0044)', () => {
  // The types forbid these pairs, so the props are built untyped, as JavaScript or a cast would.
  const pairs: ReadonlyArray<readonly [string, string, Record<string, unknown>]> = [
    ['name, icon', 'name+icon', { name: 'close', icon: Trash2 }],
    ['name, as', 'name+as', { name: 'close', as: TrashIcon }],
    ['name, children', 'name+children', { name: 'close', children: <path d="M5 12h14" /> }],
    ['icon, as', 'icon+as', { icon: Trash2, as: TrashIcon }],
    ['icon, children', 'icon+children', { icon: Trash2, children: <path d="M5 12h14" /> }],
    ['as, children', 'as+children', { as: TrashIcon, children: <path d="M5 12h14" /> }],
  ]

  test.each(pairs)('%s together warn once, naming both', async (names, key, props) => {
    const bothProps = props as unknown as IconProps
    await render(<Icon {...bothProps} />)
    const messages = consoleWarn.mock.calls.map((call) => String(call[0]))
    const exclusive = messages.filter(
      (message) => message.includes(`Icon`) && message.includes(names),
    )
    expect([key, exclusive.length]).toEqual([key, 1])
    expect(exclusive[0]).toContain('[KvirnUI]')

    // Rendering again with the same props does not warn again.
    await render(<Icon {...bothProps} />)
    expect(
      consoleWarn.mock.calls.map((call) => String(call[0])).filter((m) => m.includes(names)),
    ).toHaveLength(1)
  })

  test('one source alone never warns', async () => {
    await render(
      <>
        <Icon name="close" />
        <Icon icon={Trash2} />
        <Icon as={TrashIcon} />
        <Icon viewBox="0 0 24 24">
          <path d="M5 12h14" />
        </Icon>
      </>,
    )
    expect(consoleWarn).not.toHaveBeenCalled()
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
        size="24"
      />,
    )
    expect(svg.classList.contains('lucide-trash-2')).toBe(true)
    expect(svg.getAttribute('width')).toBe('1.5rem')
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

  test('size is a pixel string from the closed list, never a number or a CSS length', () => {
    expectTypeOf<'20'>().toExtend<IconSize>()
    expectTypeOf<'96'>().toExtend<IconSize>()
    expectTypeOf<4>().not.toExtend<IconSize>()
    expectTypeOf<20>().not.toExtend<IconSize>()
    expectTypeOf<'48px'>().not.toExtend<IconSize>()
    expectTypeOf<'2rem'>().not.toExtend<IconSize>()
    expectTypeOf<'13'>().not.toExtend<IconSize>()
    expectTypeOf<{ size: '24' }>().toExtend<IconProps>()
    expectTypeOf<{ size: 4 }>().not.toExtend<IconProps>()
    expectTypeOf<{ size: '48px' }>().not.toExtend<IconProps>()
    expectTypeOf<{ size: '13' }>().not.toExtend<IconProps>()
    expectTypeOf<{ size: '16' }>().toExtend<UseIconOptions>()
    expectTypeOf<{ size: 4 }>().not.toExtend<UseIconOptions>()
  })

  test('Lucide, Heroicons and Phosphor components are icon components', () => {
    expectTypeOf(Trash2).toExtend<IconComponent>()
    expectTypeOf(TrashIcon).toExtend<IconComponent>()
    expectTypeOf(PhosphorTrash).toExtend<IconComponent>()
    expectTypeOf<ComponentType<{ href: string }>>().not.toExtend<IconComponent>()
  })

  test('name, icon, as and children are exclusive', () => {
    expectTypeOf<{ name: BuiltInIconName; as: ElementType }>().not.toExtend<IconProps>()
    expectTypeOf<{ name: BuiltInIconName; children: ReactNode }>().not.toExtend<IconProps>()
    expectTypeOf<{ name: BuiltInIconName; icon: IconComponent }>().not.toExtend<IconProps>()
    expectTypeOf<{ icon: IconComponent; as: ElementType }>().not.toExtend<IconProps>()
    expectTypeOf<{ icon: IconComponent; children: ReactNode }>().not.toExtend<IconProps>()
    expectTypeOf<{ as: ElementType; children: ReactNode }>().not.toExtend<IconProps>()
  })

  test('icon takes an icon component, and nothing else', () => {
    expectTypeOf<{ icon: typeof Trash2 }>().toExtend<IconProps>()
    expectTypeOf<{ icon: typeof TrashIcon }>().toExtend<IconProps>()
    expectTypeOf<{ icon: ComponentType<{ href: string }> }>().not.toExtend<IconProps>()
    expectTypeOf<{ icon: ReactElement }>().not.toExtend<IconProps>()
    expectTypeOf<{ icon: 'close' }>().not.toExtend<IconProps>()
  })

  test('the accessible name only comes from label', () => {
    expectTypeOf<{ 'aria-label': string }>().not.toExtend<IconProps>()
    expectTypeOf<{ 'aria-hidden': true }>().not.toExtend<IconProps>()
    expectTypeOf<{ role: 'img' }>().not.toExtend<IconProps>()
  })

  test('the part props', () => {
    expectTypeOf<IconPartProps['className']>().toEqualTypeOf<`kv-icon kv-icon--size-${IconSize}`>()
  })
})

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
import type {
  IconPartProps,
  IconScale,
  IconSize,
  UseIconOptions,
  UseIconResult,
} from './use-icon.ts'

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
      <KvirnProvider icons={libraryIcons} iconDefaults={{ strokeWidth: 1.5, size: 6 }}>
        <KvirnProvider iconDefaults={{ size: 4 }}>
          <RegisteredIcon name="lucide-trash" />
          <RegisteredIcon name="lucide-trash" strokeWidth={3} size="32px" />
        </KvirnProvider>
      </KvirnProvider>,
    )
    const [fromDefaults, fromProps] = container.querySelectorAll('svg')
    expect(fromDefaults?.getAttribute('stroke-width')).toBe('1.5')
    expect(fromDefaults?.getAttribute('width')).toBe('1em')
    expect(fromDefaults?.getAttribute('data-size')).toBe('4')
    expect(fromProps?.getAttribute('stroke-width')).toBe('3')
    expect(fromProps?.getAttribute('width')).toBe('32px')
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
        <Icon name={unknownName} size={6} />
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
      expect(svg.getAttribute('width')).toBe('1.25em')
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
    [0, '0em', '0'],
    [0.5, '0.125em', '0.5'],
    [1, '0.25em', '1'],
    [1.5, '0.375em', '1.5'],
    [3.5, '0.875em', '3.5'],
    [4, '1em', '4'],
    [5, '1.25em', '5'],
    [6, '1.5em', '6'],
    [12, '3em', '12'],
    [32, '8em', '32'],
    [96, '24em', '96'],
  ] as const)(
    'size={%s} is a step of the size scale: %s wide and high, with data-size="%s"',
    async (size, length, step) => {
      const svg = await renderIcon(<RegisteredIcon name="lucide-trash" size={size} />)
      expect(svg.getAttribute('width')).toBe(length)
      expect(svg.getAttribute('height')).toBe(length)
      expect(svg.getAttribute('data-size')).toBe(step)
    },
  )

  test('any finite number is a step: its value is the number times 0.25em', async () => {
    const svg = await renderIcon(<RegisteredIcon name="lucide-trash" size={13 as never} />)
    expect(svg.getAttribute('width')).toBe('3.25em')
    expect(svg.getAttribute('data-size')).toBe('13')
  })

  test('the default size is step 5 (1.25em)', async () => {
    const svg = await renderIcon(<RegisteredIcon name="lucide-trash" />)
    expect(svg.getAttribute('width')).toBe('1.25em')
    expect(svg.getAttribute('data-size')).toBe('5')
  })

  test.each([['1rem'], ['48px'], ['2em'], ['1.5em']] as const)(
    'size={%j} is a CSS length: used as written, and it has no data-size',
    async (size) => {
      const svg = await renderIcon(<RegisteredIcon name="lucide-trash" size={size} />)
      expect(svg.getAttribute('width')).toBe(size)
      expect(svg.getAttribute('height')).toBe(size)
      expect(svg.hasAttribute('data-size')).toBe(false)
    },
  )

  test('an untyped size that names an Object.prototype member is a length, not a size step', async () => {
    const svg = await renderIcon(<RegisteredIcon name="lucide-trash" size={'toString' as never} />)
    expect(svg.getAttribute('width')).toBe('toString')
    expect(svg.hasAttribute('data-size')).toBe(false)
  })

  test('values are attributes, never inline style (strict CSP)', async () => {
    const svg = await renderIcon(
      <RegisteredIcon
        name="lucide-trash"
        size={6}
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
        <RegisteredIcon name="lucide-trash" size={4} color="currentColor" />
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

/** The shapes inherit fill, stroke and color from the root, so a prop on Icon reaches them. */
function expectShapesSetNoPaint(svg: SVGSVGElement) {
  const shapes = svg.querySelectorAll('*')
  expect(shapes.length).toBeGreaterThan(0)
  for (const shape of shapes) {
    for (const attribute of ['fill', 'stroke', 'color']) {
      expect(shape.hasAttribute(attribute), `<${shape.tagName}> ${attribute}`).toBe(false)
    }
  }
}

describe('library compatibility (Plan 0009, Background)', () => {
  // Each library routes `color` its own way: Lucide into the root stroke, Heroicons keeps the
  // `color` attribute (its shapes draw in currentColor), Phosphor into the root fill.
  test.each([
    ['lucide-trash', 'stroke'],
    ['heroicons-trash', 'color'],
    ['phosphor-trash', 'fill'],
  ] as const)('%s takes size and color from Icon, as the %s attribute', async (name, attribute) => {
    const svg = await renderIcon(<RegisteredIcon name={name} size={32} color="rgb(200, 0, 0)" />)
    expect(svg.getAttribute('width')).toBe('8em')
    expect(svg.getAttribute('height')).toBe('8em')
    expect(svg.getAttribute(attribute)).toBe('rgb(200, 0, 0)')
    expectShapesSetNoPaint(svg)
  })

  test.each(['lucide-trash', 'heroicons-trash'] as const)(
    '%s takes strokeWidth from Icon',
    async (name) => {
      const svg = await renderIcon(<RegisteredIcon name={name} strokeWidth={1} />)
      expect(svg.getAttribute('stroke-width')).toBe('1')
    },
  )

  test.each(['lucide-trash', 'heroicons-trash'] as const)(
    '%s takes fill and stroke from Icon, on the root',
    async (name) => {
      const svg = await renderIcon(
        <RegisteredIcon name={name} fill="rgb(1, 2, 3)" stroke="rgb(4, 5, 6)" />,
      )
      expect(svg.getAttribute('fill')).toBe('rgb(1, 2, 3)')
      expect(svg.getAttribute('stroke')).toBe('rgb(4, 5, 6)')
      expectShapesSetNoPaint(svg)
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
      <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
    const { container } = await render(<Icon as={MunicipalityMark} label="Radera" size={4} />)
    const svg = svgIn(container)
    expect(svg.getAttribute('data-slot')).toBe('icon')
    expect(svg.getAttribute('width')).toBe('1em')
    expect(received.at(-1)).not.toHaveProperty('size')
    expect(received.at(-1)).not.toHaveProperty('label')
    await expect.element(page.getByRole('img', { name: 'Radera' })).toBeVisible()
  })
})

describe('icon prop: a component reference (Plan 0044)', () => {
  test.each([
    ['Lucide', Trash2, 'stroke'],
    ['Heroicons', TrashIcon, 'color'],
  ] as const)(
    "%s: Icon's size and colour win over the library's own, with no registry",
    async (_library, component, colourAttribute) => {
      // No provider: `icon` needs no registration.
      const { container } = await render(<Icon icon={component} size={6} color="rgb(200, 0, 0)" />)
      const svg = svgIn(container)
      // Lucide draws 24 and Heroicons 24 by default: the step is 1.5em.
      expect(svg.getAttribute('width')).toBe('1.5em')
      expect(svg.getAttribute('height')).toBe('1.5em')
      expect(svg.getAttribute('data-size')).toBe('6')
      expect(svg.getAttribute(colourAttribute)).toBe('rgb(200, 0, 0)')
      expectShapesSetNoPaint(svg)
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
    const { container } = await render(<Icon icon={PhosphorTrash} size={6} />)
    const svg = svgIn(container)
    expect(svg.getAttribute('width')).toBe('1.5em')
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

  test('strokeWidth, other SVG attributes and a ref reach the <svg>', async () => {
    const ref = createRef<SVGSVGElement>()
    const { container } = await render(
      <Icon icon={Trash2} strokeWidth={1} data-testid="probe" ref={ref} />,
    )
    const svg = svgIn(container)
    expect(svg.getAttribute('stroke-width')).toBe('1')
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
        size={6}
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

  test('size is a step of the size scale, or a CSS length string', () => {
    expectTypeOf<4>().toExtend<IconScale>()
    expectTypeOf<0.5>().toExtend<IconScale>()
    expectTypeOf<96>().toExtend<IconScale>()
    expectTypeOf<13>().not.toExtend<IconScale>()
    expectTypeOf<IconScale>().toExtend<IconSize>()
    expectTypeOf<'48px'>().toExtend<IconSize>()
    expectTypeOf<{ size: 5 }>().toExtend<IconProps>()
    expectTypeOf<{ size: '2rem' }>().toExtend<IconProps>()
    expectTypeOf<{ size: 13 }>().not.toExtend<IconProps>()
    expectTypeOf<{ size: 4 }>().toExtend<UseIconOptions>()
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

  test('sizes are steps, numbers or typed lengths', () => {
    expectTypeOf<{ size: '1rem' }>().toExtend<UseIconOptions>()
  })

  test('the part props', () => {
    expectTypeOf<IconPartProps['className']>().toEqualTypeOf<'kv-icon'>()
  })
})

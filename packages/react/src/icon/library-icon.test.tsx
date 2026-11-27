import { Trash2 } from 'lucide-react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { close, search } from '@kvirn/icons'
import { ArrowForwardIcon } from '@kvirn/icons/react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Icon } from './icon.tsx'
import { defineIcons } from './icon-registry.ts'
import { LibraryIcon } from './library-icon.tsx'

// Contract: icon.a11y.md (Library icons). Plan 0160.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

function svgIn(container: HTMLElement): SVGSVGElement {
  const svg = container.querySelector('svg')
  if (svg === null) {
    throw new Error('No <svg> rendered')
  }
  return svg
}

describe('LibraryIcon', () => {
  test('without a registration the library icon draws, with no warning', async () => {
    const { container } = await render(<LibraryIcon name="close" icon={close} />)
    expect(svgIn(container).children.length).toBeGreaterThan(0)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a component draws the same way', async () => {
    const { container } = await render(<LibraryIcon name="close" icon={Trash2} />)
    expect(svgIn(container).classList.contains('lucide-trash-2')).toBe(true)
  })

  test('a registered name wins over the library icon', async () => {
    const { container } = await render(
      <KvirnProvider icons={defineIcons({ close: Trash2 })}>
        <LibraryIcon name="close" icon={close} />
      </KvirnProvider>,
    )
    expect(svgIn(container).classList.contains('lucide-trash-2')).toBe(true)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a plain component registered over a directional icon keeps its mirroring', async () => {
    const { container } = await render(
      <KvirnProvider icons={defineIcons({ 'arrow-forward': Trash2 })}>
        <LibraryIcon name="arrow-forward" icon={ArrowForwardIcon} mirrorInRtl />
      </KvirnProvider>,
    )
    expect(svgIn(container).hasAttribute('data-mirror-in-rtl')).toBe(true)
  })

  test("an app entry's mirrorInRtl: false wins over the library icon's flip", async () => {
    const { container } = await render(
      <KvirnProvider
        icons={defineIcons({ 'arrow-forward': { component: Trash2, mirrorInRtl: false } })}
      >
        <LibraryIcon name="arrow-forward" icon={ArrowForwardIcon} mirrorInRtl />
      </KvirnProvider>,
    )
    expect(svgIn(container).hasAttribute('data-mirror-in-rtl')).toBe(false)
  })

  test('the classes and the rem size match Icon', async () => {
    const { container } = await render(
      <>
        <LibraryIcon name="close" icon={Trash2} size="32" variant="danger" className="own" />
        <Icon as={Trash2} size="32" variant="danger" className="own" />
      </>,
    )
    const [libraryIcon, plainIcon] = container.querySelectorAll('svg')
    expect(libraryIcon?.getAttribute('class')).toBe(plainIcon?.getAttribute('class'))
    expect(libraryIcon?.getAttribute('width')).toBe('2rem')
    expect(libraryIcon?.getAttribute('height')).toBe('2rem')
  })

  test('the default size is 20 (1.25rem)', async () => {
    const { container } = await render(<LibraryIcon name="close" icon={close} />)
    expect(svgIn(container).classList.contains('kv-icon--size-20')).toBe(true)
    expect(svgIn(container).getAttribute('width')).toBe('1.25rem')
  })

  test('a directional icon gets data-mirror-in-rtl with mirrorInRtl, and a plain one does not', async () => {
    const { container } = await render(
      <>
        <LibraryIcon name="arrow-forward" icon={Trash2} mirrorInRtl />
        <LibraryIcon name="arrow-forward" icon={Trash2} />
      </>,
    )
    const [mirrored, plain] = container.querySelectorAll('svg')
    expect(mirrored?.hasAttribute('data-mirror-in-rtl')).toBe(true)
    expect(plain?.hasAttribute('data-mirror-in-rtl')).toBe(false)
  })

  test('is decorative by default: aria-hidden, no role', async () => {
    const { container } = await render(<LibraryIcon name="search" icon={search} />)
    const svg = svgIn(container)
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.hasAttribute('role')).toBe(false)
    expect(svg.hasAttribute('aria-label')).toBe(false)
  })

  test('a label makes it an image with that name', async () => {
    await render(<LibraryIcon name="search" icon={Trash2} label="Search" />)
    const image = page.getByRole('img', { name: 'Search' })
    await expect.element(image).toBeVisible()
    await expect.element(image).not.toHaveAttribute('aria-hidden')
  })
})

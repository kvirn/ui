import { Trash2 } from 'lucide-react'
import { describe, expect, expectTypeOf, test } from 'vite-plus/test'
import { render } from 'vitest-browser-react'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Icon } from './icon.tsx'
import { useIconLabel } from './use-icon-label.ts'
import type { IconLabelName } from './use-icon-label.ts'

// Contract: icon.a11y.md (Labels). Plan 0124 Task 7.

function LabelledIcon({
  name,
  messages,
}: {
  name: IconLabelName
  messages?: { cityHall?: string }
}) {
  return <Icon icon={Trash2} size="24" label={useIconLabel(name, messages)} />
}

function DecorativeIcon() {
  return <Icon icon={Trash2} />
}

describe('useIconLabel', () => {
  test('returns the built-in English label for a kebab-case name', async () => {
    const { container } = await render(<LabelledIcon name="city-hall" />)
    expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe('City hall')
  })

  test('a provider message override wins over the built-in label', async () => {
    const { container } = await render(
      <KvirnProvider messages={{ icons: { cityHall: 'Town hall' } }}>
        <LabelledIcon name="city-hall" />
      </KvirnProvider>,
    )
    expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe('Town hall')
  })

  test('a per-instance override wins over the provider', async () => {
    const { container } = await render(
      <KvirnProvider messages={{ icons: { cityHall: 'Town hall' } }}>
        <LabelledIcon name="city-hall" messages={{ cityHall: 'Kvirnby council' }} />
      </KvirnProvider>,
    )
    expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe('Kvirnby council')
  })

  test('a name without a label key returns undefined', async () => {
    const { container } = await render(<LabelledIcon name={'arrow-back' as IconLabelName} />)
    expect(container.querySelector('svg')?.hasAttribute('aria-label')).toBe(false)
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  test('an empty or blank override never gives a nameless image', async () => {
    const { container } = await render(
      <KvirnProvider messages={{ icons: { cityHall: '  ' } }}>
        <LabelledIcon name="city-hall" />
      </KvirnProvider>,
    )
    expect(container.querySelector('svg')?.getAttribute('aria-label')?.trim()).toBeTruthy()
  })

  test('an icon without the hook stays decorative', async () => {
    const { container } = await render(<DecorativeIcon />)
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    expect(container.querySelector('svg')?.hasAttribute('role')).toBe(false)
  })

  test('only names with a label key compile', () => {
    expectTypeOf<'city-hall'>().toExtend<IconLabelName>()
    expectTypeOf<'in-progress'>().toExtend<IconLabelName>()
    expectTypeOf<'arrow-back'>().not.toExtend<IconLabelName>()
  })
})

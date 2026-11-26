import { add } from '@kvirn/icons'
import { SvgIcon } from '@kvirn/icons/react'
import { readAloud } from '@kvirn/testing/read-aloud'
import { describe, expect, test } from 'vite-plus/test'
import { render } from 'vitest-browser-react'

// Contract: icon.a11y.md, section SvgIcon.

describe('SvgIcon', () => {
  test('a decorative icon is not read aloud', async () => {
    const { container } = await render(<SvgIcon icon={add} />)
    expect(await readAloud(container)).not.toContain('image, Add')
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  test('an icon with an aria-label is read as an image with that name', async () => {
    const { container } = await render(<SvgIcon icon={add} aria-label="Add" />)
    expect(await readAloud(container)).toContain('image, Add')
  })

  test('an icon with an aria-labelledby is read as an image with that name', async () => {
    const { container } = await render(
      <>
        <span id="add-label">Add</span>
        <SvgIcon icon={add} aria-labelledby="add-label" />
      </>,
    )
    expect(await readAloud(container)).toContain('image, Add')
  })

  test('an icon with a title is read as an image with that name', async () => {
    const { container } = await render(<SvgIcon icon={add} title="Add" />)
    expect(await readAloud(container)).toContain('image, Add')
  })

  test('an empty name stays decorative and is not read aloud', async () => {
    const { container } = await render(<SvgIcon icon={add} aria-label="" />)
    expect(await readAloud(container)).not.toContain('image, Add')
    expect(container.querySelector('svg')?.getAttribute('role')).toBeNull()
  })
})

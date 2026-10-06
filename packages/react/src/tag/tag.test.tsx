import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { useState } from 'react'
import type { ReactElement } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Tag, TagGroup } from './tag.tsx'
import type { TagGroupRootProps } from './tag.tsx'

// Contract: tag.a11y.md.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

function Filters({
  initial = ['Barn', 'Kultur', '2025'],
  refuse = false,
  ...groupProps
}: { initial?: string[]; refuse?: boolean } & Omit<TagGroupRootProps, 'children'>): ReactElement {
  const [tags, setTags] = useState(initial)
  return (
    <KvirnProvider>
      <button type="button">Före</button>
      <TagGroup.Root {...groupProps}>
        <TagGroup.Label>Valda filter</TagGroup.Label>
        <TagGroup.List>
          {tags.map((tag) => (
            <Tag.Root key={tag}>
              {/* Unstyled: a 24px minimum keeps it clear of axe's target-size rule (2.5.8). */}
              <Tag.Remove
                style={{ minBlockSize: '24px', minInlineSize: '24px' }}
                onRemove={() => {
                  if (!refuse) {
                    setTags((current) => current.filter((t) => t !== tag))
                  }
                }}
              >
                {tag}
              </Tag.Remove>
            </Tag.Root>
          ))}
        </TagGroup.List>
        <TagGroup.Empty>Inga filter valda</TagGroup.Empty>
        <TagGroup.ClearAll onClear={() => (refuse ? undefined : setTags([]))} />
      </TagGroup.Root>
    </KvirnProvider>
  )
}

const removeButton = (name: string) => page.getByRole('button', { name: `Remove ${name}` })
const clearAll = () => page.getByRole('button', { name: 'Clear all filters' })
const label = () => page.getByText('Valda filter')
const politeRegion = () => page.getByRole('status')

describe('Tag and TagGroup roles and names', () => {
  test('the list is named by the label and is not rendered while empty', async () => {
    await render(<Filters initial={['Barn']} />)
    await expect.element(page.getByRole('list', { name: 'Valda filter' })).toBeVisible()
    await removeButton('Barn').click()
    expect(page.getByRole('list').elements()).toHaveLength(0)
    await expect.element(page.getByText('Inga filter valda')).toBeVisible()
  })

  test("the remove button's name contains its visible text", async () => {
    await render(<Filters initial={['År: 2025']} />)
    const button = removeButton('År: 2025').element()
    expect(button.tagName).toBe('BUTTON')
    expect(button.getAttribute('type')).toBe('button')
    expect(button.getAttribute('aria-label')).toContain(button.textContent)
    expect(button.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })

  test('the name is translated from the provider and a label overrides the children', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <TagGroup.Root>
          <TagGroup.List>
            <Tag.Root>
              <Tag.Remove label="Stockholm" onRemove={() => {}}>
                <b>Stockholm</b>
              </Tag.Remove>
            </Tag.Root>
          </TagGroup.List>
        </TagGroup.Root>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('button', { name: 'Ta bort Stockholm' })).toBeVisible()
  })

  test('a static tag is text in a list item, with no button and no tabindex', async () => {
    await render(
      <TagGroup.Root>
        <TagGroup.List>
          <Tag.Root data-testid="tag">
            <Tag.Label>Obligatorisk</Tag.Label>
          </Tag.Root>
        </TagGroup.List>
      </TagGroup.Root>,
    )
    const item = page.getByTestId('tag').element()
    expect(item.tagName).toBe('LI')
    expect(item.querySelector('button')).toBeNull()
    expect(item.querySelector('[tabindex]')).toBeNull()
  })

  test('warns in development when the children are not a string and there is no label', async () => {
    await render(
      <TagGroup.Root>
        <TagGroup.Label>Valda</TagGroup.Label>
        <TagGroup.List>
          <Tag.Root>
            <Tag.Remove onRemove={() => {}}>
              <b>Ensam</b>
            </Tag.Remove>
          </Tag.Root>
        </TagGroup.List>
      </TagGroup.Root>,
    )
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('Tag.Remove'))
  })

  test('Tag.Remove outside a TagGroup throws, so focus can never be lost', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(
      render(
        <Tag.Root>
          <Tag.Remove onRemove={() => {}}>Ensam</Tag.Remove>
        </Tag.Root>,
      ),
    ).rejects.toThrow('Tag.Remove must be rendered inside TagGroup.Root')
    consoleError.mockRestore()
  })

  test('warns in development when a group has neither a label nor a focusFallback', async () => {
    await render(
      <TagGroup.Root>
        <TagGroup.List>
          <Tag.Root>
            <Tag.Remove onRemove={() => {}}>Barn</Tag.Remove>
          </Tag.Root>
        </TagGroup.List>
      </TagGroup.Root>,
    )
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('no TagGroup.Label'))
  })
})

describe('Tag keyboard', () => {
  test('Tab reaches every remove button in order, then Clear all', async () => {
    await render(<Filters />)
    await page.getByRole('button', { name: 'Före' }).click()
    for (const name of ['Remove Barn', 'Remove Kultur', 'Remove 2025', 'Clear all filters']) {
      await userEvent.tab()
      expect(document.activeElement).toBe(page.getByRole('button', { name }).element())
    }
  })

  test('Shift+Tab goes back through the remove buttons', async () => {
    await render(<Filters />)
    clearAll().element().focus()
    for (const name of ['Remove 2025', 'Remove Kultur', 'Remove Barn']) {
      await userEvent.tab({ shift: true })
      expect(document.activeElement).toBe(page.getByRole('button', { name }).element())
    }
  })

  test('Enter and Space remove the tag and focus the next remove button', async () => {
    await render(<Filters />)
    removeButton('Barn').element().focus()
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(removeButton('Kultur').element())
    await userEvent.keyboard(' ')
    expect(document.activeElement).toBe(removeButton('2025').element())
    expect(page.getByRole('listitem').elements()).toHaveLength(1)
  })

  test('removing the last tag focuses the previous remove button', async () => {
    await render(<Filters />)
    removeButton('2025').element().focus()
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(removeButton('Kultur').element())
  })

  test('removing the only tag focuses the fallback, never body', async () => {
    await render(<Filters initial={['Barn']} />)
    removeButton('Barn').element().focus()
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(label().element())
    expect(document.activeElement).not.toBe(document.body)
  })

  test('a focusFallback replaces the label', async () => {
    await render(
      <Filters
        initial={['Barn']}
        focusFallback={() => page.getByRole('button', { name: 'Före' }).element() as HTMLElement}
      />,
    )
    removeButton('Barn').element().focus()
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Före' }).element())
  })

  test('a focusFallback that cannot take focus falls back to the label and warns', async () => {
    await render(<Filters initial={['Barn']} focusFallback={() => document.createElement('p')} />)
    removeButton('Barn').element().focus()
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(label().element())
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('focusFallback'))
  })

  test('a removal the consumer refuses leaves focus where it was and announces nothing', async () => {
    await render(<Filters refuse />)
    removeButton('Kultur').element().focus()
    await userEvent.keyboard('{Enter}')
    await new Promise((resolve) => setTimeout(resolve, 250))
    expect(document.activeElement).toBe(removeButton('Kultur').element())
    await expect.element(politeRegion()).not.toHaveTextContent('removed')
  })

  test('Clear all refused by the consumer leaves focus where it was', async () => {
    await render(<Filters refuse />)
    clearAll().element().focus()
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(clearAll().element())
  })

  test('Clear all focuses the fallback', async () => {
    await render(<Filters />)
    clearAll().element().focus()
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(label().element())
    expect(page.getByRole('listitem').elements()).toHaveLength(0)
  })

  test('Clear all over static tags focuses the fallback', async () => {
    function StaticFilters(): ReactElement {
      const [tags, setTags] = useState(['Barn', 'Kultur'])
      return (
        <KvirnProvider>
          <TagGroup.Root>
            <TagGroup.Label>Valda filter</TagGroup.Label>
            <TagGroup.List>
              {tags.map((tag) => (
                <Tag.Root key={tag}>
                  <Tag.Label>{tag}</Tag.Label>
                </Tag.Root>
              ))}
            </TagGroup.List>
            <TagGroup.ClearAll style={{ minBlockSize: '24px' }} onClear={() => setTags([])} />
          </TagGroup.Root>
        </KvirnProvider>
      )
    }
    await render(<StaticFilters />)
    clearAll().element().focus()
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(label().element())
  })

  test('Delete and Backspace on a remove button remove nothing', async () => {
    await render(<Filters />)
    removeButton('Kultur').element().focus()
    await userEvent.keyboard('{Delete}')
    await userEvent.keyboard('{Backspace}')
    expect(page.getByRole('listitem').elements()).toHaveLength(3)
    expect(document.activeElement).toBe(removeButton('Kultur').element())
  })
})

describe('Tag announcements', () => {
  test('removing a tag announces tag.removed', async () => {
    await render(<Filters />)
    await removeButton('Kultur').click()
    await expect.element(politeRegion()).toHaveTextContent('Kultur removed.')
  })

  test('announceRemoval={false} says nothing', async () => {
    await render(<Filters announceRemoval={false} />)
    await removeButton('Kultur').click()
    expect(page.getByRole('listitem').elements()).toHaveLength(2)
    await new Promise((resolve) => setTimeout(resolve, 250))
    await expect.element(politeRegion()).not.toHaveTextContent('removed')
  })
})

test('has no axe violations with tags, and with none', async () => {
  const { container } = await render(
    <main>
      <h1>Nyheter</h1>
      <Filters />
    </main>,
  )
  await expect.element(removeButton('Barn')).toBeVisible()
  await expectNoA11yViolations(container)
  await clearAll().click()
  await expect.element(page.getByText('Inga filter valda')).toBeVisible()
  await expectNoA11yViolations(container)
})

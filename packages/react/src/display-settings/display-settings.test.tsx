import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { useEffect } from 'react'
import { afterEach, describe, expect, test } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { DisplaySettings, KvirnProvider, useDisplaySettings, useTheme } from '../index.ts'

// Contract: display-settings.a11y.md. Component tests load no theme, so only behaviour, names and
// state are asserted; the popup is the browser's own `popover` element.

afterEach(() => {
  localStorage.clear()
  const root = document.documentElement
  for (const name of root.getAttributeNames()) {
    if (name.startsWith('data-kv-')) {
      root.removeAttribute(name)
    }
  }
})

/** Writes what the provider holds, so a test reads the choice and not the DOM. */
function Choices() {
  const theme = useTheme()
  return (
    <output data-testid="choices">
      {theme.colorScheme}/{theme.contrast}/{theme.motion}
    </output>
  )
}

/** The theme store outlives a test: start each one from the device's settings. */
function Reset() {
  const theme = useTheme()
  const { selectColorScheme, selectContrast, selectMotion } = theme
  useEffect(() => {
    selectColorScheme('system')
    selectContrast('system')
    selectMotion('system')
  }, [selectColorScheme, selectContrast, selectMotion])
  return null
}

function Example({ children }: { children: React.ReactNode }) {
  return (
    <KvirnProvider>
      <Reset />
      <button type="button">Before</button>
      {children}
      <button type="button">After</button>
      <Choices />
    </KvirnProvider>
  )
}

const choices = () => page.getByTestId('choices').element().textContent
const triggerButton = () => page.getByRole('button', { name: 'Display settings' })

describe('DisplaySettings.Inline', () => {
  test('the button is named by the message and controls a closed panel', async () => {
    await render(
      <Example>
        <DisplaySettings.Inline />
      </Example>,
    )
    const button = triggerButton().element()
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(button.getAttribute('aria-controls')).not.toBeNull()
  })

  test('Enter opens the panel and Enter again closes it, and focus stays on the button', async () => {
    await render(
      <Example>
        <DisplaySettings.Inline />
      </Example>,
    )
    const button = triggerButton().element() as HTMLButtonElement
    button.focus()
    await userEvent.keyboard('{Enter}')
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(button)
    await userEvent.keyboard('{Enter}')
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  test('Space opens and closes the panel', async () => {
    await render(
      <Example>
        <DisplaySettings.Inline />
      </Example>,
    )
    const button = triggerButton().element() as HTMLButtonElement
    button.focus()
    await userEvent.keyboard(' ')
    expect(button.getAttribute('aria-expanded')).toBe('true')
    await userEvent.keyboard(' ')
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  test('Escape does not close it: the panel is in flow, not an overlay', async () => {
    await render(
      <Example>
        <DisplaySettings.Inline defaultOpen />
      </Example>,
    )
    const button = triggerButton().element() as HTMLButtonElement
    button.focus()
    await userEvent.keyboard('{Escape}')
    expect(button.getAttribute('aria-expanded')).toBe('true')
  })
})

describe('DisplaySettings.Floating and Compact', () => {
  test.each([
    ['Floating', <DisplaySettings.Floating key="f" />],
    ['Compact', <DisplaySettings.Compact key="c" />],
  ])(
    '%s: Enter opens a dialog named by the button, Escape closes it and focus returns',
    async (_name, layout) => {
      await render(<Example>{layout}</Example>)
      const button = triggerButton().element() as HTMLButtonElement
      expect(button.getAttribute('aria-haspopup')).toBe('dialog')
      button.focus()
      await userEvent.keyboard('{Enter}')
      expect(button.getAttribute('aria-expanded')).toBe('true')
      await expect.element(page.getByRole('dialog', { name: 'Display settings' })).toBeVisible()
      await userEvent.keyboard('{Escape}')
      expect(button.getAttribute('aria-expanded')).toBe('false')
      expect(document.activeElement).toBe(button)
    },
  )

  test.each([
    ['Floating', <DisplaySettings.Floating key="f" />],
    ['Compact', <DisplaySettings.Compact key="c" />],
  ])('%s: the button has a decorative chevron and the same name', async (_name, layout) => {
    await render(<Example>{layout}</Example>)
    const button = triggerButton().element()
    const chevron = button.querySelector('.kv-display-settings-chevron')
    expect(chevron?.getAttribute('aria-hidden')).toBe('true')
    expect(button.textContent?.trim()).toBe('Display settings')
  })

  test('opening the popup does not move focus', async () => {
    await render(
      <Example>
        <DisplaySettings.Floating />
      </Example>,
    )
    const button = triggerButton().element() as HTMLButtonElement
    button.focus()
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(button)
  })
})

describe('the groups', () => {
  test('three groups are named by their legends, each with three options', async () => {
    await render(
      <Example>
        <DisplaySettings.Panel />
      </Example>,
    )
    for (const [legend, options] of [
      ['Colour scheme', ['Light', 'Dark', 'Same as my device']],
      ['Contrast', ['Standard', 'High', 'Same as my device']],
      ['Motion', ['Full motion', 'Less motion', 'Same as my device']],
    ] as const) {
      const group = page.getByRole('group', { name: legend })
      await expect.element(group).toBeVisible()
      for (const option of options) {
        await expect.element(group.getByRole('radio', { name: option })).toBeInTheDocument()
      }
    }
  })

  test('the checked radios are the provider’s choices', async () => {
    await render(
      <Example>
        <DisplaySettings.Panel />
      </Example>,
    )
    expect(choices()).toBe('system/system/system')
    await expect
      .element(
        page
          .getByRole('group', { name: 'Colour scheme' })
          .getByRole('radio', { name: 'Same as my device' }),
      )
      .toBeChecked()
  })

  test('choosing a radio sets that preference through the provider', async () => {
    await render(
      <Example>
        <DisplaySettings.Panel />
      </Example>,
    )
    await userEvent.click(page.getByRole('radio', { name: 'Dark' }))
    await userEvent.click(page.getByRole('radio', { name: 'High' }))
    await userEvent.click(page.getByRole('radio', { name: 'Less motion' }))
    expect(choices()).toBe('dark/more/reduce')
    expect(document.documentElement.getAttribute('data-kv-color-scheme')).toBe('dark')
  })

  test('ArrowDown moves to and selects the next radio in a group', async () => {
    await render(
      <Example>
        <DisplaySettings.Panel />
      </Example>,
    )
    await userEvent.click(page.getByRole('radio', { name: 'Light' }))
    expect(choices()).toBe('light/system/system')
    await userEvent.keyboard('{ArrowDown}')
    expect(choices()).toBe('dark/system/system')
    expect(document.activeElement).toBe(page.getByRole('radio', { name: 'Dark' }).element())
  })

  test('ArrowUp moves to and selects the previous radio', async () => {
    await render(
      <Example>
        <DisplaySettings.Panel />
      </Example>,
    )
    await userEvent.click(page.getByRole('radio', { name: 'Dark' }))
    await userEvent.keyboard('{ArrowUp}')
    expect(choices()).toBe('light/system/system')
  })

  test('Tab has one stop per group and Shift+Tab goes back through them', async () => {
    await render(
      <Example>
        <DisplaySettings.Panel />
      </Example>,
    )
    const before = page.getByRole('button', { name: 'Before' }).element() as HTMLButtonElement
    before.focus()
    const stops: string[] = []
    for (let step = 0; step < 3; step += 1) {
      await userEvent.tab()
      const input = document.activeElement as HTMLInputElement
      stops.push(input.getAttribute('name') ?? '')
    }
    expect(stops).toEqual([
      'kv-display-settings-color-scheme',
      'kv-display-settings-contrast',
      'kv-display-settings-motion',
    ])
    await userEvent.tab({ shift: true })
    expect((document.activeElement as HTMLInputElement).getAttribute('name')).toBe(
      'kv-display-settings-contrast',
    )
  })

  test('the CompactPanel has the same groups, with the short name for the device option', async () => {
    await render(
      <Example>
        <DisplaySettings.CompactPanel />
      </Example>,
    )
    await expect
      .element(page.getByRole('group', { name: 'Motion' }).getByRole('radio', { name: 'Device' }))
      .toBeInTheDocument()
    await userEvent.click(page.getByRole('radio', { name: 'Less motion' }))
    expect(choices()).toBe('system/system/reduce')
  })
})

describe('messages and children', () => {
  test('children are shown after the groups, and there is no note of its own', async () => {
    const { container } = await render(
      <Example>
        <DisplaySettings.Panel>
          <p>We keep your choice in this browser.</p>
        </DisplaySettings.Panel>
      </Example>,
    )
    const content = container.querySelector('.kv-display-settings-content')
    expect(content?.lastElementChild?.textContent).toBe('We keep your choice in this browser.')
    expect(container.textContent).not.toContain('Privacy')
    expect(container.textContent).not.toContain('Less motion turns off')
  })

  test('the provider’s catalog sets the language of the labels', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <DisplaySettings.Inline defaultOpen />
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('button', { name: 'Visningsinställningar' })).toBeVisible()
    await expect.element(page.getByRole('group', { name: 'Färgschema' })).toBeVisible()
  })

  test('messages on the instance override the provider’s', async () => {
    await render(
      <Example>
        <DisplaySettings.Inline
          messages={{ button: 'Appearance', colorSchemeLegend: 'Theme' }}
          defaultOpen
        />
      </Example>,
    )
    await expect.element(page.getByRole('button', { name: 'Appearance' })).toBeVisible()
    await expect.element(page.getByRole('group', { name: 'Theme' })).toBeVisible()
  })

  test('useDisplaySettings returns the three groups for your own markup', async () => {
    function Own() {
      const { groups } = useDisplaySettings()
      return (
        <ul>
          {groups.map((group) => (
            <li key={group.id}>
              {group.legend}: {group.options.map((option) => option.label).join(', ')}
            </li>
          ))}
        </ul>
      )
    }
    const { container } = await render(
      <Example>
        <Own />
      </Example>,
    )
    const items = [...container.querySelectorAll('li')].map((item) => item.textContent)
    expect(items).toEqual([
      'Colour scheme: Light, Dark, Same as my device',
      'Contrast: Standard, High, Same as my device',
      'Motion: Full motion, Less motion, Same as my device',
    ])
  })
})

describe('accessibility', () => {
  test.each([
    ['Inline', <DisplaySettings.Inline key="i" defaultOpen />],
    ['Floating', <DisplaySettings.Floating key="f" defaultOpen />],
    ['Compact', <DisplaySettings.Compact key="c" defaultOpen />],
    ['Panel', <DisplaySettings.Panel key="p" />],
    ['CompactPanel', <DisplaySettings.CompactPanel key="cp" />],
  ])('%s has no axe violations', async (_name, layout) => {
    const { container } = await render(<Example>{layout}</Example>)
    expect(container.querySelectorAll('input[type="radio"]')).toHaveLength(9)
    await expectNoA11yViolations(container)
  })
})

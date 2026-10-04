import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { Button } from '../button/button.tsx'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { Toolbar } from '../toolbar/toolbar.tsx'
import { ButtonGroup } from './button-group.tsx'
import type { ButtonGroupProps, ButtonGroupState } from './button-group.tsx'
import { useButtonGroup } from './use-button-group.ts'
import type { ButtonGroupPartProps, UseButtonGroupResult } from './use-button-group.ts'

// Contract: button-group.a11y.md. It has no keys of its own: Tab moves through the Buttons
// natively, which the Tab row names.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

describe('role and name', () => {
  test('with aria-label it is a group with that name', async () => {
    const { container } = await render(
      <ButtonGroup aria-label="Ärendet">
        <Button>Spara utkast</Button>
        <Button>Skicka</Button>
      </ButtonGroup>,
    )
    const group = page.getByRole('group', { name: 'Ärendet' })
    await expect.element(group).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('with aria-labelledby it is a group named by that element', async () => {
    const { container } = await render(
      <>
        <h2 id="rubrik">Bygglov</h2>
        <ButtonGroup aria-labelledby="rubrik">
          <Button>Spara utkast</Button>
          <Button>Skicka</Button>
        </ButtonGroup>
      </>,
    )
    await expect.element(page.getByRole('group', { name: 'Bygglov' })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('without a name it is a plain div with no role, so it adds no empty group to the tree', async () => {
    const { container } = await render(
      <ButtonGroup data-testid="footer">
        <Button>Spara utkast</Button>
        <Button>Skicka</Button>
      </ButtonGroup>,
    )
    const group = page.getByTestId('footer')
    await expect.element(group).not.toHaveAttribute('role')
    expect(group.element().tagName).toBe('DIV')
    expect(page.getByRole('group').elements()).toHaveLength(0)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('part class and props', () => {
  test('marks its part with class="kv-button-group", joins a consumer class and passes props on', async () => {
    const ref = createRef<HTMLDivElement>()
    await render(
      <ButtonGroup ref={ref} className="egen-klass" aria-label="Ärendet" id="atgarder">
        <Button>Skicka</Button>
      </ButtonGroup>,
    )
    const group = page.getByRole('group', { name: 'Ärendet' })
    await expect.element(group).toHaveClass('kv-button-group', 'egen-klass')
    await expect.element(group).toHaveAttribute('id', 'atgarder')
    expect(ref.current).toBe(group.element())
  })

  test('render takes an element, or a function that gets the part props and the state', async () => {
    const seenStates: ButtonGroupState[] = []
    await render(
      <>
        <ButtonGroup aria-label="Element" render={<section />}>
          <Button>A</Button>
        </ButtonGroup>
        <ButtonGroup
          aria-label="Funktion"
          render={(groupProps, state) => {
            seenStates.push(state)
            return <div {...groupProps} data-egen="" />
          }}
        >
          <Button>B</Button>
        </ButtonGroup>
      </>,
    )
    const elementGroup = page.getByRole('group', { name: 'Element' })
    expect(elementGroup.element().tagName).toBe('SECTION')
    await expect.element(elementGroup).toHaveClass('kv-button-group')
    await expect
      .element(page.getByRole('group', { name: 'Funktion' }))
      .toHaveAttribute('data-egen', '')
    expect(seenStates.at(-1)).toEqual({ isNamed: true })
  })
})

describe('keyboard', () => {
  test('Tab and Shift+Tab move through its buttons in DOM order, one stop each, and the group adds none', async () => {
    await render(
      <ButtonGroup aria-label="Ärendet">
        <Button>Spara utkast</Button>
        <Button>Skicka</Button>
      </ButtonGroup>,
    )
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Spara utkast' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Skicka' })).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('button', { name: 'Spara utkast' })).toHaveFocus()
    expect(page.getByRole('group').element().getAttribute('tabindex')).toBeNull()
  })
})

describe('inside a Toolbar', () => {
  test('warns in development when a group in a toolbar has no name', async () => {
    await render(
      <Toolbar.Root aria-label="Formatering">
        <ButtonGroup>
          <Toolbar.Button>Ångra</Toolbar.Button>
          <Toolbar.Button>Gör om</Toolbar.Button>
          <Toolbar.Button>Spara</Toolbar.Button>
        </ButtonGroup>
      </Toolbar.Root>,
    )
    await expect.element(page.getByRole('toolbar', { name: 'Formatering' })).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('ButtonGroup')
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('aria-label')
  })

  test('does not warn when the group in a toolbar is named, or a group stands alone without a name', async () => {
    await render(
      <>
        <Toolbar.Root aria-label="Formatering">
          <ButtonGroup aria-label="Historik">
            <Toolbar.Button>Ångra</Toolbar.Button>
            <Toolbar.Button>Gör om</Toolbar.Button>
            <Toolbar.Button>Spara</Toolbar.Button>
          </ButtonGroup>
        </Toolbar.Root>
        <ButtonGroup>
          <Button>Skicka</Button>
        </ButtonGroup>
      </>,
    )
    await expect.element(page.getByRole('group', { name: 'Historik' })).toBeVisible()
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('useButtonGroup', () => {
  function HookGroup({ isNamed }: { isNamed: boolean }) {
    const group = useButtonGroup({ isNamed })
    return (
      <div {...mergeProps(group.groupProps, { 'aria-label': isNamed ? 'Ärendet' : undefined })}>
        <Button>Skicka</Button>
      </div>
    )
  }

  test('gives spreadable groupProps: a group role only when named', async () => {
    const { container, rerender } = await render(<HookGroup isNamed />)
    await expect
      .element(page.getByRole('group', { name: 'Ärendet' }))
      .toHaveClass('kv-button-group')
    await expectNoA11yViolations(container)
    await rerender(<HookGroup isNamed={false} />)
    expect(page.getByRole('group').elements()).toHaveLength(0)
  })
})

describe('server rendering', () => {
  test('renders to a string without touching the page', () => {
    expect(
      renderToString(
        <ButtonGroup aria-label="Ärendet">
          <Button>Skicka</Button>
        </ButtonGroup>,
      ),
    ).toBe(
      '<div aria-label="Ärendet" class="kv-button-group" role="group"><button class="kv-button" type="button">Skicka</button></div>',
    )
    expect(renderToString(<ButtonGroup />)).toBe('<div class="kv-button-group"></div>')
  })
})

describe('types', () => {
  test('exports the hook and part types', () => {
    expectTypeOf<ButtonGroupPartProps['className']>().toEqualTypeOf<'kv-button-group'>()
    expectTypeOf<ButtonGroupPartProps['role']>().toEqualTypeOf<'group' | undefined>()
    expectTypeOf<UseButtonGroupResult['groupProps']>().toEqualTypeOf<ButtonGroupPartProps>()
    expectTypeOf<ButtonGroupState>().toEqualTypeOf<{ isNamed: boolean }>()
    // The role comes from the name, never from a prop.
    expectTypeOf<ButtonGroupProps>().not.toHaveProperty('role')
  })
})

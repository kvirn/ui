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
import type { ButtonGroupProps } from './button-group.tsx'
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
      <ButtonGroup aria-label="The case">
        <Button>Save draft</Button>
        <Button>Send</Button>
      </ButtonGroup>,
    )
    const group = page.getByRole('group', { name: 'The case' })
    await expect.element(group).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('with aria-labelledby it is a group named by that element', async () => {
    const { container } = await render(
      <>
        <h2 id="heading">Building permit</h2>
        <ButtonGroup aria-labelledby="heading">
          <Button>Save draft</Button>
          <Button>Send</Button>
        </ButtonGroup>
      </>,
    )
    await expect.element(page.getByRole('group', { name: 'Building permit' })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('without a name it is a plain div with no role, so it adds no empty group to the tree', async () => {
    const { container } = await render(
      <ButtonGroup data-testid="footer">
        <Button>Save draft</Button>
        <Button>Send</Button>
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
      <ButtonGroup ref={ref} className="own-class" aria-label="The case" id="actions">
        <Button>Send</Button>
      </ButtonGroup>,
    )
    const group = page.getByRole('group', { name: 'The case' })
    await expect.element(group).toHaveClass('kv-button-group', 'own-class')
    await expect.element(group).toHaveAttribute('id', 'actions')
    expect(ref.current).toBe(group.element())
  })
})

describe('attached', () => {
  test('a consumer-added kv-button-group--attached keeps the group role and name, and joins the class', async () => {
    const { container } = await render(
      <ButtonGroup aria-label="Text style" className="kv-button-group--attached own-class">
        <Button>Fet</Button>
        <Button>Italic</Button>
      </ButtonGroup>,
    )
    const group = page.getByRole('group', { name: 'Text style' })
    await expect
      .element(group)
      .toHaveClass('kv-button-group', 'kv-button-group--attached', 'own-class')
    await expectNoA11yViolations(container)
  })

  test('an attached group without a name has no role', async () => {
    await render(
      <ButtonGroup className="kv-button-group--attached" data-testid="strip">
        <Button>Fet</Button>
      </ButtonGroup>,
    )
    await expect.element(page.getByTestId('strip')).not.toHaveAttribute('role')
    expect(page.getByRole('group').elements()).toHaveLength(0)
  })
})

describe('keyboard', () => {
  test('Tab and Shift+Tab move through its buttons in DOM order, one stop each, and the group adds none', async () => {
    await render(
      <ButtonGroup aria-label="The case">
        <Button>Save draft</Button>
        <Button>Send</Button>
      </ButtonGroup>,
    )
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Save draft' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Send' })).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('button', { name: 'Save draft' })).toHaveFocus()
    expect(page.getByRole('group').element().getAttribute('tabindex')).toBeNull()
  })
})

describe('inside a Toolbar', () => {
  test('warns in development when a group in a toolbar has no name', async () => {
    await render(
      <Toolbar.Root aria-label="Formatting">
        <ButtonGroup>
          <Toolbar.Button>Undo</Toolbar.Button>
          <Toolbar.Button>Redo</Toolbar.Button>
          <Toolbar.Button>Save</Toolbar.Button>
        </ButtonGroup>
      </Toolbar.Root>,
    )
    await expect.element(page.getByRole('toolbar', { name: 'Formatting' })).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('ButtonGroup')
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('aria-label')
  })

  test('does not warn when the group in a toolbar is named, or a group stands alone without a name', async () => {
    await render(
      <>
        <Toolbar.Root aria-label="Formatting">
          <ButtonGroup aria-label="History">
            <Toolbar.Button>Undo</Toolbar.Button>
            <Toolbar.Button>Redo</Toolbar.Button>
            <Toolbar.Button>Save</Toolbar.Button>
          </ButtonGroup>
        </Toolbar.Root>
        <ButtonGroup>
          <Button>Send</Button>
        </ButtonGroup>
      </>,
    )
    await expect.element(page.getByRole('group', { name: 'History' })).toBeVisible()
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('Toolbar.Group', () => {
  test('is attached, and keeps a consumer class', async () => {
    await render(
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Group aria-label="History">
          <Toolbar.Button>Undo</Toolbar.Button>
          <Toolbar.Button>Redo</Toolbar.Button>
        </Toolbar.Group>
        <Toolbar.Group aria-label="Text style" className="own-class">
          <Toolbar.Button>Fet</Toolbar.Button>
        </Toolbar.Group>
      </Toolbar.Root>,
    )
    await expect
      .element(page.getByRole('group', { name: 'History' }))
      .toHaveClass('kv-button-group--attached')
    await expect
      .element(page.getByRole('group', { name: 'Text style' }))
      .toHaveClass('kv-button-group--attached', 'own-class')
  })
})

describe('useButtonGroup', () => {
  function HookGroup({ isNamed }: { isNamed: boolean }) {
    const group = useButtonGroup({ isNamed })
    return (
      <div {...mergeProps(group.groupProps, { 'aria-label': isNamed ? 'The case' : undefined })}>
        <Button>Send</Button>
      </div>
    )
  }

  test('gives spreadable groupProps: a group role only when named', async () => {
    const { container, rerender } = await render(<HookGroup isNamed />)
    await expect
      .element(page.getByRole('group', { name: 'The case' }))
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
        <ButtonGroup aria-label="The case">
          <Button>Send</Button>
        </ButtonGroup>,
      ),
    ).toBe(
      '<div aria-label="The case" class="kv-button-group" role="group"><button class="kv-button" type="button">Send</button></div>',
    )
    expect(renderToString(<ButtonGroup />)).toBe('<div class="kv-button-group"></div>')
  })
})

describe('types', () => {
  test('exports the hook and part types', () => {
    expectTypeOf<ButtonGroupPartProps['className']>().toEqualTypeOf<'kv-button-group'>()
    expectTypeOf<ButtonGroupPartProps['role']>().toEqualTypeOf<'group' | undefined>()
    expectTypeOf<UseButtonGroupResult['groupProps']>().toEqualTypeOf<ButtonGroupPartProps>()
    // The role comes from the name, never from a prop.
    expectTypeOf<ButtonGroupProps>().not.toHaveProperty('role')
  })
})

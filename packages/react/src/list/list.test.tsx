import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { afterEach, beforeEach, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Link } from '../link/link.tsx'
import { List } from './list.tsx'

// Contract: list.a11y.md.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

test('renders a ul or an ol with li items and keeps its class next to a consumer className', async () => {
  const { container } = await render(
    <>
      <List.Root data-testid="unordered" className="annat" id="tjanster" gap="8">
        <List.Item>
          <Link.Root href="#bygglov">Bygglov</Link.Root>
        </List.Item>
        <List.Item>Avfall</List.Item>
      </List.Root>
      <List.Root as="ol" marker="decimal" data-testid="ordered">
        <List.Item>Ansök</List.Item>
        <List.Item>Vänta på beslut</List.Item>
      </List.Root>
    </>,
  )
  const unordered = page.getByTestId('unordered')
  expect(unordered.element().tagName).toBe('UL')
  expect(page.getByTestId('ordered').element().tagName).toBe('OL')
  expect(page.getByRole('listitem').elements()).toHaveLength(4)
  await expect.element(unordered).toHaveClass('kv-list', 'kv-list--gap-8', 'annat')
  await expect.element(unordered).toHaveAttribute('id', 'tjanster')
  await expectNoA11yViolations(container)
})

test('adds role="list" without a marker only, and a consumer role wins', async () => {
  await render(
    <>
      <List.Root data-testid="plain" />
      <List.Root marker="bullet" data-testid="bulleted" />
      <List.Root as="ol" marker="decimal" data-testid="numbered" />
      <List.Root role="presentation" data-testid="own" />
    </>,
  )
  expect(page.getByTestId('plain').element().getAttribute('role')).toBe('list')
  expect(page.getByTestId('bulleted').element().hasAttribute('role')).toBe(false)
  expect(page.getByTestId('numbered').element().hasAttribute('role')).toBe(false)
  expect(page.getByTestId('own').element().getAttribute('role')).toBe('presentation')
})

test('warns once for marker="decimal" on a ul, and not on an ol', async () => {
  await render(
    <>
      <List.Root as="ol" marker="decimal" />
      <List.Root marker="decimal" />
      <List.Root marker="decimal" />
    </>,
  )
  const messages = consoleWarn.mock.calls.map(([message]) => String(message))
  expect(messages.filter((message) => message.includes('marker="decimal"'))).toHaveLength(1)
})

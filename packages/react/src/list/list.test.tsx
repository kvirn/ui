import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { expect, test } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { Link } from '../link/link.tsx'
import { List } from './list.tsx'

// Contract: list.a11y.md.

test('renders a ul or an ol with li items and keeps its class next to a consumer className', async () => {
  const { container } = await render(
    <>
      <List.Root data-testid="unordered" className="kv-list--gap-8 annat" id="tjanster">
        <List.Item>
          <Link.Root href="#bygglov">Bygglov</Link.Root>
        </List.Item>
        <List.Item>Avfall</List.Item>
      </List.Root>
      <List.Root as="ol" data-testid="ordered">
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

test('always has role="list", and a consumer role wins', async () => {
  await render(
    <>
      <List.Root data-testid="plain" />
      <List.Root className="kv-list--bullet" data-testid="bulleted" />
      <List.Root as="ol" className="kv-list--decimal" data-testid="numbered" />
      <List.Root role="presentation" data-testid="own" />
    </>,
  )
  expect(page.getByTestId('plain').element().getAttribute('role')).toBe('list')
  expect(page.getByTestId('bulleted').element().getAttribute('role')).toBe('list')
  expect(page.getByTestId('numbered').element().getAttribute('role')).toBe('list')
  expect(page.getByTestId('own').element().getAttribute('role')).toBe('presentation')
})

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import {
  isThemeLoaded,
  readLength,
  readProperty,
  ScrollTable,
  ThemeMissingNotice,
  useLiveValue,
} from './foundation-helpers.tsx'
import { formatPixels, readTokenText, themeTokenNames, TokenPage } from './tokens-helpers.tsx'

// Foundation/Spacing (docs/design/foundations-and-prose.md §6.6): the 4px spacing scale and
// the prose spacing tokens, read live from the page.

const spaceTokens = themeTokenNames(/^--kv-space-\d+$/)

const proseSpaceUses: Record<string, string> = {
  '--kv-prose-space': 'Between paragraphs, lists and description lists',
  '--kv-prose-space-item': 'Between list items',
  '--kv-prose-space-block': 'Around figures, tables, code blocks, quotes and not-prose blocks',
  '--kv-prose-space-section': 'Before each h2, and around hr',
  '--kv-prose-list-indent': 'List indent, in em so the marker “10.” fits at any size',
}
const proseSpaceTokens = themeTokenNames(/^--kv-prose-(?:space|list-indent)/)

interface Measured {
  token: string
  value: string | undefined
  pixels: number | undefined
}

const measure = (element: Element, token: string): Measured => ({
  token,
  value: readProperty(element, token),
  pixels: readLength(element, token),
})

function readSpacing(page: HTMLElement) {
  const large = page.querySelector('[data-story-probe="large"]')
  if (!isThemeLoaded(page) || large === null) {
    return null
  }
  return {
    space: spaceTokens.map((token) => measure(page, token)),
    prose: proseSpaceTokens.map((token) => ({
      token,
      normal: readTokenText(page, token) ?? 'Not defined',
      large: readTokenText(large, token) ?? 'Not defined',
    })),
  }
}

function SpacingPage(): ReactNode {
  const [pageRef, values] = useLiveValue<ReturnType<typeof readSpacing>, HTMLElement>(readSpacing)
  return (
    <TokenPage title="Spacing" pageRef={pageRef}>
      {/* The large prose size, to read its tokens. It shows nothing. */}
      <div
        aria-hidden="true"
        className="kv-prose kv-prose--large"
        data-story-probe="large"
        style={{ position: 'absolute', inlineSize: 0, blockSize: 0, overflow: 'hidden' }}
      />
      <p>
        Everything sits on a 4px grid. The steps are in rem, so they grow with the user’s text size.
        Most layouts use steps 2, 4, 6 and 8: 8, 16, 24 and 32px at the default text size.
      </p>
      {values === null ? <ThemeMissingNotice /> : null}
      {values ? (
        <>
          <h2>The scale</h2>
          <ScrollTable caption="Spacing tokens">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">rem</th>
                <th scope="col">px</th>
              </tr>
            </thead>
            <tbody>
              {values.space.map(({ token, value, pixels }) => (
                <tr key={token}>
                  <th scope="row">
                    <code>{token}</code>
                  </th>
                  <td>{value ?? 'Not defined'}</td>
                  {/* The bar is the length drawn, next to its value in text. */}
                  <td>
                    {pixels === undefined ? 'Not defined' : formatPixels(pixels)}
                    <span
                      aria-hidden="true"
                      className="kv-story-bar"
                      style={{ inlineSize: `var(${token})`, marginBlockStart: 'var(--kv-space-1)' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </ScrollTable>

          <h2>Prose spacing</h2>
          <p>
            <code>kv-prose</code> spaces its content with these tokens. The large size,{' '}
            <code>kv-prose--large</code>, only swaps them for larger steps.
          </p>
          <ScrollTable caption="Prose spacing tokens, default and large">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Default</th>
                <th scope="col">Large</th>
                <th scope="col">Use</th>
              </tr>
            </thead>
            <tbody>
              {values.prose.map(({ token, normal, large }) => (
                <tr key={token}>
                  <th scope="row">
                    <code>{token}</code>
                  </th>
                  <td>{normal}</td>
                  <td>{large}</td>
                  <td>{proseSpaceUses[token] ?? 'Not described yet'}</td>
                </tr>
              ))}
            </tbody>
          </ScrollTable>
        </>
      ) : null}
    </TokenPage>
  )
}

const meta = {
  title: 'Foundation/Spacing',
  render: () => <SpacingPage />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Spacing: Story = {}

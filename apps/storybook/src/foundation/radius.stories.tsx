import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { expect, waitFor, within } from 'storybook/test'
import {
  isThemeLoaded,
  readProperty,
  ThemeMissingNotice,
  useLiveValue,
} from './foundation-helpers.tsx'
import { themeTokenNames, TokenPage } from './tokens-helpers.tsx'

// Foundation/Radius (docs/design/foundations-and-prose.md §6.6): one specimen per radius,
// with its value read live and its use from DESIGN.md, Shapes.

const radiusTokens = themeTokenNames(/^--kv-radius-/)

const radiusUses: Record<string, string> = {
  '--kv-radius-none': 'No rounding',
  '--kv-radius-sm': 'Badges inside controls, checkboxes and tags',
  '--kv-radius-md': 'Buttons, inputs and navigation items',
  '--kv-radius-lg': 'Cards and example frames',
  '--kv-radius-xl': 'Popups and dialogs',
  '--kv-radius-full': 'Pills and avatars',
}

function readRadii(page: HTMLElement) {
  if (!isThemeLoaded(page)) {
    return null
  }
  return radiusTokens.map((token) => ({ token, value: readProperty(page, token) }))
}

function RadiusPage(): ReactNode {
  const [pageRef, radii] = useLiveValue<ReturnType<typeof readRadii>, HTMLElement>(readRadii)
  return (
    <TokenPage title="Radius" pageRef={pageRef}>
      <p>
        Radii are small and consistent. Radio buttons are always circles and checkboxes always
        rounded squares, so the shape tells them apart. The focus ring follows the element’s radius.
      </p>
      {radii === null ? <ThemeMissingNotice /> : null}
      {radii ? (
        <div className="kv-not-prose">
          <ul className="kv-story-specimens" aria-label="Radius tokens">
            {radii.map(({ token, value }) => (
              <li key={token}>
                <span
                  aria-hidden="true"
                  className="kv-story-radius"
                  style={{ borderRadius: `var(${token})` }}
                />
                <code>{token}</code>
                <span>{value ?? 'Not defined'}</span>
                <span>{radiusUses[token] ?? 'Not described in DESIGN.md'}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </TokenPage>
  )
}

const meta = {
  title: 'Foundation/Radius',
  render: () => <RadiusPage />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Radius: Story = {
  play: async ({ canvasElement }) => {
    const list = await waitFor(() =>
      within(canvasElement).getByRole('list', { name: 'Radius tokens' }),
    )
    // A named list with one item per radius token.
    await expect(within(list).getAllByRole('listitem')).toHaveLength(radiusTokens.length)
  },
}

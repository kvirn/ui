import { en } from '@kvirn-ui/i18n/en'
import { KvirnProvider } from '@kvirn-ui/react'
import contract from '../../../../../packages/map/src/address-search.a11y.md?raw'
import guide from '../../../../../packages/map/src/address-search.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { withLibraryIcons } from '../../icons.tsx'
import {
  AddressSearchDemo,
  AddressSearchInFormDemo,
  AddressSearchWithMapDemo,
} from './address-search.fixture.tsx'
import type { AddressSearchDemoProps } from './address-search.fixture.tsx'

// AddressSearch: a text field that looks an address up with a geocoder you choose (contract:
// address-search.a11y.md). The geocoder here is a fake in memory, so tests send nothing. LiveWithMap calls Kvirn's map service.
// Try these texts: "Storgatan" finds three addresses, "nowhere" none, "error" fails, "slow" never
// answers. The keyboard rows are tested in address-search.test.tsx.

const source = (name: string) => showSource('map/address-search.fixture.tsx', name)

const meta = {
  title: 'Map/AddressSearch',
  component: AddressSearchDemo,
  args: {
    label: 'Find an address',
    minLength: 3,
    debounce: 400,
    timeoutMilliseconds: 10_000,
    disabled: false,
    suggest: false,
    delayMilliseconds: 300,
    needsResolve: false,
    messages: {},
    onResult: fn(),
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The visible label. Default: the provider’s `addressSearch.label`.',
    },
    minLength: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'The fewest characters, trimmed, before a search is sent. Default 3.',
    },
    debounce: {
      control: 'number',
      description:
        'Milliseconds of no typing before a search is sent as you type, default 400. `false`, or a geocoder without `suggest: true`, searches on request: Enter or the Search button.',
    },
    timeoutMilliseconds: {
      control: 'number',
      description:
        'How long to wait for an answer before the search counts as failed. Default 10 000.',
    },
    disabled: { control: 'boolean', description: 'Disables the field and the Search button.' },
    messages: {
      control: 'object',
      description:
        'Per-instance overrides of the `addressSearch` strings, such as `{ submit: "Look up" }`. Default: the provider’s catalog.',
    },
    onResult: {
      control: false,
      description:
        'Called with the picked address and its position, or `null` when the text is cleared. It never moves focus.',
    },
    suggest: {
      control: 'boolean',
      description:
        'Story only, a field of the fake geocoder: it declares `suggest: true`, so the search runs as you type. Without it the visitor presses Enter or Search.',
    },
    delayMilliseconds: {
      control: 'number',
      description: 'Story only: how long the fake geocoder takes to answer.',
    },
    needsResolve: {
      control: 'boolean',
      description:
        'Story only: the fake geocoder lists text without positions, and its `resolve` adds the position when the visitor picks.',
    },
  },
  globals: { locale: 'en' },
  parameters: {
    layout: 'padded',
    a11yContract: contract,
    docs: {
      description: { component: usageGuide(guide) },
      ...source('AddressSearchDemo').docs,
    },
  },
  // The search announces its answers through the provider's live region.
  decorators: [
    withLibraryIcons,
    (Story) => (
      <KvirnProvider locale="en" messages={en}>
        <Story />
      </KvirnProvider>
    ),
  ],
} satisfies Meta<AddressSearchDemoProps>

export default meta
type Story = StoryObj<AddressSearchDemoProps>

const input = (canvas: { getByRole: (role: string, options?: object) => HTMLElement }) =>
  canvas.getByRole('combobox')

/** Types a text and presses Enter, which searches now. */
async function searchFor(canvas: Parameters<typeof input>[0], text: string) {
  await userEvent.click(input(canvas))
  await userEvent.keyboard(`${text}{Enter}`)
}

/**
 * The search on request, the default: typing sends nothing, and Enter or the Search button sends
 * one request. A pick calls `onResult` with the address and its position, and the focus stays in
 * the field. Every option is a control; the geocoder is a fake in memory.
 */
export const Default: Story = {}

/**
 * A geocoder that declares `suggest: true` is searched as you type, 400 ms after the last key.
 * The Search button is gone, and the help text says to choose from the list. Enter still searches
 * now, and a new key abandons the request in flight.
 */
export const AsYouType: Story = {
  args: { suggest: true },
  play: async ({ canvas }) => {
    await userEvent.click(input(canvas))
    await userEvent.keyboard('Storgatan')
    await canvas.findAllByRole('option')
  },
}

/**
 * A service that lists text only: `resolve` adds the position and the address parts when the
 * visitor picks. Searching shows while it runs, and a failed `resolve` shows the error.
 */
export const ResolvedOnPick: Story = {
  args: { needsResolve: true },
  play: async ({ canvas }) => {
    await searchFor(canvas, 'Storgatan')
    await canvas.findAllByRole('option')
    await userEvent.keyboard('{ArrowDown}{Enter}')
  },
}

/**
 * Beside a map: a pick centres the map, or fits the address's bounds, draws a result pin and
 * says "The map shows the address". The pin is decoration and `Clear` removes it. The search sits
 * in a `<search>` landmark, and focus never leaves it.
 */
export const WithMap: StoryObj<Pick<AddressSearchDemoProps, 'suggest'>> = {
  args: { suggest: false },
  argTypes: Object.fromEntries(
    Object.keys(meta.argTypes)
      .filter((name) => name !== 'suggest')
      .map((name) => [name, { table: { disable: true } }]),
  ),
  render: ({ suggest }) => <AddressSearchWithMapDemo suggest={suggest} />,
  parameters: source('AddressSearchWithMapDemo'),
  play: async ({ canvas }) => {
    await searchFor(canvas, 'Storgatan 5')
    await canvas.findAllByRole('option')
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await waitFor(() => expect(input(canvas)).toHaveFocus())
  },
}

/**
 * The search and the map on real data: both call Kvirn's map service (geo.kvirn.com), which
 * receives what you type and the area you view, so it is not run in tests. Do not type a real
 * address.
 */
export const LiveWithMap: StoryObj = {
  render: () => <AddressSearchWithMapDemo live suggest />,
  parameters: source('AddressSearchWithMapDemo'),
  tags: ['!test'],
}

/**
 * In a form, above the address boxes. A pick fills street, postal code and city; the boxes stay
 * editable and nothing is asked twice. Enter in the search looks up and never sends the form: the
 * Send button does that.
 */
export const InForm: StoryObj = {
  argTypes: Object.fromEntries(
    Object.keys(meta.argTypes).map((name) => [name, { table: { disable: true } }]),
  ),
  render: () => <AddressSearchInFormDemo />,
  parameters: source('AddressSearchInFormDemo'),
  play: async ({ canvas }) => {
    await searchFor(canvas, 'Mannerheim')
    await canvas.findAllByRole('option')
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await waitFor(() =>
      expect(canvas.getByRole('textbox', { name: /Street address/ })).toHaveValue(
        'Mannerheimintie 1',
      ),
    )
    await expect(canvas.queryByText(/^Sent:/)).toBeNull()
  },
}

/** On request, Enter or Search with fewer than `minLength` characters says what is missing and sends nothing. */
export const TooShort: Story = {
  play: async ({ canvas }) => {
    await searchFor(canvas, 'St')
    await canvas.findByText('Type at least 3 characters to search.')
  },
}

/** While the answer is on its way: a spinner and "Searching for addresses". Earlier results stay in place. */
export const Searching: Story = {
  args: { timeoutMilliseconds: 3_600_000 },
  play: async ({ canvas }) => {
    await searchFor(canvas, 'slow')
    await canvas.findByText('Searching for addresses')
  },
}

/** An answer with addresses: the list opens, nothing is highlighted, and the count is announced once. */
export const Results: Story = {
  play: async ({ canvas }) => {
    await searchFor(canvas, 'Storgatan')
    await canvas.findAllByRole('option')
  },
}

/** An answer with no address is not an error: it says what to check, and the field is not invalid. */
export const NoResults: Story = {
  play: async ({ canvas }) => {
    await searchFor(canvas, 'nowhere')
    await canvas.findByText(/No address found for/)
  },
}

/** The service fails: the field keeps its text and the line says to try again. */
export const Failed: Story = {
  play: async ({ canvas }) => {
    await searchFor(canvas, 'error')
    await canvas.findByText('The address search isn’t working right now. Try again in a moment.')
  },
}

/** The browser is offline: nothing is sent, and the line says to connect and search again. */
// The fake goes in play, not beforeEach: the Docs page mounts every story at once and never runs a
// beforeEach cleanup, so a page-wide `navigator.onLine = false` would put every story offline.
export const Offline: Story = {
  play: async ({ canvas }) => {
    const descriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, 'onLine')
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false })
    try {
      await searchFor(canvas, 'Storgatan')
      await canvas.findByText('You’re offline. Connect to the internet, then search again.')
    } finally {
      Reflect.deleteProperty(navigator, 'onLine')
      if (descriptor) {
        Object.defineProperty(Navigator.prototype, 'onLine', descriptor)
      }
    }
  },
}

/** Disabled: the field and the Search button cannot be reached or used. */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Find an address' })).toBeDisabled()
  },
}

/**
 * Focus the field and drive it with the Keyboard table: type, then Enter or Tab to the Search
 * button; ArrowDown and ArrowUp move through the addresses; Enter or Alt+ArrowUp picks one;
 * Escape closes the list and keeps the text.
 */
export const Keyboard: Story = {}

/** Right to left: Clear and Search sit at the inline start, and the list opens under the field. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  play: async ({ canvas }) => {
    await searchFor(canvas, 'Storgatan')
    await canvas.findAllByRole('option')
  },
}

/** The edges, the status icon, the active address and the Search button stay visible in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  play: async ({ canvas }) => {
    await searchFor(canvas, 'Storgatan')
    await canvas.findAllByRole('option')
    await userEvent.keyboard('{ArrowDown}')
  },
}

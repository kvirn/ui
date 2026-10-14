import { en } from '@kvirn-ui/i18n/en'
import { KvirnProvider } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import {
  BaseMapsExample,
  baseMapIds,
  engines,
  type Engine,
  MapLibreExample,
  MemoryExample,
  OpenStreetMapExample,
} from './map.fixture.tsx'

// Components/Map: the viewport, markers, controls and place list. The MapLibre story draws a
// background only (no tile source), so it works offline; a real map passes its own style URL.

const meta = {
  title: 'Components/Map',
  parameters: { layout: 'padded' },
  // The map announces the places in view and a changed map type through the provider's live region.
  decorators: [
    (Story) => (
      <KvirnProvider locale="en" messages={en}>
        <Story />
      </KvirnProvider>
    ),
  ],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: () => <MapLibreExample /> }

/** The memory provider keeps the camera and draws nothing: for tests and for pages without an engine. */
export const MemoryProvider: Story = { render: () => <MemoryExample /> }

/**
 * Real tiles from OpenStreetMap's public server. Its tile usage policy allows light use only; a real
 * site uses its own or a paid tile host, and its visitors' IP addresses reach that host. The story is
 * tagged `!test` so no test run (CI included) calls a third party.
 */
export const OpenStreetMap: Story = { tags: ['!test'], render: () => <OpenStreetMapExample /> }

/**
 * Three map types the visitor switches between with `Map.BaseMapSwitch`: the camera and the markers
 * stay. The tile URLs belong to the story; imagery terms and usage policies are the consumer's.
 * Tagged `!test` so no test run calls a third party.
 */
export const BaseMaps: StoryObj<typeof BaseMapsExample> = {
  tags: ['!test'],
  args: { baseMap: 'standard', engine: 'maplibre' },
  argTypes: {
    baseMap: {
      description: 'The active map type (`baseMap` on `Map.Root`). The switch updates it too.',
      control: 'select',
      options: baseMapIds,
    },
    engine: {
      description: 'Story only: the `provider` handed to `Map.Root`.',
      control: 'inline-radio',
      options: [...engines],
    },
  },
  render: function Render() {
    const [{ baseMap, engine }, updateArgs] = useArgs<{ baseMap?: string; engine?: Engine }>()
    return (
      <BaseMapsExample
        baseMap={baseMap}
        engine={engine}
        onBaseMapChange={(id) => updateArgs({ baseMap: id })}
      />
    )
  },
}

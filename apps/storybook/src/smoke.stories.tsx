import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

/**
 * Proves the workbench, axe-in-stories and e2e harness until the first real component lands
 * (Plan 0001). Delete once Button (Plan 0003) has stories.
 */
function SmokeFixture() {
  return (
    <main>
      <h1>KvirnUI</h1>
      <button type="button">Skicka</button>
    </main>
  )
}

const meta = {
  title: 'Foundation/Smoke',
  component: SmokeFixture,
} satisfies Meta<typeof SmokeFixture>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Skicka' })).toBeVisible()
  },
}

export const RTL: Story = { globals: { dir: 'rtl', locale: 'en' } }
export const ForcedColors: Story = { globals: { forcedColors: 'active' } }

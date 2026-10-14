import { expect, within } from 'storybook/test'

export async function expectPageOutline(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  await expect(canvas.getAllByRole('banner')).toHaveLength(1)
  await expect(canvas.getAllByRole('main')).toHaveLength(1)
  await expect(canvas.getAllByRole('contentinfo')).toHaveLength(1)
  await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)
}

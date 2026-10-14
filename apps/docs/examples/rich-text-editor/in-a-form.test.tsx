import '@kvirn-ui/theme/theme.css'
import { KvirnProvider } from '@kvirn-ui/react'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { describe, expect, test } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { InAForm } from './in-a-form.tsx'

// Contract: an empty required editor is reported in an ErrorSummary that takes focus (3.3.1), and
// its link moves focus into the editable text (2.4.3).
const submitEmpty = async () => {
  const { container } = await render(
    <KvirnProvider locale="en">
      <InAForm />
    </KvirnProvider>,
  )
  const textbox = page.getByRole('textbox')
  await expect.element(textbox).toBeVisible()
  await userEvent.click(textbox)
  await userEvent.keyboard('{Control>}a{/Control}{Backspace}')
  await userEvent.click(page.getByRole('button', { name: 'Publish' }))
  return container
}

describe('RichTextEditor in a form example', () => {
  test('submitting an empty editor moves focus to the ErrorSummary', async () => {
    await submitEmpty()
    await expect.element(page.getByRole('group', { name: /There is a problem/ })).toHaveFocus()
  })

  test('the ErrorSummary link focuses the editable text', async () => {
    await submitEmpty()
    await userEvent.click(page.getByRole('link', { name: /Write the news text/ }))
    await expect.element(page.getByRole('textbox')).toHaveFocus()
  })

  test('the error state has no axe violations', async () => {
    const container = await submitEmpty()
    await expect(expectNoA11yViolations(container)).resolves.toBeUndefined()
  })
})

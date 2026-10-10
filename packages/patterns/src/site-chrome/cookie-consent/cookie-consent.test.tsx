import { expect, test } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { CookieConsent } from './cookie-consent.tsx'

// Contract: cookie-consent.a11y.md. Component tests load no theme.

function Example() {
  return (
    <CookieConsent.Root>
      <CookieConsent.Heading>Cookies on this website</CookieConsent.Heading>
      <CookieConsent.Text>
        We use statistics cookies to see which pages are read.
      </CookieConsent.Text>
      <CookieConsent.Actions>
        <CookieConsent.Accept>Accept statistics cookies</CookieConsent.Accept>
        <CookieConsent.Reject>Reject statistics cookies</CookieConsent.Reject>
      </CookieConsent.Actions>
      <CookieConsent.Accepted>You have accepted statistics cookies.</CookieConsent.Accepted>
      <CookieConsent.Rejected>You have rejected statistics cookies.</CookieConsent.Rejected>
    </CookieConsent.Root>
  )
}

test('a choice moves focus to the result text', async () => {
  await render(<Example />)
  await userEvent.click(page.getByRole('button', { name: 'Reject statistics cookies' }))
  const result = page.getByText('You have rejected statistics cookies.')
  await expect.element(result).toBeVisible()
  expect(document.activeElement).toBe(result.element())
})

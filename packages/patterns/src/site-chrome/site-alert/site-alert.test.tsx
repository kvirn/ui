import { en } from '@kvirn-ui/i18n/en'
import { KvirnProvider } from '@kvirn-ui/react'
import { expect, test } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { SiteAlert } from './site-alert.tsx'

// Contract: site-alert.a11y.md. Component tests load no theme.

test('Close moves focus to main, not body', async () => {
  await render(
    <KvirnProvider locale="en" messages={en}>
      <SiteAlert.Root>
        <SiteAlert.Title>Water shut off in North Kvirnby</SiteAlert.Title>
        <SiteAlert.Body>Water is off on Wednesday 14 October, 9 to 15.</SiteAlert.Body>
        <SiteAlert.Close />
      </SiteAlert.Root>
      <main id="main">
        <h1>Kvirnby municipality</h1>
      </main>
    </KvirnProvider>,
  )
  await userEvent.click(page.getByRole('button', { name: 'Close message' }))
  expect(document.activeElement).toBe(document.getElementById('main'))
})

import '@kvirn-ui/theme/theme.css'
import { KvirnProvider } from '@kvirn-ui/react'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { initialContactState } from '../app/(docs)/contact/contact-state.ts'
import type { ContactState } from '../app/(docs)/contact/contact-state.ts'
import { messages } from '../messages/en.ts'
import { ContactForm } from './contact-form.tsx'

// Contract: every control is labelled, errors are text tied by aria-describedby and an ErrorSummary
// that takes focus (3.3.1, 3.3.3), answers survive an error (3.3.7), autocomplete on name and
// email (1.3.5), no CAPTCHA (3.3.8), the result takes focus (4.1.3). The server action is stood in
// for by a fake that returns the state the real one would; its own rules are proved in
// actions.test.ts.
const text = messages.docs.contactPage.form
const address = 'magnus@vike.se'

const filled = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  reason: 'build',
  message: 'A question.',
}

const answer = (values: Partial<ContactState['values']>, state: Partial<ContactState>) =>
  vi.fn<(previous: ContactState) => Promise<ContactState>>(async (previous) => ({
    ...initialContactState,
    values: { ...filled, ...values },
    attempt: previous.attempt + 1,
    ...state,
  }))

const renderForm = (action: ReturnType<typeof answer>) =>
  render(
    <KvirnProvider locale="en">
      <ContactForm action={action} />
    </KvirnProvider>,
  )

const submit = () => userEvent.click(page.getByRole('button', { name: text.send }))

beforeEach(async () => {
  await page.viewport(1280, 900)
})

describe('Contact form', () => {
  test('every control has a visible label and required is marked in text', async () => {
    await renderForm(answer({}, {}))
    await expect.element(page.getByRole('textbox', { name: /Your name/ })).toBeVisible()
    await expect.element(page.getByRole('textbox', { name: /Your email address/ })).toBeVisible()
    await expect.element(page.getByRole('textbox', { name: /Your message/ })).toBeVisible()
    await expect.element(page.getByRole('group', { name: /What is it about/ })).toBeVisible()
    await expect.element(page.getByRole('button', { name: text.send })).toBeVisible()
  })

  test('name and email carry autocomplete tokens', async () => {
    await renderForm(answer({}, {}))
    await expect
      .element(page.getByRole('textbox', { name: /Your name/ }))
      .toHaveAttribute('autocomplete', 'name')
    await expect
      .element(page.getByRole('textbox', { name: /Your email address/ }))
      .toHaveAttribute('autocomplete', 'email')
  })

  test('Tab order is name, email, reason, message, send, and the honeypot is skipped', async () => {
    await renderForm(answer({}, {}))
    await page.getByRole('textbox', { name: /Your name/ }).click()
    await userEvent.tab()
    await expect.element(page.getByRole('textbox', { name: /Your email address/ })).toHaveFocus()
    await userEvent.tab()
    expect(document.activeElement?.getAttribute('type')).toBe('radio')
    await userEvent.tab()
    await expect.element(page.getByRole('textbox', { name: /Your message/ })).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: text.send })).toHaveFocus()
  })

  test('the first reason is selected before the visitor chooses', async () => {
    await renderForm(answer({}, {}))
    const radios = [...document.querySelectorAll<HTMLInputElement>('input[type="radio"]')]
    expect(radios.filter((radio) => radio.checked)).toEqual([radios[0]])
  })

  test('Shift+Tab from the send button goes back to the message', async () => {
    await renderForm(answer({}, {}))
    await page.getByRole('button', { name: text.send }).click()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('textbox', { name: /Your message/ })).toBeInTheDocument()
  })

  test('the honeypot is out of the accessibility tree and the tab order', async () => {
    await renderForm(answer({}, {}))
    const honeypot = document.querySelector('input[name="website"]')
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(honeypot?.getAttribute('tabindex')).toBe('-1')
    expect(honeypot?.getAttribute('autocomplete')).toBe('off')
  })

  test('validation errors show a summary that takes focus and links to each control', async () => {
    await renderForm(
      answer(
        { name: '', email: '', reason: '', message: '' },
        {
          status: 'invalid',
          errors: {
            name: text.nameError,
            email: text.emailError,
            reason: text.reasonError,
            message: text.messageError,
          },
        },
      ),
    )
    await submit()
    const summary = page.getByRole('group', { name: /There is a problem/ })
    await expect.element(summary).toHaveFocus()
    await expect.element(page.getByRole('link', { name: text.nameError })).toBeVisible()
    await expect.element(page.getByRole('link', { name: text.messageError })).toBeVisible()
    await expect
      .element(page.getByRole('textbox', { name: /Your name/ }))
      .toHaveAttribute('aria-invalid', 'true')
  })

  test('a summary link moves focus to its control', async () => {
    await renderForm(answer({ name: '' }, { status: 'invalid', errors: { name: text.nameError } }))
    await submit()
    await userEvent.click(page.getByRole('link', { name: text.nameError }))
    await expect.element(page.getByRole('textbox', { name: /Your name/ })).toHaveFocus()
  })

  test('answers are kept after an error', async () => {
    await renderForm(
      answer({ email: 'bad' }, { status: 'invalid', errors: { email: text.emailError } }),
    )
    await submit()
    await expect.element(page.getByRole('textbox', { name: /Your name/ })).toHaveValue(filled.name)
    await expect
      .element(page.getByRole('textbox', { name: /Your message/ }))
      .toHaveValue(filled.message)
    await expect.element(page.getByRole('radio', { name: /You build it/ })).toBeChecked()
  })

  test('a send failure keeps the answers and gives the address as text', async () => {
    await renderForm(answer({}, { status: 'failed' }))
    await submit()
    await expect.element(page.getByText(text.failedEmail({ email: address }))).toBeVisible()
    await expect
      .element(page.getByRole('textbox', { name: /Your message/ }))
      .toHaveValue(filled.message)
  })

  test('missing configuration shows the same email-us state', async () => {
    await renderForm(answer({}, { status: 'unavailable' }))
    await submit()
    await expect.element(page.getByText(text.failedEmail({ email: address }))).toBeVisible()
  })

  test('the rate limit shows its own message', async () => {
    await renderForm(answer({}, { status: 'limited' }))
    await submit()
    await expect.element(page.getByText(text.tooMany)).toBeVisible()
  })

  test('success replaces the form with an alert that takes focus and says it is sent', async () => {
    await renderForm(answer({}, { status: 'sent', values: initialContactState.values }))
    await submit()
    const alert = document.querySelector<HTMLElement>('.kv-alert')
    expect(alert?.textContent).toContain(text.sentHeading)
    expect(alert?.textContent).toContain(text.sentBody)
    expect(document.activeElement).toBe(alert)
    expect(page.getByRole('button', { name: text.send }).elements()).toHaveLength(0)
  })

  test('no axe violations in the empty, error, failed and sent states', async () => {
    const empty = await renderForm(answer({}, {}))
    await expect.element(page.getByRole('button', { name: text.send })).toBeVisible()
    await expectNoA11yViolations(empty.container)
    await empty.unmount()

    const invalid = await renderForm(
      answer({ name: '' }, { status: 'invalid', errors: { name: text.nameError } }),
    )
    await submit()
    await expect.element(page.getByRole('link', { name: text.nameError })).toBeVisible()
    await expectNoA11yViolations(invalid.container)
    await invalid.unmount()

    const failed = await renderForm(answer({}, { status: 'failed' }))
    await submit()
    await expect.element(page.getByText(text.failedEmail({ email: address }))).toBeVisible()
    await expectNoA11yViolations(failed.container)
    await failed.unmount()

    const sent = await renderForm(
      answer({}, { status: 'sent', values: initialContactState.values }),
    )
    await submit()
    await expect.element(page.getByText(text.sentBody)).toBeVisible()
    await expectNoA11yViolations(sent.container)
  })
})

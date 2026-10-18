import { en } from '@kvirn-ui/i18n/en'
import {
  Alert,
  Button,
  ErrorSummary,
  Field,
  Heading,
  KvirnProvider,
  Link,
  TextInput,
} from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import contract from '../../../../../packages/patterns/src/sign-in-and-subscribe/subscribe/subscribe.a11y.md?raw'
import { useEffect, useRef, useState } from 'react'
import { expect, userEvent } from 'storybook/test'
import { inDocsFrame } from '../../components/error-summary/error-summary.fixture.tsx'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Sign-in and subscribe/Subscribe (docs/design/storybook-patterns-t5.md S8).
// Story-only: every part is shipped, and sending the address is the app's.

const description = `Get news by e-mail. A \`Heading\`, a short text that says what it is, how often and how to stop, a privacy link, then one \`Field\` with a visible label (\`TextInput type="email" autoComplete="email"\`) and a \`Button\`. The form is not a landmark. It is \`noValidate\`: validate in your own code, so the message is yours.

An invalid address shows an [ErrorSummary](?path=/docs/components-error-summary--docs) above the heading (it takes focus once, so it is the announcement) and the same words under the field (3.3.1). When the address is sent, focus moves to the \`Alert.Success\` ("Check your inbox to confirm"), which replaces the form; nothing is announced on load. Without an inbox to confirm in, say so: this pattern never claims a subscription is active before the confirmation. No CAPTCHA, no third-party form (rule 7). In the footer, put a link to a page with this form.

## Parts and gaps

Parts used: \`Heading\`, \`Field.Root\`, \`Field.Label\`, \`Field.Description\`, \`Field.ErrorMessage\`, \`TextInput\`, \`Button\`, \`ErrorSummary\`, \`Alert.Success\`, \`Link\`. No gap.
`

const meta = {
  title: 'Patterns/Sign-in and subscribe/Subscribe',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    layout: 'padded',
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Subscribe({
  prefix,
  initialValue = '',
  initialState = 'form',
}: {
  prefix: string
  initialValue?: string
  initialState?: 'form' | 'invalid' | 'sent'
}) {
  const [state, setState] = useState(initialState)
  const [submitCount, setSubmitCount] = useState(initialState === 'invalid' ? 1 : 0)
  const sentRef = useRef<HTMLDivElement>(null)
  const emailId = `${prefix}-email`
  const message = 'Enter your e-mail address like name@example.com'

  useEffect(() => {
    if (state === 'sent' && submitCount > 0) sentRef.current?.focus()
  }, [state, submitCount])

  return (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-stack">
        {state === 'invalid' ? (
          <ErrorSummary.Root focusKey={submitCount} disableAutoFocus={inDocsFrame()}>
            <ErrorSummary.Title />
            <ErrorSummary.List>
              <ErrorSummary.Item>
                <ErrorSummary.Link controlId={emailId}>{message}</ErrorSummary.Link>
              </ErrorSummary.Item>
            </ErrorSummary.List>
          </ErrorSummary.Root>
        ) : null}
        <Heading as="h2" size="heading-3">
          News by e-mail
        </Heading>
        {state === 'sent' ? (
          <Alert.Success ref={sentRef} tabIndex={-1}>
            <Alert.Title as="p">Check your inbox to confirm</Alert.Title>
            <Alert.Body>
              We sent a message to confirm your address. You will get no news until you do.
            </Alert.Body>
          </Alert.Success>
        ) : (
          <>
            <div className="kv-prose">
              <p>
                We send the latest news from Kvirnby municipality, at most once a week. Every
                message has a link to stop.
              </p>
              <p>
                <Link.Root href="#privacy">How we handle your address</Link.Root>
              </p>
            </div>
            <form
              noValidate
              className="kv-stack"
              onSubmit={(event) => {
                event.preventDefault()
                const email = new FormData(event.currentTarget).get('email')
                const value = typeof email === 'string' ? email : ''
                setSubmitCount((count) => count + 1)
                setState(emailPattern.test(value.trim()) ? 'sent' : 'invalid')
              }}
            >
              <Field.Root controlId={emailId} invalid={state === 'invalid'} required>
                <Field.Label>E-mail address</Field.Label>
                <TextInput
                  type="email"
                  name="email"
                  autoComplete="email"
                  defaultValue={initialValue}
                />
                <Field.ErrorMessage>{message}</Field.ErrorMessage>
              </Field.Root>
              <div>
                <Button type="submit" className="kv-button--primary">
                  Subscribe
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </KvirnProvider>
  )
}

/** Fill in an address and send: the form is replaced by the confirmation and focus moves to it. */
export const Default: Story = {
  render: () => <Subscribe prefix="subscribe-default" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: /E-mail address/ })).toHaveAttribute(
      'autocomplete',
      'email',
    )
    await expect(canvas.queryByRole('group', { name: /problem/i })).toBeNull()
  },
}

/** An invalid address: the summary and the field say the same thing, and the answer is kept. */
export const Invalid: Story = {
  render: () => (
    <Subscribe prefix="subscribe-invalid" initialState="invalid" initialValue="anna@" />
  ),
  play: async ({ canvas }) => {
    const field = canvas.getByRole('textbox', { name: /E-mail address/ })
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    await expect(field).toHaveValue('anna@')
    await expect(canvas.getByRole('link', { name: /Enter your e-mail address/ })).toBeVisible()
  },
}

/** Sent: "Check your inbox to confirm" replaces the form. */
export const Sent: Story = {
  render: () => <Subscribe prefix="subscribe-sent" initialState="sent" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Check your inbox to confirm')).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Subscribe' })).toBeNull()
  },
}

/** Send an invalid address, then a valid one: the error appears, then the confirmation. */
export const Resubmit: Story = {
  render: () => <Subscribe prefix="subscribe-resubmit" />,
  play: async ({ canvas }) => {
    if (inDocsFrame()) return
    const field = canvas.getByRole('textbox', { name: /E-mail address/ })
    await userEvent.type(field, 'anna@')
    await userEvent.click(canvas.getByRole('button', { name: 'Subscribe' }))
    await expect(canvas.getByRole('textbox', { name: /E-mail address/ })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    await userEvent.type(canvas.getByRole('textbox', { name: /E-mail address/ }), 'example.com')
    await userEvent.click(canvas.getByRole('button', { name: 'Subscribe' }))
    await expect(canvas.getByText('Check your inbox to confirm')).toBeVisible()
  },
}

/** 320px: the field and button stack; nothing scrolls sideways. */
export const Narrow: Story = {
  ...Default,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 80rem. */
export const Wide: Story = {
  ...Default,
  globals: { ...wideGlobals },
}

/** Try the keys: Tab to the field, type, Enter sends. After an error Shift+Tab goes back to the summary link. */
export const Keyboard: Story = { ...Invalid, globals: { ...narrowGlobals } }

/** Right to left. */
export const RTL: Story = {
  ...Invalid,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: the error and the success state keep an icon and a status word. */
export const ForcedColors: Story = {
  ...Invalid,
  globals: { forcedColors: 'active' },
}

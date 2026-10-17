import { en } from '@kvirn-ui/i18n/en'
import {
  Alert,
  Button,
  ErrorSummary,
  Field,
  Heading,
  Icon,
  KvirnProvider,
  Link,
  RadioGroup,
  Stack,
  TextInput,
  Textarea,
} from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'
import { inDocsFrame } from '../../components/error-summary/error-summary.fixture.tsx'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'
import contract from '../../../../../packages/patterns/src/search-and-forms/form-with-error-summary/form-with-error-summary.a11y.md?raw'
import { withLibraryIcons } from '../../icons.tsx'

// Patterns/Search and forms/Form with error summary (docs/design/storybook-patterns-t5.md S7).
// Story-only: the parts are shipped, the form's state is the app's. A whole page of it is the
// Form page content type.

const description = `Answer, see every error, fix it. A back link, then after a failed send the [ErrorSummary](?path=/docs/components-forms-errorsummary--docs) first in \`main\`, the \`h1\`, and the questions as [Field](?path=/docs/components-forms-field--docs)s and a [RadioGroup](?path=/docs/components-forms-radiogroup--docs). KvirnUI holds no form state: this story keeps the answers and the errors itself and validates on submit, never while typing.

**On a failed send** the summary mounts with \`focusKey\` set to the submit count, so focus moves to it once, on every failed send, and the page title takes the \`errorSummary.titlePrefix\` word. Each link is the field's own error text and goes to its control, or to a group's first option. The fields keep their messages under the controls (3.3.1). **Answers are kept** after an error and after a failed send (3.3.7: nothing the user has typed is asked twice). No question asks the user to remember or transcribe anything, and none is a CAPTCHA (3.3.8). **A failed send** is an \`Alert.Danger\` above the \`h1\`, not a field error: focus moves to its title once, so it is read, and the answers stay. The form says "All questions are required" before the first question, because a required field carries no marker (3.3.2). **A sent form** moves focus to the confirmation's \`h1\`. Nothing is announced on load, and the summary is not a live region (R10). The form is \`noValidate\`, so the browser shows no bubble of its own.

The order is the DOM order and the focus order: back link, summary, \`h1\`, questions, Send; nothing is sticky (R5, 2.4.11). It is not a landmark and not a component of its own: copy the story's code and replace the text.

## Parts and gaps

Parts used: \`ErrorSummary.*\`, \`Field.*\`, \`RadioGroup.*\`, \`TextInput\`, \`Textarea\` with \`characterCount\`, \`Alert.Danger\`, \`Alert.Success\`, \`Button\`, \`Link\`, \`Icon\`. The back link is a \`Link\` with an \`Icon\`, until the library's back link ships. No other gap.
`

const meta = {
  title: 'Patterns/Search and forms/Form with error summary',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    layout: 'padded',
    docs: {
      description: { component: description },
      story: { inline: false, iframeHeight: 720 },
    },
    viewport: { options: chromeViewports },
  },
  decorators: [withLibraryIcons],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

type Errors = { name?: string; reply?: string; message?: string }

function EnquiryForm({
  prefix,
  start = 'empty',
  failNextSend = false,
}: {
  prefix: string
  start?: 'empty' | 'invalid' | 'failed' | 'sent' | undefined
  failNextSend?: boolean | undefined
}) {
  const [sent, setSent] = useState(start === 'sent')
  const [failed, setFailed] = useState(start === 'failed')
  const [name, setName] = useState(start === 'failed' ? 'Alex Example' : '')
  const [reply, setReply] = useState<string | null>(start === 'failed' ? 'email' : null)
  const [message, setMessage] = useState(
    start === 'failed' ? 'When does the pool open after the summer break?' : '',
  )
  const [errors, setErrors] = useState<Errors>(
    start === 'invalid'
      ? {
          name: 'Enter your name',
          reply: 'Choose how we should reply',
          message: 'Write your question',
        }
      : {},
  )
  const [submitCount, setSubmitCount] = useState(start === 'invalid' ? 1 : 0)
  const [failureCount, setFailureCount] = useState(0)
  const failureTitle = useRef<HTMLHeadingElement>(null)
  const confirmationTitle = useRef<HTMLHeadingElement>(null)
  const hasSent = useRef(false)
  const nameId = `${prefix}-name`
  const firstReplyId = `${prefix}-reply-email`
  const messageId = `${prefix}-message`
  const problems = [
    errors.name !== undefined ? { controlId: nameId, message: errors.name } : null,
    errors.reply !== undefined ? { controlId: firstReplyId, message: errors.reply } : null,
    errors.message !== undefined ? { controlId: messageId, message: errors.message } : null,
  ].filter((problem) => problem !== null)

  useEffect(() => {
    if (failureCount > 0) {
      failureTitle.current?.focus()
    }
  }, [failureCount])

  useEffect(() => {
    if (sent && hasSent.current) {
      confirmationTitle.current?.focus()
    }
  }, [sent])

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found: Errors = {}
    if (name.trim() === '') {
      found.name = 'Enter your name'
    }
    if (reply === null) {
      found.reply = 'Choose how we should reply'
    }
    if (message.trim() === '') {
      found.message = 'Write your question'
    }
    setErrors(found)
    setSubmitCount(submitCount + 1)
    if (Object.keys(found).length === 0) {
      if (failNextSend) {
        setFailed(true)
        setFailureCount(failureCount + 1)
        return
      }
      hasSent.current = true
      setFailed(false)
      setSent(true)
    }
  }

  if (sent) {
    return (
      <Stack className="kv-stack--gap-8">
        <Heading as="h1" size="heading-2" tabIndex={-1} ref={confirmationTitle}>
          Thank you for your question
        </Heading>
        <Alert.Success>
          <Alert.Title as="h2">Your question is sent</Alert.Title>
          <Alert.Body>
            <p>We answer within five working days. Nothing was sent: this is an example.</p>
          </Alert.Body>
        </Alert.Success>
      </Stack>
    )
  }

  return (
    <Stack className="kv-stack--gap-8">
      <Link.Root href="#back">
        <Link.Icon>
          <Icon name="arrow-back" size="24" />
        </Link.Icon>
        Back
      </Link.Root>
      {problems.length > 0 ? (
        <ErrorSummary.Root focusKey={submitCount} prefixDocumentTitle>
          <ErrorSummary.Title />
          <ErrorSummary.List>
            {problems.map((problem) => (
              <ErrorSummary.Item key={problem.controlId}>
                <ErrorSummary.Link controlId={problem.controlId}>
                  {problem.message}
                </ErrorSummary.Link>
              </ErrorSummary.Item>
            ))}
          </ErrorSummary.List>
        </ErrorSummary.Root>
      ) : null}
      {failed ? (
        <Alert.Danger>
          <Alert.Title as="h2" ref={failureTitle} tabIndex={-1}>
            We could not send your question
          </Alert.Title>
          <Alert.Body>
            <p>
              Something went wrong on our side. Your answers are kept. Try again in a few minutes.
            </p>
          </Alert.Body>
        </Alert.Danger>
      ) : null}
      <Heading as="h1" size="heading-2">
        Ask the council a question
      </Heading>
      <form noValidate onSubmit={send}>
        <Stack className="kv-stack--gap-8">
          <p>All questions are required.</p>
          <Field.Root controlId={nameId} invalid={errors.name !== undefined} required>
            <Field.Label>Your name</Field.Label>
            <TextInput name="name" autoComplete="name" value={name} onValueChange={setName} />
            <Field.ErrorMessage>{errors.name}</Field.ErrorMessage>
          </Field.Root>
          <RadioGroup.Root
            invalid={errors.reply !== undefined}
            required
            value={reply}
            onValueChange={setReply}
          >
            <RadioGroup.Legend>How should we reply?</RadioGroup.Legend>
            <Field.Root controlId={firstReplyId}>
              <RadioGroup.Radio value="email" />
              <Field.Label>By email</Field.Label>
            </Field.Root>
            <Field.Root>
              <RadioGroup.Radio value="letter" />
              <Field.Label>By letter</Field.Label>
            </Field.Root>
            <RadioGroup.ErrorMessage>{errors.reply}</RadioGroup.ErrorMessage>
          </RadioGroup.Root>
          <Field.Root controlId={messageId} invalid={errors.message !== undefined} required>
            <Field.Label>Your question</Field.Label>
            <Textarea
              name="message"
              maxLength={500}
              characterCount
              value={message}
              onValueChange={setMessage}
            />
            <Field.ErrorMessage>{errors.message}</Field.ErrorMessage>
          </Field.Root>
          <div>
            <Button type="submit" className="kv-button--primary">
              Send
            </Button>
          </div>
        </Stack>
      </form>
    </Stack>
  )
}

function render(
  prefix: string,
  start?: 'empty' | 'invalid' | 'failed' | 'sent',
  failNextSend?: boolean,
) {
  return (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en">
        <EnquiryForm prefix={prefix} start={start} failNextSend={failNextSend} />
      </div>
    </KvirnProvider>
  )
}

const summaryName = /There is a problem/

/** Nothing typed yet: no summary, no errors, no marker on a required question. */
export const Empty: Story = {
  globals: { ...wideGlobals },
  render: () => render('empty'),
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('group', { name: summaryName })).toBeNull()
    await expect(canvas.getByRole('heading', { level: 1 })).toBeVisible()
  },
}

/** Send the empty form: the summary appears first, takes focus and the title is prefixed; each answer keeps its own message. */
export const InvalidOnSubmit: Story = {
  globals: { ...wideGlobals },
  render: () => render('on-submit'),
  play: async ({ canvas }) => {
    if (inDocsFrame()) {
      return
    }
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }))
    await expect(canvas.getByRole('group', { name: summaryName })).toHaveFocus()
    await waitFor(() => expect(document.title.startsWith('Error: ')).toBe(true))
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3)
    await userEvent.click(canvas.getByRole('link', { name: 'Enter your name' }))
    await expect(canvas.getByRole('textbox', { name: /Your name/ })).toHaveFocus()
  },
}

/** After a failed send, with the errors shown: the summary is already on screen, and the answers are the user's. */
export const WithErrors: Story = {
  globals: { ...wideGlobals },
  render: () => render('with-errors', 'invalid'),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: summaryName })).toBeVisible()
    await expect(canvas.getByRole('textbox', { name: /Your name/ })).toHaveAccessibleDescription(
      /Enter your name/,
    )
  },
}

/** Fix the answers and send again: the summary goes away and the form is sent. Focus moves to the confirmation's heading. */
export const FixedOnNextSubmit: Story = {
  globals: { ...wideGlobals },
  render: () => render('fixed', 'invalid'),
  play: async ({ canvas }) => {
    if (inDocsFrame()) {
      return
    }
    await userEvent.type(canvas.getByRole('textbox', { name: /Your name/ }), 'Alex Example')
    await userEvent.click(canvas.getByRole('radio', { name: 'By email' }))
    await userEvent.type(canvas.getByRole('textbox', { name: /Your question/ }), 'Opening hours?')
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }))
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Thank you for your question' }),
    ).toHaveFocus()
    await expect(canvas.queryByRole('group', { name: summaryName })).toBeNull()
  },
}

/** Sent: a success message in words, and what happens. Nothing was sent. */
export const Sent: Story = {
  globals: { ...wideGlobals },
  render: () => render('sent', 'sent'),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: /Your question is sent/ }),
    ).toBeVisible()
  },
}

/** Fill in the form and send while the service is down: focus moves to the alert's title once, so it is read, and the answers are kept. */
export const SubmitFailsLive: Story = {
  globals: { ...wideGlobals },
  render: () => render('fails-live', 'empty', true),
  play: async ({ canvas }) => {
    if (inDocsFrame()) {
      return
    }
    await userEvent.type(canvas.getByRole('textbox', { name: /Your name/ }), 'Alex Example')
    await userEvent.click(canvas.getByRole('radio', { name: 'By email' }))
    await userEvent.type(canvas.getByRole('textbox', { name: /Your question/ }), 'Opening hours?')
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }))
    await expect(canvas.getByRole('heading', { level: 2, name: /We could not send/ })).toHaveFocus()
    await expect(canvas.getByRole('textbox', { name: /Your name/ })).toHaveValue('Alex Example')
    await expect(canvas.queryByRole('group', { name: summaryName })).toBeNull()
  },
}

/** The send failed on our side: an Alert.Danger above the heading, not a field error, and every answer is kept. */
export const SubmitFailed: Story = {
  globals: { ...wideGlobals },
  render: () => render('failed', 'failed'),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2, name: /We could not send/ })).toBeVisible()
    await expect(canvas.getByRole('textbox', { name: /Your name/ })).toHaveValue('Alex Example')
  },
}

/** The keys: Tab goes back link, summary links, then the fields, and Enter on a summary link moves focus to its field. */
export const Keyboard: Story = {
  globals: { ...wideGlobals },
  render: () => render('keyboard', 'invalid'),
  play: async ({ canvas, canvasElement }) => {
    if (inDocsFrame()) {
      return
    }
    canvas.getByRole('link', { name: 'Back' }).focus()
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Enter your name' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Choose how we should reply' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Write your question' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('textbox', { name: /Your name/ })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await userEvent.tab({ shift: true })
    await userEvent.keyboard('{Enter}')
    await expect(canvas.getByRole('radio', { name: 'By email' })).toHaveFocus()
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 320px: one column, the summary and the errors wrap, no sideways scroll. */
export const Narrow: Story = {
  globals: { ...narrowGlobals },
  render: () => render('narrow', 'invalid'),
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Right to left: the summary's bar and icon and the error's icon are at the right; the order is unchanged. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
  render: () => render('rtl', 'invalid'),
}

/** Forced colours: the danger bar, icon and status word, the links and the focus ring survive. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active', ...wideGlobals },
  render: () => render('forced', 'invalid'),
}

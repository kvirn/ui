'use client'
import {
  Alert,
  Button,
  ErrorSummary,
  Field,
  RadioGroup,
  TextInput,
  Textarea,
  useAnnouncer,
} from '@kvirn-ui/react'
import { useActionState, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import { initialContactState, reasons } from '../app/(docs)/contact/contact-state.ts'
import type { ContactState } from '../app/(docs)/contact/contact-state.ts'
import { messages } from '../messages/en.ts'
import { homeMessages } from '../messages/home.ts'

const text = messages.docs.contactPage.form
const email = homeMessages.contact.email

const maxNameLength = 100
const maxMessageLength = 2000

export interface ContactFormProps {
  action: (previous: ContactState, formData: FormData) => Promise<ContactState>
}

/** A real form with a server action, so it works without JavaScript. Validation runs on submit only, on the server; the summary takes focus and the answers are kept. */
export function ContactForm({ action }: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialContactState)
  const { announce } = useAnnouncer()
  const sentAlert = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isPending) {
      announce(text.sending)
    }
  }, [isPending, announce])

  useEffect(() => {
    if (state.status === 'sent') {
      sentAlert.current?.focus()
    }
  }, [state.status, state.attempt])

  if (state.status === 'sent') {
    return (
      <Alert.Success ref={sentAlert} tabIndex={-1}>
        <Alert.Title as="p">{text.sentHeading}</Alert.Title>
        <Alert.Body>{text.sentBody}</Alert.Body>
      </Alert.Success>
    )
  }

  const sendFailure =
    state.status === 'failed' || state.status === 'unavailable'
      ? text.failedEmail({ email })
      : state.status === 'limited'
        ? text.tooMany
        : undefined
  const entries = [
    state.errors.name !== undefined
      ? { controlId: 'contact-name', message: state.errors.name }
      : null,
    state.errors.email !== undefined
      ? { controlId: 'contact-email', message: state.errors.email }
      : null,
    state.errors.reason !== undefined
      ? { controlId: 'contact-reason', message: state.errors.reason }
      : null,
    state.errors.message !== undefined
      ? { controlId: 'contact-message', message: state.errors.message }
      : null,
    sendFailure !== undefined ? { controlId: 'contact-send', message: sendFailure } : null,
  ].filter((entry) => entry !== null)

  function guardDoubleSend(event: FormEvent<HTMLFormElement>) {
    if (isPending) {
      event.preventDefault()
    }
  }

  return (
    <>
      {entries.length > 0 ? (
        <ErrorSummary.Root focusKey={state.attempt} prefixDocumentTitle>
          <ErrorSummary.Title />
          <ErrorSummary.List>
            {entries.map((entry) => (
              <ErrorSummary.Item key={entry.controlId}>
                <ErrorSummary.Link controlId={entry.controlId}>{entry.message}</ErrorSummary.Link>
              </ErrorSummary.Item>
            ))}
          </ErrorSummary.List>
        </ErrorSummary.Root>
      ) : null}
      <form noValidate action={formAction} onSubmit={guardDoubleSend}>
        <Field.Root controlId="contact-name" invalid={state.errors.name !== undefined} required>
          <Field.Label>{text.nameLabel}</Field.Label>
          <TextInput
            name="name"
            autoComplete="name"
            maxLength={maxNameLength}
            defaultValue={state.values.name}
          />
          <Field.ErrorMessage>{state.errors.name}</Field.ErrorMessage>
        </Field.Root>
        <Field.Root controlId="contact-email" invalid={state.errors.email !== undefined} required>
          <Field.Label>{text.emailLabel}</Field.Label>
          <TextInput
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.values.email}
          />
          <Field.HelpText>{text.emailHelp}</Field.HelpText>
          <Field.ErrorMessage>{state.errors.email}</Field.ErrorMessage>
        </Field.Root>
        <RadioGroup.Root
          key={state.attempt}
          name="reason"
          required
          invalid={state.errors.reason !== undefined}
          defaultValue={state.values.reason === '' ? reasons[0] : state.values.reason}
        >
          <RadioGroup.Legend>{text.reasonLegend}</RadioGroup.Legend>
          {reasons.map((reason, index) => (
            <RadioGroup.Option
              key={reason}
              {...(index === 0 ? { controlId: 'contact-reason' } : {})}
            >
              <RadioGroup.Radio value={reason} />
              <Field.Label>{homeMessages.contact[reason].heading}</Field.Label>
            </RadioGroup.Option>
          ))}
          <RadioGroup.ErrorMessage>{state.errors.reason}</RadioGroup.ErrorMessage>
        </RadioGroup.Root>
        <Field.Root
          controlId="contact-message"
          invalid={state.errors.message !== undefined}
          required
        >
          <Field.Label>{text.messageLabel}</Field.Label>
          <Textarea
            name="message"
            characterCount
            maxLength={maxMessageLength}
            defaultValue={state.values.message}
          />
          <Field.ErrorMessage>{state.errors.message}</Field.ErrorMessage>
        </Field.Root>
        <div aria-hidden="true" className="kv-visually-hidden">
          <label>
            {text.honeypotLabel}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <div>
          <Button id="contact-send" type="submit" className="kv-button--primary">
            {text.send}
          </Button>
        </div>
      </form>
    </>
  )
}

'use client'

import { arrowBack } from '@kvirn-ui/icons'
import {
  Alert,
  Button,
  Container,
  CopyButton,
  ErrorSummary,
  Field,
  Heading,
  Icon,
  Link,
  Stack,
  TextInput,
  Textarea,
} from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { kvirnbyFeedbackReference, kvirnbyReferringAddress } from '../../fixtures/accessibility.ts'
import { PageFrame } from '../../page-frame/page-frame.tsx'

export interface FormPageProps {
  /**
   * Where the page starts: `empty` (the form), `invalid` (after a failed send, the error summary
   * first), `failed` (the send failed, answers kept) or `sent` (the confirmation). Sending the form
   * moves on from there. Default `empty`.
   */
  state?: 'empty' | 'invalid' | 'failed' | 'sent' | undefined
  /** The next valid send fails on the server, to show that state live. Default `false`. */
  failNextSend?: boolean | undefined
}

type Errors = { page?: string; problem?: string; email?: string }

const limit = 1000

/**
 * Report an accessibility problem (Web Accessibility Directive, Art. 7), the slot between a
 * transaction header and the footer: back link, error summary after a failed send, title, three
 * questions and Send; then a confirmation. Never asks for a personal identity number. Nothing is
 * sent: the page says so. Example text is English and fictional (Kvirnby municipality).
 */
export function FormPage({ state = 'empty', failNextSend = false }: FormPageProps) {
  const [step, setStep] = useState<'form' | 'sent'>(state === 'sent' ? 'sent' : 'form')
  const [failed, setFailed] = useState(state === 'failed')
  const [page, setPage] = useState(state === 'invalid' ? '' : kvirnbyReferringAddress)
  const [problem, setProblem] = useState(
    state === 'failed' ? 'The contrast on the search button is too low.' : '',
  )
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Errors>(
    state === 'invalid'
      ? { page: 'Enter the address of the page', problem: 'Describe what is wrong' }
      : {},
  )
  const [submitCount, setSubmitCount] = useState(state === 'invalid' ? 1 : 0)
  const confirmationTitle = useRef<HTMLHeadingElement>(null)
  const referenceRef = useRef<HTMLSpanElement>(null)
  const failureTitle = useRef<HTMLHeadingElement>(null)
  const [failureCount, setFailureCount] = useState(0)
  const hasSent = useRef(false)

  useEffect(() => {
    if (step === 'sent' && hasSent.current) {
      confirmationTitle.current?.focus()
    }
  }, [step])

  useEffect(() => {
    if (failureCount > 0) {
      failureTitle.current?.focus()
    }
  }, [failureCount])

  const problems = [
    errors.page !== undefined ? { controlId: 'form-page-address', message: errors.page } : null,
    errors.problem !== undefined
      ? { controlId: 'form-page-problem', message: errors.problem }
      : null,
    errors.email !== undefined ? { controlId: 'form-page-email', message: errors.email } : null,
  ].filter((entry) => entry !== null)

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found: Errors = {}
    if (page.trim() === '') {
      found.page = 'Enter the address of the page'
    }
    if (problem.trim() === '') {
      found.problem = 'Describe what is wrong'
    }
    if (email.trim() !== '' && !email.includes('@')) {
      found.email = 'Enter your email address in the form name@example.com'
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
      setStep('sent')
    }
  }

  if (step === 'sent') {
    return (
      <PageFrame.Main size="form">
        <Stack className="kv-stack--gap-8">
          <Heading as="h1" ref={confirmationTitle} tabIndex={-1}>
            Thank you for your report
          </Heading>
          <Alert.Success>
            <Alert.Title as="h2">Your report is sent</Alert.Title>
            <Alert.Body>
              <p>
                Your reference number is <span ref={referenceRef}>{kvirnbyFeedbackReference}</span>.
              </p>
              <CopyButton text={kvirnbyFeedbackReference} textRef={referenceRef}>
                Copy reference number
              </CopyButton>
            </Alert.Body>
          </Alert.Success>
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3">
              What happens next
            </Heading>
            <p>
              We read your report within five working days. If you gave an email address, we reply
              there and tell you when the problem is fixed.
            </p>
            <p>Nothing was sent: this is an example.</p>
          </Stack>
          <p>
            <Link.Root href="#start">Back to the start page</Link.Root>
          </p>
        </Stack>
      </PageFrame.Main>
    )
  }

  return (
    <>
      <Container size="form">
        <Link.Root href="#accessibility">
          <Link.Icon>
            <Icon name="arrow-back" icon={arrowBack} size="24" />
          </Link.Icon>
          Back to accessibility
        </Link.Root>
      </Container>
      <PageFrame.Main size="form">
        <Stack className="kv-stack--gap-8">
          {problems.length > 0 ? (
            <ErrorSummary.Root focusKey={submitCount} prefixDocumentTitle>
              <ErrorSummary.Title />
              <ErrorSummary.List>
                {problems.map((entry) => (
                  <ErrorSummary.Item key={entry.controlId}>
                    <ErrorSummary.Link controlId={entry.controlId}>
                      {entry.message}
                    </ErrorSummary.Link>
                  </ErrorSummary.Item>
                ))}
              </ErrorSummary.List>
            </ErrorSummary.Root>
          ) : null}
          {failed ? (
            <Alert.Danger>
              <Alert.Title as="h2" ref={failureTitle} tabIndex={-1}>
                We could not send your report
              </Alert.Title>
              <Alert.Body>
                <p>
                  Something went wrong on our side. Your answers are kept. Try again in a few
                  minutes.
                </p>
              </Alert.Body>
            </Alert.Danger>
          ) : null}
          <Heading as="h1">Report an accessibility problem</Heading>
          <form noValidate onSubmit={send}>
            <Field.Root controlId="form-page-address" invalid={errors.page !== undefined} required>
              <Field.Label>Which page has the problem?</Field.Label>
              <TextInput
                name="page"
                type="url"
                autoComplete="off"
                value={page}
                onValueChange={setPage}
              />
              <Field.HelpText>
                We filled in the page you came from. Change it if needed.
              </Field.HelpText>
              <Field.ErrorMessage>{errors.page}</Field.ErrorMessage>
            </Field.Root>
            <Field.Root
              controlId="form-page-problem"
              invalid={errors.problem !== undefined}
              required
            >
              <Field.Label>What is wrong?</Field.Label>
              <Textarea
                name="problem"
                maxLength={limit}
                characterCount
                value={problem}
                onValueChange={setProblem}
              />
              <Field.ErrorMessage>{errors.problem}</Field.ErrorMessage>
            </Field.Root>
            <Field.Root controlId="form-page-email" invalid={errors.email !== undefined}>
              <Field.Label>Your email address</Field.Label>
              <Field.Prose>
                <p>Only if you want a reply. We use it for nothing else.</p>
              </Field.Prose>
              <TextInput
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onValueChange={setEmail}
              />
              <Field.ErrorMessage>{errors.email}</Field.ErrorMessage>
            </Field.Root>
            <div>
              <Button type="submit" className="kv-button--primary">
                Send
              </Button>
            </div>
          </form>
        </Stack>
      </PageFrame.Main>
    </>
  )
}

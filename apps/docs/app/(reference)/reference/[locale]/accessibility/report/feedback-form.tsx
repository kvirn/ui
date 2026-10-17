'use client'
import { PageFrame } from '@kvirn-ui/patterns'
import {
  Button,
  ErrorSummary,
  Field,
  Heading,
  Icon,
  Link,
  Stack,
  TextInput,
  Textarea,
} from '@kvirn-ui/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { referenceStatementMessages } from '../../../../../../messages/reference-statement.ts'
import type { ReferenceLocale } from '../../../../../../messages/reference.ts'

type Errors = { page?: string; problem?: string; email?: string }

/** P18: validates on submit, never while typing; the summary takes focus on every failed send and the answers are kept. Nothing is sent: the confirmation is its own route. */
export function FeedbackForm({ locale }: { locale: ReferenceLocale }) {
  const text = referenceStatementMessages[locale].form
  const router = useRouter()
  const [page, setPage] = useState(text.pageValue)
  const [problem, setProblem] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [submitCount, setSubmitCount] = useState(0)
  const entries = [
    errors.page !== undefined ? { controlId: 'feedback-page', message: errors.page } : null,
    errors.problem !== undefined
      ? { controlId: 'feedback-problem', message: errors.problem }
      : null,
    errors.email !== undefined ? { controlId: 'feedback-email', message: errors.email } : null,
  ].filter((entry) => entry !== null)

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found: Errors = {}
    if (page.trim() === '') {
      found.page = text.pageError
    }
    if (problem.trim() === '') {
      found.problem = text.problemError
    }
    if (email.trim() !== '' && !email.includes('@')) {
      found.email = text.emailError
    }
    setErrors(found)
    setSubmitCount(submitCount + 1)
    if (Object.keys(found).length === 0) {
      router.push(`/reference/${locale}/accessibility/report/sent`)
    }
  }

  return (
    <>
      <PageFrame.Main size="form">
        <Stack className="kv-stack--gap-8">
          <Link href={`/reference/${locale}/accessibility`}>
            <Link.Icon>
              <Icon name="arrow-back" size="24" />
            </Link.Icon>
            {text.back}
          </Link>
          {entries.length > 0 ? (
            <ErrorSummary.Root focusKey={submitCount} prefixDocumentTitle>
              <ErrorSummary.Title />
              <ErrorSummary.List>
                {entries.map((entry) => (
                  <ErrorSummary.Item key={entry.controlId}>
                    <ErrorSummary.Link controlId={entry.controlId}>
                      {entry.message}
                    </ErrorSummary.Link>
                  </ErrorSummary.Item>
                ))}
              </ErrorSummary.List>
            </ErrorSummary.Root>
          ) : null}
          <Heading as="h1">{text.heading}</Heading>
          <form noValidate onSubmit={send}>
            <Field.Root controlId="feedback-page" invalid={errors.page !== undefined} required>
              <Field.Label>{text.pageLabel}</Field.Label>
              <TextInput
                name="page"
                type="url"
                autoComplete="off"
                value={page}
                onValueChange={setPage}
              />
              <Field.HelpText>{text.pageHelp}</Field.HelpText>
              <Field.ErrorMessage>{errors.page}</Field.ErrorMessage>
            </Field.Root>
            <Field.Root
              controlId="feedback-problem"
              invalid={errors.problem !== undefined}
              required
            >
              <Field.Label>{text.problemLabel}</Field.Label>
              <Textarea
                name="problem"
                maxLength={1000}
                characterCount
                value={problem}
                onValueChange={setProblem}
              />
              <Field.ErrorMessage>{errors.problem}</Field.ErrorMessage>
            </Field.Root>
            <Field.Root controlId="feedback-email" invalid={errors.email !== undefined}>
              <Field.Label>{text.emailLabel}</Field.Label>
              <Field.Prose>
                <p>{text.emailHelp}</p>
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
                {text.send}
              </Button>
            </div>
          </form>
        </Stack>
      </PageFrame.Main>
    </>
  )
}

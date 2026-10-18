'use client'
import { PageFrame } from '@kvirn-ui/patterns'
import {
  Alert,
  Button,
  CopyButton,
  DefinitionList,
  ErrorSummary,
  Field,
  Heading,
  Icon,
  Link,
  RadioGroup,
  Stack,
  Stepper,
  TextInput,
} from '@kvirn-ui/react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { referenceEserviceMessages } from '../../../../../../../messages/reference-eservice.ts'
import type { ReferenceLocale } from '../../../../../../../messages/reference.ts'
import { useApplyAnswers } from './apply-answers.tsx'

export type ApplyStep = 'who' | 'vehicle' | 'contact'

const service = 'parking/disabled-parking-permit'
const stepOrder: readonly ApplyStep[] = ['who', 'vehicle', 'contact']
const stepPath = (step: ApplyStep) => (step === 'who' ? 'apply' : `apply/${step}`)

function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link.Root href={href}>
      <Link.Icon>
        <Icon name="arrow-back" size="24" />
      </Link.Icon>
      {children}
    </Link.Root>
  )
}

export function QuestionPage({ locale, step }: { locale: ReferenceLocale; step: ApplyStep }) {
  const text = referenceEserviceMessages[locale].apply
  const router = useRouter()
  const { answers, setAnswer } = useApplyAnswers()
  const [error, setError] = useState<string | undefined>(undefined)
  const [submitCount, setSubmitCount] = useState(0)
  const index = stepOrder.indexOf(step)
  const href = (slug: string) => `/reference/${locale}/${service}/${slug}`
  const controlId = `apply-${step}`
  const firstOptionId = `${controlId}-${text.who.options[0]?.value}`
  const errorTarget = step === 'who' ? firstOptionId : controlId
  const previous = stepOrder[index - 1]
  const next = stepOrder[index + 1]

  const validate = () => {
    if (step === 'who') {
      return answers.who === null ? text.who.error : undefined
    }
    if (step === 'vehicle') {
      return /^[A-Za-z0-9 ]{5,8}$/.test(answers.vehicle.trim()) ? undefined : text.vehicle.error
    }
    return answers.contact.replace(/\D/g, '').length >= 6 ? undefined : text.contact.error
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validate()
    setError(found)
    setSubmitCount(submitCount + 1)
    if (found === undefined) {
      router.push(next === undefined ? href('apply/check') : href(stepPath(next)))
    }
  }

  const stepper = <Stepper current={index + 1} total={stepOrder.length} name={text.steps[index]} />

  return (
    <>
      <PageFrame.Main size="form">
        <Stack className="kv-stack--gap-8">
          <BackLink href={previous === undefined ? href('sign-in') : href(stepPath(previous))}>
            {previous === undefined ? text.back.signIn : text.back.previous}
          </BackLink>
          {error === undefined ? null : (
            <ErrorSummary.Root focusKey={submitCount} prefixDocumentTitle>
              <ErrorSummary.Title />
              <ErrorSummary.List>
                <ErrorSummary.Item>
                  <ErrorSummary.Link controlId={errorTarget}>{error}</ErrorSummary.Link>
                </ErrorSummary.Item>
              </ErrorSummary.List>
            </ErrorSummary.Root>
          )}
          <form noValidate onSubmit={submit}>
            <Stack className="kv-stack--gap-8">
              {step === 'who' ? (
                <RadioGroup.Root
                  required
                  invalid={error !== undefined}
                  value={answers.who}
                  onValueChange={(value) => setAnswer('who', value)}
                >
                  <RadioGroup.Legend className="kv-fieldset-legend--heading" marker="none">
                    <h1>{text.who.title}</h1>
                  </RadioGroup.Legend>
                  {stepper}
                  {text.who.options.map((option, optionIndex) => (
                    <RadioGroup.Option
                      key={option.value}
                      {...(optionIndex === 0 ? { controlId: firstOptionId } : {})}
                    >
                      <RadioGroup.Radio value={option.value} />
                      <Field.Label>{option.label}</Field.Label>
                    </RadioGroup.Option>
                  ))}
                  <RadioGroup.ErrorMessage>{error}</RadioGroup.ErrorMessage>
                </RadioGroup.Root>
              ) : (
                <Field.Root controlId={controlId} invalid={error !== undefined} required>
                  <h1>
                    <Field.Label className="kv-field-label--heading" marker="none">
                      {step === 'vehicle' ? text.vehicle.title : text.contact.title}
                    </Field.Label>
                  </h1>
                  {stepper}
                  <Field.HelpText>
                    {step === 'vehicle' ? text.vehicle.help : text.contact.help}
                  </Field.HelpText>
                  {step === 'vehicle' ? (
                    <TextInput
                      name="registration"
                      className="kv-input--width-10"
                      autoCapitalize="characters"
                      spellCheck={false}
                      value={answers.vehicle}
                      onValueChange={(value) => setAnswer('vehicle', value)}
                    />
                  ) : (
                    <TextInput
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      className="kv-input--width-20"
                      value={answers.contact}
                      onValueChange={(value) => setAnswer('contact', value)}
                    />
                  )}
                  <Field.ErrorMessage>{error}</Field.ErrorMessage>
                </Field.Root>
              )}
              <div>
                <Button type="submit" className="kv-button--primary">
                  {text.next}
                </Button>
              </div>
            </Stack>
          </form>
        </Stack>
      </PageFrame.Main>
    </>
  )
}

export function CheckPage({ locale }: { locale: ReferenceLocale }) {
  const text = referenceEserviceMessages[locale].apply
  const router = useRouter()
  const { answers, send } = useApplyAnswers()
  const href = (slug: string) => `/reference/${locale}/${service}/${slug}`
  const rows: { step: ApplyStep; value: string }[] = [
    {
      step: 'who',
      value: answers.who === null ? '' : (text.check.who[answers.who as 'me' | 'child'] ?? ''),
    },
    { step: 'vehicle', value: answers.vehicle.trim() },
    { step: 'contact', value: answers.contact.trim() },
  ]
  const missing = rows.filter((row) => row.value === '')
  const [submitCount, setSubmitCount] = useState(0)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitCount(submitCount + 1)
    if (missing.length === 0) {
      send()
      router.push(href('apply/sent'))
    }
  }

  return (
    <>
      <PageFrame.Main size="form">
        <Stack className="kv-stack--gap-8">
          <BackLink href={href('apply/contact')}>{text.back.previous}</BackLink>
          <Stack className="kv-stack--gap-4">
            <Heading as="h1">{text.check.heading}</Heading>
            <p className="kv-lead">{text.check.lead}</p>
          </Stack>
          {submitCount > 0 && missing.length > 0 ? (
            <ErrorSummary.Root focusKey={submitCount} prefixDocumentTitle>
              <ErrorSummary.Title />
              <ErrorSummary.List>
                {missing.map((row) => (
                  <ErrorSummary.Item key={row.step}>
                    <Link.Root href={href(stepPath(row.step))}>
                      {text.check.missing[row.step]}
                    </Link.Root>
                  </ErrorSummary.Item>
                ))}
              </ErrorSummary.List>
            </ErrorSummary.Root>
          ) : null}
          <DefinitionList.Root>
            {rows.map((row, index) => (
              <DefinitionList.Row key={row.step}>
                <DefinitionList.Term>{text.check.terms[index]}</DefinitionList.Term>
                <DefinitionList.Description>{row.value}</DefinitionList.Description>
                <DefinitionList.Actions>
                  <DefinitionList.Change href={href(stepPath(row.step))} />
                </DefinitionList.Actions>
              </DefinitionList.Row>
            ))}
          </DefinitionList.Root>
          <form onSubmit={submit}>
            <Button type="submit" className="kv-button--primary">
              {text.check.send}
            </Button>
          </form>
        </Stack>
      </PageFrame.Main>
    </>
  )
}

export function SentPage({ locale }: { locale: ReferenceLocale }) {
  const text = referenceEserviceMessages[locale].apply
  const { reference } = useApplyAnswers()
  const referenceRef = useRef<HTMLSpanElement>(null)
  const href = (slug: string) => `/reference/${locale}/${slug}`
  return (
    <PageFrame.Main size="form">
      <Stack className="kv-stack--gap-8">
        <Heading as="h1">{text.sent.heading}</Heading>
        {reference === undefined ? (
          <p>
            {text.sent.noReference}{' '}
            <Link.Root href={href(service)}>{text.sent.toService}</Link.Root>
          </p>
        ) : (
          <>
            <Alert.Success>
              <Alert.Title as="h2">{text.sent.successTitle}</Alert.Title>
              <Alert.Body>
                <p>
                  {text.sent.referenceIntro} <span ref={referenceRef}>{reference}</span>.
                </p>
                <CopyButton text={reference} textRef={referenceRef}>
                  {text.sent.copy}
                </CopyButton>
              </Alert.Body>
            </Alert.Success>
            <Stack className="kv-stack--gap-4">
              <Heading as="h2" size="heading-3">
                {text.sent.nextHeading}
              </Heading>
              <p>{text.sent.nextBody}</p>
              <p>{text.sent.exampleNote}</p>
            </Stack>
            <p>
              <Link.Root href={href('my-pages')}>{text.sent.toMyPages}</Link.Root>
            </p>
            <p>
              <Link.Root href={href('')}>{text.sent.toStart}</Link.Root>
            </p>
          </>
        )}
      </Stack>
    </PageFrame.Main>
  )
}

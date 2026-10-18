'use client'
import { Button, ErrorSummary, Field, RadioGroup, Stack } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useRadioGroupTexts } from './texts.ts'

export function InvalidRadioGroup() {
  const { texts } = useRadioGroupTexts()
  const idPrefix = useId()
  // A group of options is linked by the id of its first option.
  const firstOptionId = `${idPrefix}-post`
  const [choice, setChoice] = useState<string | null>(null)
  const [problem, setProblem] = useState<{ choice: string | null; text: string } | null>(null)
  const [submitCount, setSubmitCount] = useState(0)
  const [isSent, setIsSent] = useState(false)
  // The error belongs to the answer that was refused: choosing another one clears it.
  const isInvalid = problem !== null && choice === problem.choice

  return (
    <Stack className="kv-stack--gap-8">
      {isInvalid ? (
        <ErrorSummary.Root focusKey={submitCount}>
          {/* The docs page already has an h1, so the summary's title is an h4. On your pages the default is h2. */}
          <ErrorSummary.Title as="h4" />
          <ErrorSummary.List>
            <ErrorSummary.Item>
              <ErrorSummary.Link controlId={firstOptionId}>{problem.text}</ErrorSummary.Link>
            </ErrorSummary.Item>
          </ErrorSummary.List>
        </ErrorSummary.Root>
      ) : null}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          // This stands in for the check your server makes after the send.
          const text =
            choice === null
              ? texts.decisionMissing
              : choice === 'mailbox'
                ? texts.decisionNoMailbox
                : null
          setProblem(text === null ? null : { choice, text })
          setIsSent(text === null)
          setSubmitCount((count) => count + 1)
        }}
      >
        <p>{texts.allRequired}</p>
        <RadioGroup.Root
          name="decision"
          required
          invalid={isInvalid}
          value={choice}
          onValueChange={setChoice}
        >
          <RadioGroup.Legend>{texts.decisionLegend}</RadioGroup.Legend>
          <RadioGroup.Option controlId={firstOptionId}>
            <RadioGroup.Radio value="post" />
            <Field.Label>{texts.decisionPost}</Field.Label>
          </RadioGroup.Option>
          <RadioGroup.Option>
            <RadioGroup.Radio value="email" />
            <Field.Label>{texts.decisionEmail}</Field.Label>
          </RadioGroup.Option>
          <RadioGroup.Option>
            <RadioGroup.Radio value="mailbox" />
            <Field.Label>{texts.decisionMailbox}</Field.Label>
          </RadioGroup.Option>
          <RadioGroup.ErrorMessage>{problem?.text}</RadioGroup.ErrorMessage>
        </RadioGroup.Root>
        <Button type="submit" className="kv-button--primary">
          {texts.send}
        </Button>
      </form>
      <output>{isSent ? texts.sent : null}</output>
    </Stack>
  )
}

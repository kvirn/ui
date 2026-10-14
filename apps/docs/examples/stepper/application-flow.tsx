'use client'
import { Button, Field, Heading, Stack, Stepper, TextInput, useRouteFocus } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useStepperTexts } from './texts.ts'

export function ApplicationFlow() {
  const { texts } = useStepperTexts()
  const { sections } = texts
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>(() => sections.map(() => ''))
  const [isSent, setIsSent] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)
  // The docs page already has an h1, so this example uses an h4. On your pages the default is h1.
  useRouteFocus({ key: isSent ? 'sent' : String(index), containerRef: pageRef, selector: 'h4' })
  const section = sections[index]
  const isLast = index === sections.length - 1

  return (
    <div ref={pageRef}>
      {isSent || section === undefined ? (
        <Stack className="kv-stack--gap-4">
          <Heading as="h4">{texts.sentTitle}</Heading>
          <p>{texts.sentBody}</p>
          <div>
            <Button
              onClick={() => {
                setAnswers(sections.map(() => ''))
                setIndex(0)
                setIsSent(false)
              }}
            >
              {texts.startAgain}
            </Button>
          </div>
        </Stack>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (isLast) {
              setIsSent(true)
            } else {
              setIndex(index + 1)
            }
          }}
        >
          {/* The key remounts the field, so focus drops and useRouteFocus can move it to the heading. */}
          <Field.Root key={index}>
            <Stack className="kv-stack--gap-2">
              <Heading as="h4">
                <Field.Label className="kv-field-label--heading">{section.question}</Field.Label>
              </Heading>
              <Stepper current={index + 1} total={sections.length} name={section.name} />
            </Stack>
            <TextInput
              name={section.field}
              value={answers[index] ?? ''}
              onChange={(event) => {
                const answer = event.currentTarget.value
                setAnswers((current) => current.map((old, i) => (i === index ? answer : old)))
              }}
            />
          </Field.Root>
          <p>
            {index > 0 && (
              <>
                <Button type="button" onClick={() => setIndex(index - 1)}>
                  {texts.back}
                </Button>{' '}
              </>
            )}
            <Button type="submit" className="kv-button--primary">
              {isLast ? texts.send : texts.continue}
            </Button>
          </p>
        </form>
      )}
    </div>
  )
}

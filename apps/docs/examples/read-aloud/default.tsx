'use client'
import { Checkbox, Field, Heading, ReadAloud } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useReadAloudTexts } from './texts.ts'

export function Player() {
  const { texts } = useReadAloudTexts()
  const articleRef = useRef<HTMLElement>(null)
  // Browsers such as Chrome offer mostly online voices, which may send the text to the voice's
  // provider. The reader opts in: the default keeps the text on the device.
  const [allowRemoteVoices, setAllowRemoteVoices] = useState(false)
  return (
    <>
      <Field.Root>
        <Checkbox checked={allowRemoteVoices} onCheckedChange={setAllowRemoteVoices} />
        <Field.Label>{texts.allowRemoteVoices}</Field.Label>
        <Field.HelpText>{texts.allowRemoteVoicesHelp}</Field.HelpText>
      </Field.Root>
      <ReadAloud.Root contentRef={articleRef} allowRemoteVoices={allowRemoteVoices}>
        <ReadAloud.Play />
        <ReadAloud.Previous />
        <ReadAloud.Next />
        <ReadAloud.Stop />
        <ReadAloud.Rate />
        <ReadAloud.Voice />
        <ReadAloud.Status />
        <ReadAloud.SelectionTrigger />
      </ReadAloud.Root>
      <article ref={articleRef}>
        <Heading as="h4">{texts.title}</Heading>
        <p>{texts.firstParagraph}</p>
        <p>{texts.secondParagraph}</p>
      </article>
    </>
  )
}

'use client'
import { Field, RadioGroup, Stack, TextInput } from '@kvirn-ui/react'
import { useRadioGroupTexts } from './texts.ts'

export function AnnouncementWordingRadioGroup() {
  const { texts } = useRadioGroupTexts()
  return (
    <Stack className="kv-stack--gap-8">
      <RadioGroup.Root name="heard-from">
        <RadioGroup.Legend>{texts.sourceLegend}</RadioGroup.Legend>
        <RadioGroup.Option>
          <RadioGroup.Radio value="letter" />
          <Field.Label>{texts.sourceLetter}</Field.Label>
        </RadioGroup.Option>
        <RadioGroup.Option>
          <RadioGroup.Radio value="colleague" />
          <Field.Label>{texts.sourceColleague}</Field.Label>
        </RadioGroup.Option>
        <RadioGroup.Option>
          <RadioGroup.Radio value="other" />
          <Field.Label>{texts.sourceOther}</Field.Label>
        </RadioGroup.Option>
        <RadioGroup.Reveal value="other" messages={{ revealShown: texts.revealHeardFrom }}>
          <Field.Root>
            <Field.Label>{texts.heardFromSpecify}</Field.Label>
            <TextInput name="heard-from-other" />
          </Field.Root>
        </RadioGroup.Reveal>
      </RadioGroup.Root>
      <RadioGroup.Root name="reply-by">
        <RadioGroup.Legend>{texts.replyLegend}</RadioGroup.Legend>
        <RadioGroup.Option>
          <RadioGroup.Radio value="email" />
          <Field.Label>{texts.replyEmail}</Field.Label>
        </RadioGroup.Option>
        <RadioGroup.Option>
          <RadioGroup.Radio value="letter" />
          <Field.Label>{texts.replyLetter}</Field.Label>
        </RadioGroup.Option>
        <RadioGroup.Option>
          <RadioGroup.Radio value="other" />
          <Field.Label>{texts.sourceOther}</Field.Label>
        </RadioGroup.Option>
        <RadioGroup.Reveal value="other" messages={{ revealShown: texts.revealReplyBy }}>
          <Field.Root>
            <Field.Label>{texts.replyBySpecify}</Field.Label>
            <TextInput name="reply-by-other" />
          </Field.Root>
        </RadioGroup.Reveal>
      </RadioGroup.Root>
    </Stack>
  )
}

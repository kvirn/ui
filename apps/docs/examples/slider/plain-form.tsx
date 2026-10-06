'use client'
import { Button, Field, Slider } from '@kvirn-ui/react'
import { useState } from 'react'
import { useSliderTexts } from './texts.ts'

export function PlainForm() {
  const { texts, textLang } = useSliderTexts()
  const [sent, setSent] = useState<string | undefined>()
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const distance = new FormData(event.currentTarget).get('distance')
        setSent(typeof distance === 'string' ? distance : undefined)
      }}
    >
      <Field.Root lang={textLang}>
        <Field.Label marker="none">{texts.distanceLabel}</Field.Label>
        <Slider
          name="distance"
          max={50}
          step={5}
          defaultValue={15}
          valueText={(km) => `${km} ${texts.distanceUnit}`}
        />
        <Field.HelpText>{texts.distanceEnds}</Field.HelpText>
      </Field.Root>
      <Button type="submit" className="kv-button--primary" lang={textLang}>
        {texts.send}
      </Button>
      {sent === undefined ? null : (
        <p lang={textLang}>
          {texts.sent} {sent}
        </p>
      )}
    </form>
  )
}

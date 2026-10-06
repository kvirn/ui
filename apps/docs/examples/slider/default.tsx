'use client'
import { Field, Slider } from '@kvirn-ui/react'
import { useSliderTexts } from './texts.ts'

export function DefaultSlider() {
  const { texts, textLang } = useSliderTexts()
  return (
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
  )
}

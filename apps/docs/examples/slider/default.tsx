'use client'
import { Field, Slider } from '@kvirn-ui/react'
import { useSliderTexts } from './texts.ts'

export function DefaultSlider() {
  const { texts } = useSliderTexts()
  return (
    <Field.Root>
      <Field.Label marker="none">{texts.distanceLabel}</Field.Label>
      <Slider
        name="distance"
        min={1}
        max={20}
        defaultValue={1}
        valueText={(km) => `${km} ${texts.distanceUnit}`}
      />
      <Field.HelpText>{texts.distanceEnds}</Field.HelpText>
    </Field.Root>
  )
}

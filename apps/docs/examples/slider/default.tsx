'use client'
import { Field, Slider } from '@kvirn-ui/react'
import { useSliderTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultSlider() {
  const { texts, isFallback } = useSliderTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root>
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
    </InEnglishWhenFallback>
  )
}

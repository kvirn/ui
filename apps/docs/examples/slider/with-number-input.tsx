'use client'
import { Field, InputGroup, NumberInput, Slider } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useSliderTexts } from './texts.ts'

export function WithNumberInput() {
  const { texts, textLang } = useSliderTexts()
  const labelId = useId()
  const hintId = useId()
  const [distance, setDistance] = useState('10')
  const [sliderValue, setSliderValue] = useState(10)
  const isTooFar = Number(distance) > 50
  return (
    <Field.Root invalid={isTooFar} lang={textLang}>
      <Field.Label marker="none">
        <span id={labelId}>{texts.distanceLabel}</span>
      </Field.Label>
      <Slider
        aria-labelledby={labelId}
        aria-describedby={hintId}
        max={50}
        value={sliderValue}
        onValueChange={(value) => {
          setSliderValue(value)
          setDistance(String(value))
        }}
        valueText={(km) => `${km} ${texts.distanceUnit}`}
      />
      <InputGroup.Root>
        <NumberInput
          name="distance"
          className="kv-input--width-4"
          value={distance}
          onValueChange={(next) => {
            setDistance(next)
            const parsed = Number(next)
            if (next.trim() !== '' && Number.isFinite(parsed)) {
              setSliderValue(Math.min(50, Math.max(0, parsed)))
            }
          }}
        />
        <InputGroup.Addon>{texts.distanceUnit}</InputGroup.Addon>
      </InputGroup.Root>
      <Field.HelpText>
        <span id={hintId}>{texts.distanceHint}</span>
      </Field.HelpText>
      <Field.ErrorMessage>{texts.distanceTooFar}</Field.ErrorMessage>
    </Field.Root>
  )
}

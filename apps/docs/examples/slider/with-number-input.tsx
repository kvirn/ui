'use client'
import { Field, InputGroup, NumberInput, Slider } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useSliderTexts } from './texts.ts'

export function WithNumberInput() {
  const { texts } = useSliderTexts()
  const labelId = useId()
  const hintId = useId()
  const [distance, setDistance] = useState('1')
  const [sliderValue, setSliderValue] = useState(1)
  const isOutOfRange = distance !== '' && (Number(distance) < 1 || Number(distance) > 20)
  return (
    <Field.Root invalid={isOutOfRange}>
      <Field.Label marker="none">
        <span id={labelId}>{texts.distanceLabel}</span>
      </Field.Label>
      <Slider
        aria-labelledby={labelId}
        aria-describedby={hintId}
        min={1}
        max={20}
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
              setSliderValue(Math.min(20, Math.max(1, parsed)))
            }
          }}
        />
        <InputGroup.Addon>{texts.distanceUnit}</InputGroup.Addon>
      </InputGroup.Root>
      <Field.HelpText>
        <span id={hintId}>{texts.distanceHint}</span>
      </Field.HelpText>
      <Field.ErrorMessage>{texts.distanceOutOfRange}</Field.ErrorMessage>
    </Field.Root>
  )
}

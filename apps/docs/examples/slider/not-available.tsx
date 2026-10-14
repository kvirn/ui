'use client'
import { Checkbox, Field, Slider, Stack } from '@kvirn-ui/react'
import { useState } from 'react'
import { useSliderTexts } from './texts.ts'

export function NotAvailable() {
  const { texts } = useSliderTexts()
  const [isWholeMunicipality, setIsWholeMunicipality] = useState(false)
  return (
    <Stack className="kv-stack--gap-4">
      <Field.Root>
        <Checkbox
          checked={isWholeMunicipality}
          onCheckedChange={(checked) => setIsWholeMunicipality(checked)}
        />
        <Field.Label marker="none">{texts.wholeMunicipality}</Field.Label>
      </Field.Root>
      <Field.Root disabled={isWholeMunicipality}>
        <Field.Label marker="none">{texts.distanceLabel}</Field.Label>
        <Slider
          name="distance"
          min={1}
          max={20}
          defaultValue={5}
          valueText={(km) => `${km} ${texts.distanceUnit}`}
        />
        <Field.HelpText>
          {isWholeMunicipality ? texts.distanceOff : texts.distanceEnds}
        </Field.HelpText>
      </Field.Root>
    </Stack>
  )
}

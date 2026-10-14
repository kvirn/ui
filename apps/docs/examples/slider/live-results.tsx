'use client'
import { Field, Slider, Stack, useAnnouncer } from '@kvirn-ui/react'
import { useEffect, useState } from 'react'
import { useSliderTexts } from './texts.ts'

export function LiveResults() {
  const { texts } = useSliderTexts()
  const { announce } = useAnnouncer()
  const [distance, setDistance] = useState(5)
  const [hasMoved, setHasMoved] = useState(false)
  const nearby = texts.stations.filter((station) => station.distance <= distance)
  const message = texts.results(nearby.length, distance)

  useEffect(() => {
    if (!hasMoved) {
      return
    }
    // Wait until the thumb stops, so one move is one message.
    const timer = setTimeout(() => announce(message), 500)
    return () => clearTimeout(timer)
  }, [announce, hasMoved, message])

  return (
    <Stack className="kv-stack--gap-4">
      <Field.Root>
        <Field.Label marker="none">{texts.distanceLabel}</Field.Label>
        <Slider
          min={1}
          max={20}
          value={distance}
          onValueChange={(value) => {
            setDistance(value)
            setHasMoved(true)
          }}
          valueText={(km) => `${km} ${texts.distanceUnit}`}
        />
        <Field.HelpText>{texts.distanceEnds}</Field.HelpText>
      </Field.Root>
      <p>{message}</p>
      <ul>
        {nearby.map((station) => (
          <li key={station.name}>
            {station.name}, {station.distance} {texts.distanceUnit}
          </li>
        ))}
      </ul>
    </Stack>
  )
}

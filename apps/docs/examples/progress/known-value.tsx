'use client'
import { Alert, Button, Progress } from '@kvirn-ui/react'
import { useEffect, useState } from 'react'
import { useProgressTexts } from './texts.ts'

export function KnownValue() {
  const { texts } = useProgressTexts()
  const [value, setValue] = useState<number | undefined>(undefined)
  const isDone = value !== undefined && value >= 100

  useEffect(() => {
    if (value === undefined || value >= 100) {
      return
    }
    const timer = setTimeout(() => setValue(value + 5), 250)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div>
      <Button onClick={() => setValue(0)}>{texts.export}</Button>
      {value === undefined || isDone ? null : (
        <Progress.Root label={texts.exporting} value={value}>
          <Progress.Label />
          <Progress.Bar />
        </Progress.Root>
      )}
      {isDone ? (
        <Alert.Success announce="polite">
          <Alert.Title as="p">{texts.exported}</Alert.Title>
        </Alert.Success>
      ) : null}
    </div>
  )
}

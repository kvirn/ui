'use client'
import { Button, Progress } from '@kvirn-ui/react'
import { useEffect, useState } from 'react'
import { useProgressTexts } from './texts.ts'

export function KnownValue() {
  const { texts, textLang } = useProgressTexts()
  const [value, setValue] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (value === undefined || value >= 100) {
      return
    }
    const timer = setTimeout(() => setValue(value + 5), 250)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div lang={textLang}>
      <Button onClick={() => setValue(0)}>{texts.export}</Button>
      {value === undefined || value >= 100 ? null : (
        <Progress.Root label={texts.exporting} value={value} delayMilliseconds={0}>
          <Progress.Label />
          <Progress.Bar />
        </Progress.Root>
      )}
    </div>
  )
}

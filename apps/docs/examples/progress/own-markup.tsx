'use client'
import { Button, useFormat, useProgress } from '@kvirn-ui/react'
import { useEffect, useState } from 'react'
import { useProgressTexts } from './texts.ts'

function Waiting({ label, value }: { label: string; value: number }) {
  const progress = useProgress({ label, value })
  const format = useFormat()
  if (!progress.isShown || progress.barProps === undefined) {
    return null
  }
  return (
    <div {...progress.rootProps}>
      <p {...progress.labelProps}>
        <span id={progress.labelId}>{progress.label}</span>{' '}
        <span>{format.number(value / 100, { style: 'percent' })}</span>
        {progress.isSlow ? <span> {progress.slowText}</span> : null}
      </p>
      <progress {...progress.barProps} />
    </div>
  )
}

export function OwnMarkup() {
  const { texts } = useProgressTexts()
  const [value, setValue] = useState<number | undefined>(undefined)

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
      {value === undefined || value >= 100 ? null : (
        <Waiting label={texts.exporting} value={value} />
      )}
    </div>
  )
}

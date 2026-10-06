'use client'
import { Checkbox, Field } from '@kvirn-ui/react'
import { useState } from 'react'
import { useCheckboxTexts } from './texts.ts'

export function SelectAll() {
  const { texts, textLang } = useCheckboxTexts()
  const rows = [texts.rowOne, texts.rowTwo, texts.rowThree]
  const [selected, setSelected] = useState<readonly number[]>([0])
  const allSelected = selected.length === rows.length
  const someSelected = selected.length > 0 && !allSelected
  return (
    <div lang={textLang}>
      <Field.Root>
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onCheckedChange={(checked) => setSelected(checked ? rows.map((_, index) => index) : [])}
        />
        <Field.Label marker="none">{texts.selectAll}</Field.Label>
      </Field.Root>
      {rows.map((row, index) => (
        <Field.Root key={row}>
          <Checkbox
            checked={selected.includes(index)}
            onCheckedChange={(checked) =>
              setSelected((current) =>
                checked ? [...current, index] : current.filter((other) => other !== index),
              )
            }
          />
          <Field.Label marker="none">{row}</Field.Label>
        </Field.Root>
      ))}
    </div>
  )
}

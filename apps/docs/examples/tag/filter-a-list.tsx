'use client'
import { Checkbox, CheckboxGroup, Field, Heading, Tag, TagGroup, useAnnouncer } from '@kvirn/ui'
import { useState } from 'react'
import { useTagTexts } from './texts.ts'

type PermitType = 'extension' | 'garage' | 'fence'
const isPermitType = (value: string): value is PermitType =>
  value === 'extension' || value === 'garage' || value === 'fence'

export function FilterAList() {
  const { texts } = useTagTexts()
  const { announce } = useAnnouncer()
  const [types, setTypes] = useState<PermitType[]>(['garage'])

  const permitsFor = (chosen: PermitType[]) =>
    texts.permits.filter((permit) => chosen.length === 0 || chosen.includes(permit.type))
  const labelOf = (type: PermitType) => `${texts.typeName}: ${texts.types[type]}`

  // The group keeps only the last message, so one message says the change and the result count.
  const remove = (type: PermitType) => {
    const next = types.filter((chosen) => chosen !== type)
    setTypes(next)
    announce(texts.removedResultCount(labelOf(type), permitsFor(next).length))
  }

  return (
    <>
      <CheckboxGroup.Root
        name="type"
        value={types}
        onValueChange={(values) => {
          const next = values.filter(isPermitType)
          setTypes(next)
          announce(texts.resultCount(permitsFor(next).length))
        }}
      >
        <CheckboxGroup.Legend>{texts.typeLegend}</CheckboxGroup.Legend>
        {(['extension', 'garage', 'fence'] as const).map((type) => (
          <CheckboxGroup.Option key={type}>
            <Checkbox value={type} />
            <Field.Label>{texts.types[type]}</Field.Label>
          </CheckboxGroup.Option>
        ))}
      </CheckboxGroup.Root>
      <TagGroup.Root announceRemoval={false}>
        <TagGroup.Label>{texts.applied}</TagGroup.Label>
        <TagGroup.List>
          {types.map((type) => (
            <Tag.Root key={type}>
              <Tag.Remove label={labelOf(type)} onRemove={() => remove(type)}>
                {labelOf(type)}
              </Tag.Remove>
            </Tag.Root>
          ))}
        </TagGroup.List>
        <TagGroup.Empty>{texts.none}</TagGroup.Empty>
        <TagGroup.ClearAll
          onClear={() => {
            setTypes([])
            announce(texts.clearedResultCount(texts.permits.length))
          }}
        />
      </TagGroup.Root>
      <Heading as="h4">{texts.resultCount(permitsFor(types).length)}</Heading>
      <ul>
        {permitsFor(types).map((permit) => (
          <li key={permit.title}>{permit.title}</li>
        ))}
      </ul>
    </>
  )
}

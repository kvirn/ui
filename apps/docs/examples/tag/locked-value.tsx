'use client'
import { Button, Tag, TagGroup } from '@kvirn/ui'
import { useState } from 'react'
import { useTagTexts } from './texts.ts'

export function LockedValue() {
  const { texts } = useTagTexts()
  const [filters, setFilters] = useState([texts.day, texts.seats])
  return (
    <>
      <TagGroup.Root>
        <TagGroup.Label>{texts.yourSearch}</TagGroup.Label>
        <TagGroup.List>
          <Tag.Root>
            <Tag.Label>{texts.library}</Tag.Label>
          </Tag.Root>
          {filters.map((filter) => (
            <Tag.Root key={filter}>
              <Tag.Remove
                onRemove={() =>
                  setFilters((current) => current.filter((other) => other !== filter))
                }
              >
                {filter}
              </Tag.Remove>
            </Tag.Root>
          ))}
        </TagGroup.List>
      </TagGroup.Root>
      {/* Only so you can try the example again. */}
      <p>
        <Button onClick={() => setFilters([texts.day, texts.seats])}>{texts.startAgain}</Button>
      </p>
    </>
  )
}

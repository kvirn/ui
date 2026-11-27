'use client'
import { Button, Tag, TagGroup } from '@kvirn/ui'
import { useState } from 'react'
import { useTagTexts } from './texts.ts'

export function DefaultTag() {
  const { texts } = useTagTexts()
  const [filters, setFilters] = useState(texts.filters)
  return (
    <>
      <TagGroup.Root>
        <TagGroup.Label>{texts.applied}</TagGroup.Label>
        <TagGroup.List>
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
        <TagGroup.Empty>{texts.none}</TagGroup.Empty>
        <TagGroup.ClearAll onClear={() => setFilters([])} />
      </TagGroup.Root>
      {/* Only so you can try the example again. */}
      <p>
        <Button onClick={() => setFilters(texts.filters)}>{texts.startAgain}</Button>
      </p>
    </>
  )
}

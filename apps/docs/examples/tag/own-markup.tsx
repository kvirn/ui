'use client'
import { Button, useTagGroup } from '@kvirn/ui'
import { useState } from 'react'
import { useTagTexts } from './texts.ts'

export function OwnMarkupTags() {
  const { texts } = useTagTexts()
  const [filters, setFilters] = useState(texts.filters)
  const { labelId, labelRef, listRef, messages, prepareRemoval } = useTagGroup()
  return (
    <>
      <div className="kv-tag-group">
        <span id={labelId} ref={labelRef} className="kv-tag-group-label">
          {texts.applied}
        </span>
        {filters.length === 0 ? <p>{texts.none}</p> : null}
        {filters.length > 0 ? (
          <ul role="list" ref={listRef} aria-labelledby={labelId} className="kv-tag-group-list">
            {filters.map((filter) => (
              <li key={filter} className="kv-tag">
                <button
                  type="button"
                  data-kv-tag-remove=""
                  className="kv-tag-remove"
                  aria-label={messages.remove({ label: filter })}
                  onClick={(event) => {
                    prepareRemoval(event.currentTarget, filter)
                    setFilters((current) => current.filter((other) => other !== filter))
                  }}
                >
                  {filter}
                  <span className="kv-tag-remove-icon" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {/* Only so you can try the example again. */}
      <p>
        <Button onClick={() => setFilters(texts.filters)}>{texts.startAgain}</Button>
      </p>
    </>
  )
}

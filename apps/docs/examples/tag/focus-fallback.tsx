'use client'
import { Button, Tag, TagGroup } from '@kvirn/ui'
import { useRef, useState } from 'react'
import { useTagTexts } from './texts.ts'

export function FocusFallback() {
  const { texts } = useTagTexts()
  const [topics, setTopics] = useState(texts.topicNames)
  const followAllRef = useRef<HTMLButtonElement>(null)
  return (
    <>
      <TagGroup.Root focusFallback={() => followAllRef.current}>
        <TagGroup.Label>{texts.topics}</TagGroup.Label>
        <TagGroup.List>
          {topics.map((topic) => (
            <Tag.Root key={topic}>
              <Tag.Remove
                onRemove={() => setTopics((current) => current.filter((other) => other !== topic))}
              >
                {topic}
              </Tag.Remove>
            </Tag.Root>
          ))}
        </TagGroup.List>
        <TagGroup.Empty>{texts.noTopics}</TagGroup.Empty>
      </TagGroup.Root>
      <p>
        <Button ref={followAllRef} onClick={() => setTopics(texts.topicNames)}>
          {texts.followAll}
        </Button>
      </p>
    </>
  )
}

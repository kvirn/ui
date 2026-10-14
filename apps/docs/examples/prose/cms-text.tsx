'use client'
import { mergeProps, useProse } from '@kvirn-ui/react'
import type { CmsBlock } from './texts.ts'
import { useProseTexts } from './texts.ts'

function RichText({
  blocks,
  className,
}: {
  blocks: readonly CmsBlock[]
  className?: string | undefined
}) {
  const prose = useProse()
  return (
    <div {...mergeProps({ className }, prose.rootProps)}>
      {blocks.map((block) => {
        switch (block.type) {
          case 'heading':
            return <h2 key={`heading-${block.text}`}>{block.text}</h2>
          case 'paragraph':
            return <p key={`paragraph-${block.text}`}>{block.text}</p>
          case 'list':
            return (
              <ul key={`list-${block.items.join()}`}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )
        }
      })}
    </div>
  )
}

export function CmsText() {
  const { texts } = useProseTexts()
  return <RichText blocks={texts.cms.blocks} />
}

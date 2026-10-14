'use client'
import { Badge, Stack, VisuallyHidden } from '@kvirn-ui/react'
import { useBadgeTexts } from './texts.ts'

export function StatusInList() {
  const { texts } = useBadgeTexts()
  return (
    <Stack as="ul" className="kv-stack--gap-4">
      {texts.cases.map((item) => (
        <Stack as="li" key={item.title} className="kv-stack--gap-2">
          <span>{item.title}</span>
          <span>
            <VisuallyHidden>{texts.statusHidden}</VisuallyHidden>{' '}
            <Badge variant={item.variant}>{item.status}</Badge>
          </span>
        </Stack>
      ))}
    </Stack>
  )
}

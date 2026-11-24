'use client'
import { search } from '@kvirn/icons'
import { Button, Icon } from '@kvirn/ui'
import { useIconTexts } from './texts.ts'

export function ByImport() {
  const { texts } = useIconTexts()
  return (
    <Button>
      <Icon icon={search} />
      {texts.searchRegister}
    </Button>
  )
}

'use client'
import { search } from '@kvirn-ui/icons'
import { Button, Icon } from '@kvirn-ui/react'
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

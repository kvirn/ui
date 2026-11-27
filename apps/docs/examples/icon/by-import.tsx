'use client'
import { SearchIcon } from '@kvirn/icons/react'
import { Button } from '@kvirn/ui'
import { useIconTexts } from './texts.ts'

export function ByImport() {
  const { texts } = useIconTexts()
  return (
    <Button>
      <SearchIcon />
      {texts.searchRegister}
    </Button>
  )
}

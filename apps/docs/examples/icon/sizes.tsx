'use client'
import { info } from '@kvirn-ui/icons'
import { Icon } from '@kvirn-ui/react'
import { useIconTexts } from './texts.ts'

export function Sizes() {
  const { texts } = useIconTexts()
  return (
    <p>
      {texts.sizes} <Icon icon={info} size="16" /> <Icon icon={info} />{' '}
      <Icon icon={info} size="24" /> <Icon icon={info} size="32" /> <Icon icon={info} size="40" />
    </p>
  )
}

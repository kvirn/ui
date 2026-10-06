'use client'
import { Icon } from '@kvirn-ui/react'
import type { IconComponentProps } from '@kvirn-ui/react'
import { useIconTexts } from './texts.ts'

function HouseIcon({ ref, ...svgProps }: IconComponentProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...svgProps}
      ref={ref}
    >
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v10h12V10" />
    </svg>
  )
}

export function OwnComponent() {
  const { texts, textLang } = useIconTexts()
  return (
    <p lang={textLang}>
      <Icon icon={HouseIcon} /> {texts.house}
    </p>
  )
}

'use client'
import { Breadcrumb } from '@kvirn-ui/react'
import { useBreadcrumbTexts } from './texts.ts'

export function LongTrail() {
  const { texts, textLang } = useBreadcrumbTexts()
  return (
    <Breadcrumb.Root label={texts.longLabel} lang={textLang}>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#start">{texts.start}</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#services">{texts.services}</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#social">{texts.social}</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#home-care">{texts.homeCare}</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#home-care-help">{texts.homeCareHelp}</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Current>{texts.homeCareApply}</Breadcrumb.Current>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  )
}

'use client'
import { Breadcrumb } from '@kvirn-ui/react'
import { useBreadcrumbTexts } from './texts.ts'

export function DefaultBreadcrumb() {
  const { texts, textLang } = useBreadcrumbTexts()
  return (
    <Breadcrumb.Root lang={textLang}>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#start">{texts.start}</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#children">{texts.children}</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Current>{texts.preschool}</Breadcrumb.Current>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  )
}

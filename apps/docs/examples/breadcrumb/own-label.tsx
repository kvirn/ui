'use client'
import { Breadcrumb } from '@kvirn-ui/react'
import { useBreadcrumbTexts } from './texts.ts'

export function OwnLabel() {
  const { texts } = useBreadcrumbTexts()
  return (
    <Breadcrumb.Root label={texts.ownLabel}>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#start">{texts.start}</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#services">{texts.services}</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Current>{texts.homeCareFees}</Breadcrumb.Current>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  )
}

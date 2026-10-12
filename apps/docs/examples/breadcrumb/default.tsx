'use client'
import { Breadcrumb } from '@kvirn-ui/react'
import { useBreadcrumbTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultBreadcrumb() {
  const { texts, isFallback } = useBreadcrumbTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Breadcrumb.Root>
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
    </InEnglishWhenFallback>
  )
}

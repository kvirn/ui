'use client'
import { Link, useBreadcrumb } from '@kvirn-ui/react'
import { useBreadcrumbTexts } from './texts.ts'

export function OwnMarkup() {
  const { texts } = useBreadcrumbTexts()
  const breadcrumb = useBreadcrumb({ variant: 'slash', label: texts.ownMarkupLabel })
  return (
    <nav {...breadcrumb.rootProps}>
      <ol {...breadcrumb.listProps}>
        <li {...breadcrumb.itemProps}>
          <Link.Root href="#cases" className="kv-breadcrumb-link">
            {texts.cases}
          </Link.Root>
        </li>
        <li {...breadcrumb.itemProps}>
          <Link.Root href="#permits" className="kv-breadcrumb-link">
            {texts.permits}
          </Link.Root>
        </li>
        <li {...breadcrumb.itemProps}>
          <span {...breadcrumb.currentProps}>{texts.permitCase}</span>
        </li>
      </ol>
    </nav>
  )
}

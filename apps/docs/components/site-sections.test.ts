import { describe, expect, test } from 'vite-plus/test'
import { breadcrumbTrail, pagerPages, siteSections } from './site-sections.ts'

// Contract: docs/design/docs-shell-mega-menu.md §3 and §5 (pager order, breadcrumb trail).
const labelsAround = (pathname: string) => {
  const { previous, next } = pagerPages(siteSections, pathname)
  return [previous?.label, next?.label]
}

describe('pager', () => {
  test('Tabs sits between TableOfContents and Calendar, in menu order across groups', () => {
    expect(labelsAround('/components/tabs')).toEqual(['TableOfContents', 'Calendar'])
  })

  test('the first and the last component have only a next and only a previous page', () => {
    expect(labelsAround('/components/button')[0]).toBeUndefined()
    expect(labelsAround('/components/button')[1]).toBeDefined()
    expect(labelsAround('/components/table')[0]).toBeDefined()
    expect(labelsAround('/components/table')[1]).toBeUndefined()
  })

  test('Get started runs through its four pages and never leaves the section', () => {
    expect(labelsAround('/docs')).toEqual([undefined, 'KvirnProvider'])
    expect(labelsAround('/foundation/rendering')[1]).toBeUndefined()
  })

  test.each(['/components', '/components/wayfinding', '/content-types', '/patterns', '/nowhere'])(
    '%s has no pager',
    (pathname) => {
      expect(labelsAround(pathname)).toEqual([undefined, undefined])
    },
  )
})

describe('breadcrumb trail', () => {
  const labels = (pathname: string) =>
    breadcrumbTrail(siteSections, pathname).map((page) => page.label)

  test('a component is under its group page, which is under the section index', () => {
    expect(labels('/components/tabs')).toEqual(['Components', 'Wayfinding', 'Tabs'])
  })

  test('a Get started page has two items and the section index alone has one', () => {
    expect(labels('/foundation/kvirn-provider')).toEqual(['Get started', 'KvirnProvider'])
    expect(labels('/components')).toHaveLength(1)
  })

  test('a group without a page of its own is left out of the trail', () => {
    expect(labels('/content-types/subpage')).toEqual(['Content types', 'Subpage'])
  })

  test('a page in no section has no trail', () => {
    expect(labels('/nowhere')).toEqual([])
  })
})

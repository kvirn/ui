import { describe, expect, test } from 'vite-plus/test'
import { breadcrumbTrail, listedSections, pagerPages, siteSections } from './site-sections.ts'

// Contract: docs/design/docs-shell-mega-menu.md §3 and §5 (pager order, breadcrumb trail).
const labelsAround = (pathname: string) => {
  const { previous, next } = pagerPages(siteSections, pathname)
  return [previous?.label, next?.label]
}

describe('pager', () => {
  test('TopBar sits between Tabs and Calendar, in menu order across groups', () => {
    expect(labelsAround('/components/top-bar')).toEqual(['Tabs', 'Calendar'])
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

describe('hidden sections', () => {
  test('Patterns and Content types stay routable but are not listed in menus or search', () => {
    const listed = listedSections(siteSections).map((section) => section.id)
    expect(listed).not.toContain('patterns')
    expect(listed).not.toContain('content-types')
    expect(siteSections.map((section) => section.id)).toEqual(
      expect.arrayContaining(['patterns', 'content-types']),
    )
  })
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

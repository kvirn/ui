import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  sidebarLayoutContentAttributes,
  sidebarLayoutPartRows,
  sidebarLayoutRootAttributes,
  sidebarLayoutRootRows,
  sidebarLayoutSidebarAttributes,
  useSidebarLayoutHook,
} from '../content/sidebar-layout.api.ts'
import { DefaultSidebarLayout } from '../examples/sidebar-layout/default.tsx'
import { ServicePage } from '../examples/sidebar-layout/service-page.tsx'
import { SideInformation } from '../examples/sidebar-layout/side-information.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type SidebarLayoutExampleSources = Record<
  'default' | 'service-page' | 'side-information',
  string
>

const partRenders = (
  <>
    <code>&lt;div&gt;</code> with no role. It takes every attribute of a <code>&lt;div&gt;</code>{' '}
    and passes <code>ref</code> to it.
  </>
)

const parts: ApiPart[] = [
  {
    name: 'SidebarLayout.Root',
    renders: (
      <>
        {partRenders} Also exported as <code>SidebarLayoutRoot</code>. The default theme is
        described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: sidebarLayoutRootRows,
    attributes: sidebarLayoutRootAttributes,
  },
  {
    name: 'SidebarLayout.Sidebar',
    renders: (
      <>
        {partRenders} The side column from 64rem, stacked in DOM order below. Also exported as{' '}
        <code>SidebarLayoutSidebar</code>. A Sidebar outside a Root warns in development.
      </>
    ),
    props: sidebarLayoutPartRows,
    attributes: sidebarLayoutSidebarAttributes,
  },
  {
    name: 'SidebarLayout.Content',
    renders: (
      <>
        {partRenders} The content column. Never <code>&lt;main&gt;</code> by default, because a page
        has one. Also exported as <code>SidebarLayoutContent</code>. A Content outside a Root warns
        in development.
      </>
    ),
    props: sidebarLayoutPartRows,
    attributes: sidebarLayoutContentAttributes,
  },
]

export function SidebarLayoutPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: SidebarLayoutExampleSources
}) {
  return (
    <ComponentPage
      title="SidebarLayout"
      lead="It lays out a page with side navigation with no CSS of your own, and it adds no role, text or behaviour."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use SidebarLayout for a page that has a side column next to its content: a service page
            with navigation for its section, or an article with contact details beside it.
          </li>
          <li>
            Below 64rem the two parts are stacked in the order you wrote them, so a phone, a 400%
            zoom and a screen reader get the same order.
          </li>
          <li>
            Write the part that comes first at inline start first. There is no way to reorder them
            visually, so what you see is what a keyboard and a screen reader get.
          </li>
          <li>
            Not for a long navigation that would push the content far down on a phone: put it in a
            disclosure inside the sidebar (the Disclosure component is planned).
          </li>
          <li>
            Not for things of the same kind side by side: use{' '}
            <Link href="/components/columns">Columns</Link>. Not for one narrow column of text: use
            Container.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultSidebarLayout />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="service-page"
            title="A service page with navigation for its section"
            why="Pages in the same section, such as everything about preschool, link to each other from a side column. Render the Sidebar as a nav and name it, and mark the current page with aria-current."
            code={sources['service-page']}
            propsUsed={[
              { part: 'SidebarLayout.Root', prop: 'className' },
              { part: 'SidebarLayout.Sidebar', prop: 'as' },
            ]}
            note={
              <Note kind="reminder">
                A nav is a landmark and needs a name, in the page’s language. The Content isn’t{' '}
                <code>&lt;main&gt;</code>: a page has one, so choose it with <code>as</code> where
                it fits.
              </Note>
            }
          >
            <ServicePage />
          </UseCase>
          <UseCase
            id="side-information"
            title="Contact details beside the text"
            why="Information that belongs to the page but isn’t part of the text goes in a side column. Write the content first and the sidebar after it, so the content is at inline start and is read and focused first. Render the sidebar as an aside and name it."
            code={sources['side-information']}
            propsUsed={[{ part: 'SidebarLayout.Sidebar', prop: 'as' }]}
            note={
              <Note kind="tip">
                The side follows the DOM order, and it mirrors in right-to-left languages: the first
                part is at the right.
              </Note>
            }
          >
            <SideInformation />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { SidebarLayout, useSidebarLayout } from '@kvirn-ui/react'"
          parts={parts}
          hook={useSidebarLayoutHook}
        />
      }
    />
  )
}

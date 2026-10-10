import { LinkRoot } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  breadcrumbCurrentAttributes,
  breadcrumbItemAttributes,
  breadcrumbLinkAttributes,
  breadcrumbListAttributes,
  breadcrumbRootAttributes,
  breadcrumbRootRows,
  useBreadcrumbHook,
} from '../content/breadcrumb.api.ts'
import { DefaultBreadcrumb } from '../examples/breadcrumb/default.tsx'
import { LongTrail } from '../examples/breadcrumb/long-trail.tsx'
import { OwnLabel } from '../examples/breadcrumb/own-label.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type BreadcrumbExampleSources = Record<'default' | 'long-trail' | 'own-label', string>

const parts: ApiPart[] = [
  {
    name: 'Breadcrumb.Root',
    renders: (
      <>
        <code>&lt;nav&gt;</code>, the <code>navigation</code> landmark, named by the message{' '}
        <code>breadcrumb.label</code> or your <code>label</code>. It takes every attribute of a{' '}
        <code>&lt;nav&gt;</code> and passes <code>ref</code> to it. The default theme is described
        on <LinkRoot href="/foundation/theming">Theming</LinkRoot>.
      </>
    ),
    props: breadcrumbRootRows,
    attributes: breadcrumbRootAttributes,
  },
  {
    name: 'Breadcrumb.List',
    renders: (
      <>
        <code>&lt;ol&gt;</code> with the role <code>list</code>. It is ordered, because the sequence
        is the meaning.
      </>
    ),
    attributes: breadcrumbListAttributes,
  },
  {
    name: 'Breadcrumb.Item',
    renders: (
      <>
        <code>&lt;li&gt;</code> with the role <code>listitem</code>. It holds a{' '}
        <code>Breadcrumb.Link</code>, or the last item’s <code>Breadcrumb.Current</code>.
      </>
    ),
    attributes: breadcrumbItemAttributes,
  },
  {
    name: 'Breadcrumb.Link',
    renders: (
      <>
        <code>&lt;a href&gt;</code>: a thin wrapper over{' '}
        <LinkRoot href="/components/link">Link.Root</LinkRoot>, so it is rendered by the router link
        you register on the provider. It takes the same props and <code>ref</code> as{' '}
        <code>Link.Root</code>.
      </>
    ),
    attributes: breadcrumbLinkAttributes,
  },
  {
    name: 'Breadcrumb.Current',
    renders: (
      <>
        <code>&lt;span&gt;</code> with <code>aria-current=&quot;page&quot;</code>. The page you are
        on, as text: the last item, never a link.
      </>
    ),
    attributes: breadcrumbCurrentAttributes,
  },
]

export function BreadcrumbPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: BreadcrumbExampleSources
}) {
  return (
    <ComponentPage
      title="Breadcrumb"
      lead="A named landmark with the trail from the start page down to the page you are on, so a resident sees where they are and can go up a level. Every level is a link; the current page is text."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it at the top of a page that sits two or more levels below the start page: a topic
            page, a service page, an article.
          </li>
          <li>
            Put it before <code>&lt;main&gt;</code>, not in it, and give it a different name from
            any other <code>&lt;nav&gt;</code> on the page.
          </li>
          <li>
            List every level from the start page to the parent of the current page. It never
            collapses into “…”: a hidden level is a hidden way out, so a long trail wraps.
          </li>
          <li>
            Not for the main menu: use <LinkRoot href="/components/navigation">Navigation</LinkRoot>
            . Not for moving between pages of a list: use{' '}
            <LinkRoot href="/components/pagination">Pagination</LinkRoot>. Not on the start page,
            which has no level above it.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultBreadcrumb />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="long-trail"
            title="A page deep in the structure"
            why="A service page can sit five or six levels down. Write every level as a Breadcrumb.Link and keep the last as Breadcrumb.Current. The trail wraps onto more lines instead of hiding the middle, so the way up is always there, also at 320px width or at 400% zoom."
            code={sources['long-trail']}
            note={
              <Note kind="reminder">
                Name each link after the page’s title, as the page’s own heading says it: “Home
                care”, not “Click here” or “Level 3”. Mark no other item as the current page.
              </Note>
            }
          >
            <LongTrail />
          </UseCase>
          <UseCase
            id="own-label"
            title="A name for a page with another navigation"
            why="The landmark is named You are here, in five languages. When your page already has another navigation with that name, or your service uses other words, give the trail its own with label. A custom label is your own string, so set lang on the root if it differs from the page."
            code={sources['own-label']}
            propsUsed={[{ part: 'Breadcrumb.Root', prop: 'label' }]}
            note={
              <Note kind="recipe">
                Register your router’s link once on the provider and every Breadcrumb.Link is
                rendered by it, with no full page load. See{' '}
                <LinkRoot href="/foundation/kvirn-provider#next-js">
                  the Next.js setup on KvirnProvider
                </LinkRoot>
                .
              </Note>
            }
          >
            <OwnLabel />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} linkToStrings />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Breadcrumb, useBreadcrumb } from '@kvirn-ui/react'"
          parts={parts}
          hook={useBreadcrumbHook}
          strings={
            <StringsBlock
              namespace="breadcrumb"
              component="Breadcrumb"
              keys={[
                {
                  key: 'label',
                  meaning:
                    'The landmark’s accessible name, set as aria-label. It says what the trail is for.',
                },
              ]}
            />
          }
        />
      }
    />
  )
}

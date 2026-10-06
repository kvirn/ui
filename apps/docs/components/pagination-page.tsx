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
  paginationEllipsisAttributes,
  paginationEllipsisRows,
  paginationItemAttributes,
  paginationItemRows,
  paginationLinkAttributes,
  paginationLinkRows,
  paginationListAttributes,
  paginationListRows,
  paginationNextAttributes,
  paginationNextRows,
  paginationPreviousAttributes,
  paginationPreviousRows,
  paginationRootAttributes,
  paginationRootRows,
  paginationStatusAttributes,
  paginationStatusRows,
  usePaginationHook,
} from '../content/pagination.api.ts'
import { DefaultPagination } from '../examples/pagination/default.tsx'
import { FirstPagePagination } from '../examples/pagination/first-page.tsx'
import { NewsListPagination } from '../examples/pagination/news-list.tsx'
import { OwnWordsPagination } from '../examples/pagination/own-words.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type PaginationExampleSources = Record<
  'default' | 'news-list' | 'first-page' | 'own-words',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Pagination.Root',
    renders: (
      <>
        <code>&lt;nav&gt;</code>, the <code>navigation</code> landmark, named by the message{' '}
        <code>pagination.label</code> or your <code>label</code>. It takes every attribute of a{' '}
        <code>&lt;nav&gt;</code> and passes <code>ref</code> to it. The default theme is described
        on <LinkRoot href="/foundation/theming">Theming</LinkRoot>.
      </>
    ),
    props: paginationRootRows,
    attributes: paginationRootAttributes,
  },
  {
    name: 'Pagination.List',
    renders: (
      <>
        <code>&lt;ul&gt;</code> with the role <code>list</code>. Previous, the pages, the status and
        Next each go in a <code>Pagination.Item</code>.
      </>
    ),
    props: paginationListRows,
    attributes: paginationListAttributes,
  },
  {
    name: 'Pagination.Item',
    renders: (
      <>
        <code>&lt;li&gt;</code> with the role <code>listitem</code>. It holds one link, the gap or
        the status.
      </>
    ),
    props: paginationItemRows,
    attributes: paginationItemAttributes,
  },
  {
    name: 'Pagination.Link',
    renders: (
      <>
        <code>&lt;a href&gt;</code> for one page: a thin wrapper over{' '}
        <LinkRoot href="/components/link">Link.Root</LinkRoot>, so it is rendered by the router link
        you register on the provider. It takes the other props and <code>ref</code> of{' '}
        <code>Link.Root</code>, except <code>current</code>, which is a boolean here.
      </>
    ),
    props: paginationLinkRows,
    attributes: paginationLinkAttributes,
  },
  {
    name: 'Pagination.Previous',
    renders: (
      <>
        <code>&lt;a href&gt;</code> to the previous page, with the words from the message{' '}
        <code>pagination.previous</code>. It takes the other props and <code>ref</code> of{' '}
        <code>Link.Root</code>.
      </>
    ),
    props: paginationPreviousRows,
    attributes: paginationPreviousAttributes,
  },
  {
    name: 'Pagination.Next',
    renders: (
      <>
        <code>&lt;a href&gt;</code> to the next page, with the words from the message{' '}
        <code>pagination.next</code>. It takes the other props and <code>ref</code> of{' '}
        <code>Link.Root</code>.
      </>
    ),
    props: paginationNextRows,
    attributes: paginationNextAttributes,
  },
  {
    name: 'Pagination.Ellipsis',
    renders: (
      <>
        <code>&lt;span&gt;</code> with the text “…”, for a gap in the page numbers. It is not a link
        and not focusable.
      </>
    ),
    props: paginationEllipsisRows,
    attributes: paginationEllipsisAttributes,
  },
  {
    name: 'Pagination.Status',
    renders: (
      <>
        <code>&lt;span&gt;</code> with the text from <code>pagination.status</code>, such as “Page 2
        of 9”. The default theme shows it with Previous and Next instead of the page links below
        40rem.
      </>
    ),
    props: paginationStatusRows,
    attributes: paginationStatusAttributes,
  },
]

export function PaginationPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: PaginationExampleSources
}) {
  return (
    <ComponentPage
      title="Pagination"
      lead="A named landmark with a list of links for moving through a long list page by page. Every page is a URL, so Back, sharing and opening in a new tab work, and the current page is marked in words and shape, not colour alone."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it under a list that continues on other pages: news, search results, a register of
            cases.
          </li>
          <li>
            Every page is a link to its own address, a path or a query. If paging doesn’t change the
            address, it is not pagination.
          </li>
          <li>
            You decide which numbers to show: keep the first and last page and those next to the
            current one, with an ellipsis for each gap. Leave out Previous on the first page and
            Next on the last, never disable them.
          </li>
          <li>
            On a screen narrower than 40rem the theme shows only Previous, the status and Next, so
            always render <code>Pagination.Status</code> too.
          </li>
          <li>
            Not for steps in a form or a flow. Not for the sections of a site: use{' '}
            <LinkRoot href="/components/navigation">Navigation</LinkRoot>. Not for the way up the
            structure: use <LinkRoot href="/components/breadcrumb">Breadcrumb</LinkRoot>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultPagination />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="news-list"
            title="A news list with ten pages"
            why="With many pages, show the first and the last, and the pages around the current one, and put a Pagination.Ellipsis in each gap. The ellipsis is plain text in its own item: it is not a link and not a Tab stop. The status and Next still tell people where they are."
            code={sources['news-list']}
            propsUsed={[
              { part: 'Pagination.Link', prop: 'page' },
              { part: 'Pagination.Link', prop: 'current' },
              { part: 'Pagination.Status', prop: 'page' },
              { part: 'Pagination.Status', prop: 'total' },
            ]}
            note={
              <Note kind="tip">
                The current page stays a link, so it is a Tab stop and the address can be copied. It
                has aria-current="page", so a screen reader says “Page 5, current page” once, and
                the digit it shows is in the name.
              </Note>
            }
          >
            <NewsListPagination />
          </UseCase>
          <UseCase
            id="first-page"
            title="The first page of a short list"
            why="On the first page there is no page before, so leave Previous out instead of disabling it: a disabled link is not a thing. Do the same with Next on the last page. With three pages there is nothing to leave a gap for."
            code={sources['first-page']}
            propsUsed={[{ part: 'Pagination.Link', prop: 'current' }]}
            note={
              <Note kind="reminder">
                Mark exactly one page as <code>current</code>, and list the pages in order with
                consecutive numbers.
              </Note>
            }
          >
            <FirstPagePagination />
          </UseCase>
          <UseCase
            id="own-words"
            title="Your own words for the controls"
            why="Previous, Next and the status come from the library’s messages in six languages. To use other words, pass children, or override the message with messages on the part or the provider. Your own text is yours to translate, so set lang when it differs from the page."
            code={sources['own-words']}
            propsUsed={[
              { part: 'Pagination.Previous', prop: 'children' },
              { part: 'Pagination.Next', prop: 'children' },
              { part: 'Pagination.Status', prop: 'children' },
            ]}
            note={
              <Note kind="recipe">
                Register your router’s link once on the provider and every link here is rendered by
                it, with no full page load. See{' '}
                <LinkRoot href="/foundation/kvirn-provider#next-js">
                  the Next.js setup on KvirnProvider
                </LinkRoot>
                .
              </Note>
            }
          >
            <OwnWordsPagination />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} linkToStrings />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Pagination, usePagination } from '@kvirn-ui/react'"
          parts={parts}
          hook={usePaginationHook}
          strings={
            <StringsBlock
              namespace="pagination"
              component="Pagination"
              keys={[
                {
                  key: 'label',
                  meaning: 'The landmark’s accessible name, set as aria-label.',
                },
                {
                  key: 'previous',
                  meaning: 'The visible text of the Previous link.',
                },
                {
                  key: 'next',
                  meaning: 'The visible text of the Next link.',
                },
                {
                  key: 'status',
                  meaning:
                    'The status shown on a narrow screen instead of the page links, and read as text.',
                  values: { page: 2, total: 9 },
                },
                {
                  key: 'page',
                  meaning: 'The name of a page link. The visible number stays in the name.',
                  values: { page: 2 },
                },
              ]}
            />
          }
        />
      }
    />
  )
}

import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import { apiHookPart } from './api-ids.ts'
import { CodeBlock } from './code-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import { useRouteFocusRows } from '../content/route-focus.api.ts'
import { ChangePage } from '../examples/route-focus/default.tsx'
import { HashChange } from '../examples/route-focus/hash-change.tsx'
import type { Contract } from '../lib/contract-parser.ts'

const routeFocusOptions = apiHookPart('useRouteFocus', 'options')

export type RouteFocusExampleSources = Record<'default' | 'hash-change', string>

const nextRecipe = `'use client'
import { useRouteFocus } from '@kvirn-ui/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRef } from 'react'

export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const search = useSearchParams().toString()
  const mainRef = useRef<HTMLElement>(null)
  useRouteFocus({ key: search === '' ? pathname : \`\${pathname}?\${search}\`, containerRef: mainRef })
  return <main ref={mainRef}>{children}</main>
}`

const tanStackRecipe = `function Root() {
  const key = useRouterState({
    select: (state) => state.location.pathname + state.location.searchStr,
  })
  const mainRef = useRef<HTMLElement>(null)
  useRouteFocus({ key, containerRef: mainRef, announce: true })
  return <main ref={mainRef}><Outlet /></main>
}`

export function RouteFocusPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: RouteFocusExampleSources
}) {
  return (
    <ComponentPage
      title="Route focus"
      status="in-progress"
      whenToUse={
        <ul>
          <li>
            Use it in a single-page app, where following a link changes the page without a reload.
          </li>
          <li>Call it once, in the layout that holds every page, with the router’s location.</li>
          <li>Give each page one h1 inside that layout. That is the element that gets focus.</li>
          <li>
            Not for the first load, or a link to a section on the same page: it does nothing there.
            To jump past the header, use a <Link href="/components/skip-link">SkipLink</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <ChangePage />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="after-a-link"
            title="After the user follows a link"
            why="Follow a link and the page changes, but focus stays on the link, or on nothing if the link is gone. The hook moves focus to the title, and the next Tab continues from there."
            code={sources['default']}
            propsUsed={[
              { part: routeFocusOptions, label: 'useRouteFocus', prop: 'key' },
              { part: routeFocusOptions, label: 'useRouteFocus', prop: 'containerRef' },
              { part: routeFocusOptions, label: 'useRouteFocus', prop: 'selector' },
            ]}
            note={
              <Note kind="recipe" more={<CodeBlock code={nextRecipe} />}>
                In Next.js, build the key from the pathname and the search in a client wrapper in
                the root layout. Next.js announces routes itself, so leave announce off.
              </Note>
            }
          >
            <ChangePage />
          </UseCase>
          <UseCase
            id="hash-change"
            title="A link to a section on the same page"
            why="Jumping to a section isn’t a new page, so focus should stay where it is. Leave the hash out of the key: the hook then ignores it."
            code={sources['hash-change']}
            propsUsed={[{ part: routeFocusOptions, label: 'useRouteFocus', prop: 'key' }]}
            note={
              <Note kind="recipe" more={<CodeBlock code={tanStackRecipe} />}>
                TanStack Router has no route announcer: set announce, and the page’s title is also
                said in the live region. Update document.title before the key changes.
              </Note>
            }
          >
            <HashChange />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { useRouteFocus } from '@kvirn-ui/react'"
          parts={[]}
          hook={{
            name: 'useRouteFocus',
            intro: 'Returns nothing: call it once, in the layout.',
            options: useRouteFocusRows,
          }}
          strings={
            <StringsBlock
              namespace="routeFocus"
              component="useRouteFocus"
              keys={[
                {
                  key: 'navigated',
                  meaning: 'Announced after a navigation when announce is on.',
                  values: { title: '{title}' },
                },
              ]}
            />
          }
        />
      }
    />
  )
}

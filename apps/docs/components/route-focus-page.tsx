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
import { AnnouncedPage } from '../examples/route-focus/announce.tsx'
import { ChangePage } from '../examples/route-focus/default.tsx'
import { HashChange } from '../examples/route-focus/hash-change.tsx'
import { SearchAsYouType } from '../examples/route-focus/search.tsx'
import type { Contract } from '../lib/contract-parser.ts'

const routeFocusOptions = apiHookPart('useRouteFocus', 'options')

export type RouteFocusExampleSources = Record<
  'default' | 'hash-change' | 'search' | 'announce',
  string
>

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
      lead="It renders nothing. It does nothing on the first load, when only the hash changes, or while someone is typing in a field."
      whenToUse={
        <ul>
          <li>
            Use it in a single-page app, where following a link changes the page without loading it
            again. Without it focus (the part of the page the keyboard is acting on) stays on the
            link, which may be gone.
          </li>
          <li>
            Call it once, in the layout that holds every page, with the router’s location as the
            key: the path and the search, never the hash.
          </li>
          <li>Give each page one h1 inside that layout. That is the element that gets focus.</li>
          <li>
            Not for the first load, or a link to a section on the same page: it does nothing there.
            To jump past the header, use a <Link href="/components/skip-link">SkipLink</Link>.
          </li>
          <li>
            Not for a step in a form on one page: use the <code>moveOn</code> option of{' '}
            <Link href="/components/focus">Focus</Link>.
          </li>
        </ul>
      }
      example={
        <>
          <ExampleFrame headingId="example" code={sources['default']}>
            <ChangePage />
          </ExampleFrame>
          <Note kind="recipe" more={<CodeBlock code={nextRecipe} />}>
            In Next.js, build the key from the pathname and the search in a client wrapper in the
            root layout.{' '}
            <Link href="https://nextjs.org/docs/architecture/accessibility">
              Next.js announces routes itself
            </Link>
            , so leave announce off.
          </Note>
        </>
      }
      useCases={
        <>
          <UseCase
            id="hash-change"
            title="A link to a section on the same page"
            why="Jumping to a section isn’t a new page, so focus should stay where it is. Leave the hash out of the key and the hook ignores it. Press “To services” and focus moves to the title; press “Jump to the details” and it stays on the button."
            code={sources['hash-change']}
            propsUsed={[{ part: routeFocusOptions, label: 'useRouteFocus', prop: 'key' }]}
            note={
              <Note kind="recipe" more={<CodeBlock code={tanStackRecipe} />}>
                In TanStack Router, build the key from the path and the search, as below. If your
                router does not announce route changes, set announce: the page’s title is then also
                said in the live region. Update document.title before the key changes.
              </Note>
            }
          >
            <HashChange />
          </UseCase>
          <UseCase
            id="search-as-you-type"
            title="A search that changes the address as you type"
            why="Some pages put the search in the address, so a result can be shared. Every keystroke then changes the key. The hook never takes focus from a text field, so the cursor stays where the visitor is typing."
            code={sources['search']}
            propsUsed={[{ part: routeFocusOptions, label: 'useRouteFocus', prop: 'key' }]}
          >
            <SearchAsYouType />
          </UseCase>
          <UseCase
            id="announce"
            title="A router that doesn’t say the new page aloud"
            why="With announce on, a screen reader user also hears that the page changed, in your own words if you pass messages. Use it only where the router has no announcer of its own. Press “To services” and read the line below."
            code={sources['announce']}
            propsUsed={[
              { part: routeFocusOptions, label: 'useRouteFocus', prop: 'announce' },
              { part: routeFocusOptions, label: 'useRouteFocus', prop: 'messages' },
            ]}
            note={
              <Note kind="reminder">
                Give every page a title that names it, and set it before the key changes. The hook
                says the title but doesn’t set it (2.4.2 Page Titled).
              </Note>
            }
          >
            <AnnouncedPage />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          linkToStrings
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Keep <code>scroll-padding-top</code> above a sticky header, so it doesn’t cover the
                title that gets focus (2.4.11 Focus Not Obscured (Minimum)).
              </Note>
            ),
            focus: (
              <Note kind="tip">
                On Back and Forward the hook leaves focus alone while the browser restores the
                scroll position, so someone going back does not land on the title. The contract
                lists this as still to be confirmed. With <code>history.scrollRestoration</code> set
                to <code>manual</code> the hook moves focus then too.
              </Note>
            ),
          }}
        />
      }
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

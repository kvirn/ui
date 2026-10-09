import { LinkRoot } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { CodeBlock } from './code-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  navigationItemAttributes,
  navigationLabelAttributes,
  navigationListAttributes,
  navigationRootAttributes,
  navigationRootRows,
  useNavigationHook,
} from '../content/navigation.api.ts'
import { CollapsibleGroup } from '../examples/navigation/collapsible-group.tsx'
import { DefaultNavigation } from '../examples/navigation/default.tsx'
import { GroupLabels } from '../examples/navigation/group-labels.tsx'
import { HorizontalNavigation } from '../examples/navigation/horizontal.tsx'
import { PageNotListed } from '../examples/navigation/page-not-listed.tsx'
import { TwoLevels } from '../examples/navigation/two-levels.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type NavigationExampleSources = Record<
  | 'default'
  | 'two-levels'
  | 'horizontal'
  | 'page-not-listed'
  | 'collapsible-group'
  | 'group-labels',
  string
>

const collapsibleCode = `<Button aria-expanded={isOpen} aria-controls={groupId} onClick={toggle}>
  {permitTypes}
</Button>
<Navigation.List id={groupId} hidden={!isOpen}>…</Navigation.List>`

const parts: ApiPart[] = [
  {
    name: 'Navigation.Root',
    renders: (
      <>
        <code>&lt;nav&gt;</code>, the <code>navigation</code> landmark. It takes every attribute of
        a <code>&lt;nav&gt;</code> and passes <code>ref</code> to it. The default theme is described
        on <LinkRoot href="/foundation/theming">Theming</LinkRoot>.
      </>
    ),
    props: navigationRootRows,
    attributes: navigationRootAttributes,
  },
  {
    name: 'Navigation.List',
    renders: (
      <>
        <code>&lt;ul&gt;</code> with the role <code>list</code>. Put another one inside a{' '}
        <code>Navigation.Item</code> for a second level.
      </>
    ),
    attributes: navigationListAttributes,
  },
  {
    name: 'Navigation.Item',
    renders: (
      <>
        <code>&lt;li&gt;</code> with the role <code>listitem</code>. It holds a{' '}
        <LinkRoot href="/components/link">Link</LinkRoot> and, optionally, a nested{' '}
        <code>Navigation.List</code>.
      </>
    ),
    attributes: navigationItemAttributes,
  },
  {
    name: 'Navigation.Label',
    renders: (
      <>
        <code>&lt;span&gt;</code> with plain text, in the <code>Navigation.Item</code> next to the
        nested <code>Navigation.List</code> it names. It is not a heading and not a link: it has no
        role, is never a Tab stop and is not in the list of headings. Without a nested list in the
        same item it names nothing, and a development warning says so (
        <code>navigation-label-without-list</code>; outside any item,{' '}
        <code>navigation-label-outside-item</code>).
      </>
    ),
    attributes: navigationLabelAttributes,
  },
]

export function NavigationPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: NavigationExampleSources
}) {
  return (
    <ComponentPage
      title="Navigation"
      lead="A named landmark around a list of links to pages, with the current page marked and an optional second level. It adds no keys of its own: every link is a plain Tab stop."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it for the links that move people between the pages of a service or a site: a main
            menu, a section menu, or a menu beside a long guide.
          </li>
          <li>Give every navigation a name, and a different name when a page has more than one.</li>
          <li>Keep to two levels on pages for residents. A staff or CMS sidebar can go deeper.</li>
          <li>
            Not for switching content on the same page: use{' '}
            <LinkRoot href="/components/tabs">Tabs</LinkRoot>. Not for the headings of one long
            page: use <LinkRoot href="/components/table-of-contents">TableOfContents</LinkRoot>.
          </li>
          <li>
            Not for a menu with flyouts or one that opens and closes by itself: that is
            NavigationMenu, which is planned.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultNavigation />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="two-levels"
            title="A section with a second level"
            why="A section has pages under it. Put a second Navigation.List inside the item they belong to: the lists nest natively, so a screen reader announces the level. Mark only the page you are on, never its parent."
            code={sources['two-levels']}
            note={
              <Note kind="tip">
                The parent of the current page is drawn as a quiet bold trail, but it is not
                announced. The nesting of the lists tells screen reader users where they are.
              </Note>
            }
          >
            <TwoLevels />
          </UseCase>
          <UseCase
            id="horizontal"
            title="A row of sections at the top"
            why="Add kv-navigation--horizontal to the root to lay the top level out as a row that wraps. It is a look: the roles, the names and the keys are the same as in a column, and the links stay in reading order."
            code={sources['horizontal']}
          >
            <HorizontalNavigation />
          </UseCase>
          <UseCase
            id="page-not-listed"
            title="When the page isn’t in the navigation"
            why='On a page the menu doesn’t list, such as one application, put current on the deepest item that is shown. It sets aria-current="true", and the menu still has exactly one current link.'
            code={sources['page-not-listed']}
            note={
              <Note kind="reminder">
                Mark exactly one link per navigation, and never an ancestor of a listed page. A
                development warning fires when two links are marked.
              </Note>
            }
          >
            <PageNotListed />
          </UseCase>
          <UseCase
            id="collapsible-group"
            title="A group that opens and closes"
            why="Navigation has no toggle of its own. Render the group with hidden and open it from a Button with aria-expanded and aria-controls. A hidden group’s links leave the Tab order and the accessibility tree."
            code={sources['collapsible-group']}
            note={
              <Note kind="recipe" more={<CodeBlock code={collapsibleCode} />}>
                Hide the group, never unmount it, so the button’s aria-controls still points at it.
              </Note>
            }
          >
            <CollapsibleGroup />
          </UseCase>
          <UseCase
            id="group-labels"
            title="Links grouped under labels"
            why="A staff sidebar groups its links under names such as Permits and Services. Put a Navigation.Label in each item, next to its nested list: the list is named by it, so a screen reader says “Permits, list, 2 items”. The label is plain text, not a heading and not a link. The name is set when the page hydrates, so it is not in the server HTML."
            code={sources['group-labels']}
          >
            <GroupLabels />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Navigation, useNavigation } from '@kvirn-ui/react'"
          parts={parts}
          hook={useNavigationHook}
        />
      }
    />
  )
}

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
  navigationLabelRows,
  navigationListAttributes,
  navigationListRows,
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
    props: navigationListRows,
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
        same item it names nothing, and a development warning says so. A label outside any item gets
        a warning too.
      </>
    ),
    props: navigationLabelRows,
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
      lead="Every link is a plain Tab stop, in the order you write them, so a keyboard user has no new keys to learn."
      whenToUse={
        <ul>
          <li>
            Use it for the links that move people between the pages of a service or a site: a main
            menu, a section menu, or a menu beside a long guide.
          </li>
          <li>
            Give every navigation a name, and a different name when a page has more than one. A
            screen reader lists the page’s landmarks (labelled regions such as a navigation), and
            the name is how people tell two navigations apart.
          </li>
          <li>
            Keep it in the same place and the same order on every page, so people find it where they
            expect it (3.2.3 Consistent Navigation, AA).
          </li>
          <li>
            Keep to two levels on pages for residents. A sidebar for staff, or one from a content
            management system, can go deeper.
          </li>
          <li>
            Not for switching content on the same page: use{' '}
            <LinkRoot href="/components/tabs">Tabs</LinkRoot>. Not for the headings of one long
            page: use <LinkRoot href="/components/table-of-contents">TableOfContents</LinkRoot>.
          </li>
          <li>
            Not for a menu with flyouts, or one that opens its own lists: see the{' '}
            <LinkRoot href="/patterns/main-menu">Main menu</LinkRoot> pattern. Navigation has no
            flyouts and no toggle of its own. You can open and close a group yourself, as in “A
            group that opens and closes” below.
          </li>
        </ul>
      }
      example={
        <>
          <ExampleFrame headingId="example" code={sources['default']}>
            <DefaultNavigation />
          </ExampleFrame>
          <Note kind="reminder">
            Write link text that says where the link goes, such as “Apply for a parking permit”,
            never “click here” (2.4.4 Link Purpose (In Context), A).
          </Note>
        </>
      }
      useCases={
        <>
          <UseCase
            id="two-levels"
            title="A section with a second level"
            why="A section has pages under it. Put a second Navigation.List inside the item they belong to. The lists nest as ordinary HTML lists, so a screen reader tells people which level they are on. Mark only the page you are on as current, never its parent."
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
            why="Add the class kv-navigation--horizontal to the root to lay the top level out as a row that wraps. It changes the look only. The roles, the names and the keys are the same as in a column, and the links stay in reading order. A row has one level: a nested list stays a column under its item."
            code={sources['horizontal']}
          >
            <HorizontalNavigation />
          </UseCase>
          <UseCase
            id="page-not-listed"
            title="When the page isn’t in the navigation"
            why="Some pages are not in the menu, such as one application. Put current, with no value, on the deepest item the menu does show. It sets aria-current to true, so the menu still has exactly one current link."
            code={sources['page-not-listed']}
            note={
              <Note kind="reminder">
                Mark exactly one link per navigation, and never an ancestor of a listed page. Two
                current links confuse a screen reader user, and a development warning fires (4.1.2
                Name, Role, Value, A).
              </Note>
            }
          >
            <PageNotListed />
          </UseCase>
          <UseCase
            id="collapsible-group"
            title="A group that opens and closes"
            why="Navigation has no toggle of its own. Render the group with hidden and open it from a Button with aria-expanded and aria-controls. The links of a hidden group leave the Tab order, so keyboard users skip them until the group is open. Never put current on a link inside a hidden group."
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
            why="A staff sidebar groups its links under names such as Permits and Services. Put a Navigation.Label in each item, next to its nested list. The list takes the label as its name, so people using a screen reader hear which group they are in. The label is plain text, not a heading and not a link. The browser adds the name after the page loads, so it is not in the HTML the server sends."
            code={sources['group-labels']}
          >
            <GroupLabels />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Give every navigation a name, and a different one on each. A screen reader user
                picks a landmark by its name. Where a visible heading exists, point{' '}
                <code>aria-labelledby</code> at it. A development warning fires if a name is missing
                or used twice (2.4.1 Bypass Blocks, A; 2.4.6 Headings and Labels, AA).
              </Note>
            ),
            'known-issues': (
              <Note kind="tip">
                Check each item against your own site. What applies belongs in your accessibility
                statement, with the workaround. The Web Accessibility Directive requires public
                bodies to publish one.
              </Note>
            ),
          }}
        />
      }
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

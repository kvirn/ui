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
  tabsListAttributes,
  tabsPanelAttributes,
  tabsPanelRows,
  tabsRootAttributes,
  tabsRootRows,
  tabsTabAttributes,
  tabsTabRows,
  useTabsHook,
} from '../content/tabs.api.ts'
import { ControlledTabs } from '../examples/tabs/controlled.tsx'
import { DefaultTabs } from '../examples/tabs/default.tsx'
import { DisabledTab } from '../examples/tabs/disabled-tab.tsx'
import { FocusablePanel } from '../examples/tabs/focusable-panel.tsx'
import { ManualActivation } from '../examples/tabs/manual-activation.tsx'
import { VerticalTabs } from '../examples/tabs/vertical.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type TabsExampleSources = Record<
  'default' | 'manual-activation' | 'vertical' | 'disabled-tab' | 'controlled' | 'focusable-panel',
  string
>

const lazyPanelCode = `<Tabs.Root value={value} onValueChange={setValue}>
  <Tabs.Panel value="history">{value === 'history' && <History />}</Tabs.Panel>
</Tabs.Root>`

const parts: ApiPart[] = [
  {
    name: 'Tabs.Root',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role: a plain container for the list and the panels. It
        owns the selected value, takes every attribute of a <code>&lt;div&gt;</code> and passes{' '}
        <code>ref</code> to it. The default theme is described on{' '}
        <LinkRoot href="/foundation/theming">Theming</LinkRoot>.
      </>
    ),
    props: tabsRootRows,
    attributes: tabsRootAttributes,
  },
  {
    name: 'Tabs.List',
    renders: (
      <>
        <code>&lt;div&gt;</code> with the role <code>tablist</code>. It owns the arrow keys, Home
        and End. Name it with <code>aria-label</code> or <code>aria-labelledby</code>.
      </>
    ),
    attributes: tabsListAttributes,
  },
  {
    name: 'Tabs.Tab',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code> with the role <code>tab</code>. Its name
        is its text.
      </>
    ),
    props: tabsTabRows,
    attributes: tabsTabAttributes,
  },
  {
    name: 'Tabs.Panel',
    renders: (
      <>
        <code>&lt;div&gt;</code> with the role <code>tabpanel</code>, named by its tab. Every panel
        is rendered, and the ones that aren’t selected are <code>hidden</code>.
      </>
    ),
    props: tabsPanelRows,
    attributes: tabsPanelAttributes,
  },
]

export function TabsPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: TabsExampleSources
}) {
  return (
    <ComponentPage
      title="Tabs"
      lead="Tabs show one panel of content at a time, with a list of tabs to switch between them. Keyboard users pass the list with one Tab press and move between the tabs with the arrow keys."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use tabs when one page holds a few parts of the same thing, such as the details,
            documents and history of a case, and people need one part at a time.
          </li>
          <li>
            Keep the labels short and in the same register, and use two to five tabs. Content that
            people must read together doesn’t belong in tabs.
          </li>
          <li>
            Not for going to another page: use{' '}
            <LinkRoot href="/components/navigation">Navigation</LinkRoot> with{' '}
            <code>kv-navigation--horizontal</code>. A tab never changes the URL.
          </li>
          <li>
            Not for showing and hiding one block of text: use a disclosure. Don’t put interactive
            content, such as a close button, inside a tab.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultTabs />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="manual-activation"
            title="Panels that are slow to show"
            why="With the default, the arrow keys select the tab they move to, and its panel shows at once. If showing a panel loads data or is heavy, arrowing through the tabs would trigger it for every tab. Use manual activation: the arrows move focus, and Enter or Space selects."
            code={sources['manual-activation']}
            propsUsed={[{ part: 'Tabs.Root', prop: 'activationMode' }]}
            note={
              <Note kind="recipe" more={<CodeBlock code={lazyPanelCode} />}>
                Every panel stays in the page, so render a heavy panel’s content only while it is
                selected.
              </Note>
            }
          >
            <ManualActivation />
          </UseCase>
          <UseCase
            id="vertical"
            title="A column of tabs beside the content"
            why="Use it when there are many tabs with short names, such as the sections of an application. The arrow keys become Down and Up, and the list gets aria-orientation."
            code={sources['vertical']}
            propsUsed={[{ part: 'Tabs.Root', prop: 'orientation' }]}
          >
            <VerticalTabs />
          </UseCase>
          <UseCase
            id="disabled-tab"
            title="A tab that isn’t available yet"
            why={
              <>
                A tab can’t be used until something has happened. It stays in the Tab order and is
                read as unavailable, so people can find it. Link the reason to it with{' '}
                <code>aria-describedby</code>.
              </>
            }
            code={sources['disabled-tab']}
            propsUsed={[{ part: 'Tabs.Tab', prop: 'disabled' }]}
            note={
              <Note kind="reminder">
                Disable a tab sparingly, and say why in text people can read, as in{' '}
                <LinkRoot href="#what-you-need-to-do">What you need to do</LinkRoot>.
              </Note>
            }
          >
            <DisabledTab />
          </UseCase>
          <UseCase
            id="controlled"
            title="Choosing the tab from your own code"
            why="Use it when something else on the page must select a tab or read which one is selected. You hold the value and change it from onValueChange, which only reports what the user did."
            code={sources['controlled']}
            propsUsed={[
              { part: 'Tabs.Root', prop: 'value' },
              { part: 'Tabs.Root', prop: 'onValueChange' },
            ]}
            note={
              <Note kind="tip">
                Tabs never change the URL, so Back leaves the page. If each part needs its own
                address, use <LinkRoot href="/components/navigation">Navigation</LinkRoot>.
              </Note>
            }
          >
            <ControlledTabs />
          </UseCase>
          <UseCase
            id="focusable-panel"
            title="A panel that starts with a link or a field"
            why="A panel has tabindex 0 so keyboard users can reach one that holds only text. When its first content is focusable, pass tabIndex -1 so Tab goes straight to it and the panel isn’t an extra stop."
            code={sources['focusable-panel']}
            propsUsed={[{ part: 'Tabs.Panel', prop: 'tabIndex' }]}
          >
            <FocusablePanel />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Tabs, useTabs } from '@kvirn-ui/react'"
          parts={parts}
          hook={useTabsHook}
        />
      }
    />
  )
}

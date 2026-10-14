import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { toggleAttributes, toggleRows, useToggleHook } from '../content/toggle.api.ts'
import { DefaultToggle } from '../examples/toggle/default.tsx'
import { DisabledWithReason } from '../examples/toggle/disabled-with-reason.tsx'
import { FilterList } from '../examples/toggle/filter-list.tsx'
import { IconOnly } from '../examples/toggle/icon-only.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type ToggleExampleSources = Record<
  'default' | 'filter-list' | 'icon-only' | 'disabled-with-reason',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Toggle',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot; aria-pressed&gt;</code> with the role{' '}
        <code>button</code>. It takes every attribute of a <code>&lt;button&gt;</code> except{' '}
        <code>type</code>, <code>aria-pressed</code> and <code>aria-disabled</code>, and passes{' '}
        <code>ref</code> to it. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: toggleRows,
    attributes: toggleAttributes,
  },
]

export function TogglePage({
  contract,
  sources,
}: {
  contract: Contract
  sources: ToggleExampleSources
}) {
  return (
    <ComponentPage
      title="Toggle"
      lead="Use it for a choice with a direct, visible effect, such as showing only unread messages."
      status="alpha-candidate"
      pattern="APG Button (toggle button)"
      whenToUse={
        <ul>
          <li>
            Use a toggle for a choice that changes what the user sees right away: a filter, bold
            text, a map layer.
          </li>
          <li>
            Give it a name that stays the same when it switches: “Show only unread”, never “Show
            all” when it is on.
          </li>
          <li>
            Not for an answer in a form: use a <Link href="/components/checkbox">Checkbox</Link> or
            a radio group. Not for a setting that is saved at once: use a{' '}
            <Link href="/components/switch">Switch</Link>.
          </li>
          <li>
            Not for an action that happens once: use a <Link href="/components/button">Button</Link>
            . For a row of toggles that belong together, put them in a{' '}
            <Link href="/components/toolbar">Toolbar</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultToggle />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="filter-list"
            title="A filter on a list"
            why={
              <>
                The choice changes the page at once, so you keep the state yourself: pass{' '}
                <code>pressed</code> and update it in <code>onPressedChange</code>. That callback
                only reports the new value, so with <code>pressed</code> set the toggle changes only
                when you change it.
              </>
            }
            code={sources['filter-list']}
            propsUsed={[
              { part: 'Toggle', prop: 'pressed' },
              { part: 'Toggle', prop: 'onPressedChange' },
            ]}
            note={
              <Note kind="reminder">
                When a toggle changes a list, show how many results are left in a status message
                (4.1.3 Status Messages). The count in this example is an <code>output</code> element
                that is on the page from the start, so a screen reader announces the change.
              </Note>
            }
          >
            <FilterList />
          </UseCase>
          <UseCase
            id="icon-only"
            title="A toggle with only an icon"
            why={
              <>
                Use it where there is room for an icon and not a word, such as showing a password.
                The name comes from an <code>aria-label</code> you take from your own translations,
                and it stays the same when the toggle switches.
              </>
            }
            code={sources['icon-only']}
            propsUsed={[{ part: 'Toggle', prop: 'pressed' }]}
            note={
              <Note kind="reminder">
                Don’t change the label when the state changes: a screen reader reports the state
                from <code>aria-pressed</code>. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <IconOnly />
          </UseCase>
          <UseCase
            id="disabled-with-reason"
            title="Disabled with a reason"
            why={
              <>
                You can’t avoid disabling the toggle, for example when there is nothing to filter.
                Keep it in the Tab order and link the reason to it with{' '}
                <code>aria-describedby</code>, so people using a keyboard or a screen reader
                (software that reads the screen aloud) find it and learn why. It still says whether
                it is on.
              </>
            }
            code={sources['disabled-with-reason']}
            propsUsed={[
              { part: 'Toggle', prop: 'disabled' },
              { part: 'Toggle', prop: 'focusableWhenDisabled' },
            ]}
          >
            <DisabledWithReason />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'visual-and-modes': (
              <Note kind="reminder">
                If you restyle the pressed state, don’t rely on colour alone. Change the fill, the
                icon or the label as well (1.4.1 Use of Color).
              </Note>
            ),
            'known-issues': (
              <Note kind="tip">
                If an issue here affects your service, list it in your accessibility statement with
                its workaround.
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Toggle, useToggle } from '@kvirn-ui/react'"
          parts={parts}
          hook={useToggleHook}
        />
      }
    />
  )
}

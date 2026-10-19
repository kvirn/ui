import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { apiHookPart } from './api-ids.ts'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { toggleAttributes, toggleRows, useToggleHook } from '../content/toggle.api.ts'
import { CompareLimit } from '../examples/toggle/compare-limit.tsx'
import { DefaultToggle } from '../examples/toggle/default.tsx'
import { DisabledWithReason } from '../examples/toggle/disabled-with-reason.tsx'
import { FilterList } from '../examples/toggle/filter-list.tsx'
import { IconOnly } from '../examples/toggle/icon-only.tsx'
import { OwnButton } from '../examples/toggle/own-button.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type ToggleExampleSources = Record<
  'default' | 'filter-list' | 'icon-only' | 'disabled-with-reason' | 'compare-limit' | 'own-button',
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
      lead="A button that is either on or off, and a screen reader (software that reads the screen aloud) says which. Use it for a choice with a direct, visible effect, such as showing only unread messages."
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
                (4.1.3 Status Messages). This example uses an <code>output</code> element, which is
                a status message and is on the page from the start. You can also use{' '}
                <code>useAnnouncer</code>.
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
                Use it where there is room for an icon but not for a word, such as a button that
                shows a password. The name comes from an <code>aria-label</code> that you take from
                your own translations. It stays the same when the toggle switches.
              </>
            }
            code={sources['icon-only']}
            propsUsed={[
              { part: 'Toggle', prop: 'pressed' },
              { part: 'Toggle', prop: 'onPressedChange' },
            ]}
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
                Try not to disable a toggle. With <code>disabled</code> alone it leaves the Tab
                order. When the reason matters, for example when there is nothing to filter, add{' '}
                <code>focusableWhenDisabled</code> and link the reason to the toggle with{' '}
                <code>aria-describedby</code>. People using a keyboard or a screen reader can then
                find the toggle and learn why it is off limits. It still says whether it is on.
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
          <UseCase
            id="compare-limit"
            title="A choice with a limit"
            why={
              <>
                A parent compares day-care places, and the comparison holds at most three. Because
                you keep <code>pressed</code>, you decide what a press does: at the limit, leave the
                state as it is and say why. The hidden school name gives each toggle its own name,
                and the name stays the same when it is on.
              </>
            }
            code={sources['compare-limit']}
            propsUsed={[
              { part: 'Toggle', prop: 'pressed' },
              { part: 'Toggle', prop: 'onPressedChange' },
            ]}
            note={
              <Note kind="reminder">
                A press that changes nothing needs a reason in words. Show it and announce it, or a
                screen reader user hears only that the button is still off (4.1.3 Status Messages).
              </Note>
            }
          >
            <CompareLimit />
          </UseCase>
          <UseCase
            id="own-button"
            title="The state read from the hook"
            why={
              <>
                A resident can switch a decision letter to an easy-to-read version. When the effect
                is a change right next to the button, you need no state of your own:{' '}
                <code>useToggle</code> keeps it, and you read <code>isPressed</code>. Spread{' '}
                <code>toggleProps</code> on your own <code>&lt;button&gt;</code>.
              </>
            }
            code={sources['own-button']}
            propsUsed={[
              {
                part: apiHookPart('useToggle', 'result'),
                label: 'useToggle (result)',
                prop: 'toggleProps',
              },
              {
                part: apiHookPart('useToggle', 'result'),
                label: 'useToggle (result)',
                prop: 'isPressed',
              },
            ]}
          >
            <OwnButton />
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

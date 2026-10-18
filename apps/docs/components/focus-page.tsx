import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { apiHookPart } from './api-ids.ts'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  focusScopeAttributes,
  focusScopeRows,
  useFocusResultRows,
  useFocusRows,
} from '../content/focus.api.ts'
import { HelpPanel } from '../examples/focus/help-panel.tsx'
import { InertPanel } from '../examples/focus/inert-panel.tsx'
import { LoopDrawer } from '../examples/focus/loop-drawer.tsx'
import { RestoreDrawer } from '../examples/focus/restore-drawer.tsx'
import { WizardStep } from '../examples/focus/wizard-step.tsx'
import type { Contract } from '../lib/contract-parser.ts'

const useFocusOptions = apiHookPart('useFocus', 'options')

export type FocusExampleSources = Record<
  'restore-drawer' | 'loop-drawer' | 'inert-panel' | 'help-panel' | 'wizard-step',
  string
>

const parts: ApiPart[] = [
  {
    name: 'FocusScope',
    renders: (
      <>
        <code>&lt;div&gt;</code> by default, with no role and no ARIA. It takes the options of{' '}
        <code>useFocus</code>, every attribute of the element, and passes <code>ref</code> to it. It
        is <code>useFocus</code> and the element in one part.
      </>
    ),
    props: focusScopeRows,
    attributes: focusScopeAttributes,
  },
]

export function FocusPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: FocusExampleSources
}) {
  return (
    <ComponentPage
      title="Focus"
      lead="Neither adds a role or ARIA: you choose the element and give it a name."
      pattern="APG Dialog (Modal), focus rules only"
      whenToUse={
        <ul>
          <li>
            Use it for a panel, a drawer or a step in a form that is not a dialog. Focus (the part
            of the page the keyboard is acting on) moves in when it opens and goes back to where it
            was when it closes.
          </li>
          <li>
            Prefer the native elements. A <code>&lt;dialog&gt;</code> opened with{' '}
            <code>showModal()</code> holds focus, makes the rest of the page inert (unreachable) and
            returns focus with no code. For a dialog built from KvirnUI&rsquo;s parts, use{' '}
            <Link href="/components/dialog">Dialog</Link>.
          </li>
          <li>
            Hold focus inside the scope (<code>contain</code>) only when you must, and always give a
            way out.
          </li>
          <li>
            Not for moving focus to the title of a new page after a client-side navigation: use{' '}
            <Link href="/components/route-focus">Route focus</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['restore-drawer']}>
          <RestoreDrawer />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="return-focus"
            title="A filter panel that gives focus back"
            why="When someone using a keyboard opens the panel, focus moves to its first field. When they close it, focus returns to the button that opened it, so they carry on where they were. Tab can still leave the panel, as it can leave the page."
            code={sources['restore-drawer']}
            propsUsed={[{ part: useFocusOptions, label: 'useFocus (options)', prop: 'active' }]}
            note={
              <Note kind="reminder">
                Neither FocusScope nor useFocus adds a name to your element, so give it one, as the
                example does with <code>aria-label</code>. A <code>nav</code> scope is a landmark
                and needs a name. See <Link href="#what-it-does-for-you">What it does for you</Link>
                .
              </Note>
            }
          >
            <RestoreDrawer />
          </UseCase>
          <UseCase
            id="hold-focus"
            title="A panel that keeps Tab inside until it is closed"
            why="Use it when the panel covers the page and the rest of the page is no use while it is open. With contain set to loop, Tab on the last control goes to the first, and Shift+Tab on the first goes to the last. Escape calls onEscape, where you close the panel."
            code={sources['loop-drawer']}
            propsUsed={[
              { part: 'FocusScope', prop: 'contain' },
              { part: 'FocusScope', prop: 'onEscape' },
              { part: 'FocusScope', prop: 'as' },
            ]}
            note={
              <Note kind="reminder">
                Without <code>onEscape</code> a keyboard user has no way out (2.1.2 No Keyboard
                Trap), and a development warning says so. See{' '}
                <Link href="#focus">Focus management</Link>.
              </Note>
            }
          >
            <LoopDrawer />
          </UseCase>
          <UseCase
            id="inert-panel"
            title="A side panel that shuts the rest of the page out"
            why="With contain set to inert, the rest of the page can’t be reached with the keyboard or the pointer while the panel is open, and it is reachable again when the panel closes. Use it for a panel that covers the page, such as notes on a case. It still needs a way out, so Escape calls onEscape."
            code={sources['inert-panel']}
            propsUsed={[
              { part: 'FocusScope', prop: 'contain' },
              { part: 'FocusScope', prop: 'onEscape' },
            ]}
          >
            <InertPanel />
          </UseCase>
          <UseCase
            id="start-at-the-top"
            title="A help panel that starts at its top"
            why="By default focus starts on the first control in the panel. When the panel is mostly text, that control is a button after it, and the text is skipped. With initialFocus set to container, focus starts on the panel and Tab goes on to the first control."
            code={sources['help-panel']}
            propsUsed={[{ part: 'FocusScope', prop: 'initialFocus' }]}
          >
            <HelpPanel />
          </UseCase>
          <UseCase
            id="wizard-step"
            title="A form step that moves focus to its heading"
            why="When someone goes to the next or the previous step, focus moves to that step’s heading and Tab continues after it. It needs no scope, and it never moves focus on the first render."
            code={sources['wizard-step']}
            propsUsed={[{ part: useFocusOptions, label: 'useFocus (options)', prop: 'moveOn' }]}
          >
            <WizardStep />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            focus: (
              <Note kind="tip">
                With <code>contain=&quot;inert&quot;</code> the rest of the page is made inert at
                the moment the scope opens. Something added to the page while the scope is open is
                not made inert.
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { FocusScope, useFocus } from '@kvirn-ui/react'"
          parts={parts}
          hook={{
            name: 'useFocus',
            intro: (
              <>
                Spread <code>scopeProps</code> on your own element. <code>FocusScope</code> does
                that for you.
              </>
            ),
            options: useFocusRows,
            result: useFocusResultRows,
          }}
        />
      }
    />
  )
}

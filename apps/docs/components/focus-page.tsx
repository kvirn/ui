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
import { LoopDrawer } from '../examples/focus/loop-drawer.tsx'
import { RestoreDrawer } from '../examples/focus/restore-drawer.tsx'
import { WizardStep } from '../examples/focus/wizard-step.tsx'
import type { Contract } from '../lib/contract-parser.ts'

const useFocusOptions = apiHookPart('useFocus', 'options')

export type FocusExampleSources = Record<'restore-drawer' | 'loop-drawer' | 'wizard-step', string>

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
      lead="They add no role and no ARIA: you choose the element and its name."
      status="in-progress"
      whenToUse={
        <ul>
          <li>
            Use it for a drawer, a panel or a wizard step that is not a dialog, and for a layout
            that changes under a router.
          </li>
          <li>
            Prefer the native elements. A <code>&lt;dialog&gt;</code> opened with{' '}
            <code>showModal()</code> holds focus, makes the page inert and returns focus with no
            code. For a dialog with KvirnUI&rsquo;s parts, use{' '}
            <Link href="/components/dialog">Dialog</Link>.
          </li>
          <li>
            Hold focus (<code>contain</code>) only when you must, and always give a way out.
          </li>
          <li>
            To move focus to the page title after a client-side navigation, use{' '}
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
            title="A drawer that gives focus back"
            why="When the drawer opens, focus moves to its first control. When it closes, focus returns to the button that opened it, so a keyboard user carries on where they were. Tab can still leave the drawer, as it can leave the page."
            code={sources['restore-drawer']}
            propsUsed={[{ part: useFocusOptions, label: 'useFocus (options)', prop: 'active' }]}
          >
            <RestoreDrawer />
          </UseCase>
          <UseCase
            id="hold-focus"
            title="A drawer that holds focus"
            why="With contain set to loop, Tab on the last control goes to the first, and Shift+Tab on the first goes to the last. Escape calls onEscape, where you close the drawer. A scope that holds focus needs a way out."
            code={sources['loop-drawer']}
            propsUsed={[
              { part: 'FocusScope', prop: 'contain' },
              { part: 'FocusScope', prop: 'onEscape' },
              { part: 'FocusScope', prop: 'as' },
            ]}
            note={
              <Note kind="reminder">
                Without <code>onEscape</code> a keyboard user has no way out (2.1.2), and a
                development warning says so. See{' '}
                <Link href="#what-you-need-to-do">what you need to do</Link>.
              </Note>
            }
          >
            <LoopDrawer />
          </UseCase>
          <UseCase
            id="wizard-step"
            title="A step that moves focus to its heading"
            why="When the step changes, focus moves to the step’s heading and Tab continues after it. It works with no scope at all, and never on the first render."
            code={sources['wizard-step']}
            propsUsed={[{ part: useFocusOptions, label: 'useFocus (options)', prop: 'moveOn' }]}
          >
            <WizardStep />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { FocusScope, useFocus } from '@kvirn-ui/react'"
          parts={parts}
          hook={{ name: 'useFocus', options: useFocusRows, result: useFocusResultRows }}
        />
      }
    />
  )
}

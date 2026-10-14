import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  disclosurePanelAttributes,
  disclosureRootRows,
  disclosureTriggerAttributes,
  useDisclosureHook,
} from '../content/disclosure.api.ts'
import { ControlledDisclosure } from '../examples/disclosure/controlled.tsx'
import { DefaultDisclosure } from '../examples/disclosure/default.tsx'
import { FindInPage } from '../examples/disclosure/find-in-page.tsx'
import { HelpWithAQuestion } from '../examples/disclosure/help-with-a-question.tsx'
import { ShowMore } from '../examples/disclosure/show-more.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type DisclosureExampleSources = Record<
  'default' | 'show-more' | 'help-with-a-question' | 'find-in-page' | 'controlled',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Disclosure.Root',
    renders: (
      <>
        no element. It owns the open state and passes it to the trigger and the panel inside it. The
        default theme is described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: disclosureRootRows,
  },
  {
    name: 'Disclosure.Trigger',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code> with <code>aria-expanded</code> and{' '}
        <code>aria-controls</code>, and a chevron after its content. It takes every attribute of a{' '}
        <code>&lt;button&gt;</code> except <code>id</code>, <code>type</code>, the two ARIA
        attributes and the disabled ones, and passes <code>ref</code> to it.
      </>
    ),
    attributes: disclosureTriggerAttributes,
  },
  {
    name: 'Disclosure.Panel',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role, always rendered and <code>hidden</code> while closed.
        It takes every attribute of a <code>&lt;div&gt;</code> except <code>id</code> and{' '}
        <code>hidden</code>, and passes <code>ref</code> to it. Render it right after the trigger.
      </>
    ),
    attributes: disclosurePanelAttributes,
  },
]

export function DisclosurePage({
  contract,
  sources,
}: {
  contract: Contract
  sources: DisclosureExampleSources
}) {
  return (
    <ComponentPage
      title="Disclosure"
      lead="Whether it is open shows as a chevron and as a state a screen reader (software that reads the screen aloud) reports, never as colour alone."
      status="alpha-candidate"
      pattern="APG Disclosure"
      whenToUse={
        <ul>
          <li>
            Use it for content that some readers want and most don’t: opening hours, help with a
            question, a longer explanation after a short one.
          </li>
          <li>
            Name the button after what the panel holds (“Opening hours”) and keep the name the same
            open and closed. The chevron and a screen reader show whether it is open.
          </li>
          <li>
            Keep what the page needs out of it: an error message, or the only way to finish a task.
          </li>
          <li>
            For a list of questions and answers, use an{' '}
            <Link href="/components/accordion">Accordion</Link>, which puts a heading around each
            button.
          </li>
          <li>
            Not for a menu that is always shown on a wide screen and a button on a narrow one: a
            Disclosure can’t show its panel while it says it is closed, and the library has no
            component for that yet. For a floating panel over the page, use a{' '}
            <Link href="/components/popover">Popover</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultDisclosure />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="show-more"
            title="Show more under a short text"
            why="A news item or a page gives its main point first, and the details sit behind one button for the readers who want them. The panel follows the button, so the next Tab goes into the details."
            code={sources['show-more']}
            note={
              <Note kind="tip">
                Don’t swap “Show more” for “Show less” when it opens. Name the content (“More about
                the move”) and leave the text alone. A screen reader already says whether the button
                is expanded, so a changing name says it twice (see{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>).
              </Note>
            }
          >
            <ShowMore />
          </UseCase>
          <UseCase
            id="help-with-a-question"
            title="Help with a form question"
            why="A form asks for something people may wonder about. The explanation sits behind a button right after the field, so those who need it can read it and the form stays short."
            code={sources['help-with-a-question']}
          >
            <HelpWithAQuestion />
          </UseCase>
          <UseCase
            id="find-in-page"
            title="Findable with the browser’s search"
            why={
              <>
                A resident presses Ctrl+F for a word that is inside a closed panel. With{' '}
                <code>hiddenUntilFound</code> the browser finds the word and opens the panel.{' '}
                <code>onOpenChange</code> reports it with the reason <code>find-in-page</code>, so
                your own state stays in step.
              </>
            }
            code={sources['find-in-page']}
            propsUsed={[
              { part: 'Disclosure.Root', prop: 'hiddenUntilFound' },
              { part: 'Disclosure.Root', prop: 'onOpenChange' },
            ]}
            note={
              <Note kind="tip">
                Only some browsers can reveal a hidden panel. In the others the panel stays hidden,
                so nothing breaks, but a match inside it isn’t found.
              </Note>
            }
          >
            <FindInPage />
          </UseCase>
          <UseCase
            id="controlled"
            title="Opened from somewhere else"
            why={
              <>
                Another button or a saved choice opens the panel. Keep the state yourself with{' '}
                <code>open</code> and <code>onOpenChange</code>. <code>onOpenChange</code> only
                reports what the reader did, so you change <code>open</code> yourself.
              </>
            }
            code={sources['controlled']}
            propsUsed={[
              { part: 'Disclosure.Root', prop: 'open' },
              { part: 'Disclosure.Root', prop: 'onOpenChange' },
            ]}
          >
            <ControlledDisclosure />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Put the panel right after its button, in the same parent. If it sits elsewhere, Tab
                goes to the panel in a different order from what people see (2.4.3 Focus Order).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Disclosure, useDisclosure } from '@kvirn-ui/react'"
          parts={parts}
          hook={useDisclosureHook}
        />
      }
    />
  )
}

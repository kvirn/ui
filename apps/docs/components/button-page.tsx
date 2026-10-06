import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { CodeBlock } from './code-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { buttonAttributes, buttonRows, useButtonHook } from '../content/button.api.ts'
import { DefaultButton } from '../examples/button/default.tsx'
import { DisabledWithReason } from '../examples/button/disabled-with-reason.tsx'
import { IconOnly } from '../examples/button/icon-only.tsx'
import { Saving } from '../examples/button/saving.tsx'
import { SubmitForm } from '../examples/button/submit-form.tsx'
import { Variants } from '../examples/button/variants.tsx'
import type { Contract } from '../lib/contract-parser.ts'

// The reference page every component page copies (docs/design/docs-component-page.md, "How to
// write a component page"). It takes the contract and the example sources as props, so the page
// file does the `node:fs` reads and this composition renders in a browser test.

export type ButtonExampleSources = Record<
  'default' | 'variants' | 'disabled-with-reason' | 'submit-form' | 'saving' | 'icon-only',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Button',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code> with the role <code>button</code>. It
        takes every attribute of a <code>&lt;button&gt;</code> and passes <code>ref</code> to it.
        The default theme is described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: buttonRows,
    attributes: buttonAttributes,
  },
]

export function ButtonPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: ButtonExampleSources
}) {
  return (
    <ComponentPage
      title="Button"
      lead="A button that does something, such as sending a form or saving a draft. It never sends a form by accident, and it can stay reachable by keyboard when it’s disabled."
      status="alpha"
      whenToUse={
        <ul>
          <li>Use a button when the user does something: sends, saves, deletes or opens.</li>
          <li>
            Write the label as a verb that says what will happen: “Send application”, not “OK”.
          </li>
          <li>Use one primary button per page, for the main next step.</li>
          <li>Deleting and other actions that can’t be undone need a confirmation step.</li>
          <li>
            Not for going to another page: use a <Link href="/components/link">Link</Link>. Don’t
            make a link look like a button, or a button look like a link.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultButton />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="variants"
            title="One main action next to the others"
            why="A page has one main next step. Mark it primary, leave the rest secondary, and mark an action that deletes something as danger."
            code={sources['variants']}
          >
            <Variants />
          </UseCase>
          <UseCase
            id="disabled-with-reason"
            title="Disabled with a reason"
            why={
              <>
                You can’t avoid disabling the button, for example until the form is complete. Keep
                it in the Tab order and link the reason to it with <code>aria-describedby</code>, so
                keyboard and screen reader users find it and learn why.
              </>
            }
            code={sources['disabled-with-reason']}
            propsUsed={[
              { part: 'Button', prop: 'disabled' },
              { part: 'Button', prop: 'focusableWhenDisabled' },
            ]}
            note={
              <Note kind="reminder">
                Prefer to let people press the button and then explain what’s missing. If you do
                disable it, say why in text next to it, as in{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <DisabledWithReason />
          </UseCase>
          <UseCase
            id="send-a-form"
            title="Sending a form"
            why={
              <>
                A Button is <code>type=&quot;button&quot;</code> unless you say otherwise. Give the
                one button that sends the form <code>type=&quot;submit&quot;</code>, and Enter in a
                text field sends it too.
              </>
            }
            code={sources['submit-form']}
            propsUsed={[{ part: 'Button', prop: 'type' }]}
            note={
              <Note kind="tip">
                A focusable disabled submit button also blocks Enter in a text field, so the form
                isn’t sent through it.
              </Note>
            }
          >
            <SubmitForm />
          </UseCase>
          <UseCase
            id="save-that-takes-a-moment"
            title="A save that takes a moment"
            why="The button disables itself while it works. If it were natively disabled, focus would drop to the page body, so keep it focusable."
            code={sources['saving']}
            propsUsed={[
              { part: 'Button', prop: 'disabled' },
              { part: 'Button', prop: 'focusableWhenDisabled' },
              { part: 'Button', prop: 'onClick' },
            ]}
          >
            <Saving />
          </UseCase>
          <UseCase
            id="icon-only"
            title="A button with only an icon"
            why="Use it where there is room for an icon and not a word, such as closing a panel. The name comes from an aria-label you take from your own translations."
            code={sources['icon-only']}
            note={
              <Note
                kind="recipe"
                more={
                  <CodeBlock
                    code={'<Button aria-label={messages.close}><Icon name="close" /></Button>'}
                  />
                }
              >
                Keep the icon decorative and put the name on the Button. A development warning says
                so if an icon-only button has no name.
              </Note>
            }
          >
            <IconOnly />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Button, useButton } from '@kvirn-ui/react'"
          parts={parts}
          hook={useButtonHook}
        />
      }
    />
  )
}

import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  copyButtonAttributes,
  copyButtonRows,
  useCopyButtonHook,
} from '../content/copy-button.api.ts'
import { DefaultCopyButton } from '../examples/copy-button/default.tsx'
import { OwnCue } from '../examples/copy-button/own-cue.tsx'
import { ReferenceNumber } from '../examples/copy-button/reference-number.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type CopyButtonExampleSources = Record<'default' | 'reference-number' | 'own-cue', string>

const parts: ApiPart[] = [
  {
    name: 'CopyButton',
    renders: (
      <>
        A <Link href="/components/button">Button</Link>:{' '}
        <code>&lt;button type=&quot;button&quot;&gt;</code> with the role <code>button</code>. It
        takes every attribute of a Button except <code>type</code> and passes <code>ref</code> to
        it.
      </>
    ),
    props: copyButtonRows,
    attributes: copyButtonAttributes,
  },
]

export function CopyButtonPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: CopyButtonExampleSources
}) {
  return (
    <ComponentPage
      title="CopyButton"
      lead="A button that copies a text to the clipboard, such as a case number. Its name stays “Copy”, and the result is announced to screen reader users. If the browser refuses, the text is selected so the user can copy it by hand."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it for a short text the user will paste somewhere else: a reference or case number,
            a link, a code.
          </li>
          <li>
            Show the text on the page next to the button and pass its element as{' '}
            <code>textRef</code>, so a failed copy can select it.
          </li>
          <li>
            Give each button a name that says what it copies when a page has more than one: “Copy
            case number”.
          </li>
          <li>
            For a code sample with a label, use a{' '}
            <Link href="/components/code-block">CodeBlock</Link>, which has a copy button built in.
          </li>
          <li>Don’t copy a secret, such as a password or a token.</li>
          <li>
            Copying needs a secure context (HTTPS or localhost) and a user action. Elsewhere it
            fails, and the text is selected instead.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultCopyButton />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="reference-number"
            title="A case number to keep"
            why="A citizen gets a case number after sending an application and needs it again on the phone or in a later form. Name the button after what it copies, and pass the element that shows the number so it is selected if copying fails."
            code={sources['reference-number']}
            propsUsed={[
              { part: 'CopyButton', prop: 'text' },
              { part: 'CopyButton', prop: 'textRef' },
              { part: 'CopyButton', prop: 'children' },
            ]}
            note={
              <Note kind="tip">
                If the user is on an address without HTTPS, copying fails and the number is selected
                instead. The failure is announced, so they know to press Ctrl+C.
              </Note>
            }
          >
            <ReferenceNumber />
          </UseCase>
          <UseCase
            id="your-own-confirmation"
            title="A confirmation of your own"
            why="The result is announced for screen reader users. Sighted users see nothing change, so a confirmation is yours to show: act on onCopied, or read data-status for styling."
            code={sources['own-cue']}
            propsUsed={[{ part: 'CopyButton', prop: 'onCopied' }]}
            note={
              <Note kind="reminder">
                Known gap: the default theme shows no “Copied” cue yet. A designer’s spec is in
                progress, so for now the cue above is yours to build. Never put the result in the
                button’s name: it stays the same.
              </Note>
            }
          >
            <OwnCue />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} linkToStrings />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { CopyButton, useCopyButton } from '@kvirn-ui/react'"
          parts={parts}
          hook={useCopyButtonHook}
          strings={
            <StringsBlock
              namespace="copyButton"
              component="CopyButton"
              keys={[
                {
                  key: 'label',
                  meaning:
                    'The visible text and the accessible name. It never changes to the result.',
                },
                {
                  key: 'copied',
                  meaning: 'Announced politely after the text was written to the clipboard.',
                },
                {
                  key: 'failed',
                  meaning: 'Announced assertively when the browser refused. The text is selected.',
                },
              ]}
            />
          }
        />
      }
    />
  )
}

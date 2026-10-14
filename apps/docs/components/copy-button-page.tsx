import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import { apiHookPart } from './api-ids.ts'
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
import { Several } from '../examples/copy-button/several.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type CopyButtonExampleSources = Record<
  'default' | 'reference-number' | 'several' | 'own-cue',
  string
>

const parts: ApiPart[] = [
  {
    name: 'CopyButton',
    renders: (
      <>
        A <Link href="/components/button">Button</Link>:{' '}
        <code>&lt;button type=&quot;button&quot;&gt;</code> with the role <code>button</code>. It
        takes every attribute of a Button except <code>type</code> and passes <code>ref</code> to
        it. After the button it renders <code>&lt;span class=&quot;kv-copy-status&quot;&gt;</code>{' '}
        with the result, while the result is <code>copied</code> or <code>failed</code>.
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
      lead="Its name never changes to “Copied”. The result shows as words next to the button, and a screen reader (software that reads the screen aloud) announces it. If the browser refuses, the text is selected so people can copy it by hand."
      status="alpha-candidate"
      pattern="APG Button"
      whenToUse={
        <ul>
          <li>
            Use it for a short text people will paste somewhere else: a case or reference number, a
            link, a code.
          </li>
          <li>
            Show the text on the page next to the button and pass its element as{' '}
            <code>textRef</code>, so the text can be selected if copying fails.
          </li>
          <li>
            When a page has more than one, give each button a name that says what it copies: “Copy
            case number”.
          </li>
          <li>
            Copying works only on a secure page (HTTPS, or localhost while you build). Elsewhere it
            fails, and the text in <code>textRef</code> is selected instead.
          </li>
          <li>
            Not for a secret such as a password or a token. Not for a code sample with a label: use
            a <Link href="/components/code-block">CodeBlock</Link>, which has a copy button built
            in.
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
            why="A resident gets a case number after sending an application and needs it again on the phone or in a later form. Name the button after what it copies, and pass the element that shows the number so it is selected if copying fails."
            code={sources['reference-number']}
            propsUsed={[
              { part: 'CopyButton', prop: 'text' },
              { part: 'CopyButton', prop: 'textRef' },
              { part: 'CopyButton', prop: 'children' },
            ]}
            note={
              <Note kind="tip">
                The result shows as words next to the button: “Copied” for five seconds. A failure
                message stays until the next press, so a slow reader still has the instruction
                (3.3.1 Error Identification).
              </Note>
            }
          >
            <ReferenceNumber />
          </UseCase>
          <UseCase
            id="several-buttons"
            title="A copy button for each case in a list"
            why="A caseworker or a resident has several cases on one page. A bare “Copy” repeated down the list tells a screen reader user nothing, so each button gets a name that says which number it copies."
            code={sources['several']}
            propsUsed={[
              { part: 'CopyButton', prop: 'text' },
              { part: 'CopyButton', prop: 'textRef' },
            ]}
            note={
              <Note kind="reminder">
                Keep the visible word “Copy” at the start of the name, so someone using voice
                control can say what they see (2.5.3 Label in Name).
              </Note>
            }
          >
            <Several />
          </UseCase>
          <UseCase
            id="your-own-result"
            title="The result in your own words and place"
            why="Use the hook when the result must appear somewhere the built-in text doesn’t, or in words of your own. Pass the same words in messages, so what people see is what a screen reader announces."
            code={sources['own-cue']}
            propsUsed={[
              {
                part: apiHookPart('useCopyButton', 'options'),
                label: 'useCopyButton (options)',
                prop: 'messages',
              },
            ]}
            note={
              <Note kind="tip">
                With the component, <code>{'status={false}'}</code> removes the built-in result
                text. The button still gets <code>data-status</code> for your own styling.
              </Note>
            }
          >
            <OwnCue />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          linkToStrings
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Wrap your app in <code>KvirnProvider</code>. Without it nothing is announced, and a
                screen reader user never hears that the text was copied (4.1.3 Status Messages).
              </Note>
            ),
          }}
        />
      }
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
                  meaning:
                    'Announced politely and shown after the button when the text was written to the clipboard.',
                },
                {
                  key: 'failed',
                  meaning:
                    'Announced assertively and shown after the button when the browser refused. It stays until the next press. The text in textRef is selected.',
                },
              ]}
            />
          }
        />
      }
    />
  )
}

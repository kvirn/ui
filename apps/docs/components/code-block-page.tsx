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
  codeBlockCodeAttributes,
  codeBlockCopyAttributes,
  codeBlockCopyRows,
  codeBlockLabelAttributes,
  codeBlockRootAttributes,
  useCodeBlockHook,
} from '../content/code-block.api.ts'
import { DefaultCodeBlock } from '../examples/code-block/default.tsx'
import { NamedCopy } from '../examples/code-block/named-copy.tsx'
import { LongLine } from '../examples/code-block/long-line.tsx'
import { SeveralBlocks } from '../examples/code-block/several-blocks.tsx'
import { WithoutPrompt } from '../examples/code-block/without-prompt.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type CodeBlockExampleSources = Record<
  'default' | 'long-line' | 'named-copy' | 'several-blocks' | 'without-prompt',
  string
>

const parts: ApiPart[] = [
  {
    name: 'CodeBlock.Root',
    renders: (
      <>
        <code>&lt;div class=&quot;kv-code-block&quot;&gt;</code>. It is a <code>group</code> named
        by the Label while one is mounted, and a plain <code>div</code> without one.
      </>
    ),
    attributes: codeBlockRootAttributes,
  },
  {
    name: 'CodeBlock.Label',
    renders: (
      <>
        <code>&lt;p class=&quot;kv-code-block-label&quot;&gt;</code>: what the code is, never a
        heading.
      </>
    ),
    attributes: codeBlockLabelAttributes,
  },
  {
    name: 'CodeBlock.Code',
    renders: (
      <>
        <code>&lt;pre class=&quot;kv-code-block-code&quot;&gt;</code>. It wraps, never scrolls and
        is never a Tab stop. Put a <code>&lt;code&gt;</code> inside it if you like.
      </>
    ),
    attributes: codeBlockCodeAttributes,
  },
  {
    name: 'CodeBlock.Copy',
    renders: (
      <>
        A <Link href="/components/copy-button">CopyButton</Link> for the Code: it copies the Code’s
        text and selects the Code when copying fails. It takes the other props of a CopyButton.
      </>
    ),
    props: codeBlockCopyRows,
    attributes: codeBlockCopyAttributes,
  },
]

export function CodeBlockPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: CodeBlockExampleSources
}) {
  return (
    <ComponentPage
      title="CodeBlock"
      lead="In the default theme the code wraps, so there is nothing to scroll sideways. Nothing is highlighted, so no colour carries meaning."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it for a command, a request or a short sample that the reader will copy and run.
          </li>
          <li>
            Give it a label that says what it is: “Install”, “Send an application”. The label names
            the block for screen reader users (people using software that reads the screen aloud).
          </li>
          <li>
            For one short text such as a case number, use a{' '}
            <Link href="/components/copy-button">CopyButton</Link> next to it.
          </li>
          <li>Not for running text: use a paragraph.</li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultCodeBlock />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="long-command"
            title="A long command that wraps"
            why="A request or a path can be longer than the screen. The code wraps at any character instead of scrolling, so it fits at 320 CSS pixels and at 400% zoom. Copy still copies the whole text."
            code={sources['long-line']}
            note={
              <Note kind="tip">
                A line can break in the middle of a path or a hyphenated word. Where a break would
                mislead, say the exact text in the paragraph before the block.
              </Note>
            }
          >
            <LongLine />
          </UseCase>
          <UseCase
            id="named-copy-button"
            title="A copy button that says what it copies"
            why="With several blocks on a page, “Copy” alone doesn’t say which one. Give Copy a label of your own as its content. The visible words are then its name, and you take them from your own translations."
            code={sources['named-copy']}
            propsUsed={[{ part: 'CodeBlock.Copy', prop: 'children' }]}
          >
            <NamedCopy />
          </UseCase>
          <UseCase
            id="without-prompt"
            title="A command copied without its prompt"
            why="A command is easier to read with the prompt sign in front, but the prompt isn’t part of what to run. Give Copy the text to write, and it copies that instead of what is shown."
            code={sources['without-prompt']}
            propsUsed={[{ part: 'CodeBlock.Copy', prop: 'text' }]}
            note={
              <Note kind="tip">
                If the browser refuses to copy, the whole code is selected, prompt included, so the
                reader can copy it by hand. Use a prompt only where readers expect one.
              </Note>
            }
          >
            <WithoutPrompt />
          </UseCase>
          <UseCase
            id="several-blocks"
            title="Several blocks, each saying what was copied"
            why="With more than one block on a page, “Copied” alone doesn’t say which one. Each block gets its own label, and its own words for the button and the result. A screen reader user hears the result as it is announced."
            code={sources['several-blocks']}
            propsUsed={[{ part: 'CodeBlock.Copy', prop: 'messages' }]}
          >
            <SeveralBlocks />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          messageNamespace="copyButton"
          linkToStrings
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Give every block a label. Without one, a screen reader user hears no name for the
                block (1.3.1 Info and Relationships, 2.4.6 Headings and Labels).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { CodeBlock, useCodeBlock } from '@kvirn-ui/react'"
          parts={parts}
          hook={useCodeBlockHook}
          strings={
            <StringsBlock
              namespace="copyButton"
              component="CodeBlock.Copy"
              keys={[
                { key: 'label', meaning: 'The visible text and the accessible name of Copy.' },
                { key: 'copied', meaning: 'Announced politely after the code was copied.' },
                {
                  key: 'failed',
                  meaning: 'Announced assertively when the browser refused. The code is selected.',
                },
              ]}
            >
              <p>
                CodeBlock has no strings of its own: the Label is your text. Copy uses the messages
                of CopyButton.
              </p>
            </StringsBlock>
          }
        />
      }
    />
  )
}

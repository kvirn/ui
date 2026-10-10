import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { kbdAttributes, kbdRows, useKbdHook } from '../content/kbd.api.ts'
import { Combination } from '../examples/kbd/combination.tsx'
import { DefaultKbd } from '../examples/kbd/default.tsx'
import { ShortcutList } from '../examples/kbd/shortcut-list.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type KbdExampleSources = Record<'default' | 'combination' | 'shortcut-list', string>

const parts: ApiPart[] = [
  {
    name: 'Kbd',
    renders: (
      <>
        <code>&lt;kbd class=&quot;kv-kbd&quot;&gt;</code> with no role. It adds no ARIA, text or
        behaviour, takes every attribute of an HTML element and passes <code>ref</code> to it. The
        default theme is described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: kbdRows,
    attributes: kbdAttributes,
  },
]

export function KbdPage({ contract, sources }: { contract: Contract; sources: KbdExampleSources }) {
  return (
    <ComponentPage
      title="Kbd"
      lead="It is the native kbd element with a class, so a screen reader reads it as part of the sentence."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it in help text, instructions and shortcut lists to show a key the user presses:{' '}
            <code>Tab</code>, <code>Esc</code>, <code>Ctrl</code> and <code>C</code>.
          </li>
          <li>One key per Kbd. Show a combination by nesting them.</li>
          <li>Say what the key does in words: the key is never the only instruction.</li>
          <li>
            Not for something users can press: a key drawn as text isn’t a control. Use a{' '}
            <Link href="/components/button">Button</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultKbd />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="combination"
            title="Two keys pressed together"
            why="An outer Kbd groups one Kbd per key, with the separator as plain text. The default theme draws the keys and leaves the outer one plain, and the group never breaks across lines."
            code={sources['combination']}
            note={
              <Note kind="reminder">
                Key names aren’t translated, because they are what’s printed on the keyboard. Set{' '}
                <code>lang=&quot;en&quot;</code> on each key in a text of another language. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <Combination />
          </UseCase>
          <UseCase
            id="shortcut-list"
            title="A list of shortcuts"
            why="Each item names the key or keys, then says what they do in words. Name the keys your users have: Ctrl is Cmd on a Mac."
            code={sources['shortcut-list']}
            note={
              <Note kind="tip">
                A plain <code>&lt;kbd&gt;</code> inside <code>kv-prose</code> gets the same look as
                a Kbd, so text you don’t write in React, such as Markdown, needs no component.
              </Note>
            }
          >
            <ShortcutList />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Kbd, useKbd } from '@kvirn-ui/react'"
          parts={parts}
          hook={useKbdHook}
        />
      }
    />
  )
}

import { Link } from '@kvirn-ui/react'
import type { ApiPart } from './api-block.tsx'
import { ApiBlock } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  useVisuallyHiddenRows,
  visuallyHiddenAttributes,
  visuallyHiddenRows,
} from '../content/visually-hidden.api.ts'
import { ButtonContext } from '../examples/visually-hidden/button-context.tsx'
import { DefaultVisuallyHidden } from '../examples/visually-hidden/default.tsx'
import { HiddenHeading } from '../examples/visually-hidden/hidden-heading.tsx'
import { IconStatus } from '../examples/visually-hidden/icon-status.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type VisuallyHiddenExampleSources = Record<
  'default' | 'button-context' | 'hidden-heading' | 'icon-status',
  string
>

const parts: ApiPart[] = [
  {
    name: 'VisuallyHidden',
    renders: (
      <>
        <code>&lt;span&gt;</code> with no role. It takes every attribute of the element and passes{' '}
        <code>ref</code> to it. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: visuallyHiddenRows,
    attributes: visuallyHiddenAttributes,
  },
  {
    name: 'useVisuallyHidden',
    renders: (
      <>
        nothing. The hook takes no options and returns <code>visuallyHiddenProps</code> to spread on
        your own element.
      </>
    ),
    props: useVisuallyHiddenRows,
  },
]

export function VisuallyHiddenPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: VisuallyHiddenExampleSources
}) {
  return (
    <ComponentPage
      title="VisuallyHidden"
      lead="Text that screen reader users get and nobody sees. It stays in the page, so it is read in the flow of the sentence."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it for context a sighted user gets from the layout: which item a button belongs to,
            what an icon means, or a heading that names a block.
          </li>
          <li>
            Use it in lists, tables and cards, where the same short label repeats and each needs its
            own name.
          </li>
          <li>
            Don’t hide instructions or information that sighted users need too: write it in the page
            instead.
          </li>
          <li>
            Not for a link that skips past the header: use a{' '}
            <Link href="/components/skip-link">SkipLink</Link>. Never put a link or a control inside
            it, because a control that has focus must be seen.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultVisuallyHidden />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="button-context"
            title="The same button on every row"
            why={
              <>
                A list has a “Remove” button on each item. Sighted users see which item a button
                belongs to by its place. Add the item’s name as hidden text, so each button has its
                own name. The visible word stays first in the name.
              </>
            }
            code={sources['button-context']}
            note={
              <Note kind="reminder">
                Keep the visible label at the start of the name, so voice control users can say what
                they see. See <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <ButtonContext />
          </UseCase>
          <UseCase
            id="hidden-heading"
            title="A heading nobody sees"
            why="A block of text has no visible title, but screen reader users move by heading. Render the hidden text as the heading level that fits the page."
            code={sources['hidden-heading']}
            propsUsed={[{ part: 'VisuallyHidden', prop: 'render' }]}
            note={
              <Note kind="tip">
                A hidden heading is in the heading list like any other. Pick the level that keeps
                the outline in order.
              </Note>
            }
          >
            <HiddenHeading />
          </UseCase>
          <UseCase
            id="icon-status"
            title="A status shown by an icon"
            why="An icon says “approved” to sighted users. Put the same word in hidden text next to it, so it is not lost. Keep the icon itself decorative."
            code={sources['icon-status']}
          >
            <IconStatus />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { VisuallyHidden, useVisuallyHidden } from '@kvirn-ui/react'"
          parts={parts}
        />
      }
    />
  )
}

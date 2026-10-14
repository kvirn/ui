import { Link } from '@kvirn-ui/react'
import type { ApiPart } from './api-block.tsx'
import { ApiBlock } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  useVisuallyHiddenHook,
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
      lead="It stays in the page, so a screen reader (software that reads the screen aloud) reads it in the flow of the sentence."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it for context that sighted users get from the layout: which item a button belongs
            to, what a number counts, or a heading that names a block.
          </li>
          <li>
            Use it in lists, tables and cards, where the same short label repeats and each one needs
            its own name.
          </li>
          <li>
            Not for instructions or facts that sighted users need too: write them on the page for
            everyone.
          </li>
          <li>
            Not for a link that skips past the header: use a{' '}
            <Link href="/components/skip-link">SkipLink</Link>. Never put a link or a control inside
            VisuallyHidden, because someone using a keyboard would land on something they can’t see.
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
                own name and shows up in a list of buttons. The visible word stays first in the
                name.
              </>
            }
            code={sources['button-context']}
            note={
              <Note kind="reminder">
                Keep the visible label at the start of the name, so people who use voice control can
                say what they see (2.5.3 Label in Name). See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <ButtonContext />
          </UseCase>
          <UseCase
            id="hidden-heading"
            title="A heading nobody sees"
            why="A block of text has no visible title, but screen reader users move from heading to heading. Render the hidden text as the heading level that fits the page."
            code={sources['hidden-heading']}
            propsUsed={[{ part: 'VisuallyHidden', prop: 'as' }]}
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
            note={
              <Note kind="tip">
                An <Link href="/components/icon">Icon</Link> with a <code>label</code> is read as an
                image with that name. Hidden text is read as part of the sentence around it.
              </Note>
            }
          >
            <IconStatus />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="tip">
                Keep the hidden text short. W3C’s{' '}
                <a href="https://www.w3.org/WAI/WCAG22/Techniques/css/C7">technique C7</a> notes
                that hidden text can make a page “overly chatty” for screen reader users.
              </Note>
            ),
            focus: (
              <Note kind="reminder">
                Never put a link, button or field inside VisuallyHidden. Someone using a keyboard
                would land on it and see nothing (2.4.7 Focus Visible).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { VisuallyHidden, useVisuallyHidden } from '@kvirn-ui/react'"
          parts={parts}
          hook={useVisuallyHiddenHook}
        />
      }
    />
  )
}

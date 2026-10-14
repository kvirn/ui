import { Link } from '@kvirn-ui/react'
import type { ApiPart } from './api-block.tsx'
import { ApiBlock } from './api-block.tsx'
import { apiHookPart } from './api-ids.ts'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import { skipLinkAttributes, skipLinkRows, useSkipLinkHook } from '../content/skip-link.api.ts'
import { CustomLabel } from '../examples/skip-link/custom-label.tsx'
import { DefaultSkipLink } from '../examples/skip-link/default.tsx'
import { OwnElement } from '../examples/skip-link/own-element.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type SkipLinkExampleSources = Record<'default' | 'custom-label' | 'own-element', string>

const parts: ApiPart[] = [
  {
    name: 'SkipLink',
    renders: (
      <>
        <code>&lt;a href&gt;</code> with the role <code>link</code>. It takes every attribute of an{' '}
        <code>&lt;a&gt;</code> and passes <code>ref</code> to it. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: skipLinkRows,
    attributes: skipLinkAttributes,
  },
]

export function SkipLinkPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: SkipLinkExampleSources
}) {
  return (
    <ComponentPage
      title="SkipLink"
      lead="The default theme keeps it out of sight until it has focus, so it doesn’t change how the page looks for people who use a mouse."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use one on every page that has a header or a menu before the main content. People who
            use a keyboard can then skip it instead of tabbing through it on every page.
          </li>
          <li>Put it first in the page, before the header and any other link.</li>
          <li>Give the main content an id, and point the link at it with a same-page address.</li>
          <li>
            Not for a link to another page or a route: use a{' '}
            <Link href="/components/link">Link</Link>. For text only screen readers get, use{' '}
            <Link href="/components/visually-hidden">VisuallyHidden</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultSkipLink />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="custom-label"
            title="A link to something other than the main content"
            why="A long page may have a block that people want to reach directly, such as the application form. Write the label yourself so it says where the link goes."
            code={sources['custom-label']}
            propsUsed={[
              { part: 'SkipLink', prop: 'href' },
              { part: 'SkipLink', prop: 'children' },
            ]}
            note={
              <Note kind="reminder">
                A label of your own is not translated for you. When it is in another language than
                the page, put it in an element with <code>lang</code> (3.1.2 Language of Parts,
                level AA). See <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <CustomLabel />
          </UseCase>
          <UseCase
            id="own-element"
            title="Your own link element"
            why={
              <>
                You need markup the component doesn’t give you. Spread the props from the hook on
                your own link and use the label from the hook. If you only want your design system’s
                link, pass it to the component with <code>as</code>.
              </>
            }
            code={sources['own-element']}
            propsUsed={[
              {
                part: apiHookPart('useSkipLink', 'options'),
                label: 'useSkipLink (options)',
                prop: 'href',
              },
            ]}
            note={
              <Note kind="tip">
                The link doesn’t cancel the browser’s own jump. The jump still works before the
                scripts have loaded.
              </Note>
            }
          >
            <OwnElement />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Put the link first in the page and give the main content the id it points to. If the
                id is missing, the link goes nowhere and people using a keyboard still have to tab
                through the whole header (2.4.1 Bypass Blocks, level A). A development warning tells
                you when the id is missing.
              </Note>
            ),
            focus: (
              <Note kind="reminder">
                Keep the focus ring on the target. If your styles remove the outline from elements
                with <code>tabindex=&quot;-1&quot;</code>, someone using a keyboard can’t see where
                the link took them (2.4.7 Focus Visible, level AA).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { SkipLink, useSkipLink } from '@kvirn-ui/react'"
          parts={parts}
          hook={useSkipLinkHook}
          strings={
            <StringsBlock
              namespace="skipLink"
              component="SkipLink"
              keys={[
                {
                  key: 'label',
                  meaning:
                    'The link’s visible text, when you give no children. It says where the link goes.',
                },
              ]}
            />
          }
        />
      }
    />
  )
}

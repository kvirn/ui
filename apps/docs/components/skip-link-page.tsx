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
import { DesignSystemLink } from '../examples/skip-link/design-system-link.tsx'
import { OwnElement } from '../examples/skip-link/own-element.tsx'
import { TwoLinks } from '../examples/skip-link/two-links.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type SkipLinkExampleSources = Record<
  'default' | 'custom-label' | 'two-links' | 'design-system-link' | 'own-element',
  string
>

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
      lead="A link at the top of the page that takes people using a keyboard straight to the main content. The default theme keeps it out of sight until it has focus, so the page looks the same to people who use a mouse."
      whenToUse={
        <ul>
          <li>
            Use one on every page that has a header or a menu before the main content. People who
            use a keyboard can then jump past it, instead of pressing Tab through it on every page.
          </li>
          <li>Put it first in the page, before the header and any other link.</li>
          <li>
            Give the main content an id, such as <code>main</code>, and set the link’s{' '}
            <code>href</code> to <code>#main</code>. A <code>#</code> address points to an element
            on the same page.
          </li>
          <li>
            Not for a link to another page: use a <Link href="/components/link">Link</Link>. Not for
            text that only screen readers (software that reads the screen aloud) should get: use{' '}
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
                the page, mark the language so screen readers pronounce it correctly (3.1.2 Language
                of Parts, level AA). See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <CustomLabel />
          </UseCase>
          <UseCase
            id="two-links"
            title="A way past the header and a way to the search"
            why="Some pages have two things people look for first. Give each its own link, one after the other at the top: the main content first, then the search. Each has a target with its own id."
            code={sources['two-links']}
            propsUsed={[
              { part: 'SkipLink', prop: 'href' },
              { part: 'SkipLink', prop: 'children' },
            ]}
          >
            <TwoLinks />
          </UseCase>
          <UseCase
            id="design-system-link"
            title="Your design system’s link component"
            why={
              <>
                Your project already has a link component with its own class or markup. Pass it with{' '}
                <code>as</code>. SkipLink gives it the other props, the <code>ref</code> (a way to
                reach the underlying element) and the <code>kv-skip-link</code> class, so the link
                still hides until it has focus.
              </>
            }
            code={sources['design-system-link']}
            propsUsed={[
              { part: 'SkipLink', prop: 'as' },
              { part: 'SkipLink', prop: 'href' },
            ]}
            note={
              <Note kind="tip">
                Your component must render an <code>&lt;a href&gt;</code> and pass on its ref. Don’t
                use <code>Link.Root</code> here: a same-page address is not a route.
              </Note>
            }
          >
            <DesignSystemLink />
          </UseCase>
          <UseCase
            id="own-element"
            title="Your own link element"
            why={
              <>
                You need markup the component doesn’t give you. Spread the props from the hook on
                your own link and use the label from the hook. If you only want your design system’s
                link, use <code>as</code>, as in the case above.
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
                The link does not cancel the browser’s own jump to the target, so the jump also
                works without JavaScript.
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
                Keep the focus ring on the target. When the target can’t take focus yet, the link
                adds <code>tabindex=&quot;-1&quot;</code> to it so focus can move there. If your
                styles remove the outline from such elements, someone using a keyboard can’t see
                where the link took them (2.4.7 Focus Visible, level AA).
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

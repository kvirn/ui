import { LinkRoot } from '@kvirn-ui/react'
import { apiHookPart } from './api-ids.ts'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { topBarAttributes, topBarRows, useTopBarHook } from '../content/top-bar.api.ts'
import { ButtonTool } from '../examples/top-bar/button-tool.tsx'
import { DefaultTopBar } from '../examples/top-bar/default.tsx'
import { FilledTopBar } from '../examples/top-bar/filled.tsx'
import { OwnElement } from '../examples/top-bar/own-element.tsx'
import { PhoneLink } from '../examples/top-bar/phone-link.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type TopBarExampleSources = Record<
  'default' | 'button-tool' | 'phone-link' | 'filled' | 'own-element',
  string
>

const parts: ApiPart[] = [
  {
    name: 'TopBar',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role: it is not a landmark, a{' '}
        <LinkRoot href="/components/navigation">Navigation</LinkRoot> inside it is. It takes every
        attribute of a <code>&lt;div&gt;</code> and passes <code>ref</code> to it. Its children are
        yours, laid out at the start and the end in DOM order. The default theme is described on{' '}
        <LinkRoot href="/foundation/theming">Theming</LinkRoot>.
      </>
    ),
    props: topBarRows,
    attributes: topBarAttributes,
  },
]

export function TopBarPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: TopBarExampleSources
}) {
  return (
    <ComponentPage
      title="TopBar"
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it first in the site header for a line a visitor may need on every page: who runs
            the service, the latest news, and a few tools such as language, easy-to-read or contact.
          </li>
          <li>
            Write the text first and the navigation last. Reading order and focus order follow the
            DOM, so they are the visual order.
          </li>
          <li>
            Give the navigation inside it a <code>label</code> that differs from the main
            navigation, since the bar itself is not a landmark.
          </li>
          <li>
            Not for the main menu: use <LinkRoot href="/components/navigation">Navigation</LinkRoot>
            . Not for a message that must be noticed: use{' '}
            <LinkRoot href="/components/alert">Alert</LinkRoot>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultTopBar />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="button-tool"
            title="A tool that does something on the page"
            why={
              <>
                Some tools act on the page and don’t go to another one: print, say. Put a Button in
                the bar and give it the class <code>kv-button--link</code>. It looks like the links
                beside it and is read as a button. Tab reaches it after the navigation, in the order
                you wrote.
              </>
            }
            code={sources['button-tool']}
            note={
              <Note kind="reminder">
                Use a link to go to a page and a button to do something. A button answers Space as
                well as Enter, a link only Enter (4.1.2 Name, Role, Value, A).
              </Note>
            }
          >
            <ButtonTool />
          </UseCase>
          <UseCase
            id="phone-link"
            title="Opening hours and a phone number"
            why="A bar doesn’t need a navigation. For a single link, such as the phone number of the contact centre, write the link directly in the bar after the text. The theme treats a link that stands on its own as a bar item: at least 24px tall, and underlined only when you point at it."
            code={sources['phone-link']}
          >
            <PhoneLink />
          </UseCase>
          <UseCase
            id="filled"
            title="A bar with a fill"
            why="Set variant to primary, secondary or accent to fill the bar across the full width. Its text, links, focus ring and the current tool take the fill’s on-colour. The theme’s contrast check covers each fill: 4.5:1 for text, and 7:1 in the contrast themes. A link in a sentence stays underlined."
            code={sources['filled']}
            propsUsed={[{ part: 'TopBar', prop: 'variant' }]}
            note={
              <Note kind="reminder">
                Write a sentence in a <code>&lt;p&gt;</code>, never a bare <code>&lt;div&gt;</code>:
                a link directly in a div of the bar counts as a bar item and loses its underline at
                rest.
              </Note>
            }
          >
            <FilledTopBar />
          </UseCase>
          <UseCase
            id="own-element"
            title="Your own element"
            why="When the bar must be another element than a div, call useTopBar and spread topBarProps on it. You get only the class: no role, ARIA or tabindex. Join a class of your own with mergeProps."
            code={sources['own-element']}
            propsUsed={[
              {
                part: apiHookPart('useTopBar', 'options'),
                label: 'useTopBar (options)',
                prop: 'variant',
              },
            ]}
          >
            <OwnElement />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { TopBar, useTopBar } from '@kvirn-ui/react'"
          parts={parts}
          hook={useTopBarHook}
        />
      }
    />
  )
}

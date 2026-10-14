import { LinkRoot } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { topBarAttributes, topBarRows, useTopBarHook } from '../content/top-bar.api.ts'
import { DefaultTopBar } from '../examples/top-bar/default.tsx'
import { FilledTopBar } from '../examples/top-bar/filled.tsx'
import { OwnElement } from '../examples/top-bar/own-element.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type TopBarExampleSources = Record<'default' | 'filled' | 'own-element', string>

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
      lead="A slim bar with a line of text at the start and a navigation at the end."
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
            id="filled"
            title="A bar with a fill"
            why="Set variant to primary, secondary or accent to fill the bar across the full width. Its text, links, focus ring and the current tool take the fill’s on-colour, and the theme keeps the contrast at the required level, also in the contrast themes. A link in a sentence stays underlined."
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
            propsUsed={[{ part: 'TopBar', prop: 'variant' }]}
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

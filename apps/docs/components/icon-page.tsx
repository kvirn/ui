import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { iconAttributes, iconRows, useIconHook } from '../content/icon.api.ts'
import { DefaultIcon } from '../examples/icon/default.tsx'
import { MirrorInRtl } from '../examples/icon/mirror-in-rtl.tsx'
import { OneOffDrawing } from '../examples/icon/one-off-drawing.tsx'
import { OwnComponent } from '../examples/icon/own-component.tsx'
import { Sizes } from '../examples/icon/sizes.tsx'
import { WithLabel } from '../examples/icon/with-label.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type IconExampleSources = Record<
  'default' | 'with-label' | 'sizes' | 'own-component' | 'one-off-drawing' | 'mirror-in-rtl',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Icon',
    renders: (
      <>
        <code>&lt;svg class=&quot;kv-icon&quot;&gt;</code>, hidden from assistive technology, or{' '}
        <code>role=&quot;img&quot;</code> with a <code>label</code>. It takes every attribute of an{' '}
        <code>&lt;svg&gt;</code> except <code>width</code>, <code>height</code>,{' '}
        <code>aria-label</code>, <code>aria-hidden</code> and <code>role</code>, and passes{' '}
        <code>ref</code> to it. Register your own names with <code>defineIcons</code> and the{' '}
        <code>icons</code> prop of <code>KvirnProvider</code>. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: iconRows,
    attributes: iconAttributes,
  },
]

export function IconPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: IconExampleSources
}) {
  return (
    <ComponentPage
      title="Icon"
      lead="A small drawing that supports the text next to it. It is hidden from screen readers unless you give it a name, and it takes its size and colour from the text around it."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it beside a word to make an action or a status quicker to recognise: add, search,
            warning.
          </li>
          <li>
            Draw it from the built-in set, from a component of your own icon library, or from your
            own shapes.
          </li>
          <li>
            Give it a name only when no text beside it says the same thing, and never let it be the
            only sign of a status.
          </li>
          <li>
            Not for something users can press: put the icon inside a{' '}
            <Link href="/components/button">Button</Link> or a{' '}
            <Link href="/components/link">Link</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultIcon />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="meaningful-icon"
            title="An icon that adds meaning"
            why="Here the icon says what the word beside it is: the language. A label turns it into an image with that name, so a screen reader says the label, “Language” in English, before the word."
            code={sources['with-label']}
            propsUsed={[{ part: 'Icon', prop: 'label' }]}
            note={
              <Note kind="reminder">
                Give an icon a label only when no text beside it says the same, or it is read twice.
                See <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <WithLabel />
          </UseCase>
          <UseCase
            id="size"
            title="A size that follows the text"
            why="A number is a step of the size scale, times 0.25em, so icons grow with the text and with the user’s text size. For a fixed size, pass a CSS length."
            code={sources['sizes']}
            propsUsed={[{ part: 'Icon', prop: 'size' }]}
          >
            <Sizes />
          </UseCase>
          <UseCase
            id="library-icon"
            title="An icon from your own library"
            why="Pass a component that spreads SVG props onto one svg and forwards its ref, such as one from Lucide, Heroicons, Phosphor or Tabler, or your own."
            code={sources['own-component']}
            propsUsed={[{ part: 'Icon', prop: 'icon' }]}
            note={
              <Note kind="tip">
                Icon’s size, colour and label replace the component’s own, so every icon in the page
                is sized the same way.
              </Note>
            }
          >
            <OwnComponent />
          </UseCase>
          <UseCase
            id="one-off-drawing"
            title="A one-off drawing"
            why="For a shape you use once, pass your own shapes as children, with a viewBox. Icon is the svg, so the size, colour and name work as for any icon."
            code={sources['one-off-drawing']}
            propsUsed={[
              { part: 'Icon', prop: 'children' },
              { part: 'Icon', prop: 'label' },
            ]}
          >
            <OneOffDrawing />
          </UseCase>
          <UseCase
            id="right-to-left"
            title="An arrow in right-to-left text"
            why="The built-in arrows and chevrons flip in right-to-left text, so “next” still points forward. Set mirrorInRtl yourself on a directional icon of your own."
            code={sources['mirror-in-rtl']}
            propsUsed={[{ part: 'Icon', prop: 'mirrorInRtl' }]}
            note={
              <Note kind="reminder">
                Set <code>mirrorInRtl</code> only on directional icons: arrows and chevrons, never a
                tick, a logo or an icon with text in it.
              </Note>
            }
          >
            <MirrorInRtl />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Icon, defineIcons, useIcon } from '@kvirn-ui/react'"
          parts={parts}
          hook={useIconHook}
        />
      }
    />
  )
}

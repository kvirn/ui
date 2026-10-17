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
import { MapSet } from '../examples/icon/map-set.tsx'
import { MirrorInRtl } from '../examples/icon/mirror-in-rtl.tsx'
import { OneOffDrawing } from '../examples/icon/one-off-drawing.tsx'
import { OwnComponent } from '../examples/icon/own-component.tsx'
import { RichTextSet } from '../examples/icon/rich-text-set.tsx'
import { Sizes } from '../examples/icon/sizes.tsx'
import { WithLabel } from '../examples/icon/with-label.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type IconExampleSources = Record<
  | 'default'
  | 'map-set'
  | 'rich-text-set'
  | 'with-label'
  | 'sizes'
  | 'own-component'
  | 'one-off-drawing'
  | 'mirror-in-rtl',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Icon',
    renders: (
      <>
        <code>&lt;svg class=&quot;kv-icon&quot;&gt;</code>, hidden from assistive technology, or{' '}
        <code>role=&quot;img&quot;</code> with a <code>label</code>. It takes every attribute of an{' '}
        <code>&lt;svg&gt;</code> and passes <code>ref</code> to it, except the ones that would
        change what it is or does: <code>width</code>, <code>height</code>, <code>aria-label</code>,{' '}
        <code>aria-hidden</code>, <code>role</code>, <code>color</code>, <code>fill</code>,{' '}
        <code>stroke</code>, <code>strokeWidth</code>, <code>tabIndex</code>, <code>onClick</code>,{' '}
        <code>aria-labelledby</code> and <code>aria-describedby</code>. An icon can’t be focused or
        pressed, and its name comes only from <code>label</code>: put focus and press on the Button
        or Link around it. Register your own names with <code>defineIcons</code> and the{' '}
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
      lead="It is hidden from screen readers unless you give it a name. It is drawn in the colour of the text around it, and its size follows the reader’s browser text-size setting."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it beside a word to make an action or a status quicker to recognise: add, search,
            warning.
          </li>
          <li>
            Draw it from the icon library, from a component of your own icon set, or from your own
            shapes.
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
          <p>
            The components use icons by name, such as <code>close</code>, <code>chevron-down</code>{' '}
            and <code>search</code>. These come from the icon library. To pick an icon for your own
            use, look through all of them on the <Link href="/components/icons">Icons page</Link>.
          </p>
          <UseCase
            id="map-set"
            title="The Map’s icons"
            why={
              <>
                The map package draws the default marker pin and the control arrows with icons from{' '}
                <code>@kvirn-ui/icons</code>. Pass one with <code>icon</code>, or register them with{' '}
                <code>defineIcons</code>. <code>mapIcons</code> in <code>@kvirn-ui/map</code> lists
                them by name.
              </>
            }
            code={sources['map-set']}
            propsUsed={[{ part: 'Icon', prop: 'icon' }]}
          >
            <MapSet />
          </UseCase>
          <UseCase
            id="rich-text-set"
            title="The rich text editor’s icons"
            why={
              <>
                The editor draws its toolbar icons with <code>RichTextEditor.Icon</code>, from the
                names in <code>richTextIconNames</code> in <code>@kvirn-ui/rich-text</code>. They
                are icons from <code>@kvirn-ui/icons</code>.
              </>
            }
            code={sources['rich-text-set']}
          >
            <RichTextSet />
          </UseCase>
          <UseCase
            id="meaningful-icon"
            title="An icon that adds meaning"
            why="Here the icon says what the word beside it is: the language. A label turns it into an image with that name, so a screen reader says “Language” before the word."
            code={sources['with-label']}
            propsUsed={[{ part: 'Icon', prop: 'label' }]}
            note={
              <Note kind="reminder">
                An icon that carries a meaning no text beside it gives needs a label (1.1.1 Non-text
                Content). If text beside it says the same, leave the label out, or it is read twice.
                See <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <WithLabel />
          </UseCase>
          <UseCase
            id="size"
            title="A size that follows the reader’s settings"
            why="The size is a pixel size as a string, such as “24”. The icon is drawn in rem, so it grows with the browser’s text-size setting and zoom. For another size, add a class."
            code={sources['sizes']}
            propsUsed={[{ part: 'Icon', prop: 'size' }]}
          >
            <Sizes />
          </UseCase>
          <UseCase
            id="library-icon"
            title="An icon from a library, or of your own"
            why="Pass a component that spreads SVG props onto one svg and forwards its ref, such as one from Lucide, Heroicons or Phosphor, or your own. It needs no registration."
            code={sources['own-component']}
            propsUsed={[{ part: 'Icon', prop: 'icon' }]}
            note={
              <Note kind="tip">
                Icon’s <code>size</code> and <code>label</code> replace the component’s own, so
                every icon on the page is sized the same way.
              </Note>
            }
          >
            <OwnComponent />
          </UseCase>
          <UseCase
            id="one-off-drawing"
            title="A one-off drawing"
            why="For a mark you use once, such as a municipality’s own, pass its shapes as children, with a viewBox. Icon is the svg, so the size, the name and the colour work as for any icon. Draw the shapes with currentColor so they follow the text colour, also in forced colours (a Windows contrast theme)."
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
            why={
              <>
                In right-to-left text the library’s arrows, chevrons and the external-link icon are
                flipped by the default theme, so “next” still points forward. Set{' '}
                <code>mirrorInRtl</code> yourself on a directional icon of your own.
              </>
            }
            code={sources['mirror-in-rtl']}
            propsUsed={[{ part: 'Icon', prop: 'mirrorInRtl' }]}
            note={
              <Note kind="tip">
                Set <code>mirrorInRtl</code> only on icons that point somewhere: arrows and
                chevrons, never a tick, a logo or an icon with text in it.
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

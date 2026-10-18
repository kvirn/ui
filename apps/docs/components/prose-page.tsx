import {
  Heading,
  Link,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableRoot,
  TableRow,
  TableRowHeader,
  TableScrollRegion,
} from '@kvirn-ui/react'
import { messages } from '../messages/en.ts'
import { apiPartId, apiRowId } from './api-ids.ts'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { proseAttributes, proseRows, useProseResultRows } from '../content/prose.api.ts'
import { ArticleProse } from '../examples/prose/article.tsx'
import { CmsText } from '../examples/prose/cms-text.tsx'
import { DefaultProse } from '../examples/prose/default.tsx'
import { FieldDescription } from '../examples/prose/field-description.tsx'
import { ImagesAndMediaProse } from '../examples/prose/images-and-media.tsx'
import { InsetTextProse } from '../examples/prose/inset-text.tsx'
import { LargeProse } from '../examples/prose/large.tsx'
import { StepsProse } from '../examples/prose/steps.tsx'
import type { Contract } from '../lib/contract-parser.ts'

const text = messages.docs.api

export type ProseExampleSources = Record<
  | 'default'
  | 'article'
  | 'large'
  | 'field-description'
  | 'cms-text'
  | 'inset-text'
  | 'steps'
  | 'images-and-media',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Prose',
    renders: (
      <>
        <code>&lt;div class=&quot;kv-prose&quot;&gt;</code> with no role. It takes every attribute
        of a <code>&lt;div&gt;</code> and passes <code>ref</code> to it. <code>ProseRoot</code> is
        the same component, and <code>Prose.Root</code> is a deprecated alias. In a Field or
        Fieldset write <code>Field.Prose</code> or <code>Fieldset.Prose</code>. The default theme is
        described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: proseRows,
    attributes: proseAttributes,
  },
]

// ApiBlock's hook table needs options, and useProse has none, so its result is a local table.
function ProseHook() {
  const headingId = apiPartId('useProse')
  return (
    <>
      <Heading as="h3" id={headingId}>
        useProse
      </Heading>
      <p>
        Takes no options. Use it when you can’t use <code>as</code>, for example on a component of
        your own. It returns the same props for every call.
      </p>
      <p>{text.result}</p>
      <TableScrollRegion aria-labelledby={headingId}>
        <TableRoot className="kv-table--card kv-table--striped" aria-labelledby={headingId}>
          <TableHead>
            <TableRow>
              <TableColumnHeader>{text.prop}</TableColumnHeader>
              <TableColumnHeader>{text.type}</TableColumnHeader>
              <TableColumnHeader>{text.default}</TableColumnHeader>
              <TableColumnHeader>{text.description}</TableColumnHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(useProseResultRows).map(([prop, row]) => (
              <TableRow key={prop}>
                <TableRowHeader id={apiRowId('useProse-result', prop)}>
                  <code>{prop}</code>
                </TableRowHeader>
                <TableCell>
                  <code>{row.type}</code>
                </TableCell>
                <TableCell>
                  {row.default === undefined ? text.required : <code>{row.default}</code>}
                </TableCell>
                <TableCell>{row.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      </TableScrollRegion>
    </>
  )
}

export function ProsePage({
  contract,
  sources,
}: {
  contract: Contract
  sources: ProseExampleSources
}) {
  return (
    <ComponentPage
      title="Prose"
      lead="It adds no role, so what assistive technology finds is the headings, lists and links you write."
      whenToUse={
        <ul>
          <li>
            Use it around text that people read: an article, guidance, a confirmation page or the
            body of a message.
          </li>
          <li>
            Write plain <code>h1</code> to <code>h6</code>, <code>p</code>, <code>ul</code> and{' '}
            <code>a</code> inside it. Prose styles them, so you need no component for each.
          </li>
          <li>
            Use it for the description of a field or a group of fields: inside a Field or Fieldset
            it is linked to the control, so a screen reader reads it with the control.
          </li>
          <li>
            Not for a region with its own surface: use a{' '}
            <Link href="/components/section">Section</Link> and put the Prose inside it. Not for a
            help text that helps while typing: that is a <code>Field.HelpText</code>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultProse />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="article"
            title="A page of text"
            why="Render the Prose as an article when the text is a piece of content in its own right. The element keeps its own meaning: Prose adds nothing to it."
            code={sources['article']}
            propsUsed={[{ part: 'Prose', prop: 'as' }]}
          >
            <ArticleProse />
          </UseCase>
          <UseCase
            id="larger-text"
            title="Larger text for long reading"
            why="For guidance that residents read in full, add the large size. The text stays in rem, so it still resizes with the browser."
            code={sources['large']}
          >
            <LargeProse />
          </UseCase>
          <UseCase
            id="field-description"
            title="A description of a field"
            why="Inside a Field, a Prose is the description of the control. A screen reader reads it with the control, before any error message. Write it as Field.Prose, or Fieldset.Prose for a group."
            code={sources['field-description']}
            note={
              <Note kind="reminder">
                A description is read as plain text, so a heading, list or link in it loses its
                structure. Keep it to a few short paragraphs, as in{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <FieldDescription />
          </UseCase>
          <UseCase
            id="inset-text"
            title="A paragraph that must not be missed"
            why={
              <>
                Set a condition, an exception or a tip apart from the text around it with the{' '}
                <code>kv-inset</code> class. It is part of the article, has no role, and nothing is
                announced. A deadline that loses someone their right, or money, is an{' '}
                <Link href="/components/alert">Alert</Link> (<code>Alert.Warning</code>) instead.
              </>
            }
            code={sources['inset-text']}
            note={
              <Note kind="reminder">
                Start an inset with a word that says why it is set apart, such as “Important:”. The
                bar and the fill aren’t read aloud, and colour must never be the only cue (1.4.1 Use
                of Color).
              </Note>
            }
          >
            <InsetTextProse />
          </UseCase>
          <UseCase
            id="steps"
            title="A process in order"
            why="Write the steps as a native ol with the kv-steps class. Every step has a heading and text, or none has a heading. Start each heading with a verb. The list keeps its native numbers and list role, which a test checks in Chromium. Check the same in Safari with VoiceOver."
            code={sources['steps']}
            note={
              <Note kind="tip">
                Steps or Stepper: steps are guidance to read, in one page. They are not a progress
                indicator in a form, which is a Stepper.
              </Note>
            }
          >
            <StepsProse />
          </UseCase>
          <UseCase
            id="images-and-media"
            title="A picture with a caption"
            why="Wrap the picture in a figure with a figcaption. The alt text says what the picture shows, and the caption holds the source or credit, so the two never repeat each other."
            code={sources['images-and-media']}
            note={
              <Note kind="reminder">
                Captions, never an embed: put every fact a picture carries in the text next to it
                (1.1.1 Non-text Content). If you use video, host it yourself with captions, and
                don’t embed one from a third party.
              </Note>
            }
          >
            <ImagesAndMediaProse />
          </UseCase>
          <UseCase
            id="cms-text"
            title="Text from a CMS"
            why="When a component of your own renders text from a CMS, spread the hook’s props on its root element so the body gets the prose styles."
            code={sources['cms-text']}
            note={
              <Note kind="reminder">
                CMS content still needs real headings in order and real lists (1.3.1 Info and
                Relationships). Prose styles them but adds no structure. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <CmsText />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Prose styles your text but adds no structure. Use real headings in order, real
                lists, and links that say where they go (1.3.1 Info and Relationships, 2.4.4 Link
                Purpose (In Context)). Check text from a CMS or Markdown the same way.
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <>
          <ApiBlock importLine="import { Prose, useProse } from '@kvirn-ui/react'" parts={parts} />
          <ProseHook />
        </>
      }
    />
  )
}

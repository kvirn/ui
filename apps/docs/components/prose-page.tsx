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
import { CodeBlock } from './code-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { proseAttributes, proseRows, useProseResultRows } from '../content/prose.api.ts'
import { ArticleProse } from '../examples/prose/article.tsx'
import { DefaultProse } from '../examples/prose/default.tsx'
import { FieldDescription } from '../examples/prose/field-description.tsx'
import { LargeProse } from '../examples/prose/large.tsx'
import { OwnElementProse } from '../examples/prose/own-element.tsx'
import type { Contract } from '../lib/contract-parser.ts'

const text = messages.docs.api

export type ProseExampleSources = Record<
  'default' | 'article' | 'large' | 'field-description' | 'own-element',
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
        <TableRoot aria-labelledby={headingId}>
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
      lead="A container that sets headings, paragraphs, lists, links and tables for reading. It adds no role and no behaviour, so the semantics are the ones you write."
      status="alpha"
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
            it is read before the answer.
          </li>
          <li>
            Not for a region with its own surface: use a Section and put the Prose inside it. Not
            for a help text that helps while typing: that is a <code>Field.HelpText</code>.
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
            why="Render the Prose as an article when the text is a piece of content in its own right. The element keeps its own meaning, so a screen reader user can find it with landmark or article navigation."
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
            why="Inside a Field, a Prose is the description of the control: it gets an id and the control lists it in aria-describedby, before the error. Write it as Field.Prose, or Fieldset.Prose for a group."
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
            id="own-element"
            title="Your own element"
            why="When as doesn’t fit, for example on a component of your own, spread the hook’s props on your element."
            code={sources['own-element']}
            note={
              <Note
                kind="tip"
                more={<CodeBlock code={'<Prose as="section" aria-labelledby={titleId}>'} />}
              >
                Most of the time as does the same with less code.
              </Note>
            }
          >
            <OwnElementProse />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
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

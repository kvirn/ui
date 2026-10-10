import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  characterCountAttributes,
  characterCountRows,
  textareaAttributes,
  textareaRows,
  useCharacterCountRows,
  useTextareaHook,
} from '../content/textarea.api.ts'
import { CharacterLimit } from '../examples/textarea/character-limit.tsx'
import { CountUnderTextInput } from '../examples/textarea/count-under-text-input.tsx'
import { CountYourWay } from '../examples/textarea/count-your-way.tsx'
import { DefaultTextarea } from '../examples/textarea/default.tsx'
import { ErrorOnSubmit } from '../examples/textarea/error-on-submit.tsx'
import { RestoredDraft } from '../examples/textarea/restored-draft.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type TextareaExampleSources = Record<
  | 'default'
  | 'character-limit'
  | 'count-your-way'
  | 'error-on-submit'
  | 'restored-draft'
  | 'count-under-text-input',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Textarea',
    renders: (
      <>
        <code>&lt;textarea&gt;</code> with the role <code>textbox</code> (multi-line). It takes
        every attribute of a <code>&lt;textarea&gt;</code> except <code>dir</code>, which is the
        page’s, and passes <code>ref</code> to it. Put it in a <code>Field</code>: the label,
        description, help text and error are wired to it. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: textareaRows,
    attributes: textareaAttributes,
  },
  {
    name: 'CharacterCount',
    renders: (
      <>
        <code>&lt;p&gt;</code> with no role: a help text that says how much room is left. Textarea
        renders one for <code>characterCount</code>; use this part for the count under another
        control. It is not a live region: it is announced through the Announcer.
      </>
    ),
    props: characterCountRows,
    attributes: characterCountAttributes,
  },
]

export function TextareaPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: TextareaExampleSources
}) {
  return (
    <ComponentPage
      title="Textarea"
      lead="It never cuts a pasted text, and it can show how many characters are left."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use a Textarea when the answer is a few sentences or more: a description, a reason, a
            message to a case worker.
          </li>
          <li>
            Put it in a <code>Field</code> with a visible label. Say what to answer in a description
            above the box, and a format or a limit in a help text under it.
          </li>
          <li>
            Add a count only when the user can plausibly reach a limit, and only when your form has
            one. Don’t cut the text: let the user shorten it.
          </li>
          <li>
            Not for a short answer such as a name or a phone number: use a <code>TextInput</code>.
            Not for an amount or a quantity: use a{' '}
            <Link href="/components/number-input">NumberInput</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultTextarea />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="character-limit"
            title="A limit the user can see"
            why="Your form accepts at most 200 characters. The count says so before the user gets there, says how many are left while they type, and says how many are over if they go past it."
            code={sources['character-limit']}
            propsUsed={[
              { part: 'Textarea', prop: 'characterCount' },
              { part: 'Textarea', prop: 'maxLength' },
            ]}
            note={
              <Note kind="tip">
                With <code>characterCount</code> the limit is not written as the native{' '}
                <code>maxlength</code>, so a pasted text is kept whole and the count says how many
                characters are over. Over the limit is a warning, never an error: your form decides
                on submit.
              </Note>
            }
          >
            <CharacterLimit />
          </UseCase>
          <UseCase
            id="count-like-your-server"
            title="Count the way your server counts"
            why="The count and your server must agree, or a text the box accepts is refused on submit. Pass a function that counts the way the server does. By default the count counts what the user sees, and a line break is one character."
            code={sources['count-your-way']}
            propsUsed={[{ part: 'Textarea', prop: 'countCharacters' }]}
          >
            <CountYourWay />
          </UseCase>
          <UseCase
            id="error-on-submit"
            title="An error after submit"
            why="KvirnUI validates nothing. Your form checks the text when it is sent, sets invalid on the Field and writes the message. Then move focus to the box, after the error has rendered, so the screen reader reads it with the box."
            code={sources['error-on-submit']}
            propsUsed={[
              { part: 'Textarea', prop: 'value' },
              { part: 'Textarea', prop: 'onValueChange' },
              { part: 'Textarea', prop: 'maxLength' },
              { part: 'Textarea', prop: 'characterCount' },
            ]}
            note={
              <Note kind="reminder">
                Say which field is wrong and how to fix it, in text: “Remove some text”, not just a
                red edge. See <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <ErrorOnSubmit />
          </UseCase>
          <UseCase
            id="restored-draft"
            title="A text that comes from your code"
            why="A saved draft, or a form your library resets. Pass value so the count follows it: an uncontrolled box counts what is typed, and does not see a text you write to the element later. A text set from code changes the count and says nothing aloud."
            code={sources['restored-draft']}
            propsUsed={[
              { part: 'Textarea', prop: 'value' },
              { part: 'Textarea', prop: 'onValueChange' },
            ]}
          >
            <RestoredDraft />
          </UseCase>
          <UseCase
            id="count-under-text-input"
            title="A count under a short text"
            why="CharacterCount is its own part, so another control can have a count. Put it directly after the control in the same Field, and the Field lists it in the control’s aria-describedby."
            code={sources['count-under-text-input']}
            propsUsed={[
              { part: 'CharacterCount', prop: 'value' },
              { part: 'CharacterCount', prop: 'limit' },
            ]}
          >
            <CountUnderTextInput />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} linkToStrings />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Textarea, CharacterCount, useTextarea, useCharacterCount } from '@kvirn-ui/react'"
          parts={parts}
          hooks={[
            useTextareaHook,
            {
              name: 'useCharacterCount',
              intro: (
                <>
                  The count’s props and text for your own element. It returns{' '}
                  <code>countProps</code> (spread on a <code>&lt;p&gt;</code>), <code>count</code> (
                  <code>length</code>, <code>remaining</code>, <code>excess</code>,{' '}
                  <code>isOver</code>, <code>isNear</code>, <code>isEmpty</code>), <code>text</code>{' '}
                  and <code>isOver</code>.
                </>
              ),
              options: useCharacterCountRows,
            },
          ]}
          strings={
            <StringsBlock
              namespace="characterCount"
              component="Textarea"
              keys={[
                {
                  key: 'limit',
                  meaning: 'The count before the user types: how many characters fit.',
                  values: { limit: 500 },
                },
                {
                  key: 'remaining',
                  meaning: 'The count as the limit nears: how many characters are left.',
                  values: { count: 120 },
                },
                {
                  key: 'over',
                  meaning: 'The count past the limit: how many characters are too many.',
                  values: { count: 12 },
                },
              ]}
            />
          }
        />
      }
    />
  )
}

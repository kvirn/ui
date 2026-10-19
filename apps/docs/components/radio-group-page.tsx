import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { CodeBlock } from './code-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  radioAttributes,
  radioGroupOptionAttributes,
  radioGroupOptionRows,
  radioGroupErrorMessageAttributes,
  radioGroupHelpTextAttributes,
  radioGroupLegendAttributes,
  radioGroupLegendRows,
  radioGroupProseAttributes,
  radioGroupRevealAttributes,
  radioGroupRevealRows,
  radioGroupRootAttributes,
  radioGroupRootRows,
  radioRows,
  useRadioGroupHook,
  useRadioRows,
} from '../content/radio-group.api.ts'
import { AnnouncementWordingRadioGroup } from '../examples/radio-group/announcement-wording.tsx'
import { CompactRadioGroup } from '../examples/radio-group/compact.tsx'
import { ControlledRadioGroup } from '../examples/radio-group/controlled.tsx'
import { DefaultRadioGroup } from '../examples/radio-group/default.tsx'
import { DisabledOptionRadioGroup } from '../examples/radio-group/disabled-option.tsx'
import { ErrorOnSubmitRadioGroup } from '../examples/radio-group/error-on-submit.tsx'
import { InvalidRadioGroup } from '../examples/radio-group/invalid.tsx'
import { OptionHelpTextRadioGroup } from '../examples/radio-group/option-help-text.tsx'
import { OtherOptionRadioGroup } from '../examples/radio-group/other-option.tsx'
import { PageHeadingRadioGroup } from '../examples/radio-group/page-heading.tsx'
import { PlainFormRadioGroup } from '../examples/radio-group/plain-form.tsx'
import type { Contract } from '../lib/contract-parser.ts'

const providerWording = `import { defineMessages } from '@kvirn-ui/i18n'
import { en } from '@kvirn-ui/i18n/en'

// The text it replaces: en.radioGroup.revealShown
const messages = defineMessages(en, {
  radioGroup: { revealShown: 'A box for your own words has opened below.' },
})

<KvirnProvider messages={messages}>{/* your site */}</KvirnProvider>`

export type RadioGroupExampleSources = Record<
  | 'default'
  | 'controlled'
  | 'plain-form'
  | 'option-help-text'
  | 'error-on-submit'
  | 'disabled-option'
  | 'other-option'
  | 'announcement-wording'
  | 'invalid'
  | 'compact'
  | 'page-heading',
  string
>

const parts: ApiPart[] = [
  {
    name: 'RadioGroup.Root',
    renders: (
      <>
        <code>&lt;fieldset&gt;</code>, which a screen reader announces as a group. It is a{' '}
        <code>Fieldset.Root</code> with <code>group</code> set, takes every attribute of a{' '}
        <code>&lt;fieldset&gt;</code> and passes <code>ref</code> to it. Its options are{' '}
        <code>RadioGroup.Option</code> parts, each with a <code>RadioGroup.Radio</code> and its
        label. The default theme is described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: radioGroupRootRows,
    attributes: radioGroupRootAttributes,
  },
  {
    name: 'RadioGroup.Option',
    renders: (
      <>
        <code>&lt;div&gt;</code> (or <code>&lt;li&gt;</code>) around one answer: its radio, its{' '}
        <code>Field.Label</code> and its <code>Field.HelpText</code>. It has no “(optional)” marker
        and no error message of its own: those belong to the question.
      </>
    ),
    props: radioGroupOptionRows,
    attributes: radioGroupOptionAttributes,
  },
  {
    name: 'RadioGroup.Radio',
    renders: (
      <>
        <code>&lt;input type=&quot;radio&quot;&gt;</code> with the role <code>radio</code>. It takes
        every attribute of an <code>&lt;input&gt;</code> and passes <code>ref</code> to it. Put it
        directly in a <code>RadioGroup.Option</code>, before the label. It never has{' '}
        <code>aria-invalid</code> or <code>aria-required</code>: ARIA doesn’t support them on a
        radio.
      </>
    ),
    props: radioRows,
    attributes: radioAttributes,
  },
  {
    name: 'RadioGroup.Reveal',
    renders: (
      <>
        <code>&lt;div&gt;</code> (or <code>&lt;section&gt;</code>) that holds what belongs to one
        radio, such as an “Other, please specify” field. Put it right after that radio’s{' '}
        <code>RadioGroup.Option</code>. It is <code>hidden</code> until the radio is checked, is
        never unmounted, and never moves focus. The radio gets <code>aria-controls</code>. When
        someone checks the radio, a screen reader says “An input field has appeared below.” politely
        (see <Link href="#api-strings">Strings</Link> to change the text). The typed text is still
        submitted by a plain form: ignore or clear it on the server.
      </>
    ),
    props: radioGroupRevealRows,
    attributes: radioGroupRevealAttributes,
  },
  {
    name: 'RadioGroup.Legend',
    renders: (
      <>
        <code>&lt;legend&gt;</code>, the question and the group’s name. Put it first.
      </>
    ),
    props: radioGroupLegendRows,
    attributes: radioGroupLegendAttributes,
  },
  {
    name: 'RadioGroup.Prose',
    renders: (
      <>
        <code>&lt;div&gt;</code> with the class <code>kv-prose</code>: the description, read before
        answering, above the options. It is listed in the group’s <code>aria-describedby</code>.
      </>
    ),
    attributes: radioGroupProseAttributes,
  },
  {
    name: 'RadioGroup.HelpText',
    renders: (
      <>
        <code>&lt;p&gt;</code>: a short instruction under the options. It is listed in the group’s{' '}
        <code>aria-describedby</code>. A help text for one option is a <code>Field.HelpText</code>{' '}
        in that option’s <code>RadioGroup.Option</code>.
      </>
    ),
    attributes: radioGroupHelpTextAttributes,
  },
  {
    name: 'RadioGroup.ErrorMessage',
    renders: (
      <>
        <code>&lt;p&gt;</code> that starts with the error icon and the hidden prefix. It renders
        only while the group is <code>invalid</code>, is the last item in the group’s{' '}
        <code>aria-describedby</code>, and is not a live region. Render one per group.
      </>
    ),
    attributes: radioGroupErrorMessageAttributes,
  },
]

export function RadioGroupPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: RadioGroupExampleSources
}) {
  return (
    <ComponentPage
      title="RadioGroup"
      lead="It names the group with a legend, and the browser’s own radio keys do the rest."
      pattern="APG Radio Group"
      whenToUse={
        <ul>
          <li>
            Use it for one question where the user must choose exactly one option and the options
            fit on the screen together: a period, a delivery method, a yes or no that needs more
            than a checkbox.
          </li>
          <li>
            Ask the question in the legend. Offer an answer for everyone: if “none” or “I don’t
            know” is valid, make it an option.
          </li>
          <li>
            Preselect an option only when one answer is overwhelmingly common and harmless, because
            residents rarely change a default.
          </li>
          <li>
            Not for a long list. From about 7 options a{' '}
            <Link href="/components/listbox">Listbox</Link> is shorter to scan.
          </li>
          <li>
            Not for answers that can all be true: use a{' '}
            <Link href="/components/checkbox-group">CheckboxGroup</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultRadioGroup />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="controlled"
            title="Keep the choice in your form state"
            why="Your form library or reducer owns the value. Give the group the chosen value and store the one it reports. The group never stores it. Pass null, not undefined, to say the group is controlled and nothing is chosen."
            code={sources['controlled']}
            propsUsed={[
              { part: 'RadioGroup.Root', prop: 'value' },
              { part: 'RadioGroup.Root', prop: 'onValueChange' },
              { part: 'RadioGroup.Radio', prop: 'value' },
            ]}
            note={
              <Note kind="tip">
                The arrow keys check the radio they move to, so nothing slow or harmful may happen
                on change. Leave the page change, the save and the submit to a button.
              </Note>
            }
          >
            <ControlledRadioGroup />
          </UseCase>
          <UseCase
            id="plain-form"
            title="A plain form with no state"
            why="Without value the radios are native and uncontrolled. Set which one starts checked with defaultValue, and give the group a name. A form submit then sends the chosen value under that name."
            code={sources['plain-form']}
            propsUsed={[
              { part: 'RadioGroup.Root', prop: 'defaultValue' },
              { part: 'RadioGroup.Root', prop: 'name' },
            ]}
          >
            <PlainFormRadioGroup />
          </UseCase>
          <UseCase
            id="option-help-text"
            title="Explain one option"
            why={
              <>
                A short text about one option goes in that option’s <code>RadioGroup.Option</code>{' '}
                as a <code>Field.HelpText</code>, directly under its label, and is read with that
                radio. Text about the whole group goes in <code>RadioGroup.HelpText</code> under the
                options. A description to read before answering goes in{' '}
                <code>RadioGroup.Prose</code> above them.
              </>
            }
            code={sources['option-help-text']}
          >
            <OptionHelpTextRadioGroup />
          </UseCase>
          <UseCase
            id="page-heading"
            title="One question on a page"
            why={
              <>
                When a page asks one question, the legend can be the page’s heading. Put the heading
                inside the legend and add the class <code>kv-fieldset-legend--heading</code>, which
                gives it the size of a page heading. Use <code>h1</code> if it is the page’s main
                heading. This example is inside a page that already has one, so it uses{' '}
                <code>h2</code>. When the person presses Continue with nothing chosen, show an
                error, as in{' '}
                <Link href="#error-on-submit">Say what is wrong when nothing is chosen</Link>.
              </>
            }
            code={sources['page-heading']}
            propsUsed={[{ part: 'RadioGroup.Root', prop: 'required' }]}
            note={
              <Note kind="tip">
                Set <code>required</code> on the group, as here. Without it the legend adds
                “(optional)” after your heading, so a question the person must answer looks optional
                (3.3.2 Labels or Instructions).
              </Note>
            }
          >
            <PageHeadingRadioGroup />
          </UseCase>
          <UseCase
            id="error-on-submit"
            title="Say what is wrong when nothing is chosen"
            why={
              <>
                Check the answer when the user sends the form. Set <code>invalid</code> and render a{' '}
                <code>RadioGroup.ErrorMessage</code> that says what to do. The error is read as part
                of the group’s description, because a radio can’t be marked invalid.{' '}
                <code>required</code> removes “(optional)” from the legend, but a group can’t be
                announced as required, so say once, before the first question, that every question
                must be answered unless it says “(optional)”.
              </>
            }
            code={sources['error-on-submit']}
            propsUsed={[
              { part: 'RadioGroup.Root', prop: 'invalid' },
              { part: 'RadioGroup.Root', prop: 'required' },
              { part: 'RadioGroup.Root', prop: 'value' },
            ]}
            note={
              <Note kind="reminder">
                The group never moves focus. After a failed submit, move it to the first radio or to
                an <Link href="/components/error-summary">ErrorSummary</Link>, as in{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <ErrorOnSubmitRadioGroup />
          </UseCase>
          <UseCase
            id="invalid"
            title="Say why an answer was not accepted"
            why={
              <>
                Sometimes a person answers, but you can’t accept the answer, and you only find out
                after they send the form. Here the chosen way to get a decision is not set up. After
                the check, set <code>invalid</code> on the group and render a{' '}
                <code>RadioGroup.ErrorMessage</code> that names the reason and says what to do next.
                Also show an <Link href="/components/error-summary">ErrorSummary</Link> whose link
                goes to the group’s first option: give that option a <code>controlId</code> and use
                the same id in the link. As above, the error is read with the group’s description,
                because a radio can’t be marked invalid. If you know before the person chooses,
                disable the option and say why, as in{' '}
                <Link href="#disabled-option">One option isn’t available</Link>.
              </>
            }
            code={sources['invalid']}
            propsUsed={[
              { part: 'RadioGroup.Root', prop: 'invalid' },
              { part: 'RadioGroup.Root', prop: 'value' },
              { part: 'RadioGroup.Option', prop: 'controlId' },
            ]}
            note={
              <Note kind="reminder">
                Use the same words in the summary and under the group. Name the reason and say what
                to do next (3.3.1 Error Identification, 3.3.3 Error Suggestion).
              </Note>
            }
          >
            <InvalidRadioGroup />
          </UseCase>
          <UseCase
            id="disabled-option"
            title="One option isn’t available"
            why="Tab and the arrow keys skip a disabled radio (the browser does this). A screen reader can still reach it when reading the page, and tells the user it can't be used (each screen reader words it differently). So say why in visible help text next to it, with what the person can do. To disable every option, set disabled on the group."
            code={sources['disabled-option']}
            propsUsed={[{ part: 'RadioGroup.Radio', prop: 'disabled' }]}
          >
            <DisabledOptionRadioGroup />
          </UseCase>
          <UseCase
            id="other-option"
            title="Let people answer “Other” in their own words"
            why="A free-text answer belongs to the option it qualifies, and it is only asked when it is needed. The text field appears when “Other” is chosen, so people who pick another option don’t see it."
            code={sources['other-option']}
            propsUsed={[
              { part: 'RadioGroup.Reveal', prop: 'value' },
              { part: 'RadioGroup.Radio', prop: 'value' },
            ]}
            note={
              <>
                <p>
                  When “Other” is checked, the text field appears right after it. A screen reader
                  says <q>An input field has appeared below.</q> once, politely, and reads the radio
                  with <q>1 control</q>. That sentence is the default text of{' '}
                  <code>radioGroup.revealShown</code> (see <Link href="#api-strings">Strings</Link>
                  ). Everything else it says is under{' '}
                  <Link href="#announcements-read-aloud">What a screen reader reads</Link>.
                </p>
                <Note kind="reminder">
                  A plain form still sends what was typed as <code>source-other</code>, so ignore it
                  on the server. Give the field a label of its own, and make it required only while
                  “Other” is chosen.
                </Note>
              </>
            }
          >
            <OtherOptionRadioGroup />
          </UseCase>
          <UseCase
            id="announcement-wording"
            title="Tell several “Other” questions apart by their announcement"
            why={
              <>
                When someone checks “Other”, a screen reader says that a field has appeared, right
                after it reads the radio. In English the default text is “An input field has
                appeared below.”, and it follows the language of the page. That is enough for one
                group. When a page has several, give each Reveal its own text that names its field,
                as below, so the person hears which one opened. Every group announces, also when you
                check them one after the other. See{' '}
                <Link href="#announcements-read-aloud">What a screen reader reads</Link>.
              </>
            }
            code={sources['announcement-wording']}
            propsUsed={[
              { part: 'RadioGroup.Reveal', prop: 'value' },
              { part: 'RadioGroup.Reveal', prop: 'messages' },
              { part: 'RadioGroup.Radio', prop: 'value' },
            ]}
            note={
              <Note kind="recipe" more={<CodeBlock language="tsx" code={providerWording} />}>
                To use one text for the whole site, pass it to the provider, as below. Write it in
                the language of the page: for another language, start from that language’s catalog
                instead of <code>en</code>. An empty text is ignored, so the default is used.{' '}
                <Link href="/foundation/locales#per-provider">Locales</Link> explains the rest.
              </Note>
            }
          >
            <AnnouncementWordingRadioGroup />
          </UseCase>
          <UseCase
            id="compact"
            title="A denser group for staff screens"
            why={
              <>
                A caseworker who records many decisions a day can fit more on the screen. Put the
                class <code>kv-compact</code> on the form, on any container around the group, or on{' '}
                <code>&lt;html&gt;</code> for a whole staff tool. It is a class, not a prop. From a
                window 64rem wide (1024 pixels at the browser’s default text size), option rows are
                32px high instead of 44px, the legend and option labels are 14px instead of 16px,
                options are 4px apart instead of 8px, and questions are 16px apart instead of 24px.
                In a narrower window nothing changes, because touch is likely there. The circle
                stays at least 24 by 24 pixels, and the description and error text stay 16px.
              </>
            }
            code={sources['compact']}
            note={
              <Note kind="tip">
                Compact rows meet 2.5.8 Target Size (Minimum) (AA), but not the 44px of 2.5.5 Target
                Size (Enhanced) (AAA). Keep services for residents at the default size.
              </Note>
            }
          >
            <CompactRadioGroup />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Ask the question in the legend, and give every radio a value and a label. Without
                the legend a screen reader reads the options with no question (1.3.1 Info and
                Relationships, 3.3.2 Labels or Instructions).
              </Note>
            ),
            'known-issues': (
              <Note kind="tip">
                Check these against your own service. Where one applies, name it in your
                accessibility statement with the workaround, so users know before they meet it.
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Field, RadioGroup, useRadio, useRadioGroup } from '@kvirn-ui/react'"
          parts={parts}
          hooks={[
            useRadioGroupHook,
            {
              name: 'useRadio',
              intro: (
                <>
                  A hook that gives your own <code>&lt;input type=&quot;radio&quot;&gt;</code> the
                  same attributes, wired to the nearest Option and RadioGroup. It returns{' '}
                  <code>inputProps</code> to spread on the input, and <code>isChecked</code> (known
                  from props only), <code>isInvalid</code> and <code>isDisabled</code>. It has no
                  focus state: style focus with <code>:focus-visible</code>.
                </>
              ),
              options: useRadioRows,
            },
          ]}
          strings={
            <>
              <StringsBlock
                namespace="field"
                component="RadioGroup"
                keys={[
                  {
                    key: 'optional',
                    meaning: 'The legend’s marker when the group is not required.',
                  },
                  {
                    key: 'errorPrefix',
                    meaning: 'Read before the error message, so it is not mistaken for help.',
                  },
                ]}
              >
                <p>These are the Field strings, because the legend and the error use them.</p>
              </StringsBlock>
              <StringsBlock
                namespace="radioGroup"
                component="RadioGroup.Reveal"
                keys={[
                  {
                    key: 'revealShown',
                    meaning:
                      'Said politely once, when a user checks a radio whose Reveal opens. Not said when the page loads, when the form resets or when your code sets the value.',
                  },
                ]}
              >
                <p>
                  This string belongs to <code>RadioGroup.Reveal</code>, so a <code>messages</code>{' '}
                  prop on the Root does not change it.
                </p>
              </StringsBlock>
            </>
          }
        />
      }
    />
  )
}

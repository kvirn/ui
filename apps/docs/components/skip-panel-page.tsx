import { Link } from '@kvirn-ui/react'
import type { ApiPart } from './api-block.tsx'
import { ApiBlock } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { CodeBlock } from './code-block.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  skipPanelHelpLinkAttributes,
  skipPanelHelpLinkRows,
  skipPanelLabelRows,
  skipPanelLinkAttributes,
  skipPanelLinkRows,
  skipPanelRootAttributes,
  skipPanelRootRows,
  skipPanelShortcutAttributes,
  skipPanelShortcutRows,
  useSkipPanelGroupHook,
  useSkipPanelHelpLinkHook,
  useSkipPanelHintHook,
  useSkipPanelHook,
  useSkipPanelLinkHook,
  useSkipPanelShortcutHook,
} from '../content/skip-panel.api.ts'
import { DefaultSkipPanel } from '../examples/skip-panel/default.tsx'
import { Reopen } from '../examples/skip-panel/reopen.tsx'
import { Shortcuts } from '../examples/skip-panel/shortcuts.tsx'
import { TurnOff } from '../examples/skip-panel/turn-off.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type SkipPanelExampleSources = Record<
  'default' | 'shortcuts' | 'reopen' | 'turn-off',
  string
>

const modRecipe = `<SkipPanel.Shortcut shortcut={{ key: 'k', mod: true }} onClick={focusSearch}>
  Search
</SkipPanel.Shortcut>`

const parts: ApiPart[] = [
  {
    name: 'SkipPanel.Root',
    renders: (
      <>
        <code>&lt;div class=&quot;kv-skip-panel&quot;&gt;</code> with no role. It takes every
        attribute of a <code>&lt;div&gt;</code> and passes <code>ref</code> to it. It makes the
        panel one Tab stop by setting <code>tabindex</code> on its items, and handles the arrow,
        Home, End and Escape keys. Put it first in the body. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: skipPanelRootRows,
    attributes: skipPanelRootAttributes,
  },
  {
    name: 'SkipPanel.Group',
    renders: (
      <>
        <code>&lt;div role=&quot;group&quot;&gt;</code>, named by its Label. It takes every
        attribute of a <code>&lt;div&gt;</code>.
      </>
    ),
  },
  {
    name: 'SkipPanel.Label',
    renders: (
      <>
        <code>&lt;span&gt;</code> with the group’s visible name. It is not a heading.
      </>
    ),
    props: skipPanelLabelRows,
  },
  {
    name: 'SkipPanel.List',
    renders: (
      <>
        <code>&lt;ul role=&quot;list&quot;&gt;</code>. The role keeps the list a list for screen
        readers when a style removes the bullets.
      </>
    ),
  },
  {
    name: 'SkipPanel.Item',
    renders: (
      <>
        <code>&lt;li&gt;</code>.
      </>
    ),
  },
  {
    name: 'SkipPanel.Link',
    renders: (
      <>
        <code>&lt;a href&gt;</code> with the role <code>link</code>. Activating it moves focus to
        the target, as <Link href="/components/skip-link">SkipLink</Link> does. It takes every
        attribute of an <code>&lt;a&gt;</code> and passes <code>ref</code> to it.
      </>
    ),
    props: skipPanelLinkRows,
    attributes: skipPanelLinkAttributes,
  },
  {
    name: 'SkipPanel.Shortcut',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code>, or a link with <code>as</code>. It
        shows your text and then the key names, each in a <Link href="/components/kbd">Kbd</Link>.
        It takes every attribute of the element and passes <code>ref</code> to it.
      </>
    ),
    props: skipPanelShortcutRows,
    attributes: skipPanelShortcutAttributes,
  },
  {
    name: 'SkipPanel.HelpLink',
    renders: (
      <>
        <code>&lt;a href&gt;</code> that goes last in the list, to the page where a visitor reads
        about the shortcuts and turns them off. It follows its address as any link does and moves no
        focus. The Up and Down arrow keys reach it, but it is not a Tab stop of its own. It stays in
        the list when <code>shortcutsEnabled</code> is <code>false</code>, so a visitor can turn the
        shortcuts back on. Its default text is “Keyboard help and settings”. It takes every
        attribute of an <code>&lt;a&gt;</code> and passes <code>ref</code> to it.
      </>
    ),
    props: skipPanelHelpLinkRows,
    attributes: skipPanelHelpLinkAttributes,
  },
  {
    name: 'SkipPanel.Hint',
    renders: (
      <>
        <code>&lt;p&gt;</code> with short instructions for the list. It always renders the arrow
        sentence, “Use the up and down arrow keys to move between items.” The first link is
        described by it, so a screen reader reads it when focus arrives. With a{' '}
        <code>reopenShortcut</code> and shortcuts on, it adds a second sentence, such as “Press
        Alt+Shift+K to open this list again.” Always put one inside the Root: without it a
        development warning says the first link has no description. It takes every attribute of a{' '}
        <code>&lt;p&gt;</code>.
      </>
    ),
  },
]

export function SkipPanelPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: SkipPanelExampleSources
}) {
  return (
    <ComponentPage
      title="SkipPanel"
      lead="The whole panel is one Tab stop (a place where the Tab key stops). The first Tab lands on the first link and the next Tab leaves the panel. The Up and Down arrow keys move between the items. Every shortcut is also a row in the list, so nobody has to use the keys."
      whenToUse={
        <ul>
          <li>
            Use it when people often go to one of a few places first, such as the main content, the
            menu or the search. A municipality portal with a long header or a large menu is a good
            fit.
          </li>
          <li>
            Add shortcut rows only for real actions, such as “Search” or “My cases”. Every shortcut
            also shows in the list as a button or link, so people who can’t use the keys lose
            nothing. Keep the same links and shortcuts on every page (3.2.3 Consistent Navigation,
            AA).
          </li>
          <li>
            Put it first in the page, before the header and any other link. If the page also has a{' '}
            <Link href="/components/quick-exit">QuickExit</Link>, that comes first.
          </li>
          <li>
            It stays one Tab stop however many items it has. Someone who wants the header presses
            Tab once, instead of tabbing through every shortcut on every page.
          </li>
          <li>
            Keep it short: at most three skip links, five shortcuts and six items in all. A long
            list is slow to move through with the arrow keys.
          </li>
          <li>
            Not for a skip link that must stay in the page flow, or where one target is enough, such
            as an e-service, a form or a page with a short header (about five Tab stops or fewer
            before the main content). Use a <Link href="/components/skip-link">SkipLink</Link>{' '}
            instead.
          </li>
        </ul>
      }
      example={
        <>
          <ExampleFrame headingId="example" code={sources['default']}>
            <DefaultSkipPanel />
          </ExampleFrame>
          <Note kind="tip">
            The panel floats over the top of the page. In these examples it floats inside the
            example frame so you can see it. See{' '}
            <Link href="#visual-and-modes">Visual and modes</Link>.
          </Note>
        </>
      }
      useCases={
        <>
          <UseCase
            id="shortcuts"
            title="Shortcuts for the search and for My cases"
            why={
              <>
                Residents of a municipality often search the site or check their cases. A second
                group lists these two as rows. “Search” is a button that moves focus to the search
                field. “My cases” is a link. Each row has a chord: keys pressed together, such as
                Alt+Shift+S. Press the chord anywhere on the page, except in a text field, and the
                row runs as if you had pressed it. The help link goes last. In this example the
                links point to places on the same page. On your site, “My cases” points to the cases
                page. The help link points to the page where visitors read about the shortcuts and
                turn them off, such as <code>/accessibility-settings#shortcuts</code>.
              </>
            }
            code={sources['shortcuts']}
            propsUsed={[
              { part: 'SkipPanel.Label', prop: 'kind' },
              { part: 'SkipPanel.Shortcut', prop: 'shortcut' },
              { part: 'SkipPanel.Shortcut', prop: 'as' },
              { part: 'SkipPanel.HelpLink', prop: 'href' },
            ]}
            note={
              <Note kind="reminder">
                Make every chord Alt (Option on a Mac) plus Shift plus a letter. Or use{' '}
                <code>mod</code> with a letter: it means Ctrl on Windows and Command on a Mac. A
                bare letter would fire while someone types or uses speech input (software that turns
                speech into text). It would also fall under 2.1.4 Character Key Shortcuts (Level A),
                which asks for a way to turn it off, change it or limit it to when its control has
                focus. In development, a warning flags a bare letter, Ctrl with Alt, and{' '}
                <code>mod</code> together with <code>ctrl</code> or <code>meta</code>.
              </Note>
            }
          >
            <Shortcuts />
          </UseCase>
          <UseCase
            id="reopen"
            title="Open the list again from a long list of cases"
            why={
              <>
                A caseworker has tabbed down a list of cases and wants the list of shortcuts again.
                Give the Root a <code>reopenShortcut</code>. The chord opens the list and focuses
                its first link. Escape closes it and puts focus back on the case they were on. The
                Hint (a line of instructions in the list) tells people which keys to press.
              </>
            }
            code={sources['reopen']}
            propsUsed={[{ part: 'SkipPanel.Root', prop: 'reopenShortcut' }]}
            note={
              <Note kind="tip">
                A chord does nothing while focus is in a text field, a text area or a select, so it
                never stops someone from typing. The example has buttons and no text field, so the
                chord works wherever you tab. See the Keyboard section.
              </Note>
            }
          >
            <Reopen />
          </UseCase>
          <UseCase
            id="turn-off"
            title="Let people turn the shortcuts off"
            why={
              <>
                A shortcut can clash with the keys of a screen reader (software that reads the
                screen aloud), the browser or the system. Connect <code>shortcutsEnabled</code> to a
                setting. When it is off, no chord works, the key names disappear and the second
                group’s label changes from “Keyboard shortcuts” to “Quick links”. The rows stay in
                the list. The <code>HelpLink</code> stays too, so a visitor who turned the shortcuts
                off can find the page that turns them on again.
              </>
            }
            code={sources['turn-off']}
            propsUsed={[
              { part: 'SkipPanel.Root', prop: 'shortcutsEnabled' },
              { part: 'SkipPanel.HelpLink', prop: 'href' },
            ]}
            note={
              <Note kind="reminder">
                Offer a setting that turns the shortcuts off, and keep it where people can find it:
                link to it with a <code>HelpLink</code>. 2.1.4 Character Key Shortcuts (Level A)
                asks for this for shortcuts that are only printable characters. Alt and Ctrl chords
                fall outside that rule, but the setting still helps when they clash with a screen
                reader or the browser.
              </Note>
            }
          >
            <TurnOff />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Give every skip link a target with the id it points to. If the id is missing, the
                link goes nowhere and people using a keyboard must still tab through the whole
                header (2.4.1 Bypass Blocks, Level A). Put a Hint inside the Root, and add a{' '}
                <code>HelpLink</code> to the page where visitors can turn the shortcuts off.
              </Note>
            ),
            'visual-and-modes': (
              <Note kind="reminder">
                The floating list sits above the page by its stacking order (<code>z-index</code>).
                If a fixed header on your site sits above it, set a higher <code>z-index</code> on
                the <code>kv-skip-panel</code> class in your CSS. Otherwise the header can hide the
                item that has focus (2.4.11 Focus Not Obscured (Minimum), AA).
              </Note>
            ),
            keyboard: (
              <Note kind="recipe" more={<CodeBlock code={modRecipe} />}>
                For a chord with Ctrl on Windows and Command on a Mac, set <code>mod</code> instead
                of writing both. Command+K or Ctrl+K opens the row, and the key names and{' '}
                <code>aria-keyshortcuts</code> change to match. The other system’s key does not
                work. Check that the chord does not clash with your browser or screen reader.
              </Note>
            ),
            'known-issues': (
              <Note kind="tip">
                Test your chords with the screen readers and browsers your visitors use. Windows can
                use Alt+Shift to change the input language, and Firefox on Windows uses Alt+Shift
                with a letter for HTML access keys. Describe any clash in your accessibility
                statement. The rows in the list always work.
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { SkipPanel, useSkipPanel } from '@kvirn-ui/react'"
          parts={parts}
          hooks={[
            useSkipPanelHook,
            useSkipPanelGroupHook,
            useSkipPanelLinkHook,
            useSkipPanelShortcutHook,
            useSkipPanelHelpLinkHook,
            useSkipPanelHintHook,
          ]}
          strings={
            <>
              <StringsBlock
                namespace="skipPanel"
                component="SkipPanel"
                keys={[
                  {
                    key: 'skipToLabel',
                    meaning:
                      'The name of the group of skip links, when you give the Label no text.',
                  },
                  {
                    key: 'mainContent',
                    meaning: 'The link’s visible text, when you give the Link no children.',
                  },
                  {
                    key: 'shortcutsLabel',
                    meaning: 'The name of the group of shortcuts, with kind="shortcuts".',
                  },
                  {
                    key: 'actionsLabel',
                    meaning:
                      'The name of the second group instead of shortcutsLabel while shortcutsEnabled is false.',
                  },
                  {
                    key: 'helpLink',
                    meaning: 'The HelpLink’s visible text, when you give it no children.',
                  },
                  {
                    key: 'arrowHint',
                    meaning: 'The Hint’s first sentence. The first link is described by it.',
                  },
                  {
                    key: 'reopenHint',
                    meaning: 'The Hint. {keys} is replaced by the key names of the reopenShortcut.',
                  },
                ]}
              />
              <StringsBlock
                namespace="keys"
                layout="table"
                keys={[
                  { key: 'shift', meaning: 'The name of the Shift key in a row or the Hint.' },
                  { key: 'alt', meaning: 'The name of the Alt key.' },
                  { key: 'option', meaning: 'The name of the Alt key on Apple platforms.' },
                  { key: 'control', meaning: 'The name of the Ctrl key.' },
                  { key: 'command', meaning: 'The name of the Meta key on Apple platforms.' },
                  { key: 'meta', meaning: 'The name of the Meta key on other platforms.' },
                  { key: 'joiner', meaning: 'The text between key names.' },
                ]}
              >
                <p>
                  The key names come from the <code>keys</code> messages. Have a native speaker
                  review the Finnish and the two Norwegian names before you launch.
                </p>
              </StringsBlock>
            </>
          }
        />
      }
    />
  )
}

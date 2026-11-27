import { Link } from '@kvirn/ui'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { apiHookPart } from './api-ids.ts'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  displaySettingsCompactAttributes,
  displaySettingsCompactPanelAttributes,
  displaySettingsFloatingAttributes,
  displaySettingsInlineAttributes,
  displaySettingsPanelAttributes,
  displaySettingsPanelRows,
  displaySettingsRows,
  useDisplaySettingsHook,
} from '../content/display-settings.api.ts'
import { DefaultDisplaySettings } from '../examples/display-settings/default.tsx'
import { InTheHeader } from '../examples/display-settings/in-the-header.tsx'
import { OwnMarkupDisplaySettings } from '../examples/display-settings/own-markup.tsx'
import { SettingsPage } from '../examples/display-settings/settings-page.tsx'
import { SmallSpace } from '../examples/display-settings/small-space.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type DisplaySettingsExampleSources = Record<
  'default' | 'in-the-header' | 'small-space' | 'settings-page' | 'own-markup',
  string
>

const parts: ApiPart[] = [
  {
    name: 'DisplaySettings.Inline',
    renders: (
      <>
        a <code>&lt;button&gt;</code> and a panel next to it that opens in the page flow and pushes
        the content below it down. It is a <Link href="/components/disclosure">Disclosure</Link>.
      </>
    ),
    props: displaySettingsRows,
    attributes: displaySettingsInlineAttributes,
  },
  {
    name: 'DisplaySettings.Floating',
    renders: (
      <>
        a <code>&lt;button&gt;</code> and a popup that opens over the page, below the end of the
        button. It closes with Escape or a press outside. It is a{' '}
        <Link href="/components/popover">Popover</Link>.
      </>
    ),
    props: displaySettingsRows,
    attributes: displaySettingsFloatingAttributes,
  },
  {
    name: 'DisplaySettings.Compact',
    renders: (
      <>
        a <code>&lt;button&gt;</code> with a small icon and a small popup with a row of segments for
        each group. The segments are still native radios, so the arrow keys and the names are the
        browser’s.
      </>
    ),
    props: displaySettingsRows,
    attributes: displaySettingsCompactAttributes,
  },
  {
    name: 'DisplaySettings.Panel',
    renders: (
      <>
        a <code>&lt;div&gt;</code> with three fieldsets, the forced-colours note while forced
        colours are on, and your children. It has no container and no button. Put it in a Card, a
        Popover, a Dialog or on a page.
      </>
    ),
    props: displaySettingsPanelRows,
    attributes: displaySettingsPanelAttributes,
  },
  {
    name: 'DisplaySettings.CompactPanel',
    renders: (
      <>
        the same as <code>DisplaySettings.Panel</code>, with each group as a row of segments and the
        short name for the device option. It has no container and no button.
      </>
    ),
    props: displaySettingsPanelRows,
    attributes: displaySettingsCompactPanelAttributes,
  },
]

export function DisplaySettingsPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: DisplaySettingsExampleSources
}) {
  return (
    <ComponentPage
      title="DisplaySettings"
      lead="Pick the layout that fits where you put it, or use the choices on their own in a container you name."
      pattern="APG Disclosure (Inline), and a button that opens a dialog (Floating and Compact). The choices are native radio groups"
      whenToUse={
        <ul>
          <li>
            Use it when your service lets visitors choose how it looks: a light or dark colour
            scheme, more contrast, or less motion. Each group also has a “Same as my device” option
            that follows the visitor’s device.
          </li>
          <li>
            Put it where people look for settings: the masthead at the top of the site, or the
            footer. A page of its own works too, as on the{' '}
            <Link href="/accessibility-settings">display settings page</Link> of this site.
          </li>
          <li>
            Pick the layout by the room you have. Inline pushes the content down. Floating opens
            over the page. Compact is for a tight header. Panel and CompactPanel are the choices
            alone, for a container of your own.
          </li>
          <li>
            Not for text size or language. It has three groups only. For language, use{' '}
            <Link href="/patterns/language-links">Language links</Link>.
          </li>
          <li>
            Not for one setting that switches on or off at once, such as text message reminders: use
            a <Link href="/components/switch">Switch</Link>.
          </li>
        </ul>
      }
      example={
        <>
          <ExampleFrame headingId="example" code={sources['default']}>
            <DefaultDisplaySettings />
          </ExampleFrame>
          <Note kind="tip">
            The examples on this page change the look of the whole site, because a page has one
            theme. Your choice is kept in this browser, as on the{' '}
            <Link href="/accessibility-settings">display settings page</Link>.
          </Note>
        </>
      }
      useCases={
        <>
          <UseCase
            id="in-the-header"
            title="Put the settings in the site header"
            why="A site header is where visitors look for settings. The floating layout opens a popup over the page, so the content below does not move. Opening it does not move focus: the popup follows its button in the Tab order. Escape closes it and focus returns to the button."
            code={sources['in-the-header']}
          >
            <InTheHeader />
          </UseCase>
          <UseCase
            id="small-space"
            title="Fit the settings in a narrow header"
            why={
              <>
                The compact layout is a small button and a small popup, with a row of segments for
                each group. This example also gives the button the name “Appearance” with{' '}
                <code>messages</code>. The visible text and the name stay the same.
              </>
            }
            code={sources['small-space']}
            propsUsed={[{ part: 'DisplaySettings.Compact', prop: 'messages' }]}
            note={
              <Note kind="tip">
                In the compact layout, “Same as my device” is shortened to “Device”. It is the same
                choice with a shorter name.
              </Note>
            }
          >
            <SmallSpace />
          </UseCase>
          <UseCase
            id="settings-page"
            title="Give the settings a page of their own"
            why={
              <>
                A help page for a service explains the choices in full. Put <code>Panel</code> in a
                Card with a heading, and add your own notes after the groups as children. The panel
                has no name of its own, so the heading names the place.
              </>
            }
            code={sources['settings-page']}
            propsUsed={[{ part: 'DisplaySettings.Panel', prop: 'children' }]}
            note={
              <Note kind="tip">
                Say in plain words where the choice is kept. The provider keeps it in this browser
                only, and only after the visitor chooses. If you change <code>theme.storage</code>{' '}
                on the <Link href="/foundation/kvirn-provider">KvirnProvider</Link>, change your
                sentence too.
              </Note>
            }
          >
            <SettingsPage />
          </UseCase>
          <UseCase
            id="own-markup"
            title="Build the choices in your own markup"
            why="Use useDisplaySettings when none of the layouts fits, for example when the choices sit inside a form of your own. The hook gives you the three groups with their labels and a select function. It draws nothing."
            code={sources['own-markup']}
            propsUsed={[
              {
                part: apiHookPart('useDisplaySettings', 'result'),
                label: 'useDisplaySettings (result)',
                prop: 'groups',
              },
              {
                part: apiHookPart('useDisplaySettings', 'result'),
                label: 'useDisplaySettings (result)',
                prop: 'isForcedColors',
              },
              {
                part: apiHookPart('useDisplaySettings', 'result'),
                label: 'useDisplaySettings (result)',
                prop: 'text',
              },
            ]}
            note={
              <Note kind="reminder">
                Put each group in a fieldset with a legend, so a screen reader announces its name
                (1.3.1 Info and Relationships). While <code>isForcedColors</code> is true, say that
                the device’s own colours replace the choices.
              </Note>
            }
          >
            <OwnMarkupDisplaySettings />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                The button’s text is its name. To change it, use <code>messages.button</code>, never
                an <code>aria-label</code>, so the name always contains the visible text (2.5.3
                Label in Name).
              </Note>
            ),
            'visual-and-modes': (
              <Note kind="reminder">
                If you style the options yourself, show the checked one by more than colour (1.4.1
                Use of Color), keep its edge at 3:1 contrast (1.4.11 Non-text Contrast) and make
                each option at least 24 by 24 pixels (2.5.8 Target Size (Minimum)).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { DisplaySettings, useDisplaySettings } from '@kvirn/ui'"
          parts={parts}
          hook={useDisplaySettingsHook}
          strings={
            <StringsBlock
              namespace="displaySettings"
              component="DisplaySettings"
              layout="table"
              keys={[
                { key: 'button', meaning: 'The text and the name of the button that opens it.' },
                { key: 'colorSchemeLegend', meaning: 'The name of the colour scheme group.' },
                { key: 'colorSchemeLight', meaning: 'The light option.' },
                { key: 'colorSchemeDark', meaning: 'The dark option.' },
                {
                  key: 'colorSchemeSystem',
                  meaning: 'The option that follows the device’s colour scheme.',
                },
                { key: 'contrastLegend', meaning: 'The name of the contrast group.' },
                { key: 'contrastStandard', meaning: 'The standard contrast option.' },
                { key: 'contrastMore', meaning: 'The higher contrast option.' },
                {
                  key: 'contrastSystem',
                  meaning: 'The option that follows the device’s contrast setting.',
                },
                { key: 'motionLegend', meaning: 'The name of the motion group.' },
                { key: 'motionFull', meaning: 'The option for full motion.' },
                { key: 'motionReduce', meaning: 'The option for less motion.' },
                {
                  key: 'motionSystem',
                  meaning: 'The option that follows the device’s motion setting.',
                },
                {
                  key: 'forcedColors',
                  meaning:
                    'A note shown only while the device uses its own colours. They replace these choices.',
                },
                {
                  key: 'systemShort',
                  meaning: 'The short name of the device option in the compact layout.',
                },
              ]}
            />
          }
        />
      }
    />
  )
}

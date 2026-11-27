import { Link } from '@kvirn/ui'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { apiHookPart } from './api-ids.ts'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock, stringText } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  tagGroupClearAllRows,
  tagGroupEmptyAttributes,
  tagGroupLabelAttributes,
  tagGroupListAttributes,
  tagGroupRootAttributes,
  tagGroupRootRows,
  tagLabelAttributes,
  tagRemoveAttributes,
  tagRemoveRows,
  tagRootAttributes,
  useTagGroupHook,
} from '../content/tag.api.ts'
import { DefaultTag } from '../examples/tag/default.tsx'
import { FilterAList } from '../examples/tag/filter-a-list.tsx'
import { FocusFallback } from '../examples/tag/focus-fallback.tsx'
import { LockedValue } from '../examples/tag/locked-value.tsx'
import { OwnMarkupTags } from '../examples/tag/own-markup.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type TagExampleSources = Record<
  'default' | 'filter-a-list' | 'locked-value' | 'focus-fallback' | 'own-markup',
  string
>

const parts: ApiPart[] = [
  {
    name: 'TagGroup.Root',
    renders: (
      <>
        <code>&lt;div&gt;</code>. It takes every attribute of a <code>&lt;div&gt;</code> and passes{' '}
        <code>ref</code> to it. It holds no tags: you keep them and remove one in{' '}
        <code>onRemove</code>.
      </>
    ),
    props: tagGroupRootRows,
    attributes: tagGroupRootAttributes,
  },
  {
    name: 'TagGroup.Label',
    renders: (
      <>
        <code>&lt;span&gt;</code>. It names the list and is where focus goes when the last tag is
        removed. It takes every attribute of a <code>&lt;span&gt;</code> and passes <code>ref</code>{' '}
        to it.
      </>
    ),
    attributes: tagGroupLabelAttributes,
  },
  {
    name: 'TagGroup.List',
    renders: (
      <>
        <code>&lt;ul role=&quot;list&quot;&gt;</code>. It renders nothing while it has no tag, so no
        empty list is read out. It takes every attribute of a <code>&lt;ul&gt;</code> and passes{' '}
        <code>ref</code> to it.
      </>
    ),
    attributes: tagGroupListAttributes,
  },
  {
    name: 'TagGroup.Empty',
    renders: (
      <>
        <code>&lt;p&gt;</code>, shown only while the list has no tag. It is not announced. It takes
        every attribute of a <code>&lt;p&gt;</code>.
      </>
    ),
    attributes: tagGroupEmptyAttributes,
  },
  {
    name: 'TagGroup.ClearAll',
    renders: (
      <>
        A <Link href="/components/button">Button</Link>, shown only while the list has a tag. It
        takes every prop of a Button.
      </>
    ),
    props: tagGroupClearAllRows,
  },
  {
    name: 'Tag.Root',
    renders: (
      <>
        <code>&lt;li&gt;</code>. Put one <code>Tag.Label</code> or one <code>Tag.Remove</code> in
        it. It takes every attribute of an <code>&lt;li&gt;</code>.
      </>
    ),
    attributes: tagRootAttributes,
  },
  {
    name: 'Tag.Label',
    renders: (
      <>
        <code>&lt;span&gt;</code> with the text of a tag that cannot be removed. It takes every
        attribute of a <code>&lt;span&gt;</code>.
      </>
    ),
    attributes: tagLabelAttributes,
  },
  {
    name: 'Tag.Remove',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code> with the text and a decorative cross.
        The whole chip is the button. It must be inside a <code>TagGroup.Root</code>, or it throws.
        It takes every attribute of a <code>&lt;button&gt;</code> except <code>type</code> and{' '}
        <code>onClick</code>, and passes <code>ref</code> to it.
      </>
    ),
    props: tagRemoveRows,
    attributes: tagRemoveAttributes,
  },
]

export function TagPage({ contract, sources }: { contract: Contract; sources: TagExampleSources }) {
  return (
    <ComponentPage
      title="Tag"
      lead="TagGroup names the list and, after a person removes a tag, moves keyboard focus to the next tag so they do not lose their place."
      pattern="None: APG has no chip pattern. A removable tag is a native button, so the APG Button keys apply"
      whenToUse={
        <ul>
          <li>
            Use a tag to show a short fact in words that applies now, such as the filters applied to
            a list of permits. Write the fact so it makes sense alone: “Year: 2025”, not “2025”.
          </li>
          <li>
            Use a removable tag when a person can take the fact away with one press. The whole chip
            is the button, so there is no small cross to aim at.
          </li>
          <li>
            Use a static tag for a fact the person cannot remove, such as a value the service
            decides. It is text in the list, not a disabled button.
          </li>
          <li>
            Not for a status or a category word such as “Granted” or “Draft”: use a{' '}
            <Link href="/components/badge">Badge</Link>. Never put a Badge in a tag group.
          </li>
          <li>
            Not for choosing filters: use checkboxes in a{' '}
            <Link href="/components/checkbox-group">CheckboxGroup</Link>, and let the tags show what
            is chosen. For a long list of options, use a{' '}
            <Link href="/components/combobox">Combobox</Link> that allows several choices.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultTag />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="filter-a-list"
            title="Show the filters that are applied to a list"
            why="A resident narrows a list of building permits by type. The checkboxes are the filters, and each chosen filter becomes a tag above the results. The group keeps only its last announcement, so the example turns its own removal message off and says one message that names the change and the number of results."
            code={sources['filter-a-list']}
            propsUsed={[
              { part: 'TagGroup.Root', prop: 'announceRemoval' },
              { part: 'Tag.Remove', prop: 'label' },
              { part: 'Tag.Remove', prop: 'onRemove' },
              { part: 'TagGroup.ClearAll', prop: 'onClear' },
            ]}
            note={
              <Note kind="reminder">
                When a removal also changes other content, such as a count of results, say one
                combined message, politely, after the results settle (4.1.3 Status Messages). See{' '}
                <Link href="#announcements">Announcements</Link>.
              </Note>
            }
          >
            <FilterAList />
          </UseCase>
          <UseCase
            id="locked-value"
            title="Show a value the person cannot remove"
            why="Someone searches for a room to book at the main library. The library comes from the page they are on, so it is a static tag made with Tag.Label. It is plain text in the list and is not a Tab stop. The other two tags have a remove button."
            code={sources['locked-value']}
            propsUsed={[{ part: 'Tag.Remove', prop: 'onRemove' }]}
            note={
              <Note kind="tip">
                Show a locked value as a static tag, never as a disabled button. Nobody can ask why
                a disabled button is disabled, and it is skipped when a keyboard user presses Tab.
              </Note>
            }
          >
            <LockedValue />
          </UseCase>
          <UseCase
            id="focus-fallback"
            title="Move focus somewhere useful when the last tag goes"
            why="A resident follows topics from the municipality’s news. After the last topic is removed there is no tag left to focus. By default, focus goes to the group’s label. Here it goes to the “Follow all topics” button, the next thing the person may want to do."
            code={sources['focus-fallback']}
            propsUsed={[{ part: 'TagGroup.Root', prop: 'focusFallback' }]}
            note={
              <Note kind="reminder">
                Return a button, or an element with <code>tabindex=&quot;-1&quot;</code>, that is
                still in the page after the removal. If it cannot take focus, the group uses its
                label and logs a warning in development (2.4.3 Focus Order).
              </Note>
            }
          >
            <FocusFallback />
          </UseCase>
          <UseCase
            id="own-markup"
            title="Build the tags in your own markup"
            why="Use useTagGroup when the ready-made parts do not fit, for example when your tags sit in a table cell. You write the label, the list and the buttons. The hook gives you the focus rule after a removal and the removal message. This example uses the theme’s classes, so it looks like the ready-made chip."
            code={sources['own-markup']}
            propsUsed={[
              {
                part: apiHookPart('useTagGroup', 'result'),
                label: 'useTagGroup (result)',
                prop: 'labelId',
              },
              {
                part: apiHookPart('useTagGroup', 'result'),
                label: 'useTagGroup (result)',
                prop: 'labelRef',
              },
              {
                part: apiHookPart('useTagGroup', 'result'),
                label: 'useTagGroup (result)',
                prop: 'listRef',
              },
              {
                part: apiHookPart('useTagGroup', 'result'),
                label: 'useTagGroup (result)',
                prop: 'prepareRemoval',
              },
              {
                part: apiHookPart('useTagGroup', 'result'),
                label: 'useTagGroup (result)',
                prop: 'messages',
              },
            ]}
            note={
              <Note kind="reminder">
                Put <code>data-kv-tag-remove</code> on every remove button, as{' '}
                <code>Tag.Remove</code> does. The group uses it to find the buttons next to the one
                that goes, so focus can move to the next tag (2.4.3 Focus Order).
              </Note>
            }
          >
            <OwnMarkupTags />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          linkToStrings
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Change your tags in <code>onRemove</code>, in the same event. The group places focus
                after the render that follows the click, so a later change leaves a keyboard user
                without their place (2.4.3 Focus Order). When the content of <code>Tag.Remove</code>{' '}
                is more than a string, pass <code>label</code> with the visible text (2.5.3 Label in
                Name).
              </Note>
            ),
            'visual-and-modes': (
              <Note kind="reminder">
                If you style the tags yourself, keep the button’s edge at 3:1 contrast against the
                page (1.4.11 Non-text Contrast), the whole chip at least 24 by 24 pixels (2.5.8
                Target Size (Minimum)) and a visible focus ring (2.4.7 Focus Visible).
              </Note>
            ),
            keyboard: (
              <Note kind="tip">
                Delete and Backspace do nothing on a tag, on purpose: a stray key must not remove
                anything. Use Clear all when a person wants to remove every tag. Render it only
                while a tag can be cleared: leave it out when only locked tags remain.
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Tag, TagGroup, useTagGroup } from '@kvirn/ui'"
          parts={parts}
          hook={useTagGroupHook}
          strings={
            <StringsBlock
              namespace="tag"
              component="TagGroup"
              keys={[
                {
                  key: 'remove',
                  meaning:
                    'The name of a remove button: the word Remove and the text of the tag, so the visible text is inside the name.',
                  values: { label: 'Year: 2025' },
                },
                {
                  key: 'removed',
                  meaning:
                    'Announced politely after a tag is removed, unless announceRemoval is false.',
                  values: { label: 'Year: 2025' },
                },
              ]}
            >
              <p>
                <code>TagGroup.ClearAll</code> uses <code>filters.clearAll</code>, “
                {stringText('filters', 'clearAll')}”, unless you pass your own text.
              </p>
            </StringsBlock>
          }
        />
      }
    />
  )
}

import { TagGroup } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/tag/tag.a11y.md?raw'
import guide from '../../../../../packages/react/src/tag/tag.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  EmptyTags,
  FilterAList,
  LongTag,
  RemovableTags,
  StaticTags,
  tagTextsFor,
} from './tag.fixture.tsx'

// Components/Tag: a short fact in words, static or removable, and TagGroup, which moves focus
// after a removal (contract: tag.a11y.md, design docs/design/tag-and-filters.md). A removable tag
// is one button: the whole chip. KvirnUI holds no tag state: `useState` in the fixtures stands in
// for yours. "Filter a list" at the end is the pattern this component was built for.

const meta: Meta<typeof TagGroup.Root> = {
  title: 'Components/Content/Tag',
  component: TagGroup.Root,
  argTypes: {
    announceRemoval: {
      control: 'boolean',
      description:
        'Say `tag.removed` (polite) when a tag is removed. Default `true`. Set `false` when you announce one combined message yourself.',
    },
    focusFallback: {
      control: false,
      description: 'Where focus goes when no remove button is left. Default: the group’s label.',
    },
  },
  decorators: [withFormLocale],
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Removable tags: each is one button named "Remove …", so the whole chip is the target. */
export const Removable: Story = {
  parameters: showSource('tag/tag.fixture.tsx', 'RemovableTags'),
  render: (_args, { globals }) => <RemovableTags locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await expect(
      canvas.getAllByRole('button', { name: /^(Remove|Ta bort|Poista|Fjern) / }).length,
    ).toBe(3)
    await expect(canvas.getByRole('list')).toBeVisible()
  },
}

/** Static tags: text only, not a Tab stop. A locked value is a static tag, never a disabled button. */
export const Static: Story = {
  parameters: showSource('tag/tag.fixture.tsx', 'StaticTags'),
  render: (_args, { globals }) => <StaticTags locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4)
    await expect(canvas.queryByRole('button')).toBeNull()
  },
}

/** No tag: the list is gone, the empty text is shown and Clear all is not rendered. */
export const Empty: Story = {
  parameters: showSource('tag/tag.fixture.tsx', 'EmptyTags'),
  render: (_args, { globals }) => <EmptyTags locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    await expect(canvas.getByText(tagTextsFor(localeOf(globals)).text.empty)).toBeVisible()
    await expect(canvas.queryByRole('list')).toBeNull()
    await expect(canvas.queryByRole('button')).toBeNull()
  },
}

/** A long Finnish-style tag wraps over lines and is never truncated. */
export const LongLabel: Story = {
  globals: { locale: 'fi' },
  parameters: showSource('tag/tag.fixture.tsx', 'LongTag'),
  decorators: [
    (Story) => (
      <div className="kv-story-narrow" data-testid="narrow">
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => <LongTag locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Right to left: the cross stays at the inline end and the row starts on the right. */
export const RTL: Story = {
  globals: { dir: 'rtl' },
  render: (_args, { globals }) => (
    <div dir="rtl">
      <RemovableTags locale={localeOf(globals)} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('list')).toBeVisible()
  },
}

/** The edge and the cross survive forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => (
    <>
      <RemovableTags locale={localeOf(globals)} />
      <StaticTags locale={localeOf(globals)} />
    </>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('list')).toHaveLength(2)
  },
}

/** `kv-compact`: the chips are 32px high from 64rem. Staff tools. */
export const Compact: Story = {
  render: (_args, { globals }) => (
    <div className="kv-compact">
      <RemovableTags locale={localeOf(globals)} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('list')).toBeVisible()
  },
}

/**
 * The fixture the keyboard tests drive. Try the keys in the Keyboard section above: Tab and
 * Shift+Tab move through each remove button and Clear all, Enter and Space remove the focused
 * tag and move focus on, and Delete and Backspace do nothing.
 */
export const Keyboard: Story = {
  parameters: showSource('tag/tag.fixture.tsx', 'RemovableTags'),
  render: (_args, { globals }) => <RemovableTags locale={localeOf(globals)} />,
}

/**
 * Filter a list: checkboxes in a form, the applied filters as tags above the results, and one
 * message that says the removal and the count together. Remove a tag and focus moves to the next
 * one; remove the last and it goes to the "Applied filters" label. No Apply button: the results
 * change in place. Below 64rem the filters would sit in a Disclosure, which isn't built (plan 0075).
 */
export const FilterAListPattern: Story = {
  name: 'Filter a list',
  parameters: showSource('tag/tag.fixture.tsx', 'FilterAList'),
  render: (_args, { globals }) => <FilterAList locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const applied = within(canvas.getAllByRole('list')[0] as HTMLElement)
    const [first, second] = applied.getAllByRole('button') as [HTMLElement, HTMLElement]
    await userEvent.click(first)
    await expect(second).toHaveFocus()
    await expect(canvas.getByTestId('count')).toHaveTextContent('3')
    await waitFor(() => expect(within(document.body).getByRole('status')).toHaveTextContent(/3/))
    await userEvent.click(second)
    await expect(document.activeElement).toHaveAttribute('tabindex', '-1')
    await expect(canvas.getByTestId('count')).toHaveTextContent('6')
  },
}

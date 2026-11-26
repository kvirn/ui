import { Pagination } from '@kvirn/ui'
import contract from '../../../../../packages/react/src/pagination/pagination.a11y.md?raw'
import guide from '../../../../../packages/react/src/pagination/pagination.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { usageGuide } from '../../docs-source.ts'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import { chromeViewports, wideGlobals } from '../../patterns/patterns-story-support.tsx'
import { withLocale } from './pagination.fixture.tsx'

// Components/Pagination: the headless Pagination, styled by @kvirn/theme/theme.css (brief B17
// in docs/design/municipality-reference-site.md). The words are the library's own strings and
// follow the locale toolbar. The links go nowhere (#). The narrow layout (Previous, status and
// Next) follows the viewport width, below 40rem, so a 320px column in a wide preview can't show
// it: that check is the manual one and Plan 0051's sweep.

const meta = {
  title: 'Components/Navigation/Pagination',
  component: Pagination.Root,
  argTypes: {
    label: {
      control: 'text',
      description:
        'The landmark’s accessible name, set as `aria-label`. Replaces the message `pagination.label` (`Pages`).',
    },
  },
  decorators: [withLocale],
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Pagination.Root>

export default meta
type Story = StoryObj<typeof meta>

function Item({ children }: { children: ReactNode }) {
  return <Pagination.Item>{children}</Pagination.Item>
}

function pageLink(page: number, current = false) {
  return (
    <Item key={page}>
      <Pagination.Link page={page} href={`#page-${page}`} current={current} />
    </Item>
  )
}

/** The middle of a long list: Previous, the first and last page, the pages next to this one, gaps for the rest, Next. */
export const Default: Story = {
  args: {
    children: (
      <Pagination.List>
        <Item>
          <Pagination.Previous href="#page-4" />
        </Item>
        {pageLink(1)}
        <Item>
          <Pagination.Ellipsis />
        </Item>
        {pageLink(4)}
        {pageLink(5, true)}
        {pageLink(6)}
        <Item>
          <Pagination.Ellipsis />
        </Item>
        {pageLink(9)}
        <Item>
          <Pagination.Status page={5} total={9} />
        </Item>
        <Item>
          <Pagination.Next href="#page-6" />
        </Item>
      </Pagination.List>
    ),
  },
}

/** The first page: no Previous (omitted, not disabled), the current page and Next. */
export const FirstPage: Story = {
  args: {
    children: (
      <Pagination.List>
        {pageLink(1, true)}
        {pageLink(2)}
        {pageLink(3)}
        <Item>
          <Pagination.Ellipsis />
        </Item>
        {pageLink(9)}
        <Item>
          <Pagination.Status page={1} total={9} />
        </Item>
        <Item>
          <Pagination.Next href="#page-2" />
        </Item>
      </Pagination.List>
    ),
  },
}

/** The last page: Previous and the current page, no Next. */
export const LastPage: Story = {
  args: {
    children: (
      <Pagination.List>
        <Item>
          <Pagination.Previous href="#page-8" />
        </Item>
        {pageLink(1)}
        <Item>
          <Pagination.Ellipsis />
        </Item>
        {pageLink(7)}
        {pageLink(8)}
        {pageLink(9, true)}
        <Item>
          <Pagination.Status page={9} total={9} />
        </Item>
      </Pagination.List>
    ),
  },
}

/** Try the keys: Tab goes through every link, the current page included, and skips the gap. Enter follows a link. */
export const Keyboard: Story = {
  globals: { ...wideGlobals },
  parameters: {
    viewport: { options: chromeViewports },
    reflowOptOut: 'the page numbers are shown from 40rem; Reflow320 proves 320 px',
  },
  args: {
    children: (
      <Pagination.List>
        <Item>
          <Pagination.Previous href="#page-1" />
        </Item>
        {pageLink(1)}
        {pageLink(2, true)}
        <Item>
          <Pagination.Ellipsis />
        </Item>
        {pageLink(9)}
        <Item>
          <Pagination.Next href="#page-3" />
        </Item>
      </Pagination.List>
    ),
  },
}

/** A 320px column in Finnish: the row wraps and nothing scrolls sideways (1.4.10). */
export const Reflow320: Story = {
  args: {
    children: (
      <Pagination.List>
        <Item>
          <Pagination.Previous href="#page-4" />
        </Item>
        {pageLink(1)}
        <Item>
          <Pagination.Ellipsis />
        </Item>
        {pageLink(4)}
        {pageLink(5, true)}
        {pageLink(6)}
        <Item>
          <Pagination.Ellipsis />
        </Item>
        {pageLink(9)}
        <Item>
          <Pagination.Status page={5} total={9} />
        </Item>
        <Item>
          <Pagination.Next href="#page-6" />
        </Item>
      </Pagination.List>
    ),
  },
  decorators: [(Story) => <div className="kv-story-narrow">{<Story />}</div>],
  globals: { locale: 'fi' },
  play: async ({ canvasElement }) => {
    const column = canvasElement.querySelector<HTMLElement>('.kv-story-narrow')
    if (column === null) {
      throw new Error('no narrow column')
    }
    await expectNoHorizontalOverflow(column)
  },
}

/** Right to left: the row starts at the right, and the arrows on Previous and Next mirror. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  args: {
    children: (
      <Pagination.List>
        <Item>
          <Pagination.Previous href="#page-1" />
        </Item>
        {pageLink(1)}
        {pageLink(2, true)}
        {pageLink(3)}
        <Item>
          <Pagination.Status page={2} total={3} />
        </Item>
        <Item>
          <Pagination.Next href="#page-3" />
        </Item>
      </Pagination.List>
    ),
  },
}

/** Forced colours: system colours, and the current page a straight `LinkText` bar instead of a fill. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  args: {
    children: (
      <Pagination.List>
        <Item>
          <Pagination.Previous href="#page-1" />
        </Item>
        {pageLink(1)}
        {pageLink(2, true)}
        {pageLink(3)}
        <Item>
          <Pagination.Status page={2} total={3} />
        </Item>
        <Item>
          <Pagination.Next href="#page-3" />
        </Item>
      </Pagination.List>
    ),
  },
}

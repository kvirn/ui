import { en } from '@kvirn-ui/i18n/en'
import { PageFrame, PageHeader } from '@kvirn-ui/patterns'
import { Breadcrumb, DefinitionList, KvirnProvider } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import contract from '../../../../../packages/patterns/src/site-chrome/page-header/page-header.a11y.md?raw'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Site chrome/Page header: the intro band of a page, first in main. Each story is the
// code an adopter copies: literal JSX, literal text.

const description = `The top of a page's \`main\`: a full-width \`surface\` band with the breadcrumb, the page's \`h1\`, a lead and a few facts. DOM order is reading and focus order, and the band is not a landmark.

Put it first in \`PageFrame.Main\`. The breadcrumb is the shipped \`Breadcrumb\`, written as a child; leave it out when it would be one item. The facts are \`DefinitionList.Row\`s: a wrapping row from \`40rem\`, one per line below. The pattern has no strings of its own and no presentation props.

## API

| Part | Element | Props |
| ---- | ------- | ----- |
| \`PageHeader.Root\` | \`<div>\` with a \`Container\` | The \`<div>\` props. Children: breadcrumb, title, lead, facts |
| \`PageHeader.Title\` | \`<h1>\` | The \`Heading\` props except \`as\` and \`size\`. The page's only \`h1\`, at the \`display\` size |
| \`PageHeader.Lead\` | \`<p class="kv-lead">\` | The \`<p>\` props. At most 60 characters wide |
| \`PageHeader.Facts\` | \`<dl>\` | The \`DefinitionList.Root\` props. \`DefinitionList.Row\`s inside |

Each part is also a flat export (\`PageHeaderRoot\`, \`PageHeaderTitle\`, …) for a Server Component.

## Parts and gaps

Parts used: \`Container\`, \`Heading\`, \`DefinitionList\`, and the \`Breadcrumb\` you pass in. No gap.
`

const meta = {
  title: 'Patterns/Site chrome/Page header',
  component: PageHeader.Root,
  globals: { locale: 'en', ...wideGlobals },
  parameters: {
    layout: 'fullscreen',
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof PageHeader.Root>

export default meta
type Story = StoryObj<typeof meta>

/** Breadcrumb, title, lead and three facts. */
export const Default: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <PageFrame.Main bleed>
          <PageHeader.Root>
            <Breadcrumb.Root>
              <Breadcrumb.List>
                <Breadcrumb.Item>
                  <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <Breadcrumb.Link href="#school">Preschool and school</Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <Breadcrumb.Current>Preschool</Breadcrumb.Current>
                </Breadcrumb.Item>
              </Breadcrumb.List>
            </Breadcrumb.Root>
            <PageHeader.Title>Preschool in Kvirnby</PageHeader.Title>
            <PageHeader.Lead>
              Every child from the age of one has a right to a place. Here is how to apply, what it
              costs and who to ask.
            </PageHeader.Lead>
            <PageHeader.Facts>
              <DefinitionList.Row>
                <DefinitionList.Term>Responsible</DefinitionList.Term>
                <DefinitionList.Description>Education department</DefinitionList.Description>
              </DefinitionList.Row>
              <DefinitionList.Row>
                <DefinitionList.Term>Updated</DefinitionList.Term>
                <DefinitionList.Description>10 October 2026</DefinitionList.Description>
              </DefinitionList.Row>
              <DefinitionList.Row>
                <DefinitionList.Term>Contact</DefinitionList.Term>
                <DefinitionList.Description>
                  <code>preschool@kvirnby.example</code>
                </DefinitionList.Description>
              </DefinitionList.Row>
            </PageHeader.Facts>
          </PageHeader.Root>
        </PageFrame.Main>
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Preschool in Kvirnby' }),
    ).toBeVisible()
    await expect(canvas.getByRole('navigation', { name: 'You are here' })).toBeVisible()
    await expect(canvas.getByText('Preschool', { selector: '[aria-current="page"]' })).toBeVisible()
    await expect(canvas.getByText('Education department')).toBeVisible()
  },
}

/** Try the keys (see Keyboard above): Tab moves through the breadcrumb links and Shift+Tab back. */
export const Keyboard: Story = {
  ...Default,
  play: async ({ canvas }) => {
    const start = canvas.getByRole('link', { name: 'Start' })
    const school = canvas.getByRole('link', { name: 'Preschool and school' })
    start.focus()
    await userEvent.tab()
    await expect(school).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect(start).toHaveFocus()
  },
}

/** Only the title: no breadcrumb, no lead and no facts. */
export const TitleOnly: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <PageFrame.Main bleed>
          <PageHeader.Root>
            <PageHeader.Title>Welcome to Kvirnby</PageHeader.Title>
          </PageHeader.Root>
        </PageFrame.Main>
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    await expect(canvas.queryByRole('navigation')).toBeNull()
  },
}

/** A Finnish compound at 320px: the title hyphenates and nothing scrolls sideways. */
export const LongTitle: Story = {
  globals: { ...narrowGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <PageFrame.Main bleed>
          <PageHeader.Root>
            <PageHeader.Title>
              <span lang="fi">Varhaiskasvatuksen asiakasmaksujen tarkistuslaskelmahakemus</span>
            </PageHeader.Title>
            <PageHeader.Lead>Apply for a recalculation of the preschool fee.</PageHeader.Lead>
            <PageHeader.Facts>
              <DefinitionList.Row>
                <DefinitionList.Term>Responsible</DefinitionList.Term>
                <DefinitionList.Description>Education department</DefinitionList.Description>
              </DefinitionList.Row>
              <DefinitionList.Row>
                <DefinitionList.Term>Updated</DefinitionList.Term>
                <DefinitionList.Description>10 October 2026</DefinitionList.Description>
              </DefinitionList.Row>
            </PageHeader.Facts>
          </PageHeader.Root>
        </PageFrame.Main>
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('heading', { level: 1 })).toBeVisible()
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Right to left: the band starts at the right and the breadcrumb separator mirrors. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}

/** Forced colours: the band drops to Canvas with a CanvasText edge, links are LinkText. */
export const ForcedColors: Story = {
  ...Default,
  globals: { forcedColors: 'active', locale: 'en', ...wideGlobals },
}

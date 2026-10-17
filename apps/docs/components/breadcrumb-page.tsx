import { LinkRoot } from '@kvirn-ui/react'
import { apiHookPart } from './api-ids.ts'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  breadcrumbCurrentAttributes,
  breadcrumbItemAttributes,
  breadcrumbLinkAttributes,
  breadcrumbListAttributes,
  breadcrumbRootAttributes,
  breadcrumbRootRows,
  useBreadcrumbHook,
} from '../content/breadcrumb.api.ts'
import { CustomSeparator } from '../examples/breadcrumb/custom-separator.tsx'
import { DefaultBreadcrumb } from '../examples/breadcrumb/default.tsx'
import { LongTrail } from '../examples/breadcrumb/long-trail.tsx'
import { OtherLanguageBreadcrumb } from '../examples/breadcrumb/other-language.tsx'
import { OwnLabel } from '../examples/breadcrumb/own-label.tsx'
import { OwnMarkup } from '../examples/breadcrumb/own-markup.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type BreadcrumbExampleSources = Record<
  'default' | 'long-trail' | 'own-label' | 'custom-separator' | 'other-language' | 'own-markup',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Breadcrumb.Root',
    renders: (
      <>
        <code>&lt;nav&gt;</code>, the <code>navigation</code> landmark, named by the message{' '}
        <code>breadcrumb.label</code> or your <code>label</code>. It takes every attribute of a{' '}
        <code>&lt;nav&gt;</code> and passes <code>ref</code> to it. The default theme is described
        on <LinkRoot href="/foundation/theming">Theming</LinkRoot>.
      </>
    ),
    props: breadcrumbRootRows,
    attributes: breadcrumbRootAttributes,
  },
  {
    name: 'Breadcrumb.List',
    renders: (
      <>
        <code>&lt;ol&gt;</code> with the role <code>list</code>. It is ordered, because the sequence
        is the meaning.
      </>
    ),
    attributes: breadcrumbListAttributes,
  },
  {
    name: 'Breadcrumb.Item',
    renders: (
      <>
        <code>&lt;li&gt;</code> with the role <code>listitem</code>. It holds a{' '}
        <code>Breadcrumb.Link</code>, or the last item’s <code>Breadcrumb.Current</code>.
      </>
    ),
    attributes: breadcrumbItemAttributes,
  },
  {
    name: 'Breadcrumb.Link',
    renders: (
      <>
        <code>&lt;a href&gt;</code>: a thin wrapper over{' '}
        <LinkRoot href="/components/link">Link.Root</LinkRoot>, so it is rendered by the router link
        you register on the provider. It takes the same props and <code>ref</code> as{' '}
        <code>Link.Root</code>.
      </>
    ),
    attributes: breadcrumbLinkAttributes,
  },
  {
    name: 'Breadcrumb.Current',
    renders: (
      <>
        <code>&lt;span&gt;</code> with <code>aria-current=&quot;page&quot;</code>. The page you are
        on, as text: the last item, never a link.
      </>
    ),
    attributes: breadcrumbCurrentAttributes,
  },
]

export function BreadcrumbPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: BreadcrumbExampleSources
}) {
  return (
    <ComponentPage
      title="Breadcrumb"
      lead="Each level above you is a link. The page you are on is plain text, so someone using the keyboard doesn’t stop on it."
      status="alpha-candidate"
      pattern="APG Breadcrumb"
      whenToUse={
        <ul>
          <li>
            Use it at the top of a page that sits two or more levels below the start page: a topic
            page, a service page, an article.
          </li>
          <li>
            Put it before <code>&lt;main&gt;</code>, not in it, and give it a different name from
            any other <code>&lt;nav&gt;</code> on the page.
          </li>
          <li>
            Put it in the same place on every page that has one. People look for it there (3.2.3
            Consistent Navigation, AA).
          </li>
          <li>
            List every level from the start page to the parent of the current page. It never
            collapses into “…”: a hidden level is a hidden way out, so a long trail wraps.
          </li>
          <li>
            Not for the main menu: use <LinkRoot href="/components/navigation">Navigation</LinkRoot>
            . Not for moving between pages of a list: use{' '}
            <LinkRoot href="/components/pagination">Pagination</LinkRoot>. Not on the start page,
            which has no level above it.
          </li>
        </ul>
      }
      example={
        <>
          <ExampleFrame headingId="example" code={sources['default']}>
            <DefaultBreadcrumb />
          </ExampleFrame>
          <Note kind="recipe">
            Register your router’s link once on the provider and every Breadcrumb.Link is rendered
            by it, so a click doesn’t reload the page. See{' '}
            <LinkRoot href="/foundation/kvirn-provider#next-js">
              the Next.js setup on KvirnProvider
            </LinkRoot>
            .
          </Note>
        </>
      }
      useCases={
        <>
          <UseCase
            id="long-trail"
            title="A page deep in the structure"
            why="A service page can sit five or six levels down. Write every level as a Breadcrumb.Link and the page you are on as Breadcrumb.Current. The trail wraps onto more lines instead of hiding the middle, so every way up stays visible, also on a screen 320px wide."
            code={sources['long-trail']}
            note={
              <Note kind="reminder">
                Name each link after the page’s title, as the page’s own heading says it: “Home
                care”, not “Click here” or “Level 3”. Mark no other item as the current page.
              </Note>
            }
          >
            <LongTrail />
          </UseCase>
          <UseCase
            id="own-label"
            title="Your own name for the trail"
            why="In English the trail is named “You are here” by default. Give it another name with label when your service uses other words, or when the page has another navigation with that name. A screen reader lists landmarks by name, so two with the same name can’t be told apart."
            code={sources['own-label']}
            propsUsed={[{ part: 'Breadcrumb.Root', prop: 'label' }]}
            note={
              <Note kind="reminder">
                A name you write is your own text. If its language differs from the page, put the
                trail in a nested KvirnProvider and spread <code>useLocale().localeProps</code> on
                your own element around it (3.1.2 Language of Parts, AA).
              </Note>
            }
          >
            <OwnLabel />
          </UseCase>
          <UseCase
            id="custom-separator"
            title="Your own separator"
            why={
              <>
                The theme draws a chevron between the levels, and{' '}
                <code>variant=&quot;slash&quot;</code> draws a slash. For anything else, such as an
                icon or a component of yours, pass it as <code>separator</code> on the root. It goes
                in every item, and the theme hides the first. The <code>chevronForward</code> icon
                from <code>@kvirn-ui/icons</code> flips itself in right-to-left text; an icon of
                your own needs <code>mirrorInRtl</code>.
              </>
            }
            code={sources['custom-separator']}
            propsUsed={[{ part: 'Breadcrumb.Root', prop: 'separator' }]}
            note={
              <Note kind="reminder">
                Keep a separator to decoration: nothing a keyboard can reach, such as a link or a
                button. Screen readers skip it, so anything focusable in it would be reachable but
                have no name (4.1.2 Name, Role, Value, A).
              </Note>
            }
          >
            <CustomSeparator />
          </UseCase>
          <UseCase
            id="other-language"
            title="A trail in Swedish"
            why={
              <>
                The trail takes its name from the provider’s language: a Swedish provider gives it a
                Swedish name, and a Finnish provider a Finnish one. Give the provider the locale and
                its messages, and write no <code>label</code>. Here a nested provider keeps the rest
                of this page in English. The names of the levels are your own text, so this example
                writes them in Swedish too. A site that is in Swedish throughout sets the locale
                once, on the provider at the top.
              </>
            }
            code={sources['other-language']}
            note={
              <Note kind="tip">
                The name exists in all five languages. The Finnish version and both Norwegian
                versions are drafts: ask a native speaker to check them before you publish.
              </Note>
            }
          >
            <OtherLanguageBreadcrumb />
          </UseCase>
          <UseCase
            id="own-markup"
            title="A trail in your own markup"
            why={
              <>
                When you write the elements yourself, call <code>useBreadcrumb</code> and spread
                each set of props on the element it names: the <code>&lt;nav&gt;</code>, the{' '}
                <code>&lt;ol&gt;</code>, each <code>&lt;li&gt;</code> and the last item’s{' '}
                <code>&lt;span&gt;</code>. You get the classes, the name, the list role and{' '}
                <code>aria-current</code>. Here the slash variant gives a path-like trail for a case
                system that staff use.
              </>
            }
            code={sources['own-markup']}
            propsUsed={[
              {
                part: apiHookPart('useBreadcrumb', 'options'),
                label: 'useBreadcrumb (options)',
                prop: 'variant',
              },
              {
                part: apiHookPart('useBreadcrumb', 'options'),
                label: 'useBreadcrumb (options)',
                prop: 'label',
              },
            ]}
            note={
              <Note kind="reminder">
                Give each link the class <code>kv-breadcrumb-link</code>: the hook doesn’t. It keeps
                the link at least 24px tall (2.5.8 Target Size (Minimum), AA).
              </Note>
            }
          >
            <OwnMarkup />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} linkToStrings />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Breadcrumb, useBreadcrumb } from '@kvirn-ui/react'"
          parts={parts}
          hook={useBreadcrumbHook}
          strings={
            <StringsBlock
              namespace="breadcrumb"
              component="Breadcrumb"
              keys={[
                {
                  key: 'label',
                  meaning:
                    'The landmark’s accessible name, set as aria-label. It says what the trail is for.',
                },
              ]}
            />
          }
        />
      }
    />
  )
}

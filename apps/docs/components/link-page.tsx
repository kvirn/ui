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
  linkAttributes,
  linkIconAttributes,
  linkIconRows,
  linkNewTabNoticeAttributes,
  linkNewTabNoticeRows,
  linkRows,
  useLinkHook,
} from '../content/link.api.ts'
import { CurrentPage } from '../examples/link/current-page.tsx'
import { DefaultLink } from '../examples/link/default.tsx'
import { NewTab } from '../examples/link/new-tab.tsx'
import { OtherLanguage } from '../examples/link/other-language.tsx'
import { ServiceLink } from '../examples/link/service-link.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type LinkExampleSources = Record<
  'default' | 'new-tab' | 'current-page' | 'other-language' | 'service-link',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Link.Root',
    renders: (
      <>
        <code>&lt;a href&gt;</code> with the role <code>link</code>, rendered by the router link you
        registered on <code>KvirnProvider</code> (<code>linkComponent</code>), or a native{' '}
        <code>&lt;a&gt;</code> when none is. It takes every attribute of that element and passes{' '}
        <code>ref</code> to it. There is no <code>disabled</code> prop. Also exported as{' '}
        <code>Link</code> and <code>LinkRoot</code>. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: linkRows,
    attributes: linkAttributes,
  },
  {
    name: 'Link.NewTabNotice',
    renders: (
      <>
        <code>&lt;span&gt;</code> with the text of <code>link.newTabNotice</code>, such as{' '}
        <q lang="en">(opens in a new tab)</q>. It is part of the link’s name. Also exported as{' '}
        <code>LinkNewTabNotice</code>.
      </>
    ),
    props: linkNewTabNoticeRows,
    attributes: linkNewTabNoticeAttributes,
  },
  {
    name: 'Link.Icon',
    renders: (
      <>
        <code>&lt;span aria-hidden=&quot;true&quot;&gt;</code> for a decorative icon, first in the
        link. Also exported as <code>LinkIcon</code>.
      </>
    ),
    props: linkIconRows,
    attributes: linkIconAttributes,
  },
]

export function LinkPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: LinkExampleSources
}) {
  return (
    <ComponentPage
      title="Link"
      lead="A link that goes to another page or place. It is a native link, so it works the way people expect, and it can tell them when it opens a new tab."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>Use a link to go somewhere: another page, a place on this page or a file.</li>
          <li>
            Write text that says where the link goes, also out of context. “Apply for a parking
            permit”, not “click here”.
          </li>
          <li>
            Use <code>kv-link--service</code> once on a page, for the link that starts an e-service.
          </li>
          <li>
            Not for an action that changes something, such as sending or saving: use a{' '}
            <Link href="/components/button">Button</Link>. A link has no disabled state: if the page
            isn’t available, show text instead.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultLink />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="new-tab"
            title="A link that opens a new tab"
            why="Opening a new tab changes where the user is, so say so in the link’s name. Link.NewTabNotice adds the translated text inside the link, and Link adds noopener noreferrer to rel."
            code={sources['new-tab']}
            propsUsed={[
              { part: 'Link.Root', prop: 'target' },
              { part: 'Link.NewTabNotice', prop: 'children' },
            ]}
            note={
              <Note kind="reminder">
                Link does not check that you added the notice: there is no type error and no
                warning. Put it in every link with <code>target=&quot;_blank&quot;</code>, or
                better, don’t open new tabs. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <NewTab />
          </UseCase>
          <UseCase
            id="current-page"
            title="The current page in a list of links"
            why="Mark the link to the page the user is on, so a screen reader says “current page” and the default theme shows it by weight as well as colour. Link doesn’t read the router: you decide which link is current."
            code={sources['current-page']}
            propsUsed={[{ part: 'Link.Root', prop: 'current' }]}
            note={
              <Note kind="tip">
                With a router, compare the link’s path to the router’s own pathname, and pass{' '}
                <code>current=&quot;page&quot;</code> or <code>false</code>.
              </Note>
            }
          >
            <CurrentPage />
          </UseCase>
          <UseCase
            id="other-language"
            title="A link to a page in another language"
            why="Set lang on the link text, so a screen reader pronounces it in that language, and hrefLang on where it goes."
            code={sources['other-language']}
          >
            <OtherLanguage />
          </UseCase>
          <UseCase
            id="service-link"
            title="The link that starts an e-service"
            why="One link on a page is the way in to the service. Add the class kv-link--service and put the icon first, in Link.Icon: it is hidden from screen readers, so the name is only the text."
            code={sources['service-link']}
          >
            <ServiceLink />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Link, useLink } from '@kvirn-ui/react'"
          parts={parts}
          hook={useLinkHook}
          strings={
            <StringsBlock
              namespace="link"
              component="Link"
              keys={[
                {
                  key: 'newTabNotice',
                  meaning:
                    'Tells users a link opens in a new tab. It is part of the link’s name, used by Link.NewTabNotice and useLink().newTabNotice.',
                },
              ]}
            />
          }
        />
      }
    />
  )
}

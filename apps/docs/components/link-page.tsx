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
import { FileLink } from '../examples/link/file.tsx'
import { NewTab } from '../examples/link/new-tab.tsx'
import { OtherLanguage } from '../examples/link/other-language.tsx'
import { ServiceLink } from '../examples/link/service-link.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type LinkExampleSources = Record<
  'default' | 'new-tab' | 'current-page' | 'other-language' | 'file' | 'service-link',
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
      lead="It is a native link, so it behaves the way people expect. Add the new-tab notice and the link says when it opens a new tab, also to a screen reader (software that reads the screen aloud)."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>Use a link to go somewhere: another page, a place on this page or a file.</li>
          <li>
            Write text that says where the link goes: “Apply for a parking permit”, not “click
            here”.
          </li>
          <li>
            Use <code>kv-link--service</code> for the link that starts an e-service.
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
            why={
              <>
                Opening a new tab takes people somewhere they may not expect, so say so in the
                link’s name. <code>Link.NewTabNotice</code> adds that text inside the link,
                translated. Link also adds <code>noopener noreferrer</code> to <code>rel</code> for
                you.
              </>
            }
            code={sources['new-tab']}
            propsUsed={[
              { part: 'Link.Root', prop: 'target' },
              { part: 'Link.NewTabNotice', prop: 'children' },
            ]}
            note={
              <Note kind="tip">
                Link does not check that you added the notice: there is no type error and no
                warning, so review every <code>target=&quot;_blank&quot;</code> link by hand. No
                level A or AA criterion requires the warning (3.2.5 Change on Request is level AAA),
                but without it a screen reader user isn’t told that a new tab opens. Better still,
                don’t open new tabs.
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
                With a router, compare the link’s address with the router’s own current address, and
                pass <code>current=&quot;page&quot;</code> or <code>false</code>.
              </Note>
            }
          >
            <CurrentPage />
          </UseCase>
          <UseCase
            id="other-language"
            title="A link to a page in another language"
            why={
              <>
                Put the link in your own element with <code>lang</code> set to the language of its
                text, so a screen reader reads “Suomeksi” (in Finnish) in Finnish.{' '}
                <code>hrefLang</code> names the language of the page it goes to. It doesn’t change
                how the text is read.
              </>
            }
            code={sources['other-language']}
            note={
              <Note kind="reminder">
                Link never sets <code>lang</code> for you. Without it, a screen reader reads the
                Finnish text with the page’s language (3.1.2 Language of Parts).
              </Note>
            }
          >
            <OtherLanguage />
          </UseCase>
          <UseCase
            id="file"
            title="A link to a file"
            why={
              <>
                People decide before they tap, and some pay for their data by the megabyte. Put the
                file type and size in the link text itself, in brackets. Don’t leave them to a{' '}
                <code>title</code>, an icon alone or text beside the link. Offer a web page version
                where you can.
              </>
            }
            code={sources['file']}
            propsUsed={[{ part: 'Link.Root', prop: 'as' }]}
            note={
              <Note kind="tip">
                Write the size with <code>useFormat</code>, so the number follows the page’s
                language. Swedish uses a decimal comma, for example “2,5 MB”. Both come from the
                example’s texts, which exist in all five languages.
              </Note>
            }
          >
            <FileLink />
          </UseCase>
          <UseCase
            id="service-link"
            title="The link that starts an e-service"
            why={
              <>
                The way in to the service should be easy to find among plain links. Add the class{' '}
                <code>kv-link--service</code> and put the icon first, in <code>Link.Icon</code>. The
                icon is hidden from screen readers, so the link’s name is only its text.
              </>
            }
            code={sources['service-link']}
          >
            <ServiceLink />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                A link that says only “click here” or “read more” fails 2.4.4 Link Purpose (In
                Context) unless the paragraph, list item or table cell around it says where it goes.
                If you show or override the new-tab notice, keep its visible words in the link’s
                name: don’t hide it with <code>display: none</code> or <code>aria-hidden</code>{' '}
                (2.5.3 Label in Name).
              </Note>
            ),
          }}
        />
      }
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

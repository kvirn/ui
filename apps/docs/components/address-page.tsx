import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { addressAttributes, addressRows } from '../content/address.api.ts'
import { ArticleContact } from '../examples/address/article-contact.tsx'
import { DefaultAddress } from '../examples/address/default.tsx'
import { TwoAddresses } from '../examples/address/two-addresses.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type AddressExampleSources = Record<'default' | 'two-addresses' | 'article-contact', string>

const parts: ApiPart[] = [
  {
    name: 'Address',
    renders: (
      <>
        <code>&lt;address&gt;</code> with no role of its own. It takes every attribute of an{' '}
        <code>&lt;address&gt;</code> and passes <code>ref</code> to it. It has no state, no hook and
        no <code>as</code>, and it renders on the server too. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: addressRows,
    attributes: addressAttributes,
  },
]

export function AddressPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: AddressExampleSources
}) {
  return (
    <ComponentPage
      title="Address"
      lead="It adds no text, role or behaviour, and the default theme undoes the browser’s italic."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it for the contact details of the page, or of the article around it: who runs the
            service, where to visit, how to phone or write.
          </li>
          <li>
            Put a phone number or email address in a <Link href="/components/link">Link</Link> whose
            text is the number or the address.
          </li>
          <li>
            Label each address in words. A visiting address and a postal address go in separate{' '}
            <code>Address</code> elements.
          </li>
          <li>
            Put a heading above an <code>Address</code>, not inside it. The HTML standard{' '}
            <a href="https://html.spec.whatwg.org/multipage/sections.html#the-address-element">
              does not allow headings in it
            </a>
            .
          </li>
          <li>
            Not for text that only looks like an address, such as a place in a news story: use a
            paragraph. Not for an address the user types: use an{' '}
            <Link href="/components/address-input">AddressInput</Link>. Not for an address the
            service holds: use a <Link href="/components/definition-list">DefinitionList</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultAddress />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="two-addresses"
            title="A visiting address and a postal address"
            why="Residents visit one address and post to another. Give each its own Address and start it with a label."
            code={sources['two-addresses']}
            note={
              <Note kind="reminder">
                Name each address in words, not by position or colour. Someone who hears the page
                read aloud gets no layout (1.3.3 Sensory Characteristics).
              </Note>
            }
          >
            <TwoAddresses />
          </UseCase>
          <UseCase
            id="article-contact"
            title="Who to ask about one news item"
            why="An Address inside an article is the contact for that article, not for the page."
            code={sources['article-contact']}
          >
            <ArticleContact />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Give each phone and email link the number or the address as its text. Then the
                link’s purpose is clear from the link and its surrounding text (2.4.4 Link Purpose,
                In Context).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={<ApiBlock importLine="import { Address } from '@kvirn-ui/react'" parts={parts} />}
    />
  )
}

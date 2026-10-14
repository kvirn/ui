'use client'
import { Pagination } from '@kvirn-ui/react'
import { usePaginationTexts } from './texts.ts'

const messagePages = [1, 2, 3]
const documentPages = [1, 2, 3, 4]
const currentMessagePage = 2
const currentDocumentPage = 1

// Every address holds the page of both lists, so paging one list leaves the other where it was.
const pageHref = (messagePage: number, documentPage: number) =>
  `#messages-${messagePage}-documents-${documentPage}`

export function TwoListsPagination() {
  const { texts } = usePaginationTexts()
  return (
    <>
      <p>{texts.messagesCaption}</p>
      {/* Two paginations on a page need two names: with the default, a screen reader's list of
          landmarks would show "Pages" twice. */}
      <Pagination.Root label={texts.messagesLabel}>
        <Pagination.List>
          {currentMessagePage > 1 ? (
            <Pagination.Item>
              <Pagination.Previous href={pageHref(currentMessagePage - 1, currentDocumentPage)} />
            </Pagination.Item>
          ) : null}
          {messagePages.map((page) => (
            <Pagination.Item key={page}>
              <Pagination.Link
                page={page}
                href={pageHref(page, currentDocumentPage)}
                current={page === currentMessagePage}
              />
            </Pagination.Item>
          ))}
          <Pagination.Item>
            <Pagination.Status page={currentMessagePage} total={messagePages.length} />
          </Pagination.Item>
          {currentMessagePage < messagePages.length ? (
            <Pagination.Item>
              <Pagination.Next href={pageHref(currentMessagePage + 1, currentDocumentPage)} />
            </Pagination.Item>
          ) : null}
        </Pagination.List>
      </Pagination.Root>
      <p>{texts.documentsCaption}</p>
      <Pagination.Root label={texts.documentsLabel}>
        <Pagination.List>
          {currentDocumentPage > 1 ? (
            <Pagination.Item>
              <Pagination.Previous href={pageHref(currentMessagePage, currentDocumentPage - 1)} />
            </Pagination.Item>
          ) : null}
          {documentPages.map((page) => (
            <Pagination.Item key={page}>
              <Pagination.Link
                page={page}
                href={pageHref(currentMessagePage, page)}
                current={page === currentDocumentPage}
              />
            </Pagination.Item>
          ))}
          <Pagination.Item>
            <Pagination.Status page={currentDocumentPage} total={documentPages.length} />
          </Pagination.Item>
          {currentDocumentPage < documentPages.length ? (
            <Pagination.Item>
              <Pagination.Next href={pageHref(currentMessagePage, currentDocumentPage + 1)} />
            </Pagination.Item>
          ) : null}
        </Pagination.List>
      </Pagination.Root>
    </>
  )
}

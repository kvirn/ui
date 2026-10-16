import { Badge, Link, VisuallyHidden } from '@kvirn-ui/react'
import { messages } from '../messages/en.ts'

const text = messages.docs.nav

/** For the gallery cards. The leading space keeps it apart from the label for AT. */
export function OwnPackageBadge({ page }: { page: { ownPackage?: string | undefined } }) {
  return page.ownPackage === undefined ? null : (
    <>
      {' '}
      <Badge>{text.ownPackage}</Badge>
    </>
  )
}

/** For the menu and the sidebar: an asterisk to the eye, "separate package" to AT, explained by `OwnPackageNote`. */
export function OwnPackageMark({ page }: { page: { ownPackage?: string | undefined } }) {
  return page.ownPackage === undefined ? null : (
    <>
      {' '}
      <span aria-hidden="true">*</span>
      <VisuallyHidden>{`, ${text.ownPackage.toLowerCase()}`}</VisuallyHidden>
    </>
  )
}

/** `inList` makes it a list item, for a note placed among a `<ul>`'s children. */
export function OwnPackageNote({
  pages,
  inList = false,
}: {
  pages: readonly { ownPackage?: string | undefined }[]
  inList?: boolean
}) {
  if (!pages.some((page) => page.ownPackage !== undefined)) return null
  const Tag = inList ? 'li' : 'p'
  return (
    <Tag className="docs-own-package-note">
      * {text.ownPackage}. {text.ownPackageNote}{' '}
      <Link href="/docs#packages">
        {text.ownPackageReadMore} <VisuallyHidden>{text.ownPackageReadMoreHidden}</VisuallyHidden>
      </Link>
    </Tag>
  )
}

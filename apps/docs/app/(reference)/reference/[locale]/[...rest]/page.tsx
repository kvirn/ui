import { notFound } from 'next/navigation'

// An unknown path below a locale renders the reference 404, in that locale and inside its layout.
export const generateStaticParams = () => []

export default function ReferenceUnknownPath() {
  notFound()
}

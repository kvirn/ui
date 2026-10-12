'use client'
import { Link } from '@kvirn-ui/react'
import { useState } from 'react'
import { useLinkTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function CurrentPage() {
  const { texts, isFallback } = useLinkTexts()
  const [currentPage, setCurrentPage] = useState('overview')
  const pages = [
    { id: 'overview', label: texts.navOverview },
    { id: 'apply', label: texts.navApply },
    { id: 'contact', label: texts.navContact },
  ]
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <nav aria-label={texts.navLabel}>
        <ul>
          {pages.map((page) => (
            <li key={page.id}>
              <Link.Root
                href={`#${page.id}`}
                current={currentPage === page.id ? 'page' : false}
                onClick={() => setCurrentPage(page.id)}
              >
                {page.label}
              </Link.Root>
            </li>
          ))}
        </ul>
      </nav>
    </InEnglishWhenFallback>
  )
}

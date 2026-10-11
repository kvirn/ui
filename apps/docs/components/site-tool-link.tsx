import { Link } from '@kvirn-ui/react'
import type { SiteTool } from './site-sections.ts'

export function SiteToolLink({ tool }: { tool: SiteTool }) {
  return (
    <Link href={tool.href} target={tool.opensInNewTab === true ? '_blank' : undefined}>
      {/* One inline box: in a flex item a bare space before the notice would collapse. */}
      <span>
        {tool.label}
        {tool.opensInNewTab === true ? (
          <>
            {' '}
            <Link.NewTabNotice />
          </>
        ) : null}
      </span>
    </Link>
  )
}

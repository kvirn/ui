import { en } from '@kvirn/i18n/en'
import { ContentTypeShell } from '@kvirn/patterns/content-types'
import { KvirnProvider } from '@kvirn/ui'
import type { Decorator } from '@storybook/react-vite'

// The shell every content-type story shares (decision D12): skip link, header, optional site alert
// and footer. A story renders only the content type, which is what sits between header and footer.
// The shell itself is `ContentTypeShell` in the patterns package; this decorator reads
// `parameters.shell` for it. Story-only.

export type ShellParameters = {
  header?: 'kvirnby' | 'transaction' | 'docs'
  current?: 'page'
  siteAlert?: boolean
}

export const withShell: Decorator = (Story, context) => {
  const { header, current, siteAlert } = (context.parameters.shell ?? {}) as ShellParameters
  return (
    <KvirnProvider locale="en" messages={en}>
      <ContentTypeShell header={header} current={current} siteAlert={siteAlert}>
        <Story />
      </ContentTypeShell>
    </KvirnProvider>
  )
}

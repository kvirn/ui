import type { Preview } from '@storybook/react-vite'
import { wcagTags } from '@kvirn-ui/testing'

const preview: Preview = {
  globalTypes: {
    locale: {
      description: 'Locale for component strings',
      toolbar: { title: 'Locale', items: ['sv', 'fi', 'nb', 'nn', 'se', 'en'] },
    },
    dir: {
      description: 'Text direction',
      toolbar: { title: 'Direction', items: ['ltr', 'rtl'] },
    },
    forcedColors: {
      description:
        'Marks forced-colors stories. Real emulation runs in the chromium-forced-colors e2e project',
      toolbar: { title: 'Forced colors', items: ['none', 'active'] },
    },
  },
  initialGlobals: { locale: 'sv', dir: 'ltr', forcedColors: 'none' },
  decorators: [
    (Story, context) => (
      <div
        lang={context.globals['locale'] as string}
        dir={context.globals['dir'] as string}
        data-forced-colors={context.globals['forcedColors'] as string}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    // Every story state is an axe test in `vp test run` (AGENTS.md, gate 2). Never lower to 'todo' or 'off'.
    a11y: {
      test: 'error',
      options: { runOnly: { type: 'tag', values: [...wcagTags] } },
    },
  },
}

export default preview

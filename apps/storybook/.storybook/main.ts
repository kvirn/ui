import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  // Every story lives in this app: the Introduction, the Foundation pages and the component
  // stories in src/components/<name>/ (the packages ship no Storybook files). Every story is
  // styled by theme.css from the preview (ADR-0013), and has a Docs page (ADR-0023).
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-vitest', '@storybook/addon-a11y', '@storybook/addon-docs'],
  core: { disableTelemetry: true, disableWhatsNewNotifications: true },
}

export default config

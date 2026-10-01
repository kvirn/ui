import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  // Every story lives in this app: the Introduction and Foundation pages, and the component
  // stories in src/components/<name>/ (the packages ship no Storybook files). Every story is
  // styled by theme.css from the preview, and the Theme toolbar can remove it (ADR-0013).
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-vitest'],
  core: { disableTelemetry: true, disableWhatsNewNotifications: true },
}

export default config

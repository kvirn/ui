import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  // Component stories live with their component. The Introduction lives here. Every story is
  // styled by theme.css from the preview, and the Theme toolbar can remove it (ADR-0013).
  stories: ['../../../packages/*/src/**/*.stories.@(ts|tsx)', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-vitest'],
  core: { disableTelemetry: true, disableWhatsNewNotifications: true },
}

export default config

import type { Metadata } from 'next'
import { AccessibilitySettingsPage } from '../../../components/accessibility-settings-page.tsx'
import { messages } from '../../../messages/en.ts'
import './accessibility-settings.css'

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: messages.docs.header.accessibilitySettings }),
}

export default function Page() {
  return <AccessibilitySettingsPage />
}

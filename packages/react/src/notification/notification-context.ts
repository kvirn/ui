import { createContext } from 'react'
import type { UseNotificationResult } from './use-notification.ts'

/**
 * Internal. The root's `useNotification` result for its Title, Body and Actions: their classes
 * and refs, and the status word the Title starts with. `null` outside a root.
 */
export const NotificationContext = createContext<UseNotificationResult | null>(null)

import { createContext } from 'react'

export interface SiteAlertContextValue {
  /** The id of the title, which names the region. */
  titleId: string
  dismiss: () => void
}

export const SiteAlertContext = createContext<SiteAlertContextValue | null>(null)

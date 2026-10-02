import type { Announcer } from '@kvirn-ui/core'
import { createContext } from 'react'

/** The document's announcer, set by the outermost provider. `null` outside any provider. */
export const AnnouncerContext = createContext<Announcer | null>(null)

import { createContext } from 'react'
import type { ReactNode } from 'react'

/**
 * Internal. The root's `separator` for its items: the consumer's own element, or nothing for the
 * theme's generated one. `undefined` outside a root.
 */
export const BreadcrumbContext = createContext<ReactNode>(undefined)

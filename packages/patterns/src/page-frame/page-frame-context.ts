import { createContext } from 'react'

export interface PageFrameContextValue {
  /** The id of `main`, and the skip link's target. */
  mainId: string
}

export const PageFrameContext = createContext<PageFrameContextValue>({ mainId: 'main' })

/** True inside `PageFrame.Body`: `Main` is then the content of a sidebar layout. */
export const PageFrameBodyContext = createContext(false)

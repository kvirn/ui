import { createContext } from 'react'
import type { RefObject } from 'react'

export interface CodeBlockContextValue {
  /** The Label's id, which names the Root's group. */
  labelId: string
  /** The Code's element: the text `CodeBlock.Copy` copies, and what it selects on failure. */
  codeRef: RefObject<HTMLElement | null>
  /** The Label calls this when it mounts. Returns the cleanup. */
  registerLabel: () => () => void
}

/** `null` outside a `CodeBlock.Root`: the parts then render with their class only. */
export const CodeBlockContext = createContext<CodeBlockContextValue | null>(null)

import { createContext } from 'react'
import type { RefObject } from 'react'
import type { Shortcut } from '@kvirn-ui/core'

export interface SkipPanelContextValue {
  /** `false` turns the chords, the key caps and `aria-keyshortcuts` off. */
  shortcutsEnabled: boolean
  /** Apple platforms name Alt Option and Meta Command in the key caps. */
  apple: boolean
  reopenShortcut: Shortcut | undefined
  /** A Shortcut part calls this when it mounts, so its chord runs it. Returns the cleanup. */
  /** The id of the arrow-key sentence the first Link is described by. */
  arrowHintId: string
  /** The Hint calls this when it mounts, so the first Link is described by it. Returns the cleanup. */
  registerArrowHint: () => () => void
  /** A Link or Shortcut calls this when it mounts, so it joins the roving tabindex. Returns the cleanup. */
  registerItem: () => () => void
  /** Re-applies the roving tabindex and the first Link's description. */
  syncItems: () => void
  registerShortcut: (shortcut: Shortcut, elementRef: RefObject<HTMLElement | null>) => () => void
}

/** `null` outside a `SkipPanel.Root`: the parts then render with their class only. */
export const SkipPanelContext = createContext<SkipPanelContextValue | null>(null)

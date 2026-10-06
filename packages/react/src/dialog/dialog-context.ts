import { createAnnouncer } from '@kvirn-ui/core'
import type { Announcer } from '@kvirn-ui/core'
import { createContext, useEffect, useMemo } from 'react'
import { useEnv } from '../provider/use-env.ts'
import type { UseDialogResult } from './use-dialog.ts'

export interface DialogContextValue {
  dialog: UseDialogResult
  /** Whether this dialog is open and its element is actually shown: what a dialog inside waits for. */
  isShown: boolean
  /** The modal's own announcer: the provider's live regions are inert while a modal is open. */
  announcer: Announcer
}

/** Shared by Dialog and AlertDialog: the alert's parts are the dialog's with their own class. */
export const DialogContext = createContext<DialogContextValue | null>(null)

/**
 * Set by `Dialog.Popup` around its content only, so a dialog inside the popup knows its parent,
 * and a sibling Root next to the Popup does not. Hook-only users provide none.
 */
export const ParentDialogContext = createContext<{ isOpen: boolean; isShown: boolean } | null>(null)

/** Internal. One announcer per Root, cleared when the dialog closes and when the Root unmounts. */
export function useDialogAnnouncer(isOpen: boolean): Announcer {
  const env = useEnv()
  const announcer = useMemo(() => createAnnouncer(env), [env])
  useEffect(() => {
    if (!isOpen) {
      announcer.actions.clear()
    }
  }, [isOpen, announcer])
  useEffect(() => () => announcer.actions.clear(), [announcer])
  return announcer
}

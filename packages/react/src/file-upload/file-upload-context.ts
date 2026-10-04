import type { FileUploadEntry } from '@kvirn-ui/core'
import { createContext } from 'react'
import type { UseFileUploadResult } from './use-file-upload.ts'

// Internal. How the FileUpload parts find the Root's hook, and an Item's parts find the Item.

/** The Root's `useFileUpload()` result, for every part inside it. `null` outside a Root. */
export const FileUploadContext = createContext<UseFileUploadResult | null>(null)

/** A part of an item that its buttons are described by. */
export type FileUploadItemPartName = 'status' | 'error'

/** The Item an Item part sits in: which file, and which of its parts are rendered. */
export interface FileUploadItemContextValue {
  item: FileUploadEntry
  /** The name the list shows ("image.jpg (2)" for the second of two). */
  name: string
  index: number
  /**
   * The Status and ItemError register themselves while rendered, so the item's buttons are only
   * described by ids that exist. Returns the unregister function.
   */
  registerPart: (part: FileUploadItemPartName) => () => void
  isPartRegistered: (part: FileUploadItemPartName) => boolean
}

export const FileUploadItemContext = createContext<FileUploadItemContextValue | null>(null)

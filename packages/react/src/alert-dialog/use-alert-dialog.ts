import { useModalDialog } from '../dialog/use-dialog.ts'
import type { UseDialogOptions, UseDialogResult } from '../dialog/use-dialog.ts'

export interface UseAlertDialogOptions extends Omit<UseDialogOptions, 'dismissOnOutsidePress'> {
  /**
   * Where focus goes when it opens. **Set it**: the least destructive action ("Keep draft"), or
   * the primary one when nothing is destroyed ("Stay signed in"). A development warning fires without it.
   */
  initialFocusRef?: UseDialogOptions['initialFocusRef']
}

export type UseAlertDialogResult = UseDialogResult

/**
 * A modal alert dialog's props for your own elements (contract: alert-dialog.a11y.md): a
 * `useDialog` with `role="alertdialog"` and a press on the backdrop that never closes it. Escape
 * reports `'escape'` to `onOpenChange`, and the answer must never be destructive. It needs a
 * description, which is read out with the title, and an `initialFocusRef`.
 *
 * @example
 * const alertDialog = useAlertDialog({ open, onOpenChange, initialFocusRef: keepRef })
 */
export function useAlertDialog(options: UseAlertDialogOptions = {}): UseAlertDialogResult {
  return useModalDialog(options, 'alertdialog')
}

import type {
  AlertDialogActionsProps,
  AlertDialogBodyProps,
  AlertDialogCloseProps,
  AlertDialogDescriptionProps,
  AlertDialogPopupProps,
  AlertDialogRootProps,
  AlertDialogTitleProps,
  AlertDialogTriggerProps,
  UseAlertDialogOptions,
  UseAlertDialogResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'
import {
  dialogActionsAttributes,
  dialogBodyAttributes,
  dialogDescriptionAttributes,
  dialogHookResultRows,
  dialogRenderRow,
  dialogSharedOptionRows,
  dialogTitleAttributes,
} from './dialog.api.ts'

const alertDialogOptionRows = {
  ...dialogSharedOptionRows,
  initialFocusRef: {
    ...dialogSharedOptionRows.initialFocusRef,
    description:
      'Where focus goes when it opens. Set it: the least destructive action, or the primary one when nothing is destroyed. A development warning fires without it.',
  },
} as const

export const alertDialogRootRows = propRows<AlertDialogRootProps>({
  ...alertDialogOptionRows,
  children: {
    type: 'ReactNode',
    default: '–',
    description: 'The Trigger, if any, and the Popup. Root renders no element.',
  },
})

export const alertDialogTriggerRows = propRows<Pick<AlertDialogTriggerProps, 'render'>>(
  dialogRenderRow('button'),
)
export const alertDialogPopupRows = propRows<Pick<AlertDialogPopupProps, 'render'>>(
  dialogRenderRow('dialog'),
)
export const alertDialogTitleRows = propRows<Pick<AlertDialogTitleProps, 'render'>>(
  dialogRenderRow('h2'),
)
export const alertDialogDescriptionRows = propRows<Pick<AlertDialogDescriptionProps, 'render'>>(
  dialogRenderRow('p'),
)
export const alertDialogBodyRows = propRows<Pick<AlertDialogBodyProps, 'render'>>(
  dialogRenderRow('div'),
)
export const alertDialogActionsRows = propRows<Pick<AlertDialogActionsProps, 'render'>>(
  dialogRenderRow('div'),
)
export const alertDialogCloseRows = propRows<Pick<AlertDialogCloseProps, 'render'>>(
  dialogRenderRow('button'),
)

export const alertDialogTriggerAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-dialog-trigger, kv-alert-dialog-trigger',
    values: 'always',
    meaning: 'The part classes.',
  },
  { name: 'aria-haspopup', values: '"dialog"', meaning: 'The trigger opens a dialog.' },
  { name: 'data-open', values: 'present or absent', meaning: 'The alert dialog is open.' },
]

export const alertDialogPopupAttributes: readonly AttributeRow[] = [
  { name: 'kv-dialog, kv-alert-dialog', values: 'always', meaning: 'The part classes.' },
  {
    name: 'role',
    values: '"alertdialog"',
    meaning: 'A modal alert dialog, shown with showModal(). It is read out with its description.',
  },
  {
    name: 'aria-labelledby, aria-describedby',
    values: 'the title’s and description’s ids',
    meaning: 'Present while the Title and the Description are rendered.',
  },
  { name: 'data-open', values: 'present or absent', meaning: 'The alert dialog is open.' },
  {
    name: 'data-kv-scroll-locked',
    values: 'present or absent, on <html>',
    meaning:
      'Set while it is open. The default theme turns it into overflow: hidden. Without the theme, add that CSS yourself.',
  },
]

export const alertDialogCloseAttributes: readonly AttributeRow[] = [
  { name: 'kv-alert-dialog-close', values: 'always', meaning: 'The part class.' },
]

export const alertDialogTitleAttributes = dialogTitleAttributes.map((row) =>
  row.name === 'kv-dialog-title' ? { ...row, name: 'kv-dialog-title, kv-alert-dialog-title' } : row,
)
export const alertDialogDescriptionAttributes = dialogDescriptionAttributes.map((row) => ({
  ...row,
  name: 'kv-dialog-description, kv-alert-dialog-description',
}))
export const alertDialogBodyAttributes = dialogBodyAttributes.map((row) => ({
  ...row,
  name: 'kv-dialog-body, kv-alert-dialog-body',
}))
export const alertDialogActionsAttributes = dialogActionsAttributes.map((row) => ({
  ...row,
  name: 'kv-dialog-actions, kv-alert-dialog-actions',
}))

export const useAlertDialogHook: ApiHook = {
  name: 'useAlertDialog',
  intro:
    'The same result as useDialog, with role="alertdialog" on the popup and a backdrop press that never closes it. Render your own live regions if the content announces.',
  options: propRows<UseAlertDialogOptions>(alertDialogOptionRows),
  result: propRows<UseAlertDialogResult>(dialogHookResultRows),
}

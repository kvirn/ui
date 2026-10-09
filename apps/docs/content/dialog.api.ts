import type {
  DialogCloseProps,
  DialogRootProps,
  UseDialogOptions,
  UseDialogResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export const dialogSharedOptionRows = {
  open: {
    type: 'boolean',
    default: '–',
    description: 'Controlled: whether the dialog is open. Pair it with onOpenChange.',
  },
  defaultOpen: {
    type: 'boolean',
    default: 'false',
    description: 'Uncontrolled: whether the dialog starts open.',
  },
  onOpenChange: {
    type: '(open: boolean, details: DialogChangeDetails) => void',
    default: '–',
    description:
      'Called on every request to open or close. It only reports: with open set, you change open yourself, and if you keep it open the dialog stays. details.reason is trigger-press, close-press, escape, outside-press or native-close (the browser closed it, for example a form with method="dialog"), and details.event is the native event.',
  },
  initialFocusRef: {
    type: 'RefObject<HTMLElement | null>',
    default: '–',
    description:
      'Where focus goes when it opens. Default: the first tabbable element that is not Close, else the title.',
  },
  finalFocusRef: {
    type: 'RefObject<HTMLElement | null>',
    default: '–',
    description:
      'Where focus goes when it closes. Default: the trigger, else what had focus before it opened. Set it when the trigger can disappear or there is no trigger.',
  },
  messages: {
    type: 'Partial<KvirnMessages["dialog"]>',
    default: '–',
    description: 'Overrides for this dialog’s strings: close, the name of an icon-only Close.',
  },
} as const

const dialogOptionRows = {
  ...dialogSharedOptionRows,
  dismissOnOutsidePress: {
    type: 'boolean',
    default: 'false',
    description:
      'Whether a press on the backdrop closes it, with reason outside-press. Off by default, so a stray tap or a tremor never loses what someone typed. Turn it on for a read-only dialog.',
  },
} as const

export const dialogRootRows = propRows<DialogRootProps>({
  ...dialogOptionRows,
  children: {
    type: 'ReactNode',
    default: '–',
    description: 'The Trigger and the Popup. Root renders no element.',
  },
})

export const dialogCloseAsRow = {
  type: 'ElementType',
  default: "'button'",
  description:
    'A component to render instead of the button, with its props set on the Close: as={Button} className="kv-button--primary". It must render a button, forward its ref and spread its props on a DOM node.',
} as const

export const dialogCloseRows = propRows<Pick<DialogCloseProps, 'messages' | 'as'>>({
  messages: {
    type: 'Partial<KvirnMessages["dialog"]>',
    default: '–',
    description:
      'Overrides for this button’s name: close. Used only when it has no children. Without children it is an icon button named by the message.',
  },
  as: dialogCloseAsRow,
})

export const dialogTriggerAttributes: readonly AttributeRow[] = [
  { name: 'kv-dialog-trigger', values: 'always', meaning: 'The part class.' },
  { name: 'aria-haspopup', values: '"dialog"', meaning: 'The trigger opens a dialog.' },
  { name: 'data-open', values: 'present or absent', meaning: 'The dialog is open.' },
]

export const dialogPopupAttributes: readonly AttributeRow[] = [
  { name: 'kv-dialog', values: 'always', meaning: 'The part class.' },
  {
    name: 'role',
    values: '"dialog"',
    meaning: 'A modal dialog, shown with showModal(). The page behind it is inert.',
  },
  {
    name: 'aria-labelledby',
    values: 'the title’s id',
    meaning: 'Present while a Title is rendered. Without a Title, name it with aria-label.',
  },
  {
    name: 'aria-describedby',
    values: 'the description’s id',
    meaning: 'Present while a Description is rendered.',
  },
  { name: 'data-open', values: 'present or absent', meaning: 'The dialog is open.' },
  {
    name: 'data-kv-scroll-locked',
    values: 'present or absent, on <html>',
    meaning:
      'Set while any dialog is open, counted across nested dialogs. The default theme turns it into overflow: hidden. Without the theme, add that CSS yourself.',
  },
]

export const dialogTitleAttributes: readonly AttributeRow[] = [
  { name: 'kv-dialog-title', values: 'always', meaning: 'The part class.' },
  {
    name: 'tabindex',
    values: '"-1"',
    meaning:
      'Focus lands here when nothing tabbable comes first, so a long read starts at the top.',
  },
]

export const dialogDescriptionAttributes: readonly AttributeRow[] = [
  { name: 'kv-dialog-description', values: 'always', meaning: 'The part class.' },
]

export const dialogBodyAttributes: readonly AttributeRow[] = [
  { name: 'kv-dialog-body', values: 'always', meaning: 'The part class.' },
]

export const dialogActionsAttributes: readonly AttributeRow[] = [
  { name: 'kv-dialog-actions', values: 'always', meaning: 'The part class.' },
]

export const dialogCloseAttributes: readonly AttributeRow[] = [
  { name: 'kv-dialog-close', values: 'always', meaning: 'The part class.' },
  {
    name: 'aria-label',
    values: 'the dialog.close message',
    meaning: 'Only when it has no children.',
  },
]

export const dialogHookResultRows = {
  isOpen: { type: 'boolean', default: '–', description: 'Whether the dialog is open.' },
  triggerProps: {
    type: 'DialogTriggerPartProps',
    default: '–',
    description: 'Spread on a <button>: type, aria-haspopup, data-open, ref and the click handler.',
  },
  popupProps: {
    type: 'DialogPopupPartProps',
    default: '–',
    description:
      'Spread on a <dialog>: role, aria-modal, aria-labelledby, aria-describedby, data-open, ref and the cancel and close handlers. Render its children only while isOpen.',
  },
  titleProps: {
    type: 'DialogTitlePartProps',
    default: '–',
    description: 'Spread on the title, an <h2>: id and tabIndex.',
  },
  descriptionProps: {
    type: 'DialogDescriptionPartProps',
    default: '–',
    description: 'Spread on the description, a <p>: id.',
  },
  closeProps: {
    type: 'DialogClosePartProps',
    default: '–',
    description:
      'Spread on a <button> inside the popup that closes it. Drop aria-label when it has visible text.',
  },
  registerTitle: {
    type: '() => () => void',
    default: '–',
    description:
      'Call it from an effect in your title element. aria-labelledby appears while one is registered. Returns the cleanup.',
  },
  registerDescription: {
    type: '() => () => void',
    default: '–',
    description:
      'Call it from an effect in your description element. aria-describedby appears while one is registered. Returns the cleanup.',
  },
} as const

export const useDialogHook: ApiHook = {
  name: 'useDialog',
  intro:
    'The hook does not host the live regions that Dialog.Root adds, because the provider’s are inert while a modal is open. Render your own if the content announces.',
  options: propRows<UseDialogOptions>(dialogOptionRows),
  result: propRows<UseDialogResult>(dialogHookResultRows),
}

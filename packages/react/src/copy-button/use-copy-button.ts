import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent, RefObject } from 'react'
import { useAnnouncer } from '../announcer/use-announcer.ts'
import { useButton } from '../button/use-button.ts'
import type { ButtonPartProps } from '../button/use-button.ts'
import { useEnv } from '../provider/use-env.ts'
import { useMessages } from '../provider/use-messages.ts'

export type CopyStatus = 'idle' | 'copied' | 'failed'

/** How long `status` stays `copied` before it is `idle` again. `failed` stays until the next press. */
const statusMilliseconds = 5000

export interface UseCopyActionOptions {
  /** The text to write. A function is read when the button is activated. */
  text: string | (() => string)
  /**
   * The element that shows the text. When the browser refuses to write, its contents are
   * selected, so the user can copy them by hand.
   */
  textRef?: RefObject<Element | null> | undefined
  /** Called with the text after it was written to the clipboard. */
  onCopied?: ((text: string) => void) | undefined
  /** Called when the text could not be written, after the failure is announced. */
  onCopyError?: ((text: string) => void) | undefined
  /** Called first on activation, before the text is written. */
  onClick?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined
  /** Per-instance message overrides: `{ label: 'Kopiera ärendenumret' }`. */
  messages?: Partial<KvirnMessages['copyButton']> | undefined
}

export interface UseCopyButtonOptions extends UseCopyActionOptions {
  /** Mirrors HTML `disabled`. Blocks copying. */
  disabled?: boolean | undefined
  /** Keeps a disabled button in the Tab order with `aria-disabled="true"`. Copying stays blocked. */
  focusableWhenDisabled?: boolean | undefined
}

/** Spread on a `<button>`: the Button's props, and the result as a styling hook. */
export interface CopyButtonPartProps extends ButtonPartProps {
  /** `idle`, then `copied` for five seconds, or `failed` until the next press. Not a name and not an announcement. */
  'data-status': CopyStatus
}

export interface UseCopyButtonResult {
  buttonProps: CopyButtonPartProps
  /** The message `copyButton.label`: the default text of the button. */
  label: string
  status: CopyStatus
  isDisabled: boolean
  isFocusVisible: boolean
}

/**
 * Internal. Writing the text, announcing the result and the status: what `useCopyButton` and
 * the `CopyButton` component share, so `CopyButton` can render through `Button`.
 */
export function useCopyAction({
  text,
  textRef,
  onCopied,
  onCopyError,
  onClick,
  messages,
}: UseCopyActionOptions) {
  const env = useEnv()
  const copyMessages = useMessages('copyButton', messages)
  const { announce } = useAnnouncer()
  const [status, setStatus] = useState<CopyStatus>('idle')
  const timer = useRef<{ clear: () => void } | null>(null)

  useEffect(() => () => timer.current?.clear(), [])

  const showStatus = useCallback(
    (next: CopyStatus) => {
      setStatus(next)
      timer.current?.clear()
      if (next === 'copied' && env !== undefined) {
        const id = env.window.setTimeout(() => setStatus('idle'), statusMilliseconds)
        timer.current = { clear: () => env.window.clearTimeout(id) }
      }
    },
    [env],
  )

  const copy = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    showStatus('idle')
    const value = typeof text === 'function' ? text() : text
    const fail = () => {
      const element = textRef?.current
      if (env !== undefined && element != null) {
        env.window.getSelection()?.selectAllChildren(element)
      }
      showStatus('failed')
      announce(copyMessages.failed, { politeness: 'assertive' })
      onCopyError?.(value)
    }
    // The Clipboard API is missing in an insecure context. It is called here, synchronously,
    // because Safari only allows the write inside the user activation.
    const clipboard = env?.window.navigator.clipboard as Clipboard | undefined
    if (clipboard === undefined) {
      fail()
      return
    }
    let written: Promise<void>
    try {
      written = clipboard.writeText(value)
    } catch {
      fail()
      return
    }
    written.then(() => {
      showStatus('copied')
      announce(copyMessages.copied)
      onCopied?.(value)
    }, fail)
  }

  return {
    copy,
    status,
    label: copyMessages.label,
    statusMessages: { copied: copyMessages.copied, failed: copyMessages.failed },
  }
}

/**
 * A copy button's behaviour for your own `<button>` (contract: copy-button.a11y.md). Activating
 * it writes `text` to the clipboard and announces `copyButton.copied`. When the browser refuses,
 * it announces `copyButton.failed` and selects the contents of `textRef`. The name is `label`
 * and never changes to the result.
 *
 * @example
 * const copy = useCopyButton({ text: referenceNumber, textRef })
 * <button {...copy.buttonProps}>{copy.label}</button>
 */
export function useCopyButton({
  disabled,
  focusableWhenDisabled,
  ...actionOptions
}: UseCopyButtonOptions): UseCopyButtonResult {
  const { copy, status, label } = useCopyAction(actionOptions)
  const button = useButton({ disabled, focusableWhenDisabled, onClick: copy })
  return {
    buttonProps: { ...button.buttonProps, 'data-status': status },
    label,
    status,
    isDisabled: button.isDisabled,
    isFocusVisible: button.isFocusVisible,
  }
}

'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import type { ReactElement } from 'react'
import { Icon } from '../icon/icon.tsx'
import { Button } from '../button/button.tsx'
import type { ButtonProps } from '../button/button.tsx'
import { useCopyAction } from './use-copy-button.ts'
import type { UseCopyActionOptions } from './use-copy-button.ts'

export interface CopyButtonProps extends Omit<ButtonProps, 'type' | 'onClick'> {
  /** The text to write to the clipboard. A function is read when the button is activated. */
  text: UseCopyActionOptions['text']
  /**
   * The element that shows the text. When the browser refuses to write, its contents are
   * selected, so the user can copy them by hand.
   */
  textRef?: UseCopyActionOptions['textRef']
  /** Called with the text after it was written to the clipboard. */
  onCopied?: UseCopyActionOptions['onCopied']
  /** Called when the text could not be written, after the failure is announced. */
  onCopyError?: UseCopyActionOptions['onCopyError']
  /** Called first on activation. It is not called while disabled. */
  onClick?: UseCopyActionOptions['onClick']
  /** Your own label. Replaces the message `copyButton.label`, so its language is yours to set. */
  children?: ButtonProps['children']
  /**
   * `false` renders no visible status, so you draw your own from `data-status`. The result is
   * announced either way.
   */
  status?: boolean | undefined
  /** Per-instance message overrides: `{ label, copied, failed }`. */
  messages?: Partial<KvirnMessages['copyButton']> | undefined
}

/**
 * A Button that copies a text (contract: copy-button.a11y.md). Its name is "Copy" and stays
 * "Copy": the result, `copyButton.copied` or `copyButton.failed`, is announced through the
 * `KvirnProvider`'s live region and shown in a `span.kv-copy-status` after the button: `copied`
 * for five seconds, `failed` until the next press. It is not a live region. On failure the contents of `textRef` are selected, so the
 * user can copy them by hand. `data-status` is `idle`, `copied` or `failed` for your own cue.
 *
 * @example
 * <p>Ditt ärendenummer är <span ref={numberRef}>PK-2026-004217</span></p>
 * <CopyButton text="PK-2026-004217" textRef={numberRef}>Kopiera ärendenumret</CopyButton>
 */
export function CopyButton({
  text,
  textRef,
  onCopied,
  onCopyError,
  onClick,
  messages,
  status: showStatus = true,
  children,
  ...buttonProps
}: CopyButtonProps): ReactElement {
  const { copy, status, label, statusMessages } = useCopyAction({
    text,
    textRef,
    onCopied,
    onCopyError,
    onClick,
    messages,
  })
  const statusText = status === 'idle' || buttonProps.disabled ? null : statusMessages[status]
  return (
    <>
      <Button {...buttonProps} onClick={copy} data-status={status}>
        {children ?? label}
      </Button>
      {showStatus && statusText !== null ? (
        <span className="kv-copy-status" data-status={status}>
          <Icon name={status === 'copied' ? 'check' : 'warning'} />
          {statusText}
        </span>
      ) : null}
    </>
  )
}
CopyButton.displayName = 'CopyButton'

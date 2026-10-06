'use client'
import { useContext, useLayoutEffect } from 'react'
import type { HTMLAttributes, ReactElement, Ref, RefCallback } from 'react'
import { CopyButton } from '../copy-button/copy-button.tsx'
import type { CopyButtonProps } from '../copy-button/copy-button.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { CodeBlockContext } from './code-block-context.ts'
import { useCodeBlock } from './use-code-block.ts'

/** What `render` receives as its second argument. A code block has no state, so it's empty. */
export type CodeBlockState = Record<string, never>

/** What a `render` function gets to spread: your attributes, the part's props and a callback ref. */
export interface CodeBlockElementProps extends HTMLAttributes<HTMLElement> {
  ref: RefCallback<HTMLElement>
}

interface CodeBlockPartComponentProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement> | undefined
  /** Change the element: `render={<section />}`. Its own semantics apply. */
  render?: RenderProp<CodeBlockElementProps, CodeBlockState> | undefined
}

export type CodeBlockRootComponentProps = CodeBlockPartComponentProps
export type CodeBlockLabelComponentProps = CodeBlockPartComponentProps
export type CodeBlockCodeComponentProps = CodeBlockPartComponentProps

/** `text` and `textRef` default to the Code's text and element. */
export interface CodeBlockCopyProps extends Omit<CopyButtonProps, 'text'> {
  text?: CopyButtonProps['text'] | undefined
}

const codeBlockState: CodeBlockState = Object.freeze({})

/**
 * The code block's container: one `<div class="kv-code-block">`. It is a `group` named by the
 * Label while one is mounted.
 */
export function CodeBlockRoot({
  render,
  ref,
  ...otherProps
}: CodeBlockRootComponentProps): ReactElement {
  const codeBlock = useCodeBlock()
  const elementRef = useMergedRef(ref, null)
  return (
    <CodeBlockContext.Provider value={codeBlock.context}>
      {renderPart({
        render,
        defaultElement: 'div',
        partProps: { ...mergeProps(otherProps, codeBlock.rootProps), ref: elementRef },
        state: codeBlockState,
      })}
    </CodeBlockContext.Provider>
  )
}
CodeBlockRoot.displayName = 'CodeBlock.Root'

/** What the code is: "Install", "Example request". A `<p>`, never a heading. */
export function CodeBlockLabel({
  render,
  ref,
  ...otherProps
}: CodeBlockLabelComponentProps): ReactElement {
  const context = useContext(CodeBlockContext)
  const registerLabel = context?.registerLabel
  useLayoutEffect(() => registerLabel?.(), [registerLabel])
  const elementRef = useMergedRef(ref, null)
  const labelProps =
    context === null
      ? { className: 'kv-code-block-label' }
      : { className: 'kv-code-block-label', id: context.labelId }
  return renderPart({
    render,
    defaultElement: 'p',
    partProps: { ...mergeProps(otherProps, labelProps), ref: elementRef },
    state: codeBlockState,
  })
}
CodeBlockLabel.displayName = 'CodeBlock.Label'

/** The code: one `<pre class="kv-code-block-code">` that wraps. Put `<code>` inside if you like. */
export function CodeBlockCode({
  render,
  ref,
  ...otherProps
}: CodeBlockCodeComponentProps): ReactElement {
  const context = useContext(CodeBlockContext)
  const elementRef = useMergedRef(ref, context?.codeRef ?? null)
  return renderPart({
    render,
    defaultElement: 'pre',
    partProps: {
      ...mergeProps(otherProps, { className: 'kv-code-block-code' }),
      ref: elementRef,
    },
    state: codeBlockState,
  })
}
CodeBlockCode.displayName = 'CodeBlock.Code'

/** A CopyButton for the Code: it copies the Code's text and selects it when copying fails. */
export function CodeBlockCopy({
  text,
  textRef,
  className,
  ...otherProps
}: CodeBlockCopyProps): ReactElement {
  const context = useContext(CodeBlockContext)
  const codeRef = context?.codeRef
  const readCode = () => codeRef?.current?.textContent ?? ''
  return (
    <CopyButton
      {...otherProps}
      className={className === undefined ? 'kv-code-block-copy' : `kv-code-block-copy ${className}`}
      text={text ?? readCode}
      textRef={textRef ?? codeRef}
    />
  )
}
CodeBlockCopy.displayName = 'CodeBlock.Copy'

/**
 * A code sample with a label and a copy button (contract: code-block.a11y.md). The code wraps
 * and never scrolls, and nothing is highlighted. With `@kvirn-ui/theme`, the Root draws the
 * surface and the Code the mono type.
 *
 * @example
 * <CodeBlock.Root>
 *   <CodeBlock.Label>Installera</CodeBlock.Label>
 *   <CodeBlock.Code>pnpm add @kvirn-ui/react</CodeBlock.Code>
 *   <CodeBlock.Copy />
 * </CodeBlock.Root>
 */
export const CodeBlock = {
  Root: CodeBlockRoot,
  Label: CodeBlockLabel,
  Code: CodeBlockCode,
  Copy: CodeBlockCopy,
} as const

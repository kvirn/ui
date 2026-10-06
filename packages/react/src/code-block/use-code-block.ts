import { useCallback, useId, useMemo, useRef, useState } from 'react'
import type { CodeBlockContextValue } from './code-block-context.ts'

/** Spread on the Root's `<div>`. The group and its name appear while a Label is mounted. */
export interface CodeBlockRootProps {
  /** The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-code-block`. */
  className: 'kv-code-block'
  role?: 'group'
  'aria-labelledby'?: string
}

/** Spread on the Label's `<p>`. */
export interface CodeBlockLabelProps {
  className: 'kv-code-block-label'
  id: string
}

/** Spread on the Code's `<pre>`. Only the class: it is text, never a Tab stop. */
export interface CodeBlockCodeProps {
  className: 'kv-code-block-code'
}

export interface UseCodeBlockResult {
  rootProps: CodeBlockRootProps
  labelProps: CodeBlockLabelProps
  codeProps: CodeBlockCodeProps
  /** What the parts share. Your own parts read `labelId` and `codeRef` from it. */
  context: CodeBlockContextValue
  /** `true` while a Label is mounted. */
  hasLabel: boolean
}

/**
 * A code block's part props and what its parts share (contract: code-block.a11y.md). The Root
 * is a `group` named by the Label, but only while a Label is mounted.
 *
 * @example
 * const codeBlock = useCodeBlock()
 * <div {...codeBlock.rootProps}>
 *   <p {...codeBlock.labelProps}>Installera</p>
 *   <pre {...codeBlock.codeProps} ref={codeBlock.context.codeRef}>pnpm add @kvirn-ui/react</pre>
 * </div>
 */
export function useCodeBlock(): UseCodeBlockResult {
  const labelId = useId()
  const codeRef = useRef<HTMLElement | null>(null)
  const [hasLabel, setHasLabel] = useState(false)
  const registerLabel = useCallback(() => {
    setHasLabel(true)
    return () => setHasLabel(false)
  }, [])
  const context = useMemo(() => ({ labelId, codeRef, registerLabel }), [labelId, registerLabel])
  return {
    rootProps: {
      className: 'kv-code-block',
      ...(hasLabel ? { role: 'group', 'aria-labelledby': labelId } : {}),
    },
    labelProps: { className: 'kv-code-block-label', id: labelId },
    codeProps: { className: 'kv-code-block-code' },
    context,
    hasLabel,
  }
}

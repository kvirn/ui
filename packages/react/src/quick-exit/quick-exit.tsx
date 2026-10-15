'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ElementType, ReactElement, ReactNode } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsComponent, AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { resolveQuickExitHref, useQuickExit } from './use-quick-exit.ts'
import type { UseQuickExitResult } from './use-quick-exit.ts'

const rootTags = ['div'] as const

/** `as` is `div`, the only element. */
export type QuickExitRootProps = AsTag<
  (typeof rootTags)[number],
  'div',
  {
    /** Shift ×3 from anywhere on the page leaves it. `false` adds no listener. Default `true`. */
    shortcut?: boolean | undefined
    /** How the page is left. Default `window.location.replace(href)`. */
    navigate?: ((href: string) => void) | undefined
    /** The longest gap between two Shift presses, in milliseconds. Default 5000. */
    windowMs?: number | undefined
    /** Per-instance message overrides: `{ label, hint, shortcutRemaining }`. */
    messages?: Partial<KvirnMessages['quickExit']> | undefined
  }
>

interface QuickExitContextValue {
  quickExit: UseQuickExitResult
  registerHref: (href: string) => void
  shortcut: boolean
  hintId: string | undefined
  registerHint: (id: string | undefined) => void
}

const QuickExitContext = createContext<QuickExitContextValue | null>(null)

export function QuickExitRoot({
  as,
  shortcut,
  navigate,
  windowMs,
  messages,
  children,
  ref,
  ...otherProps
}: QuickExitRootProps): ReactElement {
  const [href, registerHref] = useState<string | undefined>(undefined)
  const [hintId, setHintId] = useState<string | undefined>(undefined)
  const hintCount = useRef(0)
  const quickExit = useQuickExit({ href, shortcut, navigate, windowMs, messages })
  const elementRef = useMergedRef(ref, null)
  const isShortcutOn = shortcut !== false
  const registerHint = useCallback((id: string | undefined) => {
    hintCount.current += id === undefined ? -1 : 1
    setHintId(id)
  }, [])
  const context = useMemo(
    () => ({
      quickExit,
      registerHref,
      shortcut: isShortcutOn,
      hintId,
      registerHint,
    }),
    [quickExit, isShortcutOn, hintId, registerHint],
  )

  useEffect(() => {
    if (isShortcutOn && hintCount.current === 0) {
      warnOnce(
        'quick-exit-hint',
        'QuickExit has the shortcut on but no <QuickExit.Hint>, so sighted keyboard users are not told about Shift ×3. Place <QuickExit.Hint /> after the link.',
      )
    }
  }, [isShortcutOn])
  return (
    <QuickExitContext.Provider value={context}>
      {renderPart({
        as: resolveAsTag({ part: 'QuickExit.Root', as, allowedTags: rootTags }),
        defaultElement: 'div',
        partProps: {
          ...mergeProps(otherProps, quickExit.rootProps),
          ref: elementRef,
          children,
        },
      })}
    </QuickExitContext.Provider>
  )
}
QuickExitRoot.displayName = 'QuickExit.Root'

interface QuickExitLinkOwnProps {
  /** Where to go: an `http(s)` URL, absolute or relative to the page. Anything else renders no `href` and navigates nowhere. */
  href: string
}

/** `as` is a component that renders an `<a href>` and forwards its ref. */
export type QuickExitLinkProps<Component extends ElementType = 'a'> = AsComponent<
  Component,
  QuickExitLinkOwnProps
>

/** The visible label is `quickExit.label`; `children` replace it. */
export function QuickExitLink<Component extends ElementType = 'a'>(
  props: QuickExitLinkProps<Component>,
): ReactElement
export function QuickExitLink({
  as,
  href,
  children,
  ref,
  ...otherProps
}: QuickExitLinkProps<'a'>): ReactElement {
  const context = useContext(QuickExitContext)
  if (context === null) {
    throw new Error('QuickExit.Link must be rendered inside QuickExit.Root.')
  }
  const { quickExit, registerHref, hintId } = context
  useEffect(() => registerHref(href), [href, registerHref])
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    as,
    defaultElement: 'a',
    partProps: {
      ...mergeProps(otherProps, quickExit.linkProps),
      href: resolveQuickExitHref(href) !== undefined ? href : undefined,
      'aria-describedby':
        [otherProps['aria-describedby'], hintId].filter(Boolean).join(' ') || undefined,
      ref: elementRef,
      children: children ?? quickExit.label,
    },
  })
}
QuickExitLink.displayName = 'QuickExit.Link'

const hintTags = ['p'] as const

/** `as` is `p`, the only element. */
export type QuickExitHintProps = AsTag<
  (typeof hintTags)[number],
  'p',
  {
    /** Your own sentence. Replaces the message `quickExit.hint`. */
    children?: ReactNode
  }
>

/**
 * The sentence "Or press Shift 3 times." (`quickExit.hint`) after the link. The link is described
 * by it. Renders nothing when the Root's `shortcut` is `false`.
 */
export function QuickExitHint({
  as,
  children,
  ref,
  ...otherProps
}: QuickExitHintProps): ReactElement | null {
  const context = useContext(QuickExitContext)
  if (context === null) {
    throw new Error('QuickExit.Hint must be rendered inside QuickExit.Root.')
  }
  const { quickExit, shortcut, registerHint } = context
  const generatedId = useId()
  const id = typeof otherProps.id === 'string' ? otherProps.id : generatedId
  const elementRef = useMergedRef(ref, null)
  useEffect(() => {
    if (!shortcut) {
      return
    }
    registerHint(id)
    return () => registerHint(undefined)
  }, [shortcut, id, registerHint])
  if (!shortcut) {
    return null
  }
  return renderPart({
    as: resolveAsTag({ part: 'QuickExit.Hint', as, allowedTags: hintTags }),
    defaultElement: 'p',
    partProps: {
      ...mergeProps(otherProps, quickExit.hintProps),
      id,
      ref: elementRef,
      children: children ?? quickExit.hint,
    },
  })
}
QuickExitHint.displayName = 'QuickExit.Hint'

/**
 * A link that leaves the page at once (contract: quick-exit.a11y.md): activating it, or pressing
 * Shift three times, hides the page, empties the title and replaces it with `href`. Place the
 * Root as a direct child of `<body>`, early in the focus order.
 *
 * @example
 * <QuickExit.Root>
 *   <QuickExit.Link href="https://www.smhi.se" />
 * </QuickExit.Root>
 */
export const QuickExit = {
  Root: QuickExitRoot,
  Link: QuickExitLink,
  Hint: QuickExitHint,
}

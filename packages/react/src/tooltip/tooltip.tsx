'use client'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ComponentPropsWithRef, ElementType, ReactElement, ReactNode } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsComponent, AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useTooltip } from './use-tooltip.ts'
import type { UseTooltipOptions, UseTooltipResult } from './use-tooltip.ts'

export type {
  TooltipChangeDetails,
  TooltipChangeReason,
  TooltipGroup,
  TooltipDescription,
} from './use-tooltip.ts'

const nameTags = ['span', 'strong'] as const
const shortcutTags = ['span', 'small'] as const

/** `description` is left out: the Root works it out from the `Tooltip.Name` and `Tooltip.Shortcut` parts it holds. */
export interface TooltipRootProps extends Omit<UseTooltipOptions, 'description'> {
  children?: ReactNode
}

/**
 * `as` is the control that the tooltip belongs to: `as={Button}`, `as={Toolbar.Toggle}`. Its
 * props are plain props of the trigger (`<Tooltip.Trigger as={Button} aria-label="Hjälp">`). It must
 * be focusable, spread its props on a DOM node and have a name of its own. Without `as` it is a
 * `<button type="button">`. A `aria-describedby` of yours is joined with the tooltip's.
 */
export type TooltipTriggerProps<Component extends ElementType = 'button'> = AsComponent<Component>

export type TooltipPopupProps = ComponentPropsWithRef<'div'>

/** `as` is `span` (default) or `strong`. */
export type TooltipNameProps = AsTag<(typeof nameTags)[number], 'span'>

/** `as` is `span` (default) or `small`. */
export type TooltipShortcutProps = AsTag<(typeof shortcutTags)[number], 'span'>

type TooltipPart = 'name' | 'shortcut'

interface TooltipContextValue {
  tooltip: UseTooltipResult
  /** A `Tooltip.Name` or `Tooltip.Shortcut` registers while it is mounted, so the trigger describes the right part. */
  registerPart: (part: TooltipPart) => () => void
}

const TooltipContext = createContext<TooltipContextValue | null>(null)

function warnOutsideRoot(part: string): void {
  warnOnce(
    `tooltip-${part.toLowerCase()}-outside-root`,
    `A Tooltip.${part} is outside a Tooltip.Root, so it shows and hides nothing. Put it inside <Tooltip.Root>.`,
  )
}

/** Marks that a part is in the tooltip while it is mounted. */
function useRegisteredPart(part: TooltipPart, context: TooltipContextValue | null): void {
  const registerPart = context?.registerPart
  useEffect(() => registerPart?.(part), [registerPart, part])
}

/**
 * Owns the state of a tooltip (contract: tooltip.a11y.md). It renders no element: put a
 * `Tooltip.Trigger` and a `Tooltip.Popup` inside it, the popup right after the trigger.
 *
 * Hover opens it after `delay` (500 ms), keyboard focus at once, and the next tooltip at once when
 * one has just closed. Escape, leaving, blur and a press on the trigger close it. The pointer can
 * move onto the tooltip, and it stays until hover or focus ends (WCAG 1.4.13). Open it from state
 * with `open` and `onOpenChange`, or let it keep its own.
 *
 * @example
 * <Tooltip.Root>
 *   <Tooltip.Trigger as={Toolbar.Toggle} aria-label="Fetstil" aria-keyshortcuts="Control+B">
 *     <Icon name="bold" />
 *   </Tooltip.Trigger>
 *   <Tooltip.Popup>
 *     <Tooltip.Name>Fetstil</Tooltip.Name>
 *     <Tooltip.Shortcut>Ctrl+B</Tooltip.Shortcut>
 *   </Tooltip.Popup>
 * </Tooltip.Root>
 */
export function TooltipRoot({ children, ...options }: TooltipRootProps): ReactElement {
  const [partCounts, setPartCounts] = useState<Record<TooltipPart, number>>({
    name: 0,
    shortcut: 0,
  })
  // The shortcut is the description when there is one. A name alone describes nothing: the trigger
  // has that name already. Plain text in the popup is the description as a whole (APG).
  const description = partCounts.shortcut > 0 ? 'shortcut' : partCounts.name > 0 ? 'none' : 'popup'
  const tooltip = useTooltip({ ...options, description })
  const registerPart = useCallback((part: TooltipPart) => {
    setPartCounts((counts) => ({ ...counts, [part]: counts[part] + 1 }))
    return () => setPartCounts((counts) => ({ ...counts, [part]: counts[part] - 1 }))
  }, [])
  return (
    <TooltipContext.Provider value={{ tooltip, registerPart }}>{children}</TooltipContext.Provider>
  )
}
TooltipRoot.displayName = 'Tooltip.Root'

const joinTokens = (...values: unknown[]): string | undefined => {
  const tokens = values
    .filter((value): value is string => typeof value === 'string')
    .flatMap((value) => value.split(/\s+/))
    .filter((token) => token !== '')
  return tokens.length === 0 ? undefined : [...new Set(tokens)].join(' ')
}

/**
 * Whether the control has a name of its own, by a rough check for the development warning (not
 * the accessible-name algorithm): `aria-label`, `aria-labelledby`, a label, or text that isn't
 * `aria-hidden`, or a labelled image. A `title` doesn't count: it is not shown on focus or touch.
 */
function hasOwnName(element: HTMLElement): boolean {
  const labels = 'labels' in element ? (element.labels as NodeList | null) : null
  if (
    element.hasAttribute('aria-label') ||
    element.hasAttribute('aria-labelledby') ||
    (labels?.length ?? 0) > 0
  ) {
    return true
  }
  const hasName = (node: Node): boolean => {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent ?? '').trim() !== ''
    }
    if (!(node instanceof Element) || node.getAttribute('aria-hidden') === 'true') {
      return false
    }
    if (node.hasAttribute('aria-label') || node.getAttribute('alt')?.trim()) {
      return true
    }
    return [...node.childNodes].some(hasName)
  }
  return [...element.childNodes].some(hasName)
}

/**
 * The control that the tooltip belongs to. It is the anchor the tooltip is placed against. It gets
 * `aria-describedby` (the tooltip, or its shortcut part) and the pointer and focus handlers, and
 * keeps its own name, role and look. Use `as` to make it a `Toolbar.Toggle`, a `Button` or a
 * `Toolbar.Item`. **Give it a name of its own** (`aria-label` from your translations for an
 * icon-only control): a tooltip is never the only name, and a development warning says so.
 */
export function TooltipTrigger<Component extends ElementType = 'button'>(
  props: TooltipTriggerProps<Component>,
): ReactElement
export function TooltipTrigger({
  as,
  ref,
  ...otherProps
}: TooltipTriggerProps<'button'>): ReactElement {
  const context = useContext(TooltipContext)
  const elementRef = useRef<HTMLButtonElement | null>(null)
  const mergedRef = useMergedRef(
    useMergedRef<HTMLButtonElement>(ref, context?.tooltip.triggerProps.ref ?? null),
    elementRef,
  )
  const triggerProps = context?.tooltip.triggerProps
  const describedBy = joinTokens(otherProps['aria-describedby'], triggerProps?.['aria-describedby'])

  useEffect(() => {
    if (context === null) {
      warnOutsideRoot('Trigger')
    }
  }, [context])
  useEffect(() => {
    const element = elementRef.current
    if (element !== null && !hasOwnName(element)) {
      warnOnce(
        'tooltip-trigger-without-name',
        'A Tooltip.Trigger has no accessible name of its own. A tooltip is never the only name: it shows on hover and keyboard focus, never on touch, and its text is not the control’s name (WCAG 4.1.2, 2.5.3). Give an icon-only control an aria-label from your translations, and start the tooltip with the same text.',
      )
    }
  })

  return renderPart({
    as,
    defaultElement: 'button',
    partProps: {
      ...mergeProps(
        as === undefined ? { type: 'button' as const } : {},
        otherProps,
        triggerProps ?? {},
      ),
      'aria-describedby': describedBy,
      ref: mergedRef,
    },
  })
}
TooltipTrigger.displayName = 'Tooltip.Trigger'

/** Controls, links and the like: a tooltip holds none (APG: a tooltip is never focusable). */
const interactiveSelector = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  '[tabindex]',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="button"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[role="tab"]',
  '[role="textbox"]',
].join(', ')

/**
 * The tooltip: a `<div popover="manual" role="tooltip">` in the top layer, so no ancestor clips it
 * and no z-index is needed. It is always rendered and hidden by the browser while closed, so the
 * trigger's `aria-describedby` always resolves. Render it **right after the trigger**. Text, and
 * `Kbd` for keys: **never interactive content** (a development warning says so). Plain text is the
 * trigger's description as a whole. When it repeats the trigger's name, wrap that in `Tooltip.Name`
 * (hidden from assistive technology, so the name is heard once), and the shortcut in
 * `Tooltip.Shortcut` (the description). Escape hides it, and the pointer can move onto it.
 */
export function TooltipPopup({ ref, ...otherProps }: TooltipPopupProps): ReactElement {
  const context = useContext(TooltipContext)
  const elementRef = useRef<HTMLDivElement | null>(null)
  const mergedRef = useMergedRef(
    useMergedRef<HTMLDivElement>(ref, context?.tooltip.popupProps.ref ?? null),
    elementRef,
  )
  useEffect(() => {
    if (context === null) {
      warnOutsideRoot('Popup')
    }
  }, [context])
  useEffect(() => {
    const element = elementRef.current
    if (element !== null && element.querySelector(interactiveSelector) !== null) {
      warnOnce(
        'tooltip-interactive-content',
        'A Tooltip.Popup holds interactive content (a link, a button or a field). A tooltip is never focusable and disappears when the pointer or focus leaves, so a keyboard or touch user can never reach it (WCAG 1.4.13, 2.1.1). Use a Popover for content that can be operated.',
      )
    }
  })
  return renderPart({
    as: undefined,
    defaultElement: 'div',
    partProps: {
      ...mergeProps(otherProps, context?.tooltip.popupProps ?? {}),
      ref: mergedRef,
    },
  })
}
TooltipPopup.displayName = 'Tooltip.Popup'

/**
 * The part of the tooltip that repeats the trigger's accessible name: `aria-hidden`, so a screen
 * reader doesn't hear the name twice. Start the tooltip with it, with the same text as the trigger's
 * name (2.5.3). A tooltip with only a name adds no description to the trigger.
 */
export function TooltipName({ as, ref, ...otherProps }: TooltipNameProps): ReactElement {
  const context = useContext(TooltipContext)
  const mergedRef = useMergedRef<HTMLSpanElement>(ref, null)
  useRegisteredPart('name', context)
  useEffect(() => {
    if (context === null) {
      warnOutsideRoot('Name')
    }
  }, [context])
  return renderPart({
    as: resolveAsTag({ part: 'Tooltip.Name', as, allowedTags: nameTags }),
    defaultElement: 'span',
    partProps: {
      ...mergeProps(otherProps, context?.tooltip.nameProps ?? {}),
      ref: mergedRef,
    },
  })
}
TooltipName.displayName = 'Tooltip.Name'

/**
 * The part of the tooltip that adds information, such as the shortcut. It is the trigger's
 * `aria-describedby`, so a screen reader reads it after the trigger's name ("Fetstil, knapp, Ctrl+B").
 * Put `Kbd` in it for keys.
 */
export function TooltipShortcut({ as, ref, ...otherProps }: TooltipShortcutProps): ReactElement {
  const context = useContext(TooltipContext)
  const mergedRef = useMergedRef<HTMLSpanElement>(ref, null)
  useRegisteredPart('shortcut', context)
  useEffect(() => {
    if (context === null) {
      warnOutsideRoot('Shortcut')
    }
  }, [context])
  return renderPart({
    as: resolveAsTag({ part: 'Tooltip.Shortcut', as, allowedTags: shortcutTags }),
    defaultElement: 'span',
    partProps: {
      ...mergeProps(otherProps, context?.tooltip.shortcutProps ?? {}),
      ref: mergedRef,
    },
  })
}
TooltipShortcut.displayName = 'Tooltip.Shortcut'

/** A tooltip: a name and a shortcut for a control, shown on hover and keyboard focus. */
export const Tooltip = {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Popup: TooltipPopup,
  Name: TooltipName,
  Shortcut: TooltipShortcut,
} as const

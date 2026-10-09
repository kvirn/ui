'use client'
import { createContext, createElement, useContext, useEffect } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { DisclosureContext, DisclosureOwnerContext } from '../disclosure/disclosure-context.ts'
import { DisclosurePanel, DisclosureRoot, DisclosureTrigger } from '../disclosure/disclosure.tsx'
import type { DisclosurePanelProps, DisclosureTriggerProps } from '../disclosure/disclosure.tsx'
import type { UseDisclosureOptions } from '../disclosure/use-disclosure.ts'
import type { HeadingLevel } from '../heading/use-heading.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { listRole, resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useAccordion } from './use-accordion.ts'

export type { DisclosureChangeDetails as AccordionChangeDetails } from '../disclosure/disclosure.tsx'

const rootTags = ['div', 'ul', 'ol'] as const
const itemTags = ['div', 'li'] as const

interface AccordionRootOwnProps {
  /**
   * Keeps every closed panel's text findable with the browser's find-in-page and `#fragment`
   * links, unless an item says otherwise (`hidden="until-found"`). Default `false`.
   */
  hiddenUntilFound?: boolean | undefined
}

/**
 * `as` is `div` (default), or `ul` or `ol` with `Accordion.Item as="li"` children, so the number of
 * questions is announced. Its own semantics apply, and the root adds `role="list"` to a `ul` or `ol`.
 */
export type AccordionRootProps = AsTag<(typeof rootTags)[number], 'div', AccordionRootOwnProps>

type AccordionItemOwnProps = Omit<UseDisclosureOptions, 'onClick'>

/** `as` is `div` (default), or `li` inside an `Accordion.Root as="ul"` or `"ol"`. */
export type AccordionItemProps = AsTag<(typeof itemTags)[number], 'div', AccordionItemOwnProps>

export interface AccordionHeadingProps extends ComponentPropsWithRef<'h2'> {
  /**
   * The level the page's outline needs: `1` to `6`. Required, because an Accordion can't know
   * where it sits (2.4.6, 1.3.1). It renders `<h1>` to `<h6>`. The trigger goes inside it.
   */
  level: HeadingLevel
}

export type AccordionTriggerProps = DisclosureTriggerProps

export interface AccordionPanelProps extends DisclosurePanelProps {
  /**
   * Makes the panel a `region` named by its trigger. APG advises it for a few panels only (about
   * six or fewer): many open regions crowd a screen reader user's landmark list. Default `false`.
   */
  region?: boolean | undefined
}

const AccordionContext = createContext<{ hiddenUntilFound: boolean }>({ hiddenUntilFound: false })

/**
 * A list of disclosures that each reveal one section, such as a page of questions and answers
 * (APG Accordion, contract: accordion.a11y.md). The root is a `<div class="kv-accordion">` with
 * no role, or a list with `as`. Items are independent: more than one can be open. Every trigger is a Tab stop, and the
 * arrow keys are not handled.
 *
 * @example
 * <Accordion.Root>
 *   <Accordion.Item>
 *     <Accordion.Heading level={3}>
 *       <Accordion.Trigger>Hur ansöker jag?</Accordion.Trigger>
 *     </Accordion.Heading>
 *     <Accordion.Panel>Du ansöker på Mina sidor.</Accordion.Panel>
 *   </Accordion.Item>
 * </Accordion.Root>
 */
export function AccordionRoot({
  hiddenUntilFound = false,
  as,
  ref,
  ...otherProps
}: AccordionRootProps): ReactElement {
  const elementRef = useMergedRef(ref, null)
  const accordion = useAccordion()
  const tag = resolveAsTag({ part: 'Accordion.Root', as, allowedTags: rootTags })
  return (
    <AccordionContext.Provider value={{ hiddenUntilFound }}>
      {renderPart({
        as: tag,
        defaultElement: 'div',
        partProps: {
          ...listRole(tag),
          ...mergeProps(otherProps, accordion.rootProps),
          ref: elementRef,
        },
      })}
    </AccordionContext.Provider>
  )
}
AccordionRoot.displayName = 'Accordion.Root'

function AccordionItemElement({
  as,
  ref,
  ...otherProps
}: AsTag<(typeof itemTags)[number], 'div'>): ReactElement {
  const disclosure = useContext(DisclosureContext)
  const accordion = useAccordion()
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    as: resolveAsTag({ part: 'Accordion.Item', as, allowedTags: itemTags }),
    defaultElement: 'div',
    partProps: {
      ...mergeProps(
        otherProps,
        accordion.itemProps,
        disclosure?.isOpen === true ? { 'data-open': '' } : {},
      ),
      ref: elementRef,
    },
  })
}

/**
 * One question and its answer: a `<div class="kv-accordion-item">` that owns its own open state,
 * as `Disclosure.Root` does (`open`, `defaultOpen`, `onOpenChange`, `disabled`). It holds a
 * heading with the trigger, then the panel.
 */
export function AccordionItem({
  open,
  defaultOpen,
  onOpenChange,
  hiddenUntilFound,
  disabled,
  focusableWhenDisabled,
  ...elementProps
}: AccordionItemProps): ReactElement {
  const accordion = useContext(AccordionContext)
  return (
    <DisclosureRoot
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      hiddenUntilFound={hiddenUntilFound ?? accordion.hiddenUntilFound}
      disabled={disabled}
      focusableWhenDisabled={focusableWhenDisabled}
    >
      <AccordionItemElement {...elementProps} />
    </DisclosureRoot>
  )
}
AccordionItem.displayName = 'Accordion.Item'

/**
 * The heading around the trigger: an `<h1>` to `<h6>` by `level`, which the page's outline sets
 * and Accordion can't know. A screen reader user finds the questions by heading. The theme draws
 * it as plain text; the trigger carries the look.
 */
export function AccordionHeading({
  level,
  ref,
  ...otherProps
}: AccordionHeadingProps): ReactElement {
  const disclosure = useContext(DisclosureContext)
  const accordion = useAccordion()
  const elementRef = useMergedRef(ref, null)
  useEffect(() => {
    if (disclosure === null) {
      warnOnce(
        'accordion-heading-outside-root',
        'An Accordion.Heading is outside an Accordion.Item, so its trigger opens and closes nothing. Put it inside <Accordion.Item>.',
      )
    }
  }, [disclosure])
  return createElement(`h${level}`, {
    ...mergeProps(otherProps, accordion.headingProps),
    ref: elementRef,
  })
}
AccordionHeading.displayName = 'Accordion.Heading'

/**
 * The item's `<button>`, with `aria-expanded`, `aria-controls` and a chevron at the inline end:
 * `Disclosure.Trigger` with the accordion's class. Put it inside `Accordion.Heading`.
 */
export function AccordionTrigger({
  className,
  ...otherProps
}: AccordionTriggerProps): ReactElement {
  return (
    <DisclosureOwnerContext.Provider value="Accordion">
      <DisclosureTrigger
        {...otherProps}
        className={
          className === undefined ? 'kv-accordion-trigger' : `kv-accordion-trigger ${className}`
        }
      />
    </DisclosureOwnerContext.Provider>
  )
}
AccordionTrigger.displayName = 'Accordion.Trigger'

/**
 * The answer: `Disclosure.Panel` with the accordion's class. Render it right after the heading
 * that holds the trigger. `region` makes it a landmark named by its trigger.
 */
export function AccordionPanel({
  className,
  region = false,
  ...otherProps
}: AccordionPanelProps): ReactElement {
  const disclosure = useContext(DisclosureContext)
  return (
    <DisclosureOwnerContext.Provider value="Accordion">
      <DisclosurePanel
        {...otherProps}
        {...(region && disclosure !== null
          ? { role: 'region', 'aria-labelledby': disclosure.triggerId }
          : {})}
        className={
          className === undefined ? 'kv-accordion-panel' : `kv-accordion-panel ${className}`
        }
      />
    </DisclosureOwnerContext.Provider>
  )
}
AccordionPanel.displayName = 'Accordion.Panel'

/** Disclosures with headings, for a list of sections that a reader opens one by one. */
export const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Heading: AccordionHeading,
  Trigger: AccordionTrigger,
  Panel: AccordionPanel,
} as const

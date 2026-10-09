import type {
  AccordionHeadingProps,
  AccordionItemProps,
  AccordionPanelProps,
  AccordionRootProps,
  UseAccordionResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export const accordionRootRows = propRows<Pick<AccordionRootProps, 'hiddenUntilFound' | 'as'>>({
  hiddenUntilFound: {
    type: 'boolean',
    default: 'false',
    description:
      'The default for every item: keeps closed panels’ text findable with the browser’s find-in-page and #fragment links. An item can set its own.',
  },
  as: {
    type: "'div' | 'ul' | 'ol'",
    default: "'div'",
    description:
      'A list of questions whose count is announced. Use ul or ol with Accordion.Item as="li", and the root adds role="list". Another tag warns once in development.',
  },
})

export const accordionItemRows = propRows<
  Pick<
    AccordionItemProps,
    | 'open'
    | 'defaultOpen'
    | 'onOpenChange'
    | 'hiddenUntilFound'
    | 'disabled'
    | 'focusableWhenDisabled'
    | 'as'
  >
>({
  open: {
    type: 'boolean',
    default: '–',
    description:
      'Controlled: whether this item is open. Pair it with onOpenChange, which only reports.',
  },
  defaultOpen: {
    type: 'boolean',
    default: 'false',
    description: 'Uncontrolled: whether this item starts open.',
  },
  onOpenChange: {
    type: '(open: boolean, details: AccordionChangeDetails) => void',
    default: '–',
    description:
      'Called when the user opens or closes this item, with the new state and { reason, event }. The reason is "trigger-press" or "find-in-page".',
  },
  hiddenUntilFound: {
    type: 'boolean',
    default: 'the Root’s value',
    description: 'Keeps this item’s closed panel findable with find-in-page.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description:
      'Blocks opening and closing. Without focusableWhenDisabled the trigger is natively disabled and skipped by Tab.',
  },
  focusableWhenDisabled: {
    type: 'boolean',
    default: 'false',
    description:
      'With disabled, keeps the trigger in the Tab order with aria-disabled="true". Opening stays blocked.',
  },
  as: {
    type: "'div' | 'li'",
    default: "'div'",
    description: 'An li inside an Accordion.Root that is a ul or an ol.',
  },
})

export const accordionHeadingRows = propRows<Pick<AccordionHeadingProps, 'level'>>({
  level: {
    type: '1 | 2 | 3 | 4 | 5 | 6',
    description:
      'The level your page’s outline needs: it renders <h1> to <h6>. Required, because an Accordion can’t know where it sits.',
  },
})

export const accordionPanelRows = propRows<Pick<AccordionPanelProps, 'region'>>({
  region: {
    type: 'boolean',
    default: 'false',
    description:
      'Makes the panel a region named by its trigger. Use it for about six sections or fewer: many open regions crowd a screen reader user’s landmark list.',
  },
})

export const accordionRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-accordion',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
]

export const accordionItemAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-accordion-item',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  { name: 'data-open', values: 'present or absent', meaning: 'The item is open.' },
]

export const accordionHeadingAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-accordion-heading',
    values: 'always',
    meaning: 'The part class. The default theme draws it as plain text: the trigger has the look.',
  },
]

export const accordionTriggerAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-accordion-trigger',
    values: 'always',
    meaning:
      'The part class, next to kv-disclosure-trigger and kv-disclosure-icon (the chevron). Your own class is added after them.',
  },
  {
    name: 'aria-expanded',
    values: '"true" or "false"',
    meaning: 'Whether the item is open. Set by the Accordion: you can’t pass it.',
  },
  {
    name: 'aria-controls',
    values: 'the panel’s id',
    meaning: 'Points at the item’s panel. Set by the Accordion.',
  },
  { name: 'data-open', values: 'present or absent', meaning: 'The item is open.' },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The item is disabled.' },
]

export const accordionPanelAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-accordion-panel',
    values: 'always',
    meaning: 'The part class, next to kv-disclosure-panel. Your own class is added after them.',
  },
  {
    name: 'hidden',
    values: '"" or "until-found", or absent',
    meaning: 'Set while closed. With hiddenUntilFound the value is until-found.',
  },
  { name: 'data-open', values: 'present or absent', meaning: 'The item is open.' },
  {
    name: 'role="region"',
    values: 'with region',
    meaning: 'Set with aria-labelledby, which points at the trigger.',
  },
]

export const useAccordionHook: ApiHook = {
  name: 'useAccordion',
  intro:
    'Takes no options. It gives the classes for your own elements: pair it with one useDisclosure() per item, and put each trigger inside a heading.',
  result: propRows<UseAccordionResult>({
    rootProps: {
      type: 'AccordionPartProps<"accordion">',
      default: '–',
      description: 'Spread on the container: the class kv-accordion.',
    },
    itemProps: {
      type: 'AccordionPartProps<"accordion-item">',
      default: '–',
      description: 'Spread on an item’s wrapper: the class kv-accordion-item.',
    },
    headingProps: {
      type: 'AccordionPartProps<"accordion-heading">',
      default: '–',
      description: 'Spread on the heading around the trigger: the class kv-accordion-heading.',
    },
  }),
}

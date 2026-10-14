import type {
  BreadcrumbRootProps,
  UseBreadcrumbOptions,
  UseBreadcrumbResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export const breadcrumbRootRows = propRows<
  Pick<BreadcrumbRootProps, 'variant' | 'separator' | 'label' | 'messages'>
>({
  variant: {
    type: "'chevron' | 'slash'",
    default: "'chevron'",
    description:
      'The separator the theme draws. slash adds kv-breadcrumb--slash; chevron adds no class. It is decoration with an empty text alternative.',
  },
  separator: {
    type: 'ReactNode',
    default: '–',
    description:
      'Your own separator, rendered in every item (the theme hides the first one, and a custom theme must too): an Icon or a component. It is aria-hidden, so it must be decorative, never interactive. The built-in chevron-forward mirrors itself in RTL; a registered or own icon needs mirrorInRtl.',
  },
  label: {
    type: 'string',
    default: 'the message breadcrumb.label',
    description:
      'The accessible name, from your translations. Set as aria-label. An empty or whitespace-only label counts as none and the message is used.',
  },
  messages: {
    type: "Partial<KvirnMessages['breadcrumb']>",
    default: '–',
    description: 'Overrides breadcrumb.label for this trail.',
  },
})

export const breadcrumbRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-breadcrumb',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'kv-breadcrumb--slash',
    values: 'variant="slash"',
    meaning: 'Swaps the generated chevron for a slash. The default adds no class.',
  },
  {
    name: 'aria-label',
    values: 'the name',
    meaning: 'Always set, from label or the message breadcrumb.label.',
  },
]

export const breadcrumbListAttributes: readonly AttributeRow[] = [
  { name: 'kv-breadcrumb-list', values: 'always', meaning: 'The part class.' },
]

export const breadcrumbItemAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-breadcrumb-item',
    values: 'always',
    meaning:
      'The part class. The default theme draws the separator before every item but the first.',
  },
  {
    name: 'kv-breadcrumb-separator',
    values: 'when the root has a separator',
    meaning: 'A span inside the item with aria-hidden="true", holding your separator.',
  },
]

export const breadcrumbLinkAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-breadcrumb-link',
    values: 'always',
    meaning: 'The part class, next to kv-link.',
  },
]

export const breadcrumbCurrentAttributes: readonly AttributeRow[] = [
  { name: 'kv-breadcrumb-current', values: 'always', meaning: 'The part class.' },
  {
    name: 'aria-current',
    values: '"page"',
    meaning: 'Always set. Mark no other item in the trail.',
  },
]

export const useBreadcrumbHook: ApiHook = {
  name: 'useBreadcrumb',
  options: propRows<UseBreadcrumbOptions>({
    variant: {
      type: "'chevron' | 'slash'",
      default: "'chevron'",
      description: 'The generated separator. slash adds kv-breadcrumb--slash to rootProps.',
    },
    label: {
      type: 'string',
      default: 'the message breadcrumb.label',
      description: 'The accessible name, set as aria-label. An empty label counts as none.',
    },
    messages: {
      type: "Partial<KvirnMessages['breadcrumb']>",
      default: '–',
      description: 'Per-instance message overrides: { label: "Du är här" }.',
    },
  }),
  result: propRows<UseBreadcrumbResult>({
    rootProps: {
      type: 'BreadcrumbRootPartProps',
      default: '–',
      description: 'Spread on the <nav>: the class and aria-label.',
    },
    listProps: {
      type: 'BreadcrumbListPartProps',
      default: '–',
      description: 'Spread on the <ol>: the class.',
    },
    itemProps: {
      type: 'BreadcrumbItemPartProps',
      default: '–',
      description: 'Spread on every <li>: the class.',
    },
    currentProps: {
      type: 'BreadcrumbCurrentPartProps',
      default: '–',
      description: 'Spread on the current page’s <span>: the class and aria-current="page".',
    },
    separatorProps: {
      type: 'BreadcrumbSeparatorPartProps',
      default: '–',
      description:
        'Spread on a <span> you render in each item but the first for your own separator: the class and aria-hidden="true".',
    },
    label: {
      type: 'string',
      default: '–',
      description: 'The resolved name of the landmark.',
    },
  }),
}

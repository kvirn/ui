import type { ListItemProps, ListRootProps } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { AttributeRow } from '../components/api-block.tsx'

export const listRootRows = propRows<Pick<ListRootProps, 'as' | 'ref'>>({
  as: {
    type: "'ul' | 'ol'",
    default: "'ul'",
    description: 'Changes the element: use ol when the order matters. Only ul and ol are allowed.',
  },
  ref: {
    type: 'Ref<HTMLElement>',
    default: '–',
    description: 'Reaches the list, whichever element it is.',
  },
})

export const listItemRows = propRows<Pick<ListItemProps, 'ref'>>({
  ref: {
    type: 'Ref<HTMLLIElement>',
    default: '–',
    description: 'Reaches the <li> element.',
  },
})

export const listRootAttributes: readonly AttributeRow[] = [
  {
    name: 'role',
    values: '"list", always',
    meaning:
      'Safari and VoiceOver drop the list role when a list has no marker, so the role is always there. A role of your own wins.',
  },
  {
    name: 'kv-list',
    values: 'always',
    meaning: 'The part class: no marker and no indent. Your className joins it.',
  },
  {
    name: 'kv-list--bullet, kv-list--decimal',
    values: 'class you add',
    meaning:
      'A marker outside the text. Use decimal only with as="ol": numbers on a ul say nothing about order to assistive technology.',
  },
  {
    name: 'kv-list--gap-2, kv-list--gap-6, kv-list--gap-8',
    values: 'class you add',
    meaning:
      'Another space between the items. gap-2 is tighter than the default, gap-6 and gap-8 are wider.',
  },
]

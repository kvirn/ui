import type { DividerProps } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { AttributeRow } from '../components/api-block.tsx'

export const dividerRows = propRows<Pick<DividerProps, 'ref'>>({
  ref: {
    type: 'Ref<HTMLHRElement>',
    default: '–',
    description: 'Reaches the <hr> element.',
  },
})

export const dividerAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-divider',
    values: 'always',
    meaning:
      'The part class. The default theme draws the line and its margin with it. Your className joins it.',
  },
  {
    name: '--kv-divider-width',
    values: 'a length, such as 2px',
    meaning: 'How thick the line is. The default is the theme’s border width.',
  },
  {
    name: '--kv-divider-style',
    values: 'a border style, such as dashed',
    meaning: 'How the line is drawn. The default is solid.',
  },
  {
    name: '--kv-divider-color',
    values: 'a colour',
    meaning:
      'The colour of the line. The default is the theme’s faint border colour. Keep your own colour visible against the background when the line matters to understanding.',
  },
  {
    name: '--kv-divider-margin-block',
    values: 'a length',
    meaning: 'The space above and below the line.',
  },
  {
    name: '--kv-divider-margin-inline',
    values: 'a length',
    meaning: 'The space at the start and end of the line. The default is none.',
  },
]

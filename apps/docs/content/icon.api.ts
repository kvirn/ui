import type { IconProps, UseIconOptions, UseIconResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export type IconDocumentedProps = Pick<
  IconProps,
  | 'name'
  | 'icon'
  | 'render'
  | 'children'
  | 'size'
  | 'strokeWidth'
  | 'color'
  | 'fill'
  | 'stroke'
  | 'label'
  | 'mirrorInRtl'
>

export const iconRows = propRows<IconDocumentedProps>({
  name: {
    type: 'IconName',
    default: '–',
    description:
      'A built-in icon, or one registered with defineIcons in a KvirnProvider. Give one of name, icon, render or children.',
  },
  icon: {
    type: 'IconComponent',
    default: '–',
    description:
      'A component from an icon library, or your own: icon={Search}. It needs no registration. Icon’s size, color and label replace the component’s own, and className is joined with it.',
  },
  render: {
    type: 'RenderProp<IconElementProps, IconState>',
    default: '–',
    description:
      'A one-off icon that isn’t registered: an element (render={<svg viewBox="0 0 24 24" />}, whose own props win) or a function that spreads the props on its own <svg>.',
  },
  children: {
    type: 'ReactNode',
    default: '–',
    description: 'Your own shapes, with Icon as the <svg>. Pass a viewBox too.',
  },
  size: {
    type: 'IconSize',
    default: '5',
    description:
      'A step of the size scale, or a CSS length such as "2rem". A step is times 0.25em, so it follows the text: 4 is 1em, 5 is 1.25em, 6 is 1.5em. A bare number is never pixels. The default comes from KvirnProvider iconDefaults.',
  },
  strokeWidth: {
    type: 'number | string',
    default: '–',
    description:
      'The stroke width. Unset keeps each icon’s own (the built-in set draws 1.5). The default comes from KvirnProvider iconDefaults.',
  },
  color: {
    type: 'string',
    default: '–',
    description:
      'Sets currentColor for the icon, so it works with every library. Unset follows the text colour around it. A custom property works: color="var(--kv-color-danger)".',
  },
  fill: {
    type: 'string',
    default: '–',
    description: 'The root <svg>’s fill. Shapes that set their own fill keep it.',
  },
  stroke: {
    type: 'string',
    default: '–',
    description:
      'The root <svg>’s stroke. With Tabler icons, stroke is the width: use color instead.',
  },
  label: {
    type: 'string',
    default: '–',
    description:
      'Makes the icon an image (role="img") with this name, from your translations. Leave it out when text next to the icon says the same: the icon is then hidden from assistive technology.',
  },
  mirrorInRtl: {
    type: 'boolean',
    default: 'the entry’s, else false',
    description:
      'Flips the icon in right-to-left text. Defaults to the registry entry’s, else the built-in icon’s of the same name, else false. Only for arrows and chevrons.',
  },
})

export const iconAttributes: readonly AttributeRow[] = [
  { name: 'kv-icon', values: 'always', meaning: 'The part class. The default theme styles it.' },
  {
    name: 'data-size',
    values: 'a step, such as "5"',
    meaning: 'The size step, when size is a number.',
  },
  {
    name: 'data-mirror-in-rtl',
    values: 'present or absent',
    meaning: 'The icon flips in right-to-left text.',
  },
  {
    name: 'aria-hidden',
    values: '"true" or absent',
    meaning: 'Set unless the icon has a label. Not passed directly.',
  },
  {
    name: 'role',
    values: '"img" or absent',
    meaning: 'Set with a label. Not passed directly.',
  },
]

export const useIconHook: ApiHook = {
  name: 'useIcon',
  options: propRows<UseIconOptions>({
    name: {
      type: 'IconName',
      default: '–',
      description: 'A built-in or registered icon, to get its component.',
    },
    size: { type: 'IconSize', default: '5', description: 'A step of the size scale, or a length.' },
    strokeWidth: {
      type: 'number | string',
      default: '–',
      description: 'The stroke width. Unset keeps each icon’s own.',
    },
    color: { type: 'string', default: '–', description: 'Sets currentColor for the icon.' },
    fill: { type: 'string', default: '–', description: 'The root <svg>’s fill.' },
    stroke: { type: 'string', default: '–', description: 'The root <svg>’s stroke.' },
    label: {
      type: 'string',
      default: '–',
      description: 'Makes the icon an image with this name. Without it the icon is decorative.',
    },
    mirrorInRtl: {
      type: 'boolean',
      default: 'the entry’s, else false',
      description: 'Flips the icon in right-to-left text.',
    },
  }),
  result: propRows<UseIconResult>({
    iconProps: {
      type: 'IconPartProps',
      default: '–',
      description:
        'Spread on the root <svg>, or pass to an icon component: class, size, colour and the aria attributes.',
    },
    component: {
      type: 'IconComponent | undefined',
      default: '–',
      description:
        'The registered or built-in component for name. Undefined without a name, or for an unknown one.',
    },
    isDecorative: {
      type: 'boolean',
      default: '–',
      description: 'True unless the icon has a label.',
    },
  }),
}

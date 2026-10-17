import type { IconProps, UseIconOptions, UseIconResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export type IconDocumentedProps = Pick<
  IconProps,
  'name' | 'icon' | 'as' | 'children' | 'size' | 'label' | 'variant' | 'mirrorInRtl'
>

export const iconRows = propRows<IconDocumentedProps>({
  name: {
    type: 'IconName',
    default: '–',
    description:
      'A built-in icon, or one registered with defineIcons in a KvirnProvider. Give one of name, icon, as or children.',
  },
  icon: {
    type: 'IconRegistryEntry',
    default: '–',
    description:
      'An icon from @kvirn-ui/icons, or a component: icon={search} or icon={Search}. It needs no registration. Icon’s size and label replace the component’s own, and className is joined with it.',
  },
  as: {
    type: 'ElementType',
    default: '–',
    description:
      'A one-off icon of your own that isn’t registered: as={MunicipalityMark}. It gets Icon’s props (width, height, aria-hidden, role, aria-label, className) as plain props and must spread them on its own <svg> and take a ref. Icon’s size and label do not reach it under those names.',
  },
  children: {
    type: 'ReactNode',
    default: '–',
    description: 'Your own shapes, with Icon as the <svg>. Pass a viewBox too.',
  },
  size: {
    type: 'IconSize',
    default: '20',
    description:
      'The size in pixels, as a string: "12", "14", "16", "20", "24", "28", "32", "40", "48", "56", "64", "80" or "96". The theme turns it into rem with the class kv-icon--size-<px>, so it follows the root font size, not the text. Another size is a class you add. The default comes from KvirnProvider iconDefaults.',
  },
  label: {
    type: 'string',
    default: '–',
    description:
      'Makes the icon an image (role="img") with this name, from your translations. Leave it out when text next to the icon says the same: the icon is then hidden from assistive technology.',
  },
  variant: {
    type: "'primary' | 'secondary' | 'accent' | 'muted' | 'info' | 'success' | 'warning' | 'danger'",
    default: '–',
    description:
      'A colour from the theme, set with the class kv-icon--<variant>. Without one the icon keeps the text colour around it. It decorates: words carry the meaning, never the colour alone.',
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
    name: 'kv-icon--size-<px>',
    values: 'such as "kv-icon--size-20"',
    meaning: 'The size, in rem in the theme. Always present.',
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
    icon: {
      type: 'IconRegistryEntry',
      default: '–',
      description: 'An icon from @kvirn-ui/icons, or a component, used instead of a name.',
    },
    size: { type: 'IconSize', default: '20', description: 'The size in pixels, as a string.' },
    label: {
      type: 'string',
      default: '–',
      description: 'Makes the icon an image with this name. Without it the icon is decorative.',
    },
    variant: {
      type: "'primary' | 'secondary' | 'accent' | 'muted' | 'info' | 'success' | 'warning' | 'danger'",
      default: '–',
      description: 'A colour from the theme, set with the class kv-icon--<variant>.',
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
        'Spread on the root <svg>, or pass to an icon component: class, width and height, and the aria attributes.',
    },
    component: {
      type: 'IconComponent | undefined',
      default: '–',
      description:
        'The registered or built-in component for name or icon. Undefined without either, or for an unknown name.',
    },
    isDecorative: {
      type: 'boolean',
      default: '–',
      description: 'True unless the icon has a label.',
    },
  }),
}

import {
  bold,
  bulletList,
  clearFormatting,
  code,
  heading2,
  heading3,
  heading4,
  heading5,
  heading6,
  image,
  indent,
  italic,
  link,
  numberedList,
  outdent,
  redo,
  strike,
  table,
  undo,
  underline,
} from '@kvirn-ui/icons'
import type { IconData } from '@kvirn-ui/icons'
import { SvgIcon } from '@kvirn-ui/icons/react'
import type { ReactElement } from 'react'

const icons = {
  undo,
  redo,
  bold,
  italic,
  underline,
  strike,
  code,
  'bullet-list': bulletList,
  'numbered-list': numberedList,
  indent,
  outdent,
  link,
  image,
  table,
  'clear-formatting': clearFormatting,
  'heading-2': heading2,
  'heading-3': heading3,
  'heading-4': heading4,
  'heading-5': heading5,
  'heading-6': heading6,
} satisfies Record<string, IconData>

/** The built-in editor icons by name. */
export type RichTextIconName = keyof typeof icons

/** The names of the built-in editor icons: all from `@kvirn-ui/icons`. */
export const richTextIconNames = Object.freeze(Object.keys(icons) as RichTextIconName[])

export interface ToolbarIconProps {
  /** A built-in editor icon. */
  name?: RichTextIconName | undefined
  /** Or your own: path data on a 24 grid, drawn with a 1.5 stroke. */
  paths?: readonly string[] | undefined
  /** Flip it in right-to-left text. Default: the directional icons do. */
  mirrorInRtl?: boolean | undefined
}

const noShapes: IconData = { shapes: [] }

/**
 * A decorative icon for a toolbar control: an `<svg aria-hidden>` that takes the control's text
 * colour (`currentColor`) and a 20px size in rem, so it follows 200% zoom. The control
 * has its own name, so the icon is never the only label.
 */
export function ToolbarIcon({ name, paths, mirrorInRtl }: ToolbarIconProps): ReactElement {
  const data: IconData =
    paths === undefined
      ? name === undefined
        ? noShapes
        : icons[name]
      : { shapes: paths.map((pathData) => ['path', { d: pathData }] as const) }
  const isMirrored = mirrorInRtl ?? (paths === undefined && data.mirrorInRtl === true)
  return (
    <SvgIcon
      icon={data}
      size="1.25rem"
      className="kv-icon kv-icon--size-20"
      {...(isMirrored ? { 'data-mirror-in-rtl': '' } : {})}
    />
  )
}
ToolbarIcon.displayName = 'RichTextEditor.Icon'

import type { ReactElement } from 'react'

/** The editor's own icons: outline drawings in the built-in set's style, on a 24 grid with a 1.5 stroke. */
const shapes = {
  undo: ['M9 14 4 9l5-5', 'M4 9h10.5a5.5 5.5 0 0 1 0 11H11'],
  redo: ['M15 14l5-5-5-5', 'M20 9H9.5a5.5 5.5 0 0 0 0 11H13'],
  bold: ['M7 4.5v15', 'M7 4.5h6a3.5 3.5 0 0 1 0 7H7', 'M7 11.5h7a4 4 0 0 1 0 8H7'],
  italic: ['M10 4.5h7', 'M7 19.5h7', 'M14.5 4.5 9.5 19.5'],
  underline: ['M7 4.5v7a5 5 0 0 0 10 0v-7', 'M5 20h14'],
  strike: [
    'M5 12h14',
    'M16.5 7.5c-.5-1.8-2.3-3-4.5-3-2.7 0-4.5 1.4-4.5 3.2 0 1.4 1 2.3 2.8 2.8',
    'M8 16.5c.5 1.8 2.3 3 4.5 3 2.7 0 4.5-1.4 4.5-3.2 0-.8-.3-1.4-.8-1.8',
  ],
  code: ['M8.5 7.5 4 12l4.5 4.5', 'M15.5 7.5 20 12l-4.5 4.5'],
  'bullet-list': ['M5 6.5h.01', 'M5 12h.01', 'M5 17.5h.01', 'M9 6.5h11', 'M9 12h11', 'M9 17.5h11'],
  'numbered-list': [
    'M10 6.5h10',
    'M10 12h10',
    'M10 17.5h10',
    'M4.75 5.25 6 4.5v4',
    'M4.5 11.75c.4-.9 2.5-.9 2.5.3 0 1-1.5 1.6-2.5 2.7H7',
  ],
  indent: ['M4 5h16', 'M11 10h9', 'M11 14h9', 'M4 19h16', 'M4 9.5 7.5 12 4 14.5Z'],
  outdent: ['M4 5h16', 'M11 10h9', 'M11 14h9', 'M4 19h16', 'M7.5 9.5 4 12l3.5 2.5Z'],
  link: [
    'M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-.9.9',
    'M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l.9-.9',
  ],
  image: [
    'M5 4h14a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 19 20H5a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 5 4Z',
    'M8.5 9.5h.01',
    'M3.5 16 9 11l4 4 2.5-2 5 4.5',
  ],
  table: [
    'M5 4h14a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 19 20H5a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 5 4Z',
    'M3.5 10h17',
    'M3.5 15h17',
    'M10 4v16',
  ],
  'clear-formatting': ['M5 5.5h10', 'M10 5.5 7.5 18.5', 'M14 14l6 6', 'M20 14l-6 6'],
} as const

/** The built-in editor icons by name. */
export type RichTextIconName = keyof typeof shapes

/** The icons that point in a direction: they flip in right-to-left text. */
const mirroredInRtl = new Set<RichTextIconName>([
  'undo',
  'redo',
  'bullet-list',
  'indent',
  'outdent',
])

export interface ToolbarIconProps {
  /** A built-in editor icon. */
  name?: RichTextIconName | undefined
  /** Or your own: path data on a 24 grid, drawn with a 1.5 stroke. */
  paths?: readonly string[] | undefined
  /** Flip it in right-to-left text. Default: the built-in directional icons do. */
  mirrorInRtl?: boolean | undefined
}

/**
 * A decorative icon for a toolbar control: an `<svg aria-hidden>` that takes the control's text
 * colour (`currentColor`) and a 20px size in rem, so it follows 200% zoom. The control
 * has its own name, so the icon is never the only label.
 */
export function ToolbarIcon({ name, paths, mirrorInRtl }: ToolbarIconProps): ReactElement {
  const drawing = paths ?? (name === undefined ? [] : shapes[name])
  const isMirrored = mirrorInRtl ?? (name !== undefined && mirroredInRtl.has(name))
  return (
    <svg
      className="kv-icon kv-icon--size-20"
      {...(isMirrored ? { 'data-mirror-in-rtl': '' } : {})}
      width="1.25rem"
      height="1.25rem"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {drawing.map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  )
}
ToolbarIcon.displayName = 'RichTextEditor.Icon'

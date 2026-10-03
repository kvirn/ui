import type { ReactElement } from 'react'
import type { IconComponent, IconComponentProps, IconRegistryEntry } from './icon-registry.ts'

/**
 * The built-in icons: original outline drawings in the style of Heroicons, on a 24 grid with a
 * 1.5 stroke, round caps and joins. Drawn from the keylines and construction table in the
 * design spec (docs/design/icon.md §6.1), in its order. Each icon is a list of path data that
 * sets no attributes of its own, so every prop reaches every stroke. A circle is two arcs, and a
 * dot is a 0.01 round-capped segment that grows with the stroke.
 */
const shapes = {
  'chevron-down': ['M5 8.5 12 15.5 19 8.5'],
  'chevron-up': ['M5 15.5 12 8.5 19 15.5'],
  'chevron-back': ['M15.5 5 8.5 12 15.5 19'],
  'chevron-forward': ['M8.5 5 15.5 12 8.5 19'],
  'arrow-back': ['M19.5 12h-15', 'M11 5.5 4.5 12l6.5 6.5'],
  'arrow-forward': ['M4.5 12h15', 'M13 5.5l6.5 6.5-6.5 6.5'],
  external: [
    'M11 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-5',
    'M10 14 20 4',
    'M14 4h6v6',
  ],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  search: ['M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z', 'M15.25 15.25l5 5'],
  add: ['M12 5v14', 'M19 12H5'],
  check: ['M4.5 12.5l5 5 10-11'],
  info: [
    'M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
    'M12 7.75h.01',
    'M12 10.75v5.75',
  ],
  success: ['M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z', 'M8.25 12.25 11 15l4.75-6'],
  warning: ['M12 3.25 21.25 20.25H2.75Z', 'M12 10.25v3.25', 'M12 16.5h.01'],
  error: ['M8.5 3.5h7l5 5v7l-5 5h-7l-5-5v-7Z', 'M9 9l6 6', 'M15 9l-6 6'],
  calendar: [
    'M6 5.5h12a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z',
    'M4 10.25h16',
    'M8 3v3.75',
    'M16 3v3.75',
    'M8 15h.01',
    'M12 15h.01',
    'M16 15h.01',
  ],
  upload: ['M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3', 'M12 15.5V4', 'M7.5 8.5 12 4l4.5 4.5'],
  download: ['M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3', 'M12 4v11.5', 'M7.5 11 12 15.5l4.5-4.5'],
  document: [
    'M13.5 3h-6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8Z',
    'M13.5 3v5h5',
    'M9 13h6',
    'M9 16.5h6',
  ],
  delete: [
    'M4 6.5h16',
    'M9.5 6.5V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5',
    'M6 6.5l.9 12.6a1 1 0 0 0 1 .9h8.2a1 1 0 0 0 1-.9L18 6.5',
    'M10 10v6.5',
    'M14 10v6.5',
  ],
  language: [
    'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z',
    'M16 12a4 9 0 1 1-8 0 4 9 0 0 1 8 0Z',
    'M3.5 9h17',
    'M3.5 15h17',
  ],
  eye: [
    'M3 12c2-4.25 5.25-6.75 9-6.75s7 2.5 9 6.75c-2 4.25-5.25 6.75-9 6.75S5 16.25 3 12Z',
    'M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z',
  ],
  // The eye, broken 2 units clear of the slash on each side (§6.1). The pupil lies wholly inside
  // that clearance, so it's left out: an empty, slashed eye.
  'eye-off': [
    'M10.36 5.41C10.9 5.31 11.44 5.25 12 5.25c3.75 0 7 2.5 9 6.75-.44.94-.94 1.79-1.5 2.55',
    'M13.64 18.59c-.54.1-1.08.16-1.64.16-3.75 0-7-2.5-9-6.75.44-.94.94-1.79 1.5-2.55',
    'M4.5 4.5l15 15',
  ],
} as const satisfies Readonly<Record<string, readonly string[]>>

/** A name in the built-in set. Every one works with no provider and no registration. */
export type BuiltInIconName = keyof typeof shapes

/** Directional icons that flip in right-to-left text. */
const mirroredInRtl: ReadonlySet<BuiltInIconName> = new Set<BuiltInIconName>([
  'chevron-forward',
  'chevron-back',
  'arrow-forward',
  'arrow-back',
  'external',
])

function createBuiltInIcon(paths: readonly string[]): IconComponent {
  return function BuiltInIcon({ ref, ...svgProps }: IconComponentProps): ReactElement {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...svgProps}
        ref={ref}
      >
        {paths.map((pathData) => (
          <path key={pathData} d={pathData} />
        ))}
      </svg>
    )
  }
}

/** Every built-in name, in the order of the design spec. */
export const builtInIconNames = Object.freeze(Object.keys(shapes) as BuiltInIconName[])

/** Internal. The base layer of every icon registry. */
export const builtInIcons: Readonly<Record<string, IconRegistryEntry | undefined>> = Object.freeze(
  Object.fromEntries(
    builtInIconNames.map((name) => {
      const component = createBuiltInIcon(shapes[name])
      return [name, mirroredInRtl.has(name) ? { component, mirrorInRtl: true } : component]
    }),
  ),
)

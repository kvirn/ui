import { createElement } from 'react'
import type { IconComponent, IconComponentProps } from '@kvirn-ui/react'
import type { ReactElement } from 'react'

/** One drawn shape: its element name and attributes, as read from the source SVG. */
export type IconShape = readonly [
  tag: 'path' | 'line' | 'polyline' | 'circle' | 'ellipse' | 'rect',
  attributes: Readonly<Record<string, string>>,
]

/** Internal. The generated modules call it; it wraps shapes in the same `<svg>` as the built-in set. */
export function createIcon(shapes: readonly IconShape[]): IconComponent {
  return function LibraryIcon({ ref, ...svgProps }: IconComponentProps): ReactElement {
    return createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        ...svgProps,
        ref,
      },
      shapes.map(([tag, attributes], index) => createElement(tag, { key: index, ...attributes })),
    )
  }
}

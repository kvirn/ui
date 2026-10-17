/** One drawn shape: its element name and attributes, as read from the source SVG. */
export type IconShape = readonly [
  tag: 'path' | 'line' | 'polyline' | 'circle' | 'ellipse' | 'rect',
  attributes: Readonly<Record<string, string>>,
]

/** A drawing as plain data, so any framework can render it. The root `<svg>` is the renderer's. */
export interface IconData {
  readonly shapes: readonly IconShape[]
  /** A hint for the renderer: flip the icon in right-to-left text. */
  readonly mirrorInRtl?: boolean
}

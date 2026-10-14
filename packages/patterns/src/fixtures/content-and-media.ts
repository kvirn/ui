const toDataUri = (svg: string): string => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

/**
 * A floor plan of a preschool, for the Figure pattern. Informative: its `alt` says what it shows,
 * and the facts are in the body text.
 */
export const kvirnbyFloorPlan: string = toDataUri(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="#f4f1de"/><rect x="40" y="40" width="560" height="280" fill="#fff" stroke="#1d4e89" stroke-width="4"/><path d="M320 40v280M40 180h280" stroke="#1d4e89" stroke-width="4"/><rect x="290" y="300" width="60" height="20" fill="#a8664a"/></svg>',
)

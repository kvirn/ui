// Inline SVG data URIs: the fixture world makes no request (rule 7). Abstract on purpose: no
// coat of arms and no real place.
const toDataUri = (svg: string): string => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

/** The brand mark: a decorative shape beside the name, so it is shown with `alt=""`. */
export const kvirnbyMark: string = toDataUri(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#1d4e89"/><path d="M8 34 20 16l8 12 5-7 7 13z" fill="#f4f1de"/><path d="M4 41c8-4 14 4 22 0s14 4 22 0" fill="none" stroke="#7fb7be" stroke-width="3"/></svg>',
)

/** Hills and a river, for the hero. Decorative, so `alt=""`. */
export const kvirnbyHills: string = toDataUri(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="#dbe9ee"/><circle cx="500" cy="80" r="34" fill="#f6e7b4"/><path d="M0 230C90 150 160 150 250 210S420 260 640 170V360H0z" fill="#8fb996"/><path d="M0 270C120 200 210 230 320 270S520 300 640 240V360H0z" fill="#5a8f6a"/><path d="M250 360C270 300 330 280 420 250S560 230 640 250V280C560 270 480 290 400 310S300 330 290 360z" fill="#7fb7be"/></svg>',
)

/** A square place picture for a news card. */
export const kvirnbySquare: string = toDataUri(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270"><rect width="480" height="270" fill="#e8e1d0"/><rect x="40" y="150" width="400" height="90" fill="#c9bfa5"/><rect x="70" y="90" width="90" height="70" fill="#a8664a"/><rect x="190" y="70" width="110" height="90" fill="#7a8f9e"/><rect x="330" y="100" width="80" height="60" fill="#a8664a"/></svg>',
)

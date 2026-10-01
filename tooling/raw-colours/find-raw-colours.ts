import { readdirSync } from 'node:fs'
import { join } from 'node:path'

// ADR-0013: theme.css and the app CSS use only `var(--kv-*)` (and system colours in forced
// colours), so an override of a token reaches everything and `theme:check` measures what users
// see. Raw colour values belong in the palette block of packages/theme/theme.css only.

/** CSS named colours (CSS Color 4). `transparent`, `currentColor` and system colours are fine. */
const namedColours = new Set(
  'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'.split(
    ' ',
  ),
)

const colourFunction = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\([^()]*\)/gi
const hexColour = /#[\da-f]{3,8}\b/gi
const word = /[a-z]+/gi

/** The value part of every declaration (`property: value`), with comments and strings removed. */
function declarationValues(css: string): string[] {
  const withoutComments = css.replaceAll(/\/\*[\s\S]*?\*\//g, '')
  return [...withoutComments.matchAll(/(?<=[{;]\s*)[\w-]+\s*:\s*([^;{}]+)/g)].map((match) =>
    (match[1] ?? '').replaceAll(/(['"])(?:(?!\1).)*\1/g, ''),
  )
}

/** Every raw colour value used in a declaration, in source order. */
export function findRawColours(css: string): string[] {
  return declarationValues(css).flatMap((value) => {
    const functions = value.match(colourFunction) ?? []
    const withoutFunctions = value.replaceAll(colourFunction, '').replaceAll(/var\([^()]*\)/g, '')
    const hexes = withoutFunctions.match(hexColour) ?? []
    const names = (withoutFunctions.replaceAll(hexColour, '').match(word) ?? []).filter((name) =>
      namedColours.has(name.toLowerCase()),
    )
    return [...functions, ...hexes, ...names]
  })
}

/** A palette step: `--kv-white`, `--kv-black` or `--kv-<role>-<step>`. */
const paletteDeclaration = /^\s*--kv-(?:white|black|[a-z]+-\d+)\s*:[^;]*$/

/**
 * The CSS without its palette block: the first `:root { … }` rule, if it defines nothing but
 * palette steps. That block is the only place raw colours are allowed.
 */
export function withoutPaletteBlock(css: string): string {
  const withoutComments = css.replaceAll(/\/\*[\s\S]*?\*\//g, '')
  const match = /:root\s*\{([^{}]*)\}/.exec(withoutComments)
  if (match === null) {
    return withoutComments
  }
  const declarations = (match[1] ?? '').split(';').filter((part) => part.trim() !== '')
  return declarations.every((declaration) => paletteDeclaration.test(declaration))
    ? withoutComments.replace(match[0], '')
    : withoutComments
}

function listCssFiles(directory: string): string[] {
  let entries
  try {
    entries = readdirSync(directory, { withFileTypes: true })
  } catch {
    return []
  }
  return entries.flatMap((entry) => {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
      return []
    }
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      return listCssFiles(path)
    }
    return entry.name.endsWith('.css') ? [path] : []
  })
}

/** theme.css (outside its palette), the docs site CSS and the Storybook CSS. */
export function listCheckedCssFiles(repositoryRoot: string): string[] {
  return [
    join(repositoryRoot, 'packages/theme/theme.css'),
    ...listCssFiles(join(repositoryRoot, 'apps/docs')),
    // The preview's stylesheet is in .storybook, which the walk skips as a dot directory.
    ...listCssFiles(join(repositoryRoot, 'apps/storybook/.storybook')),
    ...listCssFiles(join(repositoryRoot, 'apps/storybook/src')),
  ].toSorted()
}

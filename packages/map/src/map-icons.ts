import { arrowEast, arrowNorth, arrowSouth, arrowWest, locate, pin, remove } from '@kvirn/icons'

/** The Map's icons by name, for `KvirnProvider icons` or `<Icon icon>`: all from `@kvirn/icons`. */
export const mapIcons = Object.freeze({
  marker: pin,
  locate,
  remove,
  'arrow-north': arrowNorth,
  'arrow-south': arrowSouth,
  'arrow-west': arrowWest,
  'arrow-east': arrowEast,
})

import type { IconComponent, IconComponentProps } from '@kvirn-ui/react'
import type { ReactElement } from 'react'

// The built-in icon set is capped, so the map keeps its own four, drawn like the built-ins
// (24 grid, 1.5 stroke, round caps and joins) and passed to Icon with `icon`.
function createMapIcon(paths: readonly string[]): IconComponent {
  return function MapIcon({ ref, ...svgProps }: IconComponentProps): ReactElement {
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

export const RemoveIcon = createMapIcon(['M19 12H5'])
export const ArrowUpIcon = createMapIcon(['M12 19.5v-15', 'M5.5 11 12 4.5l6.5 6.5'])
export const ArrowDownIcon = createMapIcon(['M12 4.5v15', 'M5.5 13 12 19.5l6.5-6.5'])
export const LocateIcon = createMapIcon([
  'M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z',
  'M12 3v2.5',
  'M12 18.5V21',
  'M3 12h2.5',
  'M18.5 12H21',
])
export const ArrowLeftIcon = createMapIcon(['M19.5 12h-15', 'M11 5.5 4.5 12l6.5 6.5'])
export const ArrowRightIcon = createMapIcon(['M4.5 12h15', 'M13 5.5l6.5 6.5-6.5 6.5'])

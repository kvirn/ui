import { createElement } from 'react'
import type { FunctionComponent, ReactElement, SVGProps } from 'react'
import type { IconData } from './icon-data.ts'

export interface SvgIconProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'title'> {
  icon: IconData
  /** Width and height. A number is pixels. Default 24. */
  size?: number | string | undefined
  /** Names the icon, as a `<title>`. Without a name (`title`, `aria-label` or `aria-labelledby`) the icon is decorative. */
  title?: string | undefined
}

const componentsByData = new WeakMap<IconData, FunctionComponent<Omit<SvgIconProps, 'icon'>>>()

// The data keeps SVG's own attribute names (`stroke-dasharray`); React wants `strokeDasharray`.
function toReactAttributes(attributes: Readonly<Record<string, string>>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(attributes).map(([name, value]) => [
      name.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase()),
      value,
    ]),
  )
}

// No hooks, context or 'use client', so it renders in a React Server Component.
// `IconData.mirrorInRtl` is a hint only: flipping in right-to-left text is the caller's.
export function SvgIcon({ icon, size = 24, title, ref, ...svgProps }: SvgIconProps): ReactElement {
  const isLabelled = [title, svgProps['aria-label'], svgProps['aria-labelledby']].some(
    (name) => typeof name === 'string' && name !== '',
  )
  return createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      width: size,
      height: size,
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.5,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ...svgProps,
      ...(isLabelled
        ? { role: 'img', 'aria-hidden': undefined }
        : { 'aria-hidden': 'true', focusable: 'false' }),
      ref,
    },
    title === undefined ? undefined : createElement('title', { key: 'title' }, title),
    ...icon.shapes.map(([tag, attributes], index) =>
      createElement(tag, { key: index, ...toReactAttributes(attributes) }),
    ),
  )
}

/** A component that draws `data`, the same one each time for the same data. */
export function createIconComponent(data: IconData): FunctionComponent<Omit<SvgIconProps, 'icon'>> {
  const existing = componentsByData.get(data)
  if (existing !== undefined) return existing
  const component = function DataIcon(props: Omit<SvgIconProps, 'icon'>): ReactElement {
    return SvgIcon({ icon: data, ...props })
  }
  componentsByData.set(data, component)
  return component
}

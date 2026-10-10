import type { ReactNode } from 'react'

export type Tone = 'ink' | 'fill' | 'text' | 'key' | 'shell' | 'slot'

interface ShapeProps {
  tone?: Tone
}

const toneClass = (tone: Tone) => `docs-gallery-${tone}`

const strokeProps = { strokeWidth: 1.5, vectorEffect: 'non-scaling-stroke' } as const

/** The one picture box: decorative, so no title, no text and out of the tab order. */
export function Drawing({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 160 100" aria-hidden="true" focusable="false">
      {children}
    </svg>
  )
}

export function Rect({
  x,
  y,
  width,
  height,
  radius = 4,
  tone = 'ink',
}: ShapeProps & { x: number; y: number; width: number; height: number; radius?: number }) {
  return (
    <rect
      className={toneClass(tone)}
      x={x}
      y={y}
      width={width}
      height={height}
      rx={radius}
      {...strokeProps}
    />
  )
}

/** A line of text: a bar, never a glyph. */
export function Bar({
  x,
  y,
  width,
  height = 3,
  tone = 'text',
}: ShapeProps & { x: number; y: number; width: number; height?: number }) {
  return (
    <rect
      className={toneClass(tone)}
      x={x}
      y={y}
      width={width}
      height={height}
      rx={height / 2}
      {...strokeProps}
    />
  )
}

export function Pill({
  x,
  y,
  width,
  height = 20,
  tone = 'key',
}: ShapeProps & { x: number; y: number; width: number; height?: number }) {
  return <Rect x={x} y={y} width={width} height={height} radius={height / 2} tone={tone} />
}

export function Circle({
  cx,
  cy,
  radius,
  tone = 'ink',
}: ShapeProps & { cx: number; cy: number; radius: number }) {
  return <circle className={toneClass(tone)} cx={cx} cy={cy} r={radius} {...strokeProps} />
}

export function Line({
  x1,
  y1,
  x2,
  y2,
  tone = 'ink',
}: ShapeProps & { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line
      className={toneClass(tone)}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      strokeLinecap="round"
      {...strokeProps}
    />
  )
}

export function Path({ d, tone = 'ink' }: ShapeProps & { d: string }) {
  return (
    <path
      className={toneClass(tone)}
      d={d}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...strokeProps}
    />
  )
}

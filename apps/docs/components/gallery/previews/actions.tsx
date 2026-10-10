import type { ReactNode } from 'react'
import { Bar, Drawing, Line, Rect } from './primitives.tsx'

export const actionPreviews: Record<string, ReactNode> = {
  button: (
    <Drawing>
      <Rect x={44} y={34} width={72} height={32} radius={6} tone="key" />
      <Bar x={62} y={48.5} width={36} tone="fill" />
    </Drawing>
  ),
  'button-group': (
    <Drawing>
      <Rect x={20} y={36} width={40} height={28} radius={6} tone="key" />
      <Rect x={60} y={36} width={40} height={28} radius={6} />
      <Rect x={100} y={36} width={40} height={28} radius={6} />
      <Bar x={30} y={48.5} width={20} tone="fill" />
      <Bar x={70} y={48.5} width={20} />
      <Bar x={110} y={48.5} width={20} />
    </Drawing>
  ),
  'copy-button': (
    <Drawing>
      <Rect x={26} y={34} width={108} height={32} radius={6} />
      <Bar x={38} y={48.5} width={48} />
      <Rect x={102} y={42} width={10} height={12} radius={2} />
      <Rect x={106} y={46} width={10} height={12} radius={2} tone="key" />
    </Drawing>
  ),
  link: (
    <Drawing>
      <Bar x={20} y={26} width={120} />
      <Bar x={20} y={42} width={40} />
      <Bar x={66} y={42} width={40} tone="key" />
      <Line x1={66} y1={50} x2={106} y2={50} tone="key" />
      <Bar x={112} y={42} width={28} />
      <Bar x={20} y={58} width={90} />
    </Drawing>
  ),
  toolbar: (
    <Drawing>
      <Rect x={14} y={34} width={132} height={32} radius={6} />
      <Rect x={24} y={42} width={16} height={16} radius={3} tone="fill" />
      <Rect x={46} y={42} width={16} height={16} radius={3} tone="key" />
      <Rect x={68} y={42} width={16} height={16} radius={3} tone="fill" />
      <Line x1={92} y1={40} x2={92} y2={60} />
      <Rect x={100} y={42} width={16} height={16} radius={3} tone="fill" />
      <Rect x={122} y={42} width={16} height={16} radius={3} tone="fill" />
    </Drawing>
  ),
}

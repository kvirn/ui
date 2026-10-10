import type { ReactNode } from 'react'
import { Bar, Circle, Drawing, Line, Path, Rect } from './primitives.tsx'

export const dataPreviews: Record<string, ReactNode> = {
  announcer: (
    <Drawing>
      <Rect x={16} y={14} width={128} height={72} radius={6} tone="slot" />
      <Bar x={26} y={26} width={60} />
      <Bar x={26} y={36} width={80} />
      <Rect x={44} y={54} width={100} height={22} radius={6} tone="fill" />
      <Circle cx={56} cy={65} radius={4} tone="key" />
      <Bar x={68} y={63.5} width={64} />
      <Path d="M22 62 q6 3 0 6" tone="key" />
      <Path d="M28 59 q10 6 0 12" tone="key" />
    </Drawing>
  ),
  focus: (
    <Drawing>
      <Rect x={14} y={12} width={132} height={76} radius={6} tone="slot" />
      <Rect x={32} y={24} width={96} height={52} radius={6} tone="fill" />
      <Bar x={42} y={34} width={50} />
      <Rect x={42} y={50} width={30} height={16} radius={4} tone="key" />
      <Rect x={80} y={50} width={38} height={16} radius={4} />
      <Path d="M24 40 q-4 -6 0 -12 M136 60 q4 6 0 12" tone="key" />
    </Drawing>
  ),
  'read-aloud': (
    <Drawing>
      <Rect x={16} y={14} width={128} height={46} radius={6} />
      <Bar x={26} y={24} width={100} />
      <Bar x={26} y={34} width={104} tone="key" />
      <Bar x={26} y={44} width={70} />
      <Circle cx={36} cy={78} radius={8} tone="key" />
      <Path d="M33 74 l8 4 l-8 4 z" tone="fill" />
      <Line x1={54} y1={78} x2={140} y2={78} tone="slot" />
      <Line x1={54} y1={78} x2={96} y2={78} tone="key" />
    </Drawing>
  ),
  'route-focus': (
    <Drawing>
      <Rect x={16} y={14} width={128} height={72} radius={6} />
      <Rect x={22} y={20} width={60} height={14} radius={4} tone="slot" />
      <Bar x={30} y={25.5} width={44} />
      <Rect x={22} y={44} width={116} height={14} radius={4} tone="key" />
      <Bar x={30} y={49.5} width={56} height={5} />
      <Bar x={22} y={68} width={100} />
      <Bar x={22} y={76} width={72} />
      <Path d="M112 28 h14 l-4 -4 m4 4 l-4 4" tone="key" />
    </Drawing>
  ),
  table: (
    <Drawing>
      <Rect x={16} y={16} width={128} height={68} radius={5} />
      <Rect x={16} y={16} width={128} height={16} radius={5} tone="fill" />
      <Line x1={16} y1={50} x2={144} y2={50} />
      <Line x1={16} y1={66} x2={144} y2={66} />
      <Line x1={58} y1={16} x2={58} y2={84} />
      <Line x1={102} y1={16} x2={102} y2={84} />
      <Bar x={24} y={22.5} width={24} tone="key" />
      <Bar x={66} y={22.5} width={26} tone="key" />
      <Bar x={110} y={22.5} width={24} tone="key" />
      <Bar x={24} y={39.5} width={24} />
      <Bar x={66} y={39.5} width={20} />
      <Bar x={110} y={39.5} width={26} />
      <Bar x={24} y={57.5} width={20} />
      <Bar x={66} y={57.5} width={26} />
      <Bar x={110} y={57.5} width={18} />
      <Bar x={24} y={73.5} width={26} />
      <Bar x={66} y={73.5} width={18} />
      <Bar x={110} y={73.5} width={24} />
    </Drawing>
  ),
}

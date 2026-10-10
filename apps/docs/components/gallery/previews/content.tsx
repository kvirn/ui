import type { ReactNode } from 'react'
import { Bar, Circle, Drawing, Line, Path, Pill, Rect } from './primitives.tsx'

export const contentPreviews: Record<string, ReactNode> = {
  accordion: (
    <Drawing>
      <Rect x={24} y={10} width={112} height={18} />
      <Bar x={32} y={17.5} width={50} />
      <Path d="M122 16 l4 4 l4 -4" />
      <Rect x={24} y={34} width={112} height={18} tone="fill" />
      <Bar x={32} y={41.5} width={50} />
      <Path d="M122 46 l4 -4 l4 4" tone="key" />
      <Bar x={32} y={58} width={90} />
      <Bar x={32} y={68} width={60} />
      <Rect x={24} y={80} width={112} height={18} />
      <Bar x={32} y={87.5} width={50} />
      <Path d="M122 86 l4 4 l4 -4" />
    </Drawing>
  ),
  alert: (
    <Drawing>
      <Rect x={20} y={28} width={120} height={44} radius={6} tone="fill" />
      <Rect x={20} y={28} width={5} height={44} radius={2} tone="key" />
      <Circle cx={42} cy={50} radius={6} tone="key" />
      <Bar x={56} y={44} width={70} />
      <Bar x={56} y={54} width={44} />
    </Drawing>
  ),
  badge: (
    <Drawing>
      <Bar x={24} y={48.5} width={50} height={5} />
      <Pill x={84} y={40} width={52} tone="key" />
      <Bar x={96} y={48.5} width={28} tone="fill" />
    </Drawing>
  ),
  card: (
    <Drawing>
      <Rect x={30} y={12} width={100} height={76} radius={6} tone="fill" />
      <Bar x={42} y={24} width={50} height={5} />
      <Bar x={42} y={40} width={76} />
      <Bar x={42} y={50} width={70} />
      <Bar x={42} y={60} width={44} />
      <Bar x={42} y={74} width={30} tone="key" />
    </Drawing>
  ),
  'code-block': (
    <Drawing>
      <Rect x={16} y={18} width={128} height={64} radius={6} />
      <Line x1={16} y1={36} x2={144} y2={36} />
      <Bar x={26} y={25.5} width={30} />
      <Rect x={122} y={24} width={12} height={8} radius={2} tone="key" />
      <Bar x={28} y={46} width={60} />
      <Bar x={36} y={56} width={70} />
      <Bar x={36} y={66} width={44} />
    </Drawing>
  ),
  disclosure: (
    <Drawing>
      <Rect x={24} y={16} width={112} height={22} />
      <Bar x={34} y={25.5} width={52} />
      <Path d="M120 30 l4 -4 l4 4" tone="key" />
      <Bar x={24} y={50} width={112} />
      <Bar x={24} y={60} width={96} />
      <Bar x={24} y={70} width={60} />
    </Drawing>
  ),
  heading: (
    <Drawing>
      <Bar x={24} y={16} width={88} height={8} tone="key" />
      <Bar x={24} y={34} width={112} />
      <Bar x={24} y={44} width={96} />
      <Bar x={24} y={60} width={60} height={5} tone="key" />
      <Bar x={24} y={74} width={104} />
    </Drawing>
  ),
  icon: (
    <Drawing>
      <Circle cx={50} cy={50} radius={18} />
      <Line x1={50} y1={50} x2={50} y2={58} tone="key" />
      <Circle cx={50} cy={42} radius={1.5} tone="key" />
      <Bar x={78} y={48.5} width={56} />
    </Drawing>
  ),
  kbd: (
    <Drawing>
      <Rect x={52} y={26} width={56} height={46} radius={8} tone="fill" />
      <Rect x={58} y={32} width={44} height={28} radius={5} />
      <Bar x={72} y={44.5} width={16} height={4} tone="key" />
    </Drawing>
  ),
  progress: (
    <Drawing>
      <Bar x={20} y={26} width={40} />
      <Bar x={112} y={26} width={28} />
      <Rect x={20} y={42} width={120} height={14} radius={7} />
      <Rect x={20} y={42} width={72} height={14} radius={7} tone="key" />
    </Drawing>
  ),
  prose: (
    <Drawing>
      <Bar x={20} y={12} width={70} height={6} />
      <Bar x={20} y={28} width={120} />
      <Bar x={20} y={38} width={110} />
      <Bar x={20} y={48} width={60} />
      <Rect x={20} y={62} width={3} height={26} radius={1} tone="key" />
      <Bar x={30} y={66} width={100} />
      <Bar x={30} y={78} width={70} />
    </Drawing>
  ),
  'visually-hidden': (
    <Drawing>
      <Rect x={30} y={30} width={100} height={40} radius={6} tone="slot" />
      <Path d="M62 50 q18 -14 36 0 q-18 14 -36 0" />
      <Circle cx={80} cy={50} radius={3} />
      <Line x1={68} y1={62} x2={92} y2={38} tone="key" />
    </Drawing>
  ),
}

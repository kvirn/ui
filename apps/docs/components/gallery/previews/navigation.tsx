import type { ReactNode } from 'react'
import { Bar, Circle, Drawing, Line, Path, Pill, Rect } from './primitives.tsx'

export const navigationPreviews: Record<string, ReactNode> = {
  breadcrumb: (
    <Drawing>
      <Bar x={14} y={48.5} width={24} />
      <Path d="M44 45 l4 5 l-4 5" tone="slot" />
      <Bar x={54} y={48.5} width={30} />
      <Path d="M90 45 l4 5 l-4 5" tone="slot" />
      <Bar x={100} y={47.5} width={44} height={5} tone="key" />
    </Drawing>
  ),
  navigation: (
    <Drawing>
      <Rect x={20} y={14} width={120} height={72} radius={6} />
      <Rect x={28} y={22} width={104} height={16} radius={4} tone="fill" />
      <Rect x={28} y={22} width={4} height={16} radius={2} tone="key" />
      <Bar x={40} y={28.5} width={50} tone="key" />
      <Bar x={40} y={46} width={60} />
      <Bar x={48} y={56} width={44} />
      <Bar x={48} y={66} width={36} />
      <Bar x={40} y={76} width={52} />
    </Drawing>
  ),
  pagination: (
    <Drawing>
      <Rect x={14} y={38} width={20} height={24} radius={5} />
      <Path d="M27 45 l-4 5 l4 5" />
      <Rect x={40} y={38} width={20} height={24} radius={5} />
      <Bar x={46} y={48.5} width={8} />
      <Rect x={66} y={38} width={20} height={24} radius={5} tone="key" />
      <Bar x={72} y={48.5} width={8} tone="fill" />
      <Rect x={92} y={38} width={20} height={24} radius={5} />
      <Bar x={98} y={48.5} width={8} />
      <Rect x={126} y={38} width={20} height={24} radius={5} />
      <Path d="M133 45 l4 5 l-4 5" />
    </Drawing>
  ),
  'skip-link': (
    <Drawing>
      <Rect x={16} y={12} width={128} height={76} radius={6} />
      <Pill x={24} y={18} width={52} height={16} tone="key" />
      <Bar x={34} y={24.5} width={32} tone="fill" />
      <Rect x={24} y={42} width={112} height={12} radius={3} tone="slot" />
      <Rect x={24} y={60} width={112} height={20} radius={4} tone="fill" />
      <Bar x={32} y={68.5} width={60} />
    </Drawing>
  ),
  stepper: (
    <Drawing>
      <Bar x={20} y={30} width={70} height={5} />
      <Bar x={98} y={30} width={42} />
      <Rect x={20} y={52} width={120} height={8} radius={4} />
      <Rect x={20} y={52} width={48} height={8} radius={4} tone="key" />
      <Circle cx={20} cy={78} radius={3} tone="key" />
      <Circle cx={50} cy={78} radius={3} tone="key" />
      <Circle cx={80} cy={78} radius={3} tone="slot" />
      <Circle cx={110} cy={78} radius={3} tone="slot" />
      <Circle cx={140} cy={78} radius={3} tone="slot" />
    </Drawing>
  ),
  'table-of-contents': (
    <Drawing>
      <Bar x={24} y={16} width={40} height={5} />
      <Line x1={26} y1={30} x2={26} y2={84} tone="slot" />
      <Line x1={26} y1={44} x2={26} y2={56} tone="key" />
      <Bar x={36} y={30} width={70} />
      <Bar x={36} y={43} width={86} tone="key" />
      <Bar x={36} y={56} width={60} />
      <Bar x={46} y={69} width={50} />
      <Bar x={36} y={82} width={76} />
    </Drawing>
  ),
  tabs: (
    <Drawing>
      <Rect x={16} y={34} width={128} height={52} radius={5} />
      <Rect x={16} y={14} width={38} height={20} radius={5} tone="fill" />
      <Bar x={26} y={22.5} width={18} tone="key" />
      <Bar x={66} y={22.5} width={20} />
      <Bar x={98} y={22.5} width={22} />
      <Bar x={28} y={48} width={90} />
      <Bar x={28} y={58} width={74} />
      <Bar x={28} y={68} width={50} />
    </Drawing>
  ),
}

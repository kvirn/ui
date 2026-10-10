import type { ReactNode } from 'react'
import { Bar, Drawing, Rect } from './primitives.tsx'

export const layoutPreviews: Record<string, ReactNode> = {
  columns: (
    <Drawing>
      <Rect x={16} y={16} width={40} height={30} radius={5} tone="fill" />
      <Rect x={60} y={16} width={40} height={30} radius={5} tone="fill" />
      <Rect x={104} y={16} width={40} height={30} radius={5} tone="fill" />
      <Rect x={16} y={54} width={40} height={30} radius={5} tone="fill" />
      <Rect x={60} y={54} width={40} height={30} radius={5} tone="fill" />
      <Rect x={104} y={54} width={40} height={30} radius={5} tone="slot" />
      <Bar x={24} y={28} width={24} />
      <Bar x={68} y={28} width={24} />
      <Bar x={112} y={28} width={24} />
      <Bar x={24} y={66} width={24} />
      <Bar x={68} y={66} width={24} />
    </Drawing>
  ),
  container: (
    <Drawing>
      <Rect x={10} y={14} width={140} height={72} radius={6} tone="slot" />
      <Rect x={40} y={14} width={80} height={72} radius={4} tone="fill" />
      <Bar x={50} y={26} width={50} height={5} tone="key" />
      <Bar x={50} y={42} width={60} />
      <Bar x={50} y={52} width={56} />
      <Bar x={50} y={62} width={40} />
    </Drawing>
  ),
  'scroll-area': (
    <Drawing>
      <Rect x={28} y={14} width={96} height={72} radius={6} />
      <Bar x={38} y={26} width={70} />
      <Bar x={38} y={38} width={80} />
      <Bar x={38} y={50} width={56} />
      <Bar x={38} y={62} width={76} />
      <Rect x={130} y={14} width={8} height={72} radius={4} tone="slot" />
      <Rect x={130} y={24} width={8} height={30} radius={4} tone="key" />
    </Drawing>
  ),
  section: (
    <Drawing>
      <Rect x={16} y={16} width={128} height={68} radius={6} />
      <Rect x={16} y={16} width={128} height={18} radius={6} tone="fill" />
      <Bar x={26} y={23.5} width={44} tone="key" />
      <Bar x={26} y={46} width={100} />
      <Bar x={26} y={56} width={88} />
      <Bar x={26} y={66} width={60} />
    </Drawing>
  ),
  'sidebar-layout': (
    <Drawing>
      <Rect x={14} y={14} width={42} height={72} radius={5} tone="fill" />
      <Bar x={22} y={26} width={26} tone="key" />
      <Bar x={22} y={38} width={26} />
      <Bar x={22} y={48} width={20} />
      <Bar x={22} y={58} width={24} />
      <Rect x={62} y={14} width={84} height={72} radius={5} />
      <Bar x={72} y={26} width={50} height={5} />
      <Bar x={72} y={42} width={64} />
      <Bar x={72} y={52} width={56} />
      <Bar x={72} y={62} width={40} />
    </Drawing>
  ),
  stack: (
    <Drawing>
      <Rect x={30} y={12} width={100} height={20} radius={5} tone="fill" />
      <Rect x={30} y={40} width={100} height={20} radius={5} tone="fill" />
      <Rect x={30} y={68} width={100} height={20} radius={5} tone="fill" />
      <Bar x={40} y={20.5} width={50} />
      <Bar x={40} y={48.5} width={60} />
      <Bar x={40} y={76.5} width={40} />
    </Drawing>
  ),
}

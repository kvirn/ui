import type { ReactNode } from 'react'
import { Bar, Circle, Drawing, Line, Path, Pill, Rect } from './primitives.tsx'

function DayGrid({
  x,
  y,
  cell,
  columns = 7,
  rows = 4,
  selected,
}: {
  x: number
  y: number
  cell: number
  columns?: number
  rows?: number
  selected: number[]
}) {
  return (
    <>
      {Array.from({ length: columns * rows }, (_, index) => (
        <Rect
          key={index}
          x={x + (index % columns) * cell}
          y={y + Math.floor(index / columns) * cell}
          width={cell - 3}
          height={cell - 3}
          radius={2}
          tone={selected.includes(index) ? 'key' : 'fill'}
        />
      ))}
    </>
  )
}

export const formsPreviews: Record<string, ReactNode> = {
  calendar: (
    <Drawing>
      <Rect x={26} y={8} width={108} height={84} radius={6} />
      <Path d="M38 19 l-4 4 l4 4" />
      <Bar x={64} y={21} width={32} />
      <Path d="M122 19 l4 4 l-4 4" />
      <DayGrid x={34} y={34} cell={14} selected={[9]} />
    </Drawing>
  ),
  'date-input': (
    <Drawing>
      <Bar x={20} y={30} width={40} />
      <Rect x={20} y={40} width={30} height={26} />
      <Rect x={58} y={40} width={30} height={26} />
      <Rect x={96} y={40} width={44} height={26} />
      <Bar x={26} y={52} width={14} tone="key" />
      <Bar x={64} y={52} width={14} tone="key" />
      <Bar x={104} y={52} width={24} tone="key" />
    </Drawing>
  ),
  'date-picker': (
    <Drawing>
      <Rect x={14} y={12} width={96} height={24} />
      <Bar x={24} y={22.5} width={50} />
      <Rect x={116} y={12} width={30} height={24} tone="key" />
      <Rect x={125} y={19} width={12} height={10} radius={2} tone="fill" />
      <Rect x={70} y={44} width={76} height={48} radius={6} />
      <DayGrid x={78} y={51} cell={10} columns={6} rows={4} selected={[8]} />
    </Drawing>
  ),
  'date-range-picker': (
    <Drawing>
      <Rect x={10} y={12} width={50} height={24} />
      <Bar x={18} y={22.5} width={30} />
      <Line x1={64} y1={24} x2={70} y2={24} />
      <Rect x={74} y={12} width={50} height={24} />
      <Bar x={82} y={22.5} width={30} />
      <Rect x={128} y={12} width={24} height={24} tone="key" />
      <Rect x={134} y={19} width={12} height={10} radius={2} tone="fill" />
      <Rect x={70} y={44} width={82} height={48} radius={6} />
      <DayGrid x={78} y={51} cell={10} columns={6} rows={4} selected={[7, 8, 9]} />
    </Drawing>
  ),
  'error-summary': (
    <Drawing>
      <Rect x={20} y={14} width={120} height={72} radius={6} />
      <Rect x={20} y={14} width={5} height={72} radius={2} tone="key" />
      <Bar x={36} y={26} width={60} height={5} />
      <Bar x={36} y={44} width={70} tone="key" />
      <Line x1={36} y1={51} x2={106} y2={51} tone="key" />
      <Bar x={36} y={62} width={54} tone="key" />
      <Line x1={36} y1={69} x2={90} y2={69} tone="key" />
    </Drawing>
  ),
  field: (
    <Drawing>
      <Bar x={22} y={12} width={44} height={4} />
      <Bar x={22} y={22} width={80} />
      <Rect x={22} y={32} width={116} height={26} />
      <Bar x={32} y={43.5} width={50} tone="fill" />
      <Bar x={22} y={66} width={70} />
      <Circle cx={27} cy={82} radius={4} tone="key" />
      <Bar x={36} y={80.5} width={64} tone="key" />
    </Drawing>
  ),
  fieldset: (
    <Drawing>
      <Rect x={18} y={20} width={124} height={68} radius={6} />
      <Rect x={28} y={14} width={50} height={12} radius={3} tone="fill" />
      <Bar x={34} y={18.5} width={38} />
      <Rect x={30} y={36} width={100} height={18} />
      <Rect x={30} y={62} width={100} height={18} />
    </Drawing>
  ),
  'file-upload': (
    <Drawing>
      <rect
        className="docs-gallery-ink"
        x={20}
        y={16}
        width={120}
        height={68}
        rx={6}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeDasharray="5 4"
      />
      <Path d="M80 62 v-22" tone="key" />
      <Path d="M71 48 l9 -9 l9 9" tone="key" />
      <Bar x={58} y={70} width={44} />
    </Drawing>
  ),
  'input-group': (
    <Drawing>
      <Rect x={16} y={32} width={128} height={36} />
      <Circle cx={32} cy={50} radius={6} tone="fill" />
      <Bar x={46} y={48.5} width={50} />
      <Pill x={104} y={40} width={32} height={20} tone="key" />
      <Bar x={113} y={48.5} width={14} tone="fill" />
    </Drawing>
  ),
  'number-input': (
    <Drawing>
      <Rect x={36} y={32} width={88} height={36} />
      <Bar x={46} y={48.5} width={28} tone="key" />
      <Line x1={96} y1={32} x2={96} y2={68} />
      <Path d="M104 46 l6 -6 l6 6" />
      <Path d="M104 54 l6 6 l6 -6" />
    </Drawing>
  ),
  'one-time-code': (
    <Drawing>
      <Rect x={10} y={34} width={20} height={32} />
      <Rect x={34} y={34} width={20} height={32} />
      <Rect x={58} y={34} width={20} height={32} />
      <Rect x={82} y={34} width={20} height={32} />
      <Rect x={106} y={34} width={20} height={32} />
      <Rect x={130} y={34} width={20} height={32} />
      <Bar x={16} y={48.5} width={8} tone="key" />
      <Bar x={40} y={48.5} width={8} tone="key" />
      <Bar x={64} y={48.5} width={8} tone="key" />
    </Drawing>
  ),
  slider: (
    <Drawing>
      <Bar x={20} y={48.5} width={120} />
      <Bar x={20} y={48} width={68} height={4} tone="key" />
      <Circle cx={88} cy={50} radius={9} tone="key" />
      <Circle cx={88} cy={50} radius={3} tone="fill" />
    </Drawing>
  ),
  'summary-list': (
    <Drawing>
      <Bar x={20} y={22} width={30} />
      <Bar x={64} y={22} width={44} />
      <Bar x={120} y={22} width={20} tone="key" />
      <Line x1={20} y1={34} x2={140} y2={34} />
      <Bar x={20} y={46} width={30} />
      <Bar x={64} y={46} width={54} />
      <Bar x={120} y={46} width={20} tone="key" />
      <Line x1={20} y1={58} x2={140} y2={58} />
      <Bar x={20} y={70} width={30} />
      <Bar x={64} y={70} width={36} />
      <Bar x={120} y={70} width={20} tone="key" />
    </Drawing>
  ),
  'text-input': (
    <Drawing>
      <Bar x={22} y={28} width={44} />
      <Rect x={22} y={38} width={116} height={30} />
      <Bar x={32} y={51.5} width={60} tone="fill" />
    </Drawing>
  ),
  textarea: (
    <Drawing>
      <Bar x={22} y={14} width={44} />
      <Rect x={22} y={24} width={116} height={62} />
      <Bar x={32} y={36} width={90} tone="fill" />
      <Bar x={32} y={46} width={76} tone="fill" />
      <Bar x={32} y={56} width={40} tone="fill" />
      <Path d="M130 82 l4 -4 M126 82 l8 -8" />
    </Drawing>
  ),
}

import type { ReactNode } from 'react'
import { Bar, Circle, Drawing, Line, Path, Rect } from './primitives.tsx'

function DialogPanel({ children }: { children: ReactNode }) {
  return (
    <>
      <Rect x={12} y={10} width={136} height={80} radius={6} tone="shell" />
      <Rect x={34} y={20} width={92} height={60} radius={6} tone="fill" />
      {children}
      <Bar x={44} y={43} width={72} />
      <Bar x={44} y={51} width={56} />
      <Rect x={68} y={62} width={26} height={12} radius={4} />
      <Rect x={98} y={62} width={20} height={12} radius={4} tone="key" />
    </>
  )
}

function Checkbox({ x, y, checked }: { x: number; y: number; checked: boolean }) {
  return (
    <>
      <Rect x={x} y={y} width={16} height={16} radius={4} tone={checked ? 'key' : 'fill'} />
      {checked ? (
        <Path d={`M ${x + 4} ${y + 8} L ${x + 7} ${y + 11} L ${x + 12} ${y + 5}`} tone="fill" />
      ) : null}
    </>
  )
}

function Radio({ cx, cy, checked }: { cx: number; cy: number; checked: boolean }) {
  return (
    <>
      <Circle cx={cx} cy={cy} radius={8} tone={checked ? 'key' : 'fill'} />
      {checked ? <Circle cx={cx} cy={cy} radius={3} tone="fill" /> : null}
    </>
  )
}

function Chevron({ x, y }: { x: number; y: number }) {
  return <Path d={`M ${x} ${y} L ${x + 4} ${y + 5} L ${x + 8} ${y}`} />
}

export const choicePreviews: Record<string, ReactNode> = {
  dialog: (
    <Drawing>
      <DialogPanel>
        <Bar x={44} y={29} width={40} />
      </DialogPanel>
    </Drawing>
  ),
  'alert-dialog': (
    <Drawing>
      <DialogPanel>
        <Path d="M 50 24 L 57 36 L 43 36 Z" tone="fill" />
        <Line x1={50} y1={28} x2={50} y2={31} />
        <Line x1={50} y1={33.5} x2={50} y2={33.5} />
        <Bar x={64} y={29} width={40} />
      </DialogPanel>
    </Drawing>
  ),
  menu: (
    <Drawing>
      <Rect x={20} y={12} width={56} height={20} radius={6} />
      <Bar x={30} y={20.5} width={24} />
      <Rect x={20} y={38} width={72} height={50} radius={6} tone="fill" />
      <Rect x={25} y={43} width={62} height={12} radius={4} tone="key" />
      <Bar x={33} y={47.5} width={34} tone="fill" />
      <Bar x={33} y={63} width={40} />
      <Bar x={33} y={75} width={28} />
    </Drawing>
  ),
  popover: (
    <Drawing>
      <Rect x={54} y={10} width={52} height={20} radius={6} tone="key" />
      <Bar x={64} y={18.5} width={32} tone="fill" />
      <Path d="M 74 42 L 80 36 L 86 42" tone="fill" />
      <Rect x={26} y={42} width={108} height={46} radius={6} tone="fill" />
      <Bar x={38} y={52} width={60} />
      <Bar x={38} y={60} width={44} />
      <Rect x={96} y={68} width={30} height={12} radius={4} tone="key" />
    </Drawing>
  ),
  tooltip: (
    <Drawing>
      <Rect x={44} y={16} width={72} height={20} radius={6} tone="key" />
      <Bar x={54} y={24.5} width={52} tone="fill" />
      <Path d="M 74 36 L 80 42 L 86 36" tone="key" />
      <Rect x={52} y={50} width={56} height={26} radius={6} />
      <Bar x={64} y={61.5} width={32} />
    </Drawing>
  ),
  combobox: (
    <Drawing>
      <Rect x={20} y={12} width={120} height={22} radius={6} tone="fill" />
      <Bar x={30} y={21.5} width={36} />
      <Line x1={70} y1={17} x2={70} y2={29} tone="key" />
      <Chevron x={124} y={20} />
      <Rect x={20} y={38} width={120} height={50} radius={6} tone="fill" />
      <Rect x={25} y={43} width={110} height={12} radius={4} tone="key" />
      <Bar x={33} y={47.5} width={50} tone="fill" />
      <Bar x={33} y={63} width={60} />
      <Bar x={33} y={75} width={44} />
    </Drawing>
  ),
  autocomplete: (
    <Drawing>
      <Rect x={20} y={14} width={120} height={22} radius={6} tone="fill" />
      <Bar x={30} y={23.5} width={22} />
      <Line x1={56} y1={19} x2={56} y2={31} tone="key" />
      <Rect x={20} y={40} width={120} height={34} radius={6} tone="fill" />
      <Rect x={25} y={45} width={110} height={12} radius={4} tone="key" />
      <Bar x={33} y={49.5} width={22} tone="fill" />
      <Bar x={59} y={49.5} width={40} tone="fill" />
      <Bar x={33} y={65} width={22} />
      <Bar x={59} y={65} width={30} />
    </Drawing>
  ),
  listbox: (
    <Drawing>
      <Rect x={20} y={12} width={120} height={22} radius={6} />
      <Bar x={30} y={21.5} width={48} />
      <Chevron x={124} y={20} />
      <Rect x={20} y={38} width={120} height={50} radius={6} tone="fill" />
      <Bar x={33} y={47.5} width={50} />
      <Rect x={25} y={55} width={110} height={12} radius={4} tone="key" />
      <Bar x={33} y={59.5} width={60} tone="fill" />
      <Path d="M 118 61 L 121 64 L 126 58" tone="fill" />
      <Bar x={33} y={75} width={44} />
    </Drawing>
  ),
  checkbox: (
    <Drawing>
      <Checkbox x={16} y={42} checked />
      <Bar x={40} y={48.5} width={28} />
      <Checkbox x={88} y={42} checked={false} />
      <Bar x={112} y={48.5} width={28} />
    </Drawing>
  ),
  'checkbox-group': (
    <Drawing>
      <Checkbox x={40} y={18} checked />
      <Bar x={64} y={24.5} width={56} />
      <Checkbox x={40} y={42} checked={false} />
      <Bar x={64} y={48.5} width={44} />
      <Checkbox x={40} y={66} checked />
      <Bar x={64} y={72.5} width={50} />
    </Drawing>
  ),
  'radio-group': (
    <Drawing>
      <Radio cx={48} cy={26} checked={false} />
      <Bar x={66} y={24.5} width={50} />
      <Radio cx={48} cy={50} checked />
      <Bar x={66} y={48.5} width={56} />
      <Radio cx={48} cy={74} checked={false} />
      <Bar x={66} y={72.5} width={42} />
    </Drawing>
  ),
  switch: (
    <Drawing>
      <Rect x={16} y={38} width={48} height={24} radius={12} tone="key" />
      <Circle cx={52} cy={50} radius={8} tone="fill" />
      <Rect x={96} y={38} width={48} height={24} radius={12} tone="fill" />
      <Circle cx={108} cy={50} radius={8} tone="fill" />
    </Drawing>
  ),
  toggle: (
    <Drawing>
      <Rect x={20} y={32} width={52} height={36} radius={6} tone="key" />
      <Rect x={38} y={42} width={16} height={16} radius={3} tone="fill" />
      <Rect x={88} y={32} width={52} height={36} radius={6} />
      <Rect x={106} y={42} width={16} height={16} radius={3} />
    </Drawing>
  ),
  toast: (
    <Drawing>
      <Rect x={8} y={8} width={144} height={84} radius={6} />
      <Bar x={20} y={20} width={60} />
      <Bar x={20} y={30} width={90} />
      <Bar x={20} y={40} width={40} />
      <Rect x={66} y={60} width={76} height={24} radius={6} tone="fill" />
      <Circle cx={78} cy={72} radius={5} tone="key" />
      <Bar x={90} y={67} width={40} />
      <Bar x={90} y={74} width={28} />
    </Drawing>
  ),
}

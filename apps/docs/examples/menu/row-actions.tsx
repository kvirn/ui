'use client'
import { Menu, VisuallyHidden } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useMenuTexts } from './texts.ts'

const cases = ['2024-118', '2024-131']

export function RowActions() {
  const { texts } = useMenuTexts()
  const headingId = useId()
  const [last, setLast] = useState('')
  return (
    <>
      <p id={headingId}>{texts.cases}</p>
      <ul aria-labelledby={headingId}>
        {cases.map((number) => (
          <li key={number}>
            {texts.case} {number}{' '}
            <Menu.Root>
              <Menu.Trigger className="kv-button">
                {texts.actions}
                <VisuallyHidden>
                  {' '}
                  {texts.forCase} {number}
                </VisuallyHidden>
              </Menu.Trigger>
              <Menu.Popup>
                <Menu.Item onSelect={() => setLast(`${texts.printing} ${number}.`)}>
                  {texts.print}
                </Menu.Item>
                <Menu.Item>{texts.download}</Menu.Item>
              </Menu.Popup>
            </Menu.Root>
          </li>
        ))}
      </ul>
      <output>{last}</output>
    </>
  )
}

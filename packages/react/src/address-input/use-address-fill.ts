import type { AddressDetails } from '@kvirn-ui/core'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'

export type AddressFillBox = 'line1' | 'postalCode' | 'city'

const fillBoxes = ['line1', 'postalCode', 'city'] as const

/** Which of the boxes a pick would leave empty, for the note and the announcement. */
export interface AddressFillGaps {
  postalCode: boolean
  city: boolean
}

export interface AddressFill {
  registerBox: (box: AddressFillBox, element: HTMLInputElement) => () => void
  registerCountry: (element: HTMLSelectElement) => () => void
  /** True when the pick is in another country than the Country part shows, and its select has that country. */
  willSwitchCountry: (details: AddressDetails) => boolean
  gaps: (details: AddressDetails) => AddressFillGaps
  fill: (details: AddressDetails) => void
  /** Writes the postal code and the city a result has, but only into a box that is empty or still holds what a pick left; returns which it wrote. */
  fillBlanks: (details: AddressDetails) => AddressFillGaps
  /** What the box holds now, trimmed; `''` when it is empty or not mounted. */
  valueOf: (box: AddressFillBox) => string
}

type Boxes = Partial<Record<AddressFillBox, HTMLInputElement>>
type Left = Partial<Record<AddressFillBox, string>>

// The value setter of the prototype, not the element's own: React's tracker then sees a real change.
function setNativeValue(element: HTMLInputElement | HTMLSelectElement, value: string): void {
  const prototype =
    element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, value)
}

/** Sets the value as typing would and sends the `input` event. `force`: also when the value is already there, as the combobox's own selection leaves it. */
export function writeInputValue(element: HTMLInputElement, value: string, force = false): void {
  if (element.value === value && !force) {
    return
  }
  if (element.value === value) {
    // React's tracker only reports a change from a value it knows is different.
    element.value = ''
  }
  setNativeValue(element, value)
  element.dispatchEvent(new Event('input', { bubbles: true }))
}

function isLeftByPick(boxes: Boxes, left: Left, name: AddressFillBox): boolean {
  const value = left[name]
  return value !== undefined && boxes[name]?.value === value
}

function canSwitchTo(select: HTMLSelectElement | undefined, country: string): boolean {
  return (
    select !== undefined &&
    select.value !== country &&
    Array.from(select.options).some((option) => option.value === country)
  )
}

function writePick(boxes: Boxes, left: Left, details: AddressDetails): void {
  for (const name of fillBoxes) {
    const element = boxes[name]
    if (element === undefined) {
      continue
    }
    // Line 1 holds the result's label after a pick, which is never the street: always written.
    if (details[name] !== '' || name === 'line1') {
      writeInputValue(element, details[name], name === 'line1')
      left[name] = element.value
    } else if (isLeftByPick(boxes, left, name)) {
      writeInputValue(element, '')
      delete left[name]
    }
  }
}

/**
 * Writes a pick into the Root's boxes the way typing does: the native value, then the event a
 * form library, a controlled `value` and the mask all listen to. Line 2 is never touched. A box
 * the pick has no value for is emptied only if the value in it is the one an earlier pick left.
 */
export function useAddressFill(): AddressFill {
  const boxes = useRef<Boxes>({})
  const left = useRef<Left>({})
  const countrySelect = useRef<HTMLSelectElement | undefined>(undefined)
  const pending = useRef<AddressDetails | undefined>(undefined)
  const [fillCount, setFillCount] = useState(0)

  // After the render that follows a country switch, so the postal code's mask is the new one's.
  useLayoutEffect(() => {
    const details = pending.current
    pending.current = undefined
    if (details !== undefined) {
      writePick(boxes.current, left.current, details)
    }
  }, [fillCount])

  return useMemo<AddressFill>(
    () => ({
      registerBox: (box, element) => {
        boxes.current[box] = element
        return () => {
          if (boxes.current[box] === element) {
            delete boxes.current[box]
          }
        }
      },
      registerCountry: (element) => {
        countrySelect.current = element
        return () => {
          if (countrySelect.current === element) {
            countrySelect.current = undefined
          }
        }
      },
      willSwitchCountry: (details) => canSwitchTo(countrySelect.current, details.country),
      gaps: (details) => {
        const isGap = (name: AddressFillBox) =>
          details[name] === '' &&
          (boxes.current[name]?.value === '' || isLeftByPick(boxes.current, left.current, name))
        return { postalCode: isGap('postalCode'), city: isGap('city') }
      },
      fillBlanks: (details) => {
        const written: AddressFillGaps = { postalCode: false, city: false }
        for (const name of ['postalCode', 'city'] as const) {
          const element = boxes.current[name]
          if (
            element !== undefined &&
            details[name] !== '' &&
            element.value !== details[name] &&
            (element.value === '' || isLeftByPick(boxes.current, left.current, name))
          ) {
            writeInputValue(element, details[name])
            left.current[name] = element.value
            written[name] = true
          }
        }
        return written
      },
      valueOf: (box) => boxes.current[box]?.value.trim() ?? '',
      fill: (details) => {
        const select = countrySelect.current
        if (select !== undefined && canSwitchTo(select, details.country)) {
          setNativeValue(select, details.country)
          select.dispatchEvent(new Event('change', { bubbles: true }))
        }
        pending.current = details
        setFillCount((count) => count + 1)
      },
    }),
    [],
  )
}

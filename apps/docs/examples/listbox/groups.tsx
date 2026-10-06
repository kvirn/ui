'use client'
import { Field, Listbox } from '@kvirn-ui/react'
import { useMemo } from 'react'
import { findMunicipality } from './data.ts'
import type { Municipality } from './data.ts'
import { useListboxTexts } from './texts.ts'

export function GroupedListbox() {
  const { texts, textLang } = useListboxTexts()
  const groups = useMemo(
    () => [
      {
        key: 'west',
        label: texts.regionWest,
        items: [findMunicipality('boras'), findMunicipality('goteborg')],
      },
      {
        key: 'east',
        label: texts.regionEast,
        items: [findMunicipality('stockholm'), findMunicipality('uppsala')],
      },
      {
        key: 'south',
        label: texts.regionSouth,
        items: [findMunicipality('lund'), findMunicipality('malmo')],
      },
    ],
    [texts],
  )
  return (
    <Field.Root required lang={textLang}>
      <Field.Label>{texts.municipality}</Field.Label>
      <Listbox.Root
        native="never"
        groups={groups}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        placeholder={texts.municipalityPlaceholder}
      >
        <Listbox.Trigger />
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => <Listbox.Option item={municipality} />}
          </Listbox.List>
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

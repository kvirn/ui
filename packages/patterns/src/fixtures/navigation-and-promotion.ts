// kv-lang-ok-file: long Finnish compound words prove wrapping without truncation
export interface TopTask {
  readonly label: string
  readonly href: string
}

/** Eight most-done tasks of the fictional municipality, as verb phrases (Top tasks, 6 or 8). */
export const kvirnbyTopTasks: readonly TopTask[] = [
  { label: 'Apply for a preschool place', href: '#preschool' },
  { label: 'Book a time at the recycling centre', href: '#recycling' },
  { label: 'Report a fault in a street or park', href: '#fault' },
  { label: 'Pay a parking fee', href: '#parking' },
  { label: 'Find your waste collection day', href: '#waste' },
  { label: 'Renew a library loan', href: '#library' },
  { label: 'Apply for a building permit', href: '#permit' },
  { label: 'Contact the contact centre', href: '#contact' },
]

/** Long Finnish task names, to prove wrapping without truncation (Top tasks, long Finnish). */
export const kvirnbyTopTasksFinnish: readonly TopTask[] = [
  { label: 'Hae kunnallista päivähoitopaikkaa lapselle', href: '#paivahoito' },
  { label: 'Varaa aika jäteaseman asiakaspalvelupisteeseen', href: '#jateasema' },
  { label: 'Ilmoita kadun tai puiston kunnossapitoon liittyvästä viasta', href: '#vika' },
  { label: 'Hae rakennuslupaa omakotitalon laajennukselle', href: '#rakennuslupa' },
  { label: 'Selvitä oman jätehuoltoalueesi tyhjennyspäivät', href: '#jatehuolto' },
  { label: 'Tarkista ja uudista kirjaston lainat verkossa', href: '#kirjasto' },
]

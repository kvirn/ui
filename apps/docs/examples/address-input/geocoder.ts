import { kvirnGeocoder } from '@kvirn-ui/map/kvirn'

// Kvirn's own map service looks up what a visitor types, once they type (the privacy page says so).
export const addressGeocoder = kvirnGeocoder({
  url: 'https://geo.kvirn.com',
  name: 'Kvirn’s map service',
  countries: ['se', 'fi', 'no', 'de'],
})

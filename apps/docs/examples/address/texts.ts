import { defineExampleTexts } from '../../components/local-example-texts.ts'

// Kvirnby is a made-up municipality. The phone number is in the series 070-174 06 05 to 99 that
// PTS reserved for fiction in 2020 (reported by SVT). The email address is on the reserved
// .example domain.
export const useAddressTexts = defineExampleTexts({
  en: {
    organisation: 'Kvirnby municipality',
    office: 'Citizen service',
    street: 'Storgatan 1',
    postalCity: '123 45 Kvirnby',
    phone: '+46 70 174 06 05',
    phoneHref: 'tel:+46701740605',
    email: 'contact@kvirnby.example',
    emailHref: 'mailto:contact@kvirnby.example',
    contactHeading: 'Contact us',
    visitingLabel: 'Visiting address',
    postalLabel: 'Postal address',
    registry: 'Registry office',
    box: 'Box 100',
    articleHeading: 'The recycling centre has new opening hours',
    articleText:
      'From 1 November the recycling centre is open until 19:00 on weekdays. On Saturdays it closes at 15:00.',
    articleContactLabel: 'Questions about this news item',
    articleOffice: 'Environment office',
  },
})

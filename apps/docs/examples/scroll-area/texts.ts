import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useScrollAreaTexts = defineExampleTexts({
  en: {
    feesLabel: 'Permit fees for 2026',
    headers: ['Permit', 'Category', 'Processing time', 'Fee', 'Appeal period'],
    rows: [
      ['Building permit', 'Housing', '10 weeks', '12,400 kr', '3 weeks'],
      ['Demolition permit', 'Housing', '6 weeks', '4,200 kr', '3 weeks'],
      ['Change of use', 'Commercial', '8 weeks', '9,800 kr', '3 weeks'],
      ['Sign permit', 'Commercial', '4 weeks', '1,900 kr', '3 weeks'],
      ['Outdoor serving', 'Hospitality', '5 weeks', '2,700 kr', '3 weeks'],
      ['Event permit', 'Culture', '3 weeks', '1,200 kr', '2 weeks'],
    ],
    shortText: 'Three fees, all shown at once: nothing here scrolls.',
  },
  sv: {
    feesLabel: 'Avgifter för tillstånd 2026',
    headers: ['Tillstånd', 'Kategori', 'Handläggningstid', 'Avgift', 'Överklagandetid'],
    rows: [
      ['Bygglov', 'Bostad', '10 veckor', '12 400 kr', '3 veckor'],
      ['Rivningslov', 'Bostad', '6 veckor', '4 200 kr', '3 veckor'],
      ['Ändrad användning', 'Verksamhet', '8 veckor', '9 800 kr', '3 veckor'],
      ['Skyltlov', 'Verksamhet', '4 veckor', '1 900 kr', '3 veckor'],
      ['Uteservering', 'Restaurang', '5 veckor', '2 700 kr', '3 veckor'],
      ['Evenemangstillstånd', 'Kultur', '3 veckor', '1 200 kr', '2 veckor'],
    ],
    shortText: 'Tre avgifter, alla syns på en gång: ingenting här rullar.',
  },
})

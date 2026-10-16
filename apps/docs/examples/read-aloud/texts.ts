import { defineExampleTexts } from '../../components/local-example-texts.ts'

const en = {
  allowRemoteVoices: 'Allow online voices',
  allowRemoteVoicesHelp:
    'Some browsers also offer online voices. The browser may then send the text to the voice’s provider, so leave this off for text with personal data.',
  title: 'Applying for a building permit',
  firstParagraph:
    'You apply for a building permit in the municipality where the building will stand. Start with the property designation and a short description of the work. Attach a site plan.',
  secondParagraph:
    'The case officer reviews the application within ten weeks. If something is missing you are told what, and the time stops until you reply.',
  skipped: 'Reference: case 2024-0113',
  roadWorksTitle: 'Road works on Storgatan',
  roadWorksText:
    'The road is closed to cars from 3 to 14 June. Buses stop at Torget instead. People on foot can pass on the north side.',
  wasteNotice:
    'Your collection day changes in the week of 22 December. Put the bin out the evening before.',
}

export const useReadAloudTexts = defineExampleTexts({ en })

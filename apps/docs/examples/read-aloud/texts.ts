import { defineExampleTexts } from '../../components/local-example-texts.ts'

const en = {
  allowRemoteVoices: 'Allow online voices',
  allowRemoteVoicesHelp:
    'Online voices are currently offered only by Google Chrome, with Google’s voices. The browser sends the text to Google to read it, so leave this off for text with personal data.',
  title: 'Applying for a building permit.',
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

const sv: typeof en = {
  allowRemoteVoices: 'Tillåt röster online',
  allowRemoteVoicesHelp:
    'Röster online erbjuds för närvarande bara av Google Chrome, med Googles röster. Webbläsaren skickar texten till Google för att läsa upp den, så låt den vara avstängd för text med personuppgifter.',
  title: 'Ansöka om bygglov',
  firstParagraph:
    'Du ansöker om bygglov i den kommun där byggnaden ska stå. Börja med fastighetsbeteckningen och en kort beskrivning av arbetet. Bifoga en situationsplan.',
  secondParagraph:
    'Handläggaren granskar ansökan inom tio veckor. Om något saknas får du veta vad, och tiden stannar tills du svarar.',
  skipped: 'Referens: ärende 2024-0113',
  roadWorksTitle: 'Vägarbete på Storgatan',
  roadWorksText:
    'Vägen är avstängd för bilar 3–14 juni. Bussarna stannar vid Torget i stället. Gående kan passera på norra sidan.',
  wasteNotice:
    'Din hämtningsdag ändras veckan som börjar 22 december. Ställ ut kärlet kvällen före.',
}

export const useReadAloudTexts = defineExampleTexts({ en })

export const swedishArticle = sv

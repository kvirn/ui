import { defineExampleTexts } from '../../components/local-example-texts.ts'

const en = {
  title: 'Applying for a building permit',
  firstParagraph:
    'You apply for a building permit in the municipality where the building will stand. Start with the property designation and a short description of the work. Attach a site plan.',
  secondParagraph:
    'The case officer reviews the application within ten weeks. If something is missing you are told what, and the time stops until you reply.',
  skipped: 'Reference: case 2024-0113',
}

const sv: typeof en = {
  title: 'Ansöka om bygglov',
  firstParagraph:
    'Du ansöker om bygglov i den kommun där byggnaden ska stå. Börja med fastighetsbeteckningen och en kort beskrivning av arbetet. Bifoga en situationsplan.',
  secondParagraph:
    'Handläggaren granskar ansökan inom tio veckor. Om något saknas får du veta vad, och tiden stannar tills du svarar.',
  skipped: 'Referens: ärende 2024-0113',
}

export const useReadAloudTexts = defineExampleTexts({ en })

export const swedishArticle = sv

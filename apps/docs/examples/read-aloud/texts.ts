import { defineExampleTexts } from '../../components/local-example-texts.ts'

const en = {
  title: 'Applying for a building permit',
  firstParagraph:
    'You apply for a building permit in the municipality where the building will stand. Start with the property designation and a short description of the work. Attach a site plan.',
  secondParagraph:
    'The case officer reviews the application within ten weeks. If something is missing you are told what, and the time stops until you reply.',
  barDemo: {
    navLabel: 'Site navigation',
    navHome: 'Home',
    navServices: 'Services',
    navContact: 'Contact',
    title: 'Road closed for water main repairs',
    paragraph:
      'Elm Street is closed to through traffic from 3 to 14 November while the water main is replaced. Buses use the marked diversion. Residents on Elm Street keep access to their driveways.',
  },
  cms: {
    relatedHeading: 'Related services',
    relatedText: 'Appeal a decision. Pay a fee. Change your contact details.',
    title: 'Your case decision',
    paragraph1:
      'The municipality has decided to grant your application for a disabled parking permit.',
    paragraph2: 'The permit is valid for three years and is sent to your registered address.',
  },
  language: {
    title: 'The original wording of a decision',
    intro:
      'This page is in English, but the decision itself is kept in the language it was issued in. In English, it says: “The decision becomes final three weeks after it is announced.”',
  },
  idlePanel: {
    title: 'How winter parking rules work',
    paragraph:
      'From 1 December to 31 March, parking on odd dates is allowed on the odd side of the street, and on even dates on the even side, so snow ploughs can get through. Move your car by 8 a.m.',
  },
}

export const useReadAloudTexts = defineExampleTexts({ en })

// Swedish text for the decision quoted in the "content language differs from the interface"
// use case. It is not in the page's own texts: the voice follows this text's own `lang`, never
// the surrounding English interface (3.1.2 Language of Parts).
// kv-lang-ok: the quoted decision is in Swedish on purpose, to show the voice follows the content's own language, never the page's interface language
export const swedishDecisionText =
  'Beslutet vinner laga kraft tre veckor efter att det har kungjorts.'

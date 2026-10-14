import { defineExampleTexts } from '../../components/local-example-texts.ts'

const en = {
  open: 'Filter cases',
  close: 'Close filters',
  apply: 'Show cases',
  search: 'Case number',
  filterLabel: 'Filter cases',
  stepHeading: ({ step, total, title }: { step: number; total: number; title: string }) =>
    `Step ${step} of ${total}: ${title}`,
  steps: [
    { title: 'Your details', body: 'Enter your name and how we can reach you.' },
    { title: 'The property', body: 'Enter the property designation and describe the work.' },
    { title: 'Attachments', body: 'Attach a site plan, then send your application.' },
  ],
  back: 'Previous step',
  next: 'Next step',
  openNotes: 'Notes on the case',
  notesLabel: 'Notes on case 2026-0142',
  note: 'New note',
  saveNote: 'Save note',
  closeNotes: 'Close the notes',
  openHelp: 'Help with the form',
  helpLabel: 'Help with the form',
  helpFirst:
    'You can apply for a building permit for a new house, an extension or a change of use.',
  helpSecond:
    'Have your property designation and a site plan ready. You can save the form and come back later.',
  helpThird: 'Applications are handled in the order they arrive. You get an answer in writing.',
  closeHelp: 'Close the help',
}

export const useFocusTexts = defineExampleTexts({ en })

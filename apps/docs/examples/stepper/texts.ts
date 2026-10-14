import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useStepperTexts = defineExampleTexts({
  en: {
    heading: 'Which vehicle is the permit for?',
    sectionName: 'Your vehicle',
    registrationNumber: 'Registration number',
    continue: 'Continue',
    back: 'Back',
    send: 'Send application',
    startAgain: 'Start again',
    sentTitle: 'Application sent',
    sentBody: 'We have received your application for a parking permit.',
    sections: [
      { name: 'Your details', question: 'What is your full name?', field: 'full-name' },
      {
        name: 'Your vehicle',
        question: 'What is the registration number?',
        field: 'registration-number',
      },
      { name: 'Where you park', question: 'Which street do you park on?', field: 'street' },
    ],
    owner: {
      question: 'Who is the vehicle registered to?',
      me: 'Me',
      company: 'A company I work for',
      family: 'A family member',
    },
  },
})

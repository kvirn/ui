import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useButtonTexts = defineExampleTexts({
  en: {
    saveDraft: 'Save draft',
    sendApplication: 'Send application',
    deleteDraft: 'Delete draft',
    dangerNote:
      'Delete buttons always need a confirmation step. They are shown together here only so you can compare them.',
    disabledReason: 'Fill in all required fields before you send.',
    applicantName: 'Your name',
    closeLabel: 'Close',
    saving: 'Saving your draft.',
    kinds: { primary: 'Primary', secondary: 'Secondary', danger: 'Danger', iconOnly: 'Icon only' },
    states: {
      rest: 'Default',
      keyboardFocus: 'Keyboard focus',
      disabledFocusable: 'Disabled but focusable, keyboard focus',
    },
  },
})

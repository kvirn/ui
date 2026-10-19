import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useButtonTexts = defineExampleTexts({
  en: {
    saving: 'Saving your draft.',
    kinds: { primary: 'Primary', secondary: 'Secondary', danger: 'Danger', iconOnly: 'Icon only' },
    states: {
      rest: 'Default',
      keyboardFocus: 'Keyboard focus',
      disabledFocusable: 'Disabled but focusable, keyboard focus',
    },
  },
})

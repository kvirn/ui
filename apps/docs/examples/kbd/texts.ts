// kv-lang-ok-file: Arabic text for the Language of Parts (3.1.2) example
import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useKbdTexts = defineExampleTexts({
  en: {
    moveBetweenFields: 'You can move between the fields with',
    copy: 'Copy the text with',
    shortcuts: 'Shortcuts in the editor',
    save: 'Save the draft',
    undo: 'Undo the last change',
    closeDialog: 'Close the dialog',
    printApplication: 'Print your application with',
    onAMac: 'On a Mac, use',
    // Arabic: "Press" … "to move between the fields." Written once, for the Arabic version of the page.
    arabicBefore: 'اضغط على',
    arabicAfter: 'للانتقال بين الحقول.',
  },
})

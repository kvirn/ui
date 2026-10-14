'use client'
import { Field } from '@kvirn-ui/react'
import { RichTextEditor } from '@kvirn-ui/rich-text'
import { useRichTextEditorTexts } from './texts.ts'

export function OwnToolbar() {
  const { texts } = useRichTextEditorTexts()
  return (
    <Field.Root>
      <Field.Label>{texts.addressLabel}</Field.Label>
      <RichTextEditor.Root defaultValue={`<p>${texts.addressLines.join('<br>')}</p>`}>
        <RichTextEditor.Toolbar>
          <RichTextEditor.DefaultControls />
          <RichTextEditor.Group aria-label={texts.lineBreakGroup}>
            <RichTextEditor.CommandButton
              label={texts.lineBreak}
              isAvailable={(editor) => editor.can().setHardBreak()}
              onPress={(editor) => {
                // No focus(): the keyboard stays on the button, and the command acts at the selection.
                editor.chain().setHardBreak().run()
              }}
            />
          </RichTextEditor.Group>
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content />
      </RichTextEditor.Root>
    </Field.Root>
  )
}

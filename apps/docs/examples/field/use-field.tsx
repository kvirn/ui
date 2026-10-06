'use client'
import { useField } from '@kvirn-ui/react'
import { useFieldTexts } from './texts.ts'

export function OwnElements() {
  const { texts, textLang } = useFieldTexts()
  const field = useField({ descriptions: ['helpText'] })
  return (
    <div {...field.rootProps} lang={textLang}>
      <label {...field.labelProps}>
        {texts.contactMethod}
        {field.optionalMarker === undefined ? null : (
          <>
            {' '}
            <span className="kv-field-optional">{field.optionalMarker}</span>
          </>
        )}
      </label>
      <select {...field.controlProps} className="kv-listbox-native" name="contact">
        <option value="email">{texts.contactByEmail}</option>
        <option value="phone">{texts.contactByPhone}</option>
      </select>
      <p {...field.getDescriptionProps('helpText')} className="kv-field-help-text">
        {texts.contactHelpText}
      </p>
    </div>
  )
}

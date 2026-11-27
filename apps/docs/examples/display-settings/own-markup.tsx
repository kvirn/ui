'use client'
import { useDisplaySettings } from '@kvirn/ui'

export function OwnMarkupDisplaySettings() {
  const { groups, isForcedColors, text } = useDisplaySettings()
  return (
    <div>
      {groups.map((group) => (
        <fieldset key={group.id}>
          <legend>{group.legend}</legend>
          {group.options.map((option) => (
            <div key={option.value}>
              <label>
                <input
                  type="radio"
                  name={group.name}
                  value={option.value}
                  checked={group.value === option.value}
                  onChange={() => group.select(option.value)}
                />{' '}
                {option.label}
              </label>
            </div>
          ))}
        </fieldset>
      ))}
      {isForcedColors ? <p>{text.forcedColors}</p> : null}
    </div>
  )
}

'use client'
import { Button, Fieldset, Grid, Icon, Stack } from '@kvirn-ui/react'
import { useExampleTexts } from '../../components/example-texts.tsx'
import { useButtonTexts } from './texts.ts'

const kinds = [
  { kind: 'primary', className: 'kv-button--primary' },
  { kind: 'secondary', className: undefined },
  { kind: 'danger', className: 'kv-button--danger' },
] as const

// `data-focus-visible` is what the Button sets itself after a Tab. Passing it here shows the ring
// without moving focus. On your own page, press Tab to see the same ring on a real button.
export function FocusStates() {
  const { texts } = useExampleTexts()
  const { texts: buttonTexts } = useButtonTexts()
  return (
    <Stack className="kv-stack--gap-4">
      {kinds.map(({ kind, className }) => (
        <Fieldset.Root key={kind}>
          <Fieldset.Legend>{buttonTexts.kinds[kind]}</Fieldset.Legend>
          <Grid.Root className="kv-grid--fit-sm kv-grid--gap-4">
            <div>
              <p>{buttonTexts.states.rest}</p>
              <Button className={className}>{texts.button.sendApplication}</Button>
            </div>
            <div>
              <p>{buttonTexts.states.keyboardFocus}</p>
              <Button className={className} data-focus-visible="">
                {texts.button.sendApplication}
              </Button>
            </div>
            <div>
              <p>{buttonTexts.states.disabledFocusable}</p>
              <Button className={className} disabled focusableWhenDisabled data-focus-visible="">
                {texts.button.sendApplication}
              </Button>
            </div>
          </Grid.Root>
        </Fieldset.Root>
      ))}
      <Fieldset.Root>
        <Fieldset.Legend>{buttonTexts.kinds.iconOnly}</Fieldset.Legend>
        <Grid.Root className="kv-grid--fit-sm kv-grid--gap-4">
          <div>
            <p>{buttonTexts.states.rest}</p>
            <Button className="kv-button--icon-only" aria-label={texts.button.closeLabel}>
              <Icon name="close" />
            </Button>
          </div>
          <div>
            <p>{buttonTexts.states.keyboardFocus}</p>
            <Button
              className="kv-button--icon-only"
              aria-label={texts.button.closeLabel}
              data-focus-visible=""
            >
              <Icon name="close" />
            </Button>
          </div>
        </Grid.Root>
      </Fieldset.Root>
    </Stack>
  )
}

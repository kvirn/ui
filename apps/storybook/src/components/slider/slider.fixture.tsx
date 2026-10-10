import { Field, InputGroup, NumberInput, Slider } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/Form/Slider. Each function is one example, and the story's "Show code"
// prints it (`showSource`), so it reads the way an adopter writes it. KvirnUI holds no form
// state: the `useState` here stands in for yours.

export interface SliderTexts {
  distanceLabel: string
  distanceHint: string
  distanceUnit: string
  distanceValueText: (value: number) => string
  distanceTooFar: string
  distanceDisabledHint: string
  radiusLabel: string
  longLabel: string
  volumeLabel: string
  volumeHint: string
  volumeValueText: (value: number) => string
}

const textsEn: SliderTexts = {
  distanceLabel: 'Distance from your address, in kilometres',
  distanceHint: 'From 0 to 50 km. You can also type a number.',
  distanceUnit: 'km',
  distanceValueText: (value) => `${value} km`,
  distanceTooFar: 'Enter a distance of 50 km or less',
  distanceDisabledHint: 'Add your address to search by distance.',
  radiusLabel: 'Search radius',
  longLabel:
    'Distance from your home address to the place where you want to look for a service, in kilometres',
  volumeLabel: 'Volume',
  volumeHint: 'From silent to loudest.',
  volumeValueText: (value) => `${value} percent`,
}

const textsSv: SliderTexts = {
  distanceLabel: 'Avstånd från din adress i kilometer',
  distanceHint: 'Från 0 till 50 km. Du kan också skriva ett tal.',
  distanceUnit: 'km',
  distanceValueText: (value) => `${value} km`,
  distanceTooFar: 'Ange ett avstånd på högst 50 km',
  distanceDisabledHint: 'Lägg till din adress för att söka på avstånd.',
  radiusLabel: 'Sökradie',
  longLabel:
    'Avstånd från din hemadress till den plats där du vill söka efter en tjänst, i kilometer',
  volumeLabel: 'Volym',
  volumeHint: 'Från tyst till högst.',
  volumeValueText: (value) => `${value} procent`,
}

const textsFi: SliderTexts = {
  distanceLabel: 'Etäisyys osoitteestasi kilometreinä',
  distanceHint: '0–50 km. Voit myös kirjoittaa luvun.',
  distanceUnit: 'km',
  distanceValueText: (value) => `${value} km`,
  distanceTooFar: 'Anna enintään 50 kilometrin etäisyys',
  distanceDisabledHint: 'Lisää osoitteesi, jotta voit hakea etäisyyden mukaan.',
  radiusLabel: 'Hakusäde',
  longLabel: 'Etäisyys kotiosoitteestasi paikkaan, josta haluat etsiä palvelua, kilometreinä',
  volumeLabel: 'Äänenvoimakkuus',
  volumeHint: 'Hiljaisesta kovimpaan.',
  volumeValueText: (value) => `${value} prosenttia`,
}

const textsNb: SliderTexts = {
  distanceLabel: 'Avstand fra adressen din i kilometer',
  distanceHint: 'Fra 0 til 50 km. Du kan også skrive et tall.',
  distanceUnit: 'km',
  distanceValueText: (value) => `${value} km`,
  distanceTooFar: 'Skriv inn en avstand på høyst 50 km',
  distanceDisabledHint: 'Legg til adressen din for å søke etter avstand.',
  radiusLabel: 'Søkeradius',
  longLabel:
    'Avstand fra hjemmeadressen din til stedet der du vil søke etter en tjeneste, i kilometer',
  volumeLabel: 'Volum',
  volumeHint: 'Fra stille til høyest.',
  volumeValueText: (value) => `${value} prosent`,
}

const textsNn: SliderTexts = {
  distanceLabel: 'Avstand frå adressa di i kilometer',
  distanceHint: 'Frå 0 til 50 km. Du kan også skrive eit tal.',
  distanceUnit: 'km',
  distanceValueText: (value) => `${value} km`,
  distanceTooFar: 'Skriv inn ein avstand på høgst 50 km',
  distanceDisabledHint: 'Legg til adressa di for å søkje etter avstand.',
  radiusLabel: 'Søkjeradius',
  longLabel:
    'Avstand frå heimeadressa di til staden der du vil søkje etter ei teneste, i kilometer',
  volumeLabel: 'Volum',
  volumeHint: 'Frå stille til høgast.',
  volumeValueText: (value) => `${value} prosent`,
}

const sliderTexts: Record<FormLocale, SliderTexts | undefined> = {
  sv: textsSv,
  fi: textsFi,
  nb: textsNb,
  nn: textsNn,
  en: textsEn,
}

/** The fixture text in a locale. */
export function sliderTextsFor(locale: FormLocale): {
  text: SliderTexts
  lang: 'en' | undefined
} {
  const text = sliderTexts[locale]
  return { text: text ?? textsEn, lang: text === undefined ? 'en' : undefined }
}

/**
 * Pattern A: a Slider with a NumberInput under it, both bound to one value. The NumberInput owns
 * the Field (its id is the label's `for`, and the error is on it), so the label click and an
 * error summary land on the precise control. The Slider has `aria-labelledby` and
 * `aria-describedby`, which opts it out of the Field. The Field's label and help text take no
 * `id`, so a `<span id>` inside each gives the Slider something to point at. Only the NumberInput
 * has a `name`, so the form sends the value once.
 */
export function DistanceWithNumberInput({ locale }: { locale: FormLocale }) {
  const { text, lang } = sliderTextsFor(locale)
  const labelId = useId()
  const hintId = useId()
  const [distance, setDistance] = useState('10')
  const [sliderValue, setSliderValue] = useState(10)
  const isTooFar = Number(distance) > 50
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root invalid={isTooFar}>
        <Field.Label marker="none">
          <span id={labelId}>{text.distanceLabel}</span>
        </Field.Label>
        <Slider
          aria-labelledby={labelId}
          aria-describedby={hintId}
          min={0}
          max={50}
          step={1}
          value={sliderValue}
          onValueChange={(value) => {
            setSliderValue(value)
            setDistance(String(value))
          }}
          valueText={text.distanceValueText}
        />
        <InputGroup.Root>
          <NumberInput
            name="distance"
            className="kv-input--width-4"
            value={distance}
            onValueChange={(next) => {
              setDistance(next)
              const parsed = Number(next)
              if (next.trim() !== '' && Number.isFinite(parsed)) {
                setSliderValue(Math.min(50, Math.max(0, parsed)))
              }
            }}
          />
          <InputGroup.Addon>{text.distanceUnit}</InputGroup.Addon>
        </InputGroup.Root>
        <Field.HelpText>
          <span id={hintId}>{text.distanceHint}</span>
        </Field.HelpText>
        <Field.ErrorMessage>{text.distanceTooFar}</Field.ErrorMessage>
      </Field.Root>
    </div>
  )
}

/**
 * Three sliders: a plain one, a disabled one with the reason in its help text, and a plain one
 * after it. Tab skips the disabled slider, and the arrows, Home, End, PageUp and PageDown move
 * the focused one.
 */
export function KeyboardSliders({ locale }: { locale: FormLocale }) {
  const { text, lang } = sliderTextsFor(locale)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root>
        <Field.Label marker="none">{text.volumeLabel}</Field.Label>
        <Slider name="volume" defaultValue={40} step={10} valueText={text.volumeValueText} />
        <Field.HelpText>{text.volumeHint}</Field.HelpText>
      </Field.Root>
      <Field.Root disabled>
        <Field.Label marker="none">{text.radiusLabel}</Field.Label>
        <Slider name="distance" max={50} defaultValue={10} valueText={text.distanceValueText} />
        <Field.HelpText>{text.distanceDisabledHint}</Field.HelpText>
      </Field.Root>
      <Field.Root>
        <Field.Label marker="none">{text.distanceLabel}</Field.Label>
        <Slider
          name="radius"
          max={50}
          step={5}
          defaultValue={15}
          valueText={text.distanceValueText}
        />
      </Field.Root>
    </div>
  )
}

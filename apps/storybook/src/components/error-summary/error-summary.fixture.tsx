import type { KvirnMessages } from '@kvirn-ui/i18n'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { se } from '@kvirn-ui/i18n/se'
import { sv } from '@kvirn-ui/i18n/sv'
import {
  Button,
  ErrorSummary,
  Field,
  Heading,
  KvirnProvider,
  RadioGroup,
  TextInput,
} from '@kvirn-ui/react'
import type { Decorator } from '@storybook/react-vite'

// The library's own strings follow the locale toolbar, through a provider with the catalog like
// an app's would. The visible fixture text is Swedish, or the story's own language.

const catalogs: Record<string, KvirnMessages> = { sv, fi, nb, nn, se, en }

export const withErrorSummaryLocale: Decorator = (Story, { globals }) => {
  const locale = String(globals['locale'] ?? 'sv')
  return (
    <KvirnProvider locale={locale} messages={catalogs[locale] ?? en}>
      <Story />
    </KvirnProvider>
  )
}

/**
 * The summary above the question: each link is the field's own error text and points at its
 * control, or at a group's first option. Ids start with `prefix`, because an id is unique on a
 * page and a Docs page shows every story in one document.
 */
export function ParkingForm({
  prefix,
  focusKey,
  prefixDocumentTitle,
  showErrors = true,
}: {
  prefix: string
  focusKey?: number
  prefixDocumentTitle?: boolean
  showErrors?: boolean
}) {
  const emailId = `${prefix}-epost`
  const firstOptionId = `${prefix}-giltighet-1`
  return (
    <div className="kv-stack">
      {showErrors ? (
        <ErrorSummary.Root focusKey={focusKey} prefixDocumentTitle={prefixDocumentTitle}>
          <ErrorSummary.Title />
          <ErrorSummary.List>
            <ErrorSummary.Item>
              <ErrorSummary.Link controlId={emailId}>Ange din e-postadress</ErrorSummary.Link>
            </ErrorSummary.Item>
            <ErrorSummary.Item>
              <ErrorSummary.Link controlId={firstOptionId}>
                Välj hur länge tillståndet ska gälla
              </ErrorSummary.Link>
            </ErrorSummary.Item>
          </ErrorSummary.List>
        </ErrorSummary.Root>
      ) : null}
      <Heading as="h1" size="heading-2">
        Ansök om boendeparkering
      </Heading>
      <form noValidate onSubmit={(event) => event.preventDefault()} className="kv-stack">
        <Field.Root controlId={emailId} invalid={showErrors}>
          <Field.Label>E-post</Field.Label>
          <TextInput type="email" autoComplete="email" />
          <Field.ErrorMessage>Ange din e-postadress</Field.ErrorMessage>
        </Field.Root>
        <RadioGroup.Root invalid={showErrors}>
          <RadioGroup.Legend>Hur länge behöver du tillståndet?</RadioGroup.Legend>
          <Field.Root controlId={firstOptionId}>
            <RadioGroup.Radio value="1" />
            <Field.Label>1 månad</Field.Label>
          </Field.Root>
          <Field.Root>
            <RadioGroup.Radio value="12" />
            <Field.Label>12 månader</Field.Label>
          </Field.Root>
          <RadioGroup.ErrorMessage>Välj hur länge tillståndet ska gälla</RadioGroup.ErrorMessage>
        </RadioGroup.Root>
        <Button type="submit" className="kv-button--primary">
          Skicka ansökan
        </Button>
      </form>
    </div>
  )
}

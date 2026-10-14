'use client'
import { Button, ErrorSummary, Field, Stack } from '@kvirn-ui/react'
import { RichTextEditor } from '@kvirn-ui/rich-text'
import { useId, useState } from 'react'
import { useRichTextEditorTexts } from './texts.ts'

export function InAForm() {
  const { texts } = useRichTextEditorTexts()
  const editorId = useId()
  const [submitCount, setSubmitCount] = useState(0)
  const [hasError, setHasError] = useState(false)
  const [posted, setPosted] = useState<string | undefined>()

  return (
    <Stack className="kv-stack--gap-8">
      {hasError ? (
        <ErrorSummary.Root focusKey={submitCount}>
          <ErrorSummary.Title />
          <ErrorSummary.List>
            <ErrorSummary.Item>
              <ErrorSummary.Link controlId={editorId}>{texts.newsError}</ErrorSummary.Link>
            </ErrorSummary.Item>
          </ErrorSummary.List>
        </ErrorSummary.Root>
      ) : null}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          const news = new FormData(event.currentTarget).get('news')
          const html = typeof news === 'string' ? news : ''
          setHasError(html === '')
          setPosted(html === '' ? undefined : html)
          setSubmitCount((count) => count + 1)
        }}
        onReset={() => {
          setHasError(false)
          setPosted(undefined)
        }}
      >
        <Field.Root controlId={editorId} required invalid={hasError}>
          <Field.Label>{texts.newsLabel}</Field.Label>
          <Field.Prose>
            <p>{texts.newsDescription}</p>
          </Field.Prose>
          <RichTextEditor.Root name="news" defaultValue={`<p>${texts.newsIntro}</p>`}>
            <RichTextEditor.Toolbar />
            <RichTextEditor.Content />
          </RichTextEditor.Root>
          <Field.ErrorMessage>{texts.newsError}</Field.ErrorMessage>
        </Field.Root>
        <div className="kv-button-group">
          <Button type="submit" className="kv-button--primary">
            {texts.publish}
          </Button>
          <Button type="reset">{texts.reset}</Button>
        </div>
      </form>
      <output>
        {posted === undefined ? null : (
          <>
            {texts.posted} <code>{posted}</code>
          </>
        )}
      </output>
    </Stack>
  )
}

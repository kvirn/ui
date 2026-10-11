'use client'

import { Button, ButtonGroup, Field, TextInput, mergeProps } from '@kvirn-ui/react'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'

export interface SiteSearchProps extends Omit<ComponentPropsWithRef<'search'>, 'children'> {
  /** Where the form goes: a GET to the search page. */
  action: string
  /** The field's label, such as `Search the site`. Visually hidden: the button's word is the visible cue. */
  label: string
  /** The button's word, such as `Search`: its name and its visible text (2.5.3). */
  children: ReactNode
  /** The query parameter. Default `q`. */
  name?: string | undefined
  /** The query already searched for, on the results page. */
  defaultValue?: string | undefined
}

/**
 * The site search: a `<search>` landmark around a GET form, with a `Field` and a `Button` joined
 * into one strip by an attached `ButtonGroup`. The field is named by `label`, and the button says
 * its word (2.5.3). Contract: site-search.a11y.md.
 */
export function SiteSearch({
  action,
  label,
  children,
  name = 'q',
  defaultValue,
  ...otherProps
}: SiteSearchProps): ReactElement {
  return (
    <search {...mergeProps(otherProps, { className: 'kv-site-search' })}>
      <form action={action} method="get" className="kv-site-search-form">
        <ButtonGroup className="kv-button-group--attached">
          <Field.Root className="kv-site-search-field">
            <Field.Label marker="none">{label}</Field.Label>
            <TextInput type="search" name={name} defaultValue={defaultValue} autoComplete="off" />
          </Field.Root>
          <Button type="submit">{children}</Button>
        </ButtonGroup>
      </form>
    </search>
  )
}
SiteSearch.displayName = 'SiteSearch'

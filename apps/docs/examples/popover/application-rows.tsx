'use client'
import { Heading, Popover, VisuallyHidden } from '@kvirn-ui/react'
import { useId } from 'react'
import { usePopoverTexts } from './texts.ts'

function ApplicationDetails({
  number,
  received,
  status,
}: {
  number: string
  received: string
  status: string
}) {
  const { texts } = usePopoverTexts()
  const headingId = useId()
  return (
    <Popover.Root>
      <Popover.Trigger className="kv-button">
        {texts.showDetails}
        {/* The visible word comes first, so the name starts with what people see. The hidden
            part tells the buttons apart in a list of the page's controls. */}
        <VisuallyHidden>
          {' '}
          {texts.forApplication} {number}
        </VisuallyHidden>
      </Popover.Trigger>
      {/* Named by its own heading, so the name and what the popup shows can't drift apart. */}
      <Popover.Popup aria-labelledby={headingId}>
        <Heading as="h4" id={headingId}>
          {texts.application} {number}
        </Heading>
        <p>
          {texts.receivedOn}: {received}
        </p>
        <p>
          {texts.status}: {status}
        </p>
        <Popover.Close className="kv-button">{texts.close}</Popover.Close>
      </Popover.Popup>
    </Popover.Root>
  )
}

export function ApplicationRows() {
  const { texts } = usePopoverTexts()
  const headingId = useId()
  return (
    <>
      <p id={headingId}>{texts.applications}</p>
      <ul aria-labelledby={headingId}>
        <li>
          2024-118{' '}
          <ApplicationDetails
            number="2024-118"
            received={texts.firstReceived}
            status={texts.firstStatus}
          />
        </li>
        <li>
          2024-131{' '}
          <ApplicationDetails
            number="2024-131"
            received={texts.secondReceived}
            status={texts.secondStatus}
          />
        </li>
      </ul>
    </>
  )
}

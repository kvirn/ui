'use client'
import { Link, Popover, Toolbar } from '@kvirn-ui/react'
import { useToolbarTexts } from './texts.ts'

export function OtherControls() {
  const { texts } = useToolbarTexts()
  return (
    <Toolbar.Root aria-label={texts.formatting}>
      <Toolbar.Button>{texts.undo}</Toolbar.Button>
      <Toolbar.Toggle>{texts.bold}</Toolbar.Toggle>
      <Popover.Root>
        <Toolbar.Item as={Popover.Trigger} className="kv-button">
          {texts.addLink}
        </Toolbar.Item>
        <Popover.Popup aria-label={texts.addLink}>
          <form onSubmit={(event) => event.preventDefault()}>
            <label>
              {texts.address}
              <br />
              <input name="address" type="url" className="kv-input" />
            </label>
            <p>
              <button type="submit" className="kv-button kv-button--primary">
                {texts.add}
              </button>{' '}
              <Popover.Close className="kv-button">{texts.cancel}</Popover.Close>
            </p>
          </form>
        </Popover.Popup>
      </Popover.Root>
      <Toolbar.Item as={Link.Root} href="#accessibility">
        {texts.guide}
      </Toolbar.Item>
    </Toolbar.Root>
  )
}

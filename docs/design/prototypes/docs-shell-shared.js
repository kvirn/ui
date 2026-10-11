// Throwaway prototype script for docs/design/docs-shell-concepts.md. Not library code.
// - [data-p-disclosure]: a button that shows and hides the element named by aria-controls.
// - [data-p-narrow]: the same, for a panel that is always shown from 64rem.
// - [data-p-topics]: a group of disclosures where one opens at a time, Escape closes the open one
//   and returns focus to its button, and focus or a press leaving the group closes it
//   (main-menu.a11y.md).
// - input[name="p-scheme"] / [name="p-contrast"]: set the theme attributes on <html>.
// The pages are complete without it: html gets data-p-js only when it runs, and CSS shows every
// panel without it.
document.documentElement.setAttribute('data-p-js', '')

// A [data-p-narrow] button (Menu, "Pages in …") only exists below 64rem: from 64rem its panel is
// always shown, so the script never hides it there (reset.css keeps [hidden] hidden).
const wide = matchMedia('(width >= 64rem)')
const isShown = (button) =>
  button.getAttribute('aria-expanded') === 'true' || (button.hasAttribute('data-p-narrow') && wide.matches)
wide.addEventListener('change', () => {
  for (const button of document.querySelectorAll('[data-p-narrow]')) {
    document.getElementById(button.getAttribute('aria-controls')).hidden = !isShown(button)
  }
})

for (const button of document.querySelectorAll('[data-p-disclosure]')) {
  const panel = document.getElementById(button.getAttribute('aria-controls'))
  if (!panel) continue
  panel.hidden = !isShown(button)
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true'
    const group = button.closest('[data-p-topics]')
    if (open && group) {
      for (const other of group.querySelectorAll('[data-p-disclosure][aria-expanded="true"]')) {
        if (other !== button) setOpen(other, false)
      }
    }
    setOpen(button, open)
  })
}

function setOpen(button, open) {
  button.setAttribute('aria-expanded', String(open))
  document.getElementById(button.getAttribute('aria-controls')).hidden = !isShown(button)
}

for (const group of document.querySelectorAll('[data-p-topics]')) {
  const closeAll = () => {
    for (const b of group.querySelectorAll('[data-p-disclosure][aria-expanded="true"]')) setOpen(b, false)
  }
  group.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    const open = group.querySelector('[data-p-disclosure][aria-expanded="true"]')
    if (!open) return
    const panel = document.getElementById(open.getAttribute('aria-controls'))
    const inPanel = panel.contains(document.activeElement)
    setOpen(open, false)
    if (inPanel) open.focus()
  })
  group.addEventListener('focusout', (event) => {
    if (!group.contains(event.relatedTarget) && event.relatedTarget !== null) closeAll()
  })
  document.addEventListener('pointerdown', (event) => {
    if (!group.contains(event.target)) closeAll()
  })
}

const root = document.documentElement
const prefersDark = matchMedia('(prefers-color-scheme: dark)')
function applyScheme() {
  const scheme = document.querySelector('input[name="p-scheme"]:checked')?.value ?? 'system'
  const contrast = document.querySelector('input[name="p-contrast"]:checked')?.value ?? 'standard'
  root.dataset.kvColorScheme = scheme === 'system' ? (prefersDark.matches ? 'dark' : 'light') : scheme
  root.dataset.kvContrast = contrast
}
for (const input of document.querySelectorAll('input[name="p-scheme"], input[name="p-contrast"]')) {
  input.addEventListener('change', applyScheme)
}
prefersDark.addEventListener('change', applyScheme)
applyScheme()

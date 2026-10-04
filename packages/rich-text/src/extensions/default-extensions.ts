import type { Extensions } from '@tiptap/core'
import { Image as ImageNode } from '@tiptap/extension-image'
import type { ImageOptions } from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import type { TableKitOptions } from '@tiptap/extension-table'
import StarterKit from '@tiptap/starter-kit'
import type { StarterKitOptions } from '@tiptap/starter-kit'
import { isAllowedImageSource } from './image-sources.ts'
import type { ImageSourceOptions } from './image-sources.ts'
import { KvirnKeymap } from './kvirn-keymap.ts'

export interface DefaultExtensionsOptions {
  /**
   * Heading options, or `false` for no headings. Default: levels 2 and 3. There is no H1: the
   * page owns it. `{ levels: [2, 3, 4] }` adds a level, and the block picker follows.
   */
  heading?: StarterKitOptions['heading'] | undefined
  /**
   * The Link mark's options, or `false` for no links. Default: `openOnClick` off (a click puts the
   * caret in the link, and the Link control edits it), autolinking on, only `https`, `http`,
   * `mailto` and `tel` addresses (and relative ones), and no `target`.
   */
  link?: StarterKitOptions['link'] | undefined
  /**
   * The table options, or `false` for no tables. Default: not resizable (column dragging has no
   * keyboard alternative). A table gets a header row from the Table control.
   */
  table?: Partial<TableKitOptions> | false | undefined
  /**
   * The Image node's options, or `false` for no images. Default: a block image, no `data:`
   * addresses, and sources limited by `imageSources`.
   */
  image?: Partial<ImageOptions> | false | undefined
  /**
   * The origins images may come from. Default: the page's own origin and relative addresses only,
   * so a text never makes readers' browsers fetch from a third-party server. Add origins
   * (`['https://bilder.example.se']`), or `['*']` for any.
   */
  imageSources?: ImageSourceOptions['sources'] | undefined
  /**
   * Typing rules: `# ` makes a heading, `* ` a list, `**x**` bold. Default `false`, because they
   * change the text without telling a screen reader user.
   */
  inputRules?: boolean | undefined
  /** Any other StarterKit option, such as `underline: false` or `codeBlock: false`. */
  starterKit?: Partial<StarterKitOptions> | undefined
  /** `false` leaves out the Kvirn keymap: Tab, Escape, Alt+F10, Mod-k and the AltGr guard. */
  keymap?: boolean | undefined
}

const allowedLinkProtocols = ['https', 'http', 'mailto', 'tel']

/** Removes whitespace and control characters: they can hide a scheme (`java\tscript:`). */
function withoutInvisibleCharacters(address: string): string {
  let cleaned = ''
  for (const character of address) {
    const code = character.codePointAt(0) ?? 0
    if (code > 0x1f && code !== 0x7f && !/\s/u.test(character)) {
      cleaned += character
    }
  }
  return cleaned
}

/**
 * Whether a link address is allowed: relative, or one of the allowed schemes (`https`, `http`,
 * `mailto` and `tel` unless you pass others). Never `javascript:`, `data:` or `ftp:`.
 */
export function isAllowedLinkAddress(
  address: string,
  protocols: ReadonlyArray<string | { scheme: string }> = allowedLinkProtocols,
): boolean {
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(withoutInvisibleCharacters(address))?.[1]
  if (scheme === undefined) {
    return true
  }
  return protocols.some(
    (protocol) =>
      (typeof protocol === 'string' ? protocol : protocol.scheme).toLowerCase() ===
      scheme.toLowerCase(),
  )
}

/** Tiptap's default for typing a link, narrowed to the allowed addresses. */
function shouldAutoLink(address: string, protocols: ReadonlyArray<string | { scheme: string }>) {
  if (!isAllowedLinkAddress(address, protocols)) {
    return false
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(address)) {
    return true
  }
  const host = (address.includes('@') ? (address.split('@').pop() ?? '') : address).split(
    /[/?#:]/,
  )[0]
  return host !== undefined && host.includes('.') && !/^\d{1,3}(\.\d{1,3}){3}$/.test(host)
}

/**
 * The extensions a Kvirn editor starts with (design spec §6.6, Plan 0036): StarterKit with
 * headings 2 and 3 and typing rules off, safe links, tables without column dragging, images from
 * your own origin, and the Kvirn keymap. Every part is configurable or `false`, and you add your
 * own with the ordinary Tiptap API:
 *
 * @example
 * <RichTextEditor.Root
 *   extensions={[...defaultExtensions({ table: false, heading: { levels: [2, 3, 4] } }), Highlight]}
 * >
 */
export function defaultExtensions({
  heading,
  link,
  table,
  image,
  imageSources,
  inputRules = false,
  starterKit,
  keymap = true,
}: DefaultExtensionsOptions = {}): Extensions {
  const extensions: Extensions = [
    StarterKit.configure({
      heading: heading ?? { levels: [2, 3] },
      link:
        link === false
          ? false
          : {
              openOnClick: false,
              autolink: true,
              defaultProtocol: 'https',
              // No `target`: a link opens where the reader decides, and `rel` has nothing to guard.
              HTMLAttributes: { target: null, rel: null, class: null },
              isAllowedUri: (address, { protocols }) =>
                isAllowedLinkAddress(address, [...allowedLinkProtocols, ...protocols]),
              shouldAutoLink: (address) => shouldAutoLink(address, allowedLinkProtocols),
              ...link,
            },
      ...starterKit,
    }),
  ]
  if (table !== false) {
    extensions.push(TableKit.configure({ table: { resizable: false }, ...table }))
  }
  if (image !== false) {
    extensions.push(
      ImageNode.configure({ inline: false, allowBase64: false, ...image }).extend({
        // An address outside the allowed sources never becomes an image: not pasted, not set
        // from stored content, not inserted by a command.
        parseHTML() {
          return [
            {
              tag: 'img[src]',
              getAttrs: (element: HTMLElement | string) =>
                typeof element !== 'string' &&
                isAllowedImageSource(element.getAttribute('src'), {
                  sources: imageSources,
                  allowBase64: this.options.allowBase64,
                })
                  ? null
                  : false,
            },
          ]
        },
        addCommands() {
          const commands = this.parent?.()
          return {
            ...commands,
            setImage: (options) => (props) => {
              const insert = commands?.setImage?.(options)
              const isAllowed = isAllowedImageSource(options.src, {
                sources: imageSources,
                allowBase64: this.options.allowBase64,
              })
              return isAllowed && insert !== undefined && insert(props)
            },
          }
        },
      }),
    )
  }
  if (keymap) {
    extensions.push(KvirnKeymap.configure({ inputRules }))
  }
  return extensions
}

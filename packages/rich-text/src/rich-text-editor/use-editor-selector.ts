import type { Editor } from '@tiptap/core'
import { useCallback, useSyncExternalStore } from 'react'

/**
 * Reads one flat value (a string, number or boolean) from the editor, and re-renders only when it
 * changes, as `useEditorState` does. It exists because Tiptap's `useEditorState` doesn't read the
 * editor again when it changes from `null` to the editor Tiptap creates after the first render: its
 * value stays as it was on the first render until the next transaction, so every control would be
 * stuck unavailable and the Table group missing until the user typed. `fallback` is the value
 * while there is no editor.
 */
export function useEditorSelector<Value extends string | number | boolean>(
  editor: Editor | null,
  selector: (editor: Editor) => Value,
  fallback: Value,
): Value {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (editor === null) {
        return () => {}
      }
      editor.on('transaction', onChange)
      editor.on('update', onChange)
      return () => {
        editor.off('transaction', onChange)
        editor.off('update', onChange)
      }
    },
    [editor],
  )
  return useSyncExternalStore(
    subscribe,
    () => (editor === null ? fallback : selector(editor)),
    () => fallback,
  )
}

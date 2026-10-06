import { createContext } from 'react'
import type { ToastController } from './toast-controller.ts'

/** The document's toast controller, made by the outermost provider. `null` outside any provider. */
export const ToastContext = createContext<ToastController | null>(null)

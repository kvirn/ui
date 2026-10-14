'use client'
import { Button, useToast } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useToastTexts } from './texts.ts'

export function JobInProgress() {
  const { texts } = useToastTexts()
  const toast = useToast()
  const [status, setStatus] = useState<'idle' | 'working' | 'ready'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const exportReport = () => {
    setStatus('working')
    toast.show({ id: 'export', busy: true, title: texts.preparingReport })
    // A real app waits for the server. The same id replaces the busy toast with the result.
    timer.current = setTimeout(() => {
      setStatus('ready')
      toast.show({ id: 'export', variant: 'success', title: texts.reportReady })
    }, 3000)
  }

  return (
    <>
      <p>
        {status === 'idle'
          ? texts.noReportYet
          : status === 'working'
            ? texts.preparingReport
            : texts.reportReady}
      </p>
      <Button busy={status === 'working'} onClick={exportReport}>
        {texts.exportReport}
      </Button>
    </>
  )
}

import { useEffect, useState } from 'react'
import type { LiveEvent } from '../types'

export function useLiveEvents(onEvent?: (e: LiveEvent) => void) {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const es = new EventSource('/api/events')
    es.onopen = () => setConnected(true)
    es.onerror = () => setConnected(false)
    es.onmessage = (e) => {
      const event: LiveEvent = JSON.parse(e.data)
      onEvent?.(event)
    }
    return () => { es.close(); setConnected(false) }
  }, [onEvent])

  return { connected }
}

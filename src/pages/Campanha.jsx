import React, { useEffect, useState } from 'react'
import { Campaigns } from './Campaigns'
import { Sessions } from './Sessions'

export function Campanha({ initialView = 'historia', onViewChange }) {
  const [activeView, setActiveView] = useState(initialView)

  useEffect(() => {
    if (initialView) setActiveView(initialView)
  }, [initialView])

  useEffect(() => {
    onViewChange?.(activeView)
  }, [activeView, onViewChange])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {activeView === 'historia' && <Campaigns />}
      {activeView === 'sessoes' && <Sessions />}
    </div>
  )
}

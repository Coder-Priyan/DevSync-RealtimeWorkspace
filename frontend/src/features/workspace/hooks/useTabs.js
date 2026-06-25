// features/workspace/hooks/useTabs.js
// Manages which files are open as tabs and which is active.

import { useState, useCallback } from 'react'

export function useTabs() {
  const [tabs,      setTabs]      = useState([])
  const [activeTab, setActiveTab] = useState(null)

  const openTab = useCallback((file) => {
    setTabs((prev) => {
      const exists = prev.find((t) => t._id === file._id)
      if (exists) return prev
      return [...prev, file]
    })
    setActiveTab(file._id)
  }, [])

  const closeTab = useCallback((fileId, e) => {
    e?.stopPropagation()
    setTabs((prev) => {
      const remaining = prev.filter((t) => t._id !== fileId)
      // If closing the active tab, switch to the nearest one
      if (activeTab === fileId) {
        const idx  = prev.findIndex((t) => t._id === fileId)
        const next = remaining[idx] ?? remaining[idx - 1] ?? null
        setActiveTab(next?._id ?? null)
      }
      return remaining
    })
  }, [activeTab])

  const switchTab = useCallback((fileId) => {
    setActiveTab(fileId)
  }, [])

  return { tabs, activeTab, openTab, closeTab, switchTab }
}
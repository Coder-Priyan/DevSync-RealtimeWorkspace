// features/workspace/components/Editor/TabBar.jsx

import { getFileColor } from '@/utils/fileHelpers'

export function TabBar({ tabs, activeTab, onSwitch, onClose }) {
  if (tabs.length === 0) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      backgroundColor: '#161B22',
      borderBottom: '1px solid #30363D',
      overflowX: 'auto', flexShrink: 0,
      scrollbarWidth: 'none',
    }}>
      {tabs.map((tab) => {
        const isActive = tab._id === activeTab
        const dotColor = getFileColor(tab.name)

        return (
          <div
            key={tab._id}
            onClick={() => onSwitch(tab._id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '0 14px', height: '36px',
              cursor: 'pointer', flexShrink: 0,
              borderRight: '1px solid #30363D',
              backgroundColor: isActive ? '#0D1117' : 'transparent',
              borderBottom: isActive ? '2px solid #7C5CFC' : '2px solid transparent',
              transition: 'background-color 80ms ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = '#21262D'
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            {/* File color dot */}
            <div style={{
              width: '7px', height: '7px', borderRadius: '2px',
              backgroundColor: dotColor, flexShrink: 0,
            }} />

            {/* Filename */}
            <span style={{
              fontSize: '12px',
              color: isActive ? '#E6EDF3' : '#8B949E',
              whiteSpace: 'nowrap',
            }}>
              {tab.name}
            </span>

            {/* Close button */}
            <button
              onClick={(e) => onClose(tab._id, e)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#484F58', padding: '0', display: 'flex',
                marginLeft: '2px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#E6EDF3'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#484F58'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}

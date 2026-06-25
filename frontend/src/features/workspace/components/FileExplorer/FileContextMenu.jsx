// features/workspace/components/FileExplorer/FileContextMenu.jsx

import { useEffect } from 'react'

const menuItem = (label, onClick, danger = false) => ({ label, onClick, danger })

export function FileContextMenu({ contextMenu, onClose }) {
  if (!contextMenu) return null

  const { x, y, node } = contextMenu
  const isFolder = node.type === 'folder'

  const items = isFolder
    ? [
        menuItem('New File',    () => { alert('New file — Stage 6'); onClose() }),
        menuItem('New Folder',  () => { alert('New folder — Stage 6'); onClose() }),
        menuItem('Rename',      () => { alert('Rename — Stage 6'); onClose() }),
        menuItem('Delete',      () => { alert('Delete — Stage 6'); onClose() }, true),
      ]
    : [
        menuItem('Rename',      () => { alert('Rename — Stage 6'); onClose() }),
        menuItem('Delete',      () => { alert('Delete — Stage 6'); onClose() }, true),
      ]

  // Close on click outside or Escape
  useEffect(() => {
    const handle = (e) => {
      if (e.type === 'keydown' && e.key !== 'Escape') return
      onClose()
    }
    window.addEventListener('mousedown', handle)
    window.addEventListener('keydown', handle)
    return () => {
      window.removeEventListener('mousedown', handle)
      window.removeEventListener('keydown', handle)
    }
  }, [onClose])

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed', zIndex: 100,
        left: x, top: y,
        backgroundColor: '#21262D',
        border: '1px solid #30363D',
        borderRadius: '6px',
        padding: '4px',
        minWidth: '150px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          style={{
            display: 'block', width: '100%', textAlign: 'left',
            padding: '7px 12px', borderRadius: '4px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '12px', fontFamily: 'inherit',
            color: item.danger ? '#F85149' : '#C9D1D9',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#30363D'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

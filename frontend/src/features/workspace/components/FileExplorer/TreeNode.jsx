// features/workspace/components/FileExplorer/TreeNode.jsx

import { getFileColor, getFileExtension } from '@/utils/fileHelpers'

const INDENT = 12

function FolderIcon({ isOpen }) {
  return isOpen ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#E3B341" stroke="none">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#8B949E" stroke="none">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function FileColorDot({ filename }) {
  const color = getFileColor(filename)
  return (
    <div style={{
      width: '8px', height: '8px', borderRadius: '2px',
      backgroundColor: color, flexShrink: 0,
    }} />
  )
}

export function TreeNode({ node, depth = 0, selectedFileId, onFileClick, onToggleFolder, onContextMenu }) {
  const isSelected = node._id === selectedFileId
  const paddingLeft = 12 + depth * INDENT

  if (node.type === 'folder') {
    return (
      <div>
        {/* Folder row */}
        <div
          onClick={() => onToggleFolder(node._id)}
          onContextMenu={(e) => onContextMenu(e, node)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: `3px 8px 3px ${paddingLeft}px`,
            cursor: 'pointer', borderRadius: '4px',
            color: '#C9D1D9', fontSize: '12px',
            transition: 'background-color 80ms ease',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#21262D'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {/* Chevron */}
          <svg
            width="10" height="10" viewBox="0 0 24 24"
            fill="none" stroke="#484F58" strokeWidth="2.5" strokeLinecap="round"
            style={{
              flexShrink: 0,
              transform: node.isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 120ms ease',
            }}
          >
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <FolderIcon isOpen={node.isOpen} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {node.name}
          </span>
        </div>

        {/* Children */}
        {node.isOpen && node.children?.map((child) => (
          <TreeNode
            key={child._id}
            node={child}
            depth={depth + 1}
            selectedFileId={selectedFileId}
            onFileClick={onFileClick}
            onToggleFolder={onToggleFolder}
            onContextMenu={onContextMenu}
          />
        ))}
      </div>
    )
  }

  // File row
  return (
    <div
      onClick={() => onFileClick(node)}
      onContextMenu={(e) => onContextMenu(e, node)}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: `3px 8px 3px ${paddingLeft}px`,
        cursor: 'pointer', borderRadius: '4px',
        backgroundColor: isSelected ? '#1C1B2E' : 'transparent',
        color: isSelected ? '#E6EDF3' : '#C9D1D9',
        fontSize: '12px',
        transition: 'background-color 80ms ease',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = '#21262D'
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      <FileColorDot filename={node.name} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {node.name}
      </span>
    </div>
  )
}

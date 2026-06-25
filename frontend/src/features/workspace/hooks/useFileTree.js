// features/workspace/hooks/useFileTree.js
// Stage 5 — static mock data only. Real API wiring in Stage 6.

import { useState } from 'react'

const MOCK_TREE = [
  {
    _id: 'folder-1', type: 'folder', name: 'src', isOpen: true,
    children: [
      { _id: 'file-1', type: 'file', name: 'App.jsx',   folderId: 'folder-1' },
      { _id: 'file-2', type: 'file', name: 'main.jsx',  folderId: 'folder-1' },
      { _id: 'file-3', type: 'file', name: 'index.css', folderId: 'folder-1' },
    ],
  },
  {
    _id: 'folder-2', type: 'folder', name: 'public', isOpen: false,
    children: [
      { _id: 'file-4', type: 'file', name: 'index.html', folderId: 'folder-2' },
    ],
  },
  { _id: 'file-5', type: 'file', name: 'package.json', folderId: null },
  { _id: 'file-6', type: 'file', name: '.gitignore',   folderId: null },
]

export function useFileTree() {
  const [tree,           setTree]           = useState(MOCK_TREE)
  const [selectedFileId, setSelectedFileId] = useState(null)
  const [contextMenu,    setContextMenu]    = useState(null) // { x, y, node }

  // Toggle folder open/closed
  const toggleFolder = (folderId) => {
    const toggle = (nodes) => nodes.map((n) =>
      n._id === folderId
        ? { ...n, isOpen: !n.isOpen }
        : n.children
          ? { ...n, children: toggle(n.children) }
          : n
    )
    setTree(toggle)
  }

  const selectFile = (fileId) => setSelectedFileId(fileId)

  const openContextMenu = (e, node) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, node })
  }

  const closeContextMenu = () => setContextMenu(null)

  return {
    tree,
    selectedFileId,
    contextMenu,
    toggleFolder,
    selectFile,
    openContextMenu,
    closeContextMenu,
  }
}
// features/workspace/components/FileExplorer/FileTree.jsx

import { TreeNode } from './TreeNode'

export function FileTree({ tree, selectedFileId, onFileClick, onToggleFolder, onContextMenu }) {
  return (
    <div style={{ padding: '4px 0' }}>
      {tree.map((node) => (
        <TreeNode
          key={node._id}
          node={node}
          depth={0}
          selectedFileId={selectedFileId}
          onFileClick={onFileClick}
          onToggleFolder={onToggleFolder}
          onContextMenu={onContextMenu}
        />
      ))}
    </div>
  )
}

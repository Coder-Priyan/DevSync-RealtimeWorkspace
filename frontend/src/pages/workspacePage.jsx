// pages/WorkspacePage.jsx

import { useParams } from 'react-router-dom'

import { useFileTree }  from '@/features/workspace/hooks/useFileTree'
import { useTabs }      from '@/features/workspace/hooks/useTabs'
import { useEditor }    from '@/features/workspace/hooks/useEditor'
import { usePresence }  from '@/features/workspace/hooks/usePresence'

import { WorkspaceNavbar }  from '@/features/workspace/components/Toolbar/WorkspaceNavbar'
import { FileTree }         from '@/features/workspace/components/FileExplorer/FileTree'
import { FileContextMenu }  from '@/features/workspace/components/FileExplorer/FileContextMenu'
import { TabBar }           from '@/features/workspace/components/Editor/TabBar'
import { EditorPane }       from '@/features/workspace/components/Editor/EditorPane'
import { EditorPlaceHolder } from '@/features/workspace/components/Editor/EditorPlaceHolder'
import { PresenceList }     from '@/features/workspace/components/CollabPane/PresenceList'
import { InviteForm }       from '@/features/workspace/components/CollabPane/InviteForm'

// Repo name is hardcoded for Stage 5 — Stage 6 fetches it from API
const MOCK_REPO_NAME = 'my-project'

function WorkspacePage() {
  const { repoId } = useParams()

  const { tree, selectedFileId, contextMenu, toggleFolder, selectFile, openContextMenu, closeContextMenu } = useFileTree()
  const { tabs, activeTab, openTab, closeTab, switchTab } = useTabs()
  const { getContent, setContent, syncStatus } = useEditor()
  const { onlineUsers } = usePresence()

  // When a file is clicked in the tree
  const handleFileClick = (file) => {
    selectFile(file._id)
    openTab(file)
  }

  // Active file object (for EditorPane)
  const activeFile = tabs.find((t) => t._id === activeTab) ?? null

  return (
    <div style={{
      height: '100vh', maxHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', backgroundColor: '#0D1117',
    }}>

      {/* ── Top navbar ──────────────────────────────────────────────────── */}
      <WorkspaceNavbar
        repoName={MOCK_REPO_NAME}
        onlineUsers={onlineUsers}
        syncStatus={syncStatus}
      />

      {/* ── Main body ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* ── Left: File Explorer ─────────────────────────────────────── */}
        <div style={{
          width: '220px', flexShrink: 0,
          backgroundColor: '#161B22',
          borderRight: '1px solid #30363D',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Explorer header */}
          <div style={{
            padding: '10px 12px 6px',
            fontSize: '10px', fontWeight: '600',
            color: '#484F58', letterSpacing: '0.08em',
            textTransform: 'uppercase', flexShrink: 0,
          }}>
            Explorer
          </div>

          {/* File tree — scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <FileTree
              tree={tree}
              selectedFileId={selectedFileId}
              onFileClick={handleFileClick}
              onToggleFolder={toggleFolder}
              onContextMenu={openContextMenu}
            />
          </div>
        </div>

        {/* ── Center: Editor ──────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onSwitch={switchTab}
            onClose={closeTab}
          />
          {activeFile ? (
            <EditorPane
              file={activeFile}
              content={getContent(activeFile._id)}
              onChange={setContent}
            />
          ) : (
            <EditorPlaceHolder repoName={MOCK_REPO_NAME} />
          )}
        </div>

        {/* ── Right: Collab Panel ─────────────────────────────────────── */}
        <div style={{
          width: '200px', flexShrink: 0,
          backgroundColor: '#161B22',
          borderLeft: '1px solid #30363D',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <PresenceList onlineUsers={onlineUsers} />
            <div style={{ height: '1px', backgroundColor: '#30363D', margin: '8px 0' }} />
            <InviteForm />
          </div>
        </div>

      </div>

      {/* ── Status bar ──────────────────────────────────────────────────── */}
      <div style={{
        height: '24px', flexShrink: 0,
        backgroundColor: '#161B22',
        borderTop: '1px solid #30363D',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', color: '#484F58' }}>
            {onlineUsers.length} online
          </span>
          {activeFile && (
            <span style={{ fontSize: '11px', color: '#484F58' }}>
              {activeFile.name}
            </span>
          )}
        </div>
        <span style={{ fontSize: '11px', color: '#484F58' }}>
          DevSync
        </span>
      </div>

      {/* Context menu — rendered at root level so it escapes panel overflow */}
      <FileContextMenu contextMenu={contextMenu} onClose={closeContextMenu} />

    </div>
  )
}

export default WorkspacePage

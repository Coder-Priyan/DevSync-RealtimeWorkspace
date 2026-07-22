// frontend/src/pages/WorkspacePage.jsx
//
// Phase 4 changes vs previous version:
//   1. useSocket moved BEFORE useEditor in hook call order
//   2. socket destructured from useSocket
//   3. socket passed into useEditor(repoId, socket)
//   4. useEffect wires setRemoteUpdateCallback with activeTab

import { useState, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useSocket }     from '@/features/workspace/hooks/useSocket'
import { useWorkspace }  from '@/features/workspace/hooks/useWorkspace'
import { useFileTree }   from '@/features/workspace/hooks/useFileTree'
import { useTabs }       from '@/features/workspace/hooks/useTabs'
import { useEditor }     from '@/features/workspace/hooks/useEditor'

import { WorkspaceNavbar }   from '@/features/workspace/components/Toolbar/WorkspaceNavbar'
import { FileTree }          from '@/features/workspace/components/FileExplorer/FileTree'
import { FileContextMenu }   from '@/features/workspace/components/FileExplorer/FileContextMenu'
import { TabBar }            from '@/features/workspace/components/Editor/TabBar'
import { EditorPane }        from '@/features/workspace/components/Editor/EditorPane'
import { EditorPlaceHolder } from '@/features/workspace/components/Editor/EditorPlaceHolder'
import { PresenceList }      from '@/features/workspace/components/CollabPane/PresenceList'
import { InviteForm }        from '@/features/workspace/components/CollabPane/InviteForm'
import { ReceivedInvitations } from '@/features/workspace/components/CollabPane/ReceivedInvitations'

function NewItemInput({ placeholder, onConfirm, onCancel }) {
  const [value, setValue] = useState('')
  const inputRef = useCallback((el) => el?.focus(), [])

  const confirm = () => {
    if (value.trim()) onConfirm(value.trim())
    else onCancel()
  }

  return (
    <div style={{ padding: '4px 12px' }}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter')  confirm()
          if (e.key === 'Escape') onCancel()
        }}
        onBlur={onCancel}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '5px 8px', borderRadius: '4px',
          backgroundColor: '#21262D', border: '1px solid #7C5CFC',
          color: '#E6EDF3', fontSize: '12px', outline: 'none',
          fontFamily: 'inherit', boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

function RenameInput({ node, onConfirm, onCancel }) {
  const [value, setValue] = useState(node.name)
  const inputRef = useCallback((el) => { if (el) { el.focus(); el.select() } }, [])

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter')  onConfirm(node._id, value.trim())
        if (e.key === 'Escape') onCancel()
      }}
      onBlur={() => onConfirm(node._id, value.trim())}
      onClick={(e) => e.stopPropagation()}
      style={{
        width: '100%', padding: '2px 6px', borderRadius: '3px',
        backgroundColor: '#21262D', border: '1px solid #7C5CFC',
        color: '#E6EDF3', fontSize: '12px', outline: 'none',
        fontFamily: 'inherit', boxSizing: 'border-box',
      }}
    />
  )
}

function WorkspacePage() {
  const { repoId } = useParams()

  const { repo } = useWorkspace(repoId)

  const {
    tree, isLoading: treeLoading, error: treeError,
    selectedFileId, contextMenu, renamingNode, isFolderOpen,
    selectFile, toggleFolder, openContextMenu, closeContextMenu,
    setRenamingNode,
    handleCreateFile, handleCreateFolder,
    handleRenameFile, handleRenameFolder,
    handleDeleteFile, handleDeleteFolder,
    reloadTree,
  } = useFileTree(repoId)

  const { tabs, activeTab, openTab, closeTab, switchTab } = useTabs()

  // ── useSocket BEFORE useEditor ────────────────────────────────────────────
  // Critical ordering: useSocket creates the socket and returns it in state.
  // useEditor receives it as a parameter so its EDITOR_UPDATE listener
  // registers on the real socket, not on null.
  const { isConnected, onlineUsers, socket } = useSocket(repoId, reloadTree)

  // ── useEditor receives socket as param ────────────────────────────────────
  const {
    getContent,
    setContent,
    loadFile,
    isFileLoading,
    syncStatus,
    ignoreRemoteChange,
    setEditorRef,
    applyRemoteUpdate,
    setRemoteUpdateCallback,
  } = useEditor(repoId, socket)

  const [newItem, setNewItem] = useState(null)

  // ── Wire remote update callback ───────────────────────────────────────────
  // useEditor doesn't know activeTab — WorkspacePage does.
  // This callback is called by useEditor when EDITOR_UPDATE arrives.
  useEffect(() => {
    setRemoteUpdateCallback((fileId, content) => {
      console.log("[Workspace] Remote callback", {
        incomingFile: fileId,
        activeTab,
      })
      applyRemoteUpdate(fileId, content, activeTab)
    })
  }, [setRemoteUpdateCallback, applyRemoteUpdate, activeTab])

  const handleFileClick = useCallback((file) => {
    selectFile(file._id)
    openTab(file)
    loadFile(file)
  }, [selectFile, openTab, loadFile])

  const handleContextCreateFile   = (parentId) => setNewItem({ type: 'file',   parentId })
  const handleContextCreateFolder = (parentId) => setNewItem({ type: 'folder', parentId })
  const handleContextRename       = (node)     => setRenamingNode(node)

  const handleContextDelete = async (node) => {
    const confirmed = window.confirm(
      `Delete "${node.name}"${node.type === 'folder' ? ' and all its contents' : ''}?`
    )
    if (!confirmed) return
    if (node.type === 'file')   await handleDeleteFile(node._id)
    if (node.type === 'folder') await handleDeleteFolder(node._id)
  }

  const handleNewItemConfirm = async (name) => {
    if (newItem.type === 'file')   await handleCreateFile(name, newItem.parentId)
    if (newItem.type === 'folder') await handleCreateFolder(name, newItem.parentId)
    setNewItem(null)
  }

  const activeFile = tabs.find((t) => t._id === activeTab) ?? null

  console.log("🔥 ONLINE USERS:", onlineUsers)

  return (
    <div style={{
      height: '100vh', maxHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', backgroundColor: '#0D1117',
    }}>

      <WorkspaceNavbar
        repoName={repo?.name ?? '…'}
        onlineUsers={onlineUsers}
        syncStatus={isConnected ? syncStatus : 'error'}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* ── Left: File Explorer ─────────────────────────────────────── */}
        <div style={{
          width: '220px', flexShrink: 0,
          backgroundColor: '#161B22',
          borderRight: '1px solid #30363D',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 12px 6px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexShrink: 0,
          }}>
            <span style={{
              fontSize: '10px', fontWeight: '600',
              color: '#484F58', letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              Explorer
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setNewItem({ type: 'file', parentId: null })}
                title="New File"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#484F58', padding: '2px', display: 'flex' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#E6EDF3'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#484F58'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </button>
              <button
                onClick={() => setNewItem({ type: 'folder', parentId: null })}
                title="New Folder"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#484F58', padding: '2px', display: 'flex' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#E6EDF3'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#484F58'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  <line x1="12" y1="11" x2="12" y2="17"/>
                  <line x1="9" y1="14" x2="15" y2="14"/>
                </svg>
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {treeLoading && (
              <div style={{ padding: '16px 12px', fontSize: '11px', color: '#484F58' }}>
                Loading files…
              </div>
            )}
            {treeError && (
              <div style={{ padding: '16px 12px', fontSize: '11px', color: '#F85149' }}>
                {treeError}
              </div>
            )}
            {!treeLoading && !treeError && (
              <FileTree
                tree={tree}
                selectedFileId={selectedFileId}
                renamingNode={renamingNode}
                isFolderOpen={isFolderOpen}
                onFileClick={handleFileClick}
                onToggleFolder={toggleFolder}
                onContextMenu={openContextMenu}
                onRenameConfirm={(id, name, type) =>
                  type === 'file'
                    ? handleRenameFile(id, name)
                    : handleRenameFolder(id, name)
                }
                onRenameCancel={() => setRenamingNode(null)}
                RenameInput={RenameInput}
              />
            )}
            {newItem && (
              <NewItemInput
                placeholder={newItem.type === 'file' ? 'filename.js' : 'folder-name'}
                onConfirm={handleNewItemConfirm}
                onCancel={() => setNewItem(null)}
              />
            )}
          </div>
        </div>

        {/* ── Center: Editor ────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onSwitch={switchTab}
            onClose={closeTab}
          />
          {activeFile ? (
            isFileLoading(activeFile._id) ? (
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#0D1117', color: '#484F58', fontSize: '12px',
              }}>
                Loading…
              </div>
            ) : (
              <EditorPane
                file={activeFile}
                content={getContent(activeFile._id)}
                onChange={setContent}
                ignoreRemoteChange={ignoreRemoteChange}
                onEditorMount={setEditorRef}
                repoId={repoId}
              />
            )
          ) : (
            <EditorPlaceHolder repoName={repo?.name} />
          )}
        </div>

        {/* ── Right: Collab Panel ───────────────────────────────────── */}
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
            <InviteForm repoId={repoId} />
            <ReceivedInvitations />
          </div>
        </div>

      </div>

      {/* ── Status bar ──────────────────────────────────────────────── */}
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
        <span style={{ fontSize: '11px', color: '#484F58' }}>DevSync</span>
      </div>

      <FileContextMenu
        contextMenu={contextMenu}
        onClose={closeContextMenu}
        onCreateFile={handleContextCreateFile}
        onCreateFolder={handleContextCreateFolder}
        onRename={handleContextRename}
        onDelete={handleContextDelete}
      />

    </div>
  )
}

export default WorkspacePage

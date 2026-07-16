// frontend/src/features/workspace/components/Editor/EditorPane.jsx
//
// Phase 4: replaces the plain textarea with Monaco Editor.
// Wires onDidChangeModelContent with the ignoreRemoteChange guard.
//
// Install dependency if not already installed:
//   npm install @monaco-editor/react

import { useRef, useEffect } from 'react'
import MonacoEditor from '@monaco-editor/react'
import { getLanguageFromFilename, MONACO_DEFAULT_OPTIONS, DEVSYNC_MONACO_THEME } from '@/lib/monaco'
import { EVENTS } from '@/constants/events'
import { getSocket } from '@/lib/socket'

export function EditorPane({
  file,
  content,
  onChange,          // (fileId, value) → called for LOCAL changes only
  ignoreRemoteChange, // ref — true when a remote update is being applied
  onEditorMount,     // (editor, monaco) → registers the editor instance in useEditor
  repoId,
}) {
  if (!file) return null

  const language = getLanguageFromFilename(file.name)

  // ── Handle Monaco mount ───────────────────────────────────────────────────
  const handleMount = (editor, monaco) => {
    console.log("[Editor] Monaco mounted")
    // Register DevSync dark theme
    monaco.editor.defineTheme('devsync-dark', DEVSYNC_MONACO_THEME)
    monaco.editor.setTheme('devsync-dark')

    // Pass editor instance up to useEditor via setEditorRef
    if (onEditorMount) onEditorMount(editor)

    // Emit EDITOR_JOIN so the backend records which file this socket is viewing
    const socket = getSocket()
    if (socket?.connected && repoId && file._id) {
      console.log("[Editor] Emitting EDITOR_JOIN", repoId, file._id)
      socket.emit(EVENTS.EDITOR_JOIN, {
        repositoryId: repoId,
        fileId:       file._id,
      })
    }

    // ── Register change listener ────────────────────────────────────────────
    // This is where the ignoreRemoteChange guard prevents the loop.
    //
    // Flow for LOCAL change:
    //   User types → event fires → ignoreRemoteChange.current === false
    //   → onChange(fileId, value) called → socket emit + auto-save
    //
    // Flow for REMOTE change:
    //   applyRemoteUpdate() sets ignoreRemoteChange.current = true
    //   → editor.setValue(content) → event fires
    //   → ignoreRemoteChange.current === true → SKIP onChange
    //   → applyRemoteUpdate() resets ignoreRemoteChange.current = false
    editor.onDidChangeModelContent(() => {
      console.log("[Editor] Local typing")
      if (ignoreRemoteChange.current) {
        // This change came from applyRemoteUpdate — do not re-emit
        return
      }

      const value = editor.getValue()
      onChange(file._id, value)
    })
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#0D1117' }}>
      <MonacoEditor
        height="100%"
        language={language}
        value={content}
        options={MONACO_DEFAULT_OPTIONS}
        onMount={handleMount}
        // Do NOT pass onChange prop to MonacoEditor directly.
        // We use onDidChangeModelContent inside handleMount instead,
        // because it gives us access to ignoreRemoteChange.current.
        // The MonacoEditor onChange prop does not have access to the ref.
        theme="devsync-dark"
      />
    </div>
  )
}

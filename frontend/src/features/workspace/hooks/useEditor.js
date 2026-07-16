// frontend/src/features/workspace/hooks/useEditor.js
//
// Phase 4 fix: socket received as parameter instead of getSocket() at effect time.
//
// Root cause of previous bug:
//   useEditor ran before useSocket created the socket singleton.
//   getSocket() returned null → EDITOR_UPDATE listener never registered.
//
// Fix:
//   useSocket stores socket in state and returns it.
//   WorkspacePage passes it down: useEditor(repoId, socket)
//   useEditor effects depend on [socket] — re-run when null → instance.
//
// ignoreRemoteChange guard prevents infinite loop:
//   Local change → setContent() → socket.emit(EDITOR_CHANGE) ✓
//   Remote change → applyRemoteUpdate() sets ignoreRemoteChange = true
//               → editor.setValue() fires onDidChangeModelContent
//               → guard check skips socket.emit ✓
//               → ignoreRemoteChange reset to false ✓

import { useState, useCallback, useRef, useEffect } from 'react'
import { getFileById, updateFileContent } from '@/services/file.service'
import { EVENTS } from '@/constants/events'

console.log("[CP2-FE] EVENTS.EDITOR_CHANGE =", EVENTS.EDITOR_CHANGE)
console.log("[CP2-FE] EVENTS.EDITOR_UPDATE =", EVENTS.EDITOR_UPDATE)

const AUTOSAVE_DEBOUNCE_MS = 800

export function useEditor(repoId, socket) {
  const [contentMap,   setContentMap]   = useState({})
  const [loadingFiles, setLoadingFiles] = useState(new Set())
  const [syncStatus,   setSyncStatus]   = useState('saved')

  const timers = useRef({})

  // Ref — must be read synchronously in Monaco's change handler.
  // State would be too slow (async batching).
  const ignoreRemoteChange = useRef(false)

  // Monaco editor instance — set by EditorPane after mount.
  const editorRef = useRef(null)

  const setEditorRef = useCallback((editor) => {
    editorRef.current = editor
  }, [])

  // ── loadFile — fetch content from REST API ────────────────────────────────
  const loadFile = useCallback(async (file) => {
    if (contentMap[file._id] !== undefined) return

    setLoadingFiles((prev) => new Set(prev).add(file._id))
    try {
      const data = await getFileById(repoId, file._id)
      const content = data.file?.content ?? data.content ?? ''
      setContentMap((prev) => ({ ...prev, [file._id]: content }))
    } catch (err) {
      console.error('[Editor] loadFile failed:', err)
      setContentMap((prev) => ({ ...prev, [file._id]: '' }))
    } finally {
      setLoadingFiles((prev) => {
        const next = new Set(prev)
        next.delete(file._id)
        return next
      })
    }
  }, [repoId, contentMap])

  const getContent = useCallback((fileId) => {
    return contentMap[fileId] ?? ''
  }, [contentMap])

  const isFileLoading = useCallback((fileId) => {
    return loadingFiles.has(fileId)
  }, [loadingFiles])

  // ── setContent — local keystrokes only ───────────────────────────────────
  // Uses socket param directly — no getSocket() call.
  // socket in dependency array ensures callback stays current as socket changes.
  const setContent = useCallback((fileId, value) => {
    console.log("[useEditor] setContent called", fileId, value)
    setContentMap((prev) => ({ ...prev, [fileId]: value }))
    setSyncStatus('saving')

    console.log("[useEditor] About to emit", {
      connected: socket?.connected,
      socketId: socket?.id,
      event: EVENTS.EDITOR_CHANGE,
      repoId,
      fileId,
    })

    // Immediate emit for realtime feel — no debounce on socket
    if (socket?.connected && repoId) {
      socket.emit(EVENTS.EDITOR_CHANGE, {
        repositoryId: repoId,
        fileId,
        content: value,
    })

    console.log("[CP1] emit called")
  } else {
    console.log("[CP1] emit SKIPPED", {
      connected: socket?.connected,
      repoId,
     socketId: socket?.id,
    })
}

    // Debounced REST auto-save — persistence layer
    if (timers.current[fileId]) clearTimeout(timers.current[fileId])

    timers.current[fileId] = setTimeout(async () => {
      try {
        await updateFileContent(repoId, fileId, value)
        setSyncStatus('saved')
      } catch (err) {
        console.error('[Editor] auto-save failed:', err)
        setSyncStatus('error')
      }
    }, AUTOSAVE_DEBOUNCE_MS)
  }, [repoId, socket])

  // ── applyRemoteUpdate — applies EDITOR_UPDATE to Monaco ──────────────────
  // All steps are synchronous — no race condition between guard set/reset.
  const applyRemoteUpdate = useCallback((fileId, content, activeFileId) => {
    if (fileId !== activeFileId) {
      // Background tab — update contentMap so switching tabs shows latest content
      setContentMap((prev) => ({ ...prev, [fileId]: content }))
      return
    }

    ignoreRemoteChange.current = true

    if (editorRef.current) {
      const position = editorRef.current.getPosition()
      editorRef.current.setValue(content)
      if (position) {
        editorRef.current.setPosition(position)
      }
    }

    ignoreRemoteChange.current = false

    setContentMap((prev) => ({ ...prev, [fileId]: content }))
  }, [])

  // ── onRemoteUpdateRef — callback bridge to WorkspacePage ─────────────────
  // WorkspacePage knows activeTab; useEditor does not.
  const onRemoteUpdateRef = useRef(null)

  const setRemoteUpdateCallback = useCallback((cb) => {
    onRemoteUpdateRef.current = cb
  }, [])

  // ── EDITOR_UPDATE listener ────────────────────────────────────────────────
  // Previously broken: getSocket() returned null because useEditor ran before
  // useSocket created the singleton. Now socket is passed as a parameter.
  //
  // When socket is null → effect returns early.
  // When useSocket sets socket state → WorkspacePage re-renders → useEditor
  // receives real socket → this effect re-runs → listener registers correctly.
  useEffect(() => {
    if (!socket) return

    console.log("[useEditor] EDITOR_UPDATE listener registered on socket:", socket.id)

    const handleEditorUpdate = ({ fileId, content }) => {
      console.log("STEP 3 Event Received", fileId)
      console.log(`[Editor] Remote update received | file: ${fileId} | bytes: ${content?.length}`)
      if (onRemoteUpdateRef.current) {
        onRemoteUpdateRef.current(fileId, content)
      }
    }

    socket.on(EVENTS.EDITOR_UPDATE, handleEditorUpdate)

    return () => {
      socket.off(EVENTS.EDITOR_UPDATE, handleEditorUpdate)
    }
  }, [socket])

  return {
    getContent,
    setContent,
    loadFile,
    isFileLoading,
    syncStatus,
    ignoreRemoteChange,
    setEditorRef,
    applyRemoteUpdate,
    setRemoteUpdateCallback,
  }
}
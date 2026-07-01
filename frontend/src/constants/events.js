// frontend/src/constants/events.js
// Must stay in sync with backend/src/sockets/events.js exactly.

export const EVENTS = {
  // ── Connection lifecycle ─────────────────────────────────────────────────
  CONNECT:           'connect',
  DISCONNECT:        'disconnect',
  CONNECT_ERROR:     'connect_error',
  RECONNECT:         'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',

  // ── Workspace ────────────────────────────────────────────────────────────
  WORKSPACE_JOIN:   'workspace:join',
  WORKSPACE_LEAVE:  'workspace:leave',
  WORKSPACE_JOINED: 'workspace:joined',

  // ── Presence (Phase 2) ──────────────────────────────────────────────────
  PRESENCE_UPDATE: 'presence:update',
  PRESENCE_LIST:   'presence:list',

  // ── File operations (Phase 3) ────────────────────────────────────────────
  FILE_CREATED: 'file:created',
  FILE_RENAMED: 'file:renamed',
  FILE_DELETED: 'file:deleted',

  // ── Folder operations (Phase 3) ──────────────────────────────────────────
  FOLDER_CREATED: 'folder:created',
  FOLDER_RENAMED: 'folder:renamed',
  FOLDER_DELETED: 'folder:deleted',

  // ── Editor (Phase 4) ─────────────────────────────────────────────────────
  CODE_CHANGE: 'editor:code-change',
  CURSOR_MOVE: 'editor:cursor-move',
  FILE_OPENED: 'editor:file-opened',

  // ── System ───────────────────────────────────────────────────────────────
  ERROR: 'error',
}
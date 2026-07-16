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

  // ── Presence ─────────────────────────────────────────────────────────────
  PRESENCE_UPDATE: 'presence:update',
  PRESENCE_LIST:   'presence:list',

  // ── File operations ───────────────────────────────────────────────────────
  FILE_CREATED: 'file:created',
  FILE_RENAMED: 'file:renamed',
  FILE_DELETED: 'file:deleted',

  // ── Folder operations ─────────────────────────────────────────────────────
  FOLDER_CREATED: 'folder:created',
  FOLDER_RENAMED: 'folder:renamed',
  FOLDER_DELETED: 'folder:deleted',

  // ── Editor (Phase 4) ──────────────────────────────────────────────────────
  EDITOR_JOIN:   'editor:join',
  EDITOR_CHANGE: 'editor:change',
  EDITOR_UPDATE: 'editor:update',

  // ── System ───────────────────────────────────────────────────────────────
  ERROR: 'error',
}
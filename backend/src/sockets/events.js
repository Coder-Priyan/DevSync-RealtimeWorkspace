// backend/src/sockets/events.js
// No changes to constants — WORKSPACE_JOIN/LEAVE/JOINED were already defined.
// Republished here for completeness so you can confirm your file matches exactly.

const EVENTS = {
  // ── Connection lifecycle ─────────────────────────────────────────────────
  CONNECT:           'connect',
  DISCONNECT:        'disconnect',
  CONNECT_ERROR:     'connect_error',
  RECONNECT:         'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',

  // ── Workspace (Phase 1 — THIS MILESTONE) ────────────────────────────────
  WORKSPACE_JOIN:   'workspace:join',   // client → server
  WORKSPACE_LEAVE:  'workspace:leave',  // client → server
  WORKSPACE_JOINED: 'workspace:joined', // server → client (ack)

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

module.exports = { EVENTS }
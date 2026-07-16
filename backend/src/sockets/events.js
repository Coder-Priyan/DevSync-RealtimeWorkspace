// backend/src/sockets/events.js
// Phase 4: EDITOR_JOIN, EDITOR_CHANGE, EDITOR_UPDATE added.

const EVENTS = {
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
  // client → server: user opened a file in the editor
  EDITOR_JOIN: 'editor:join',
  // client → server: user typed — content changed
  EDITOR_CHANGE: 'editor:change',
  // server → other clients: propagate the change (never sent back to sender)
  EDITOR_UPDATE: 'editor:update',

  // ── System ───────────────────────────────────────────────────────────────
  ERROR: 'error',
}

module.exports = { EVENTS }
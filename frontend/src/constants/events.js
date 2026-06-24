/**
 * SOCKET EVENTS — All Socket.IO event name constants.
 *
 * Rule: never write a raw socket event string like socket.on('file-created', ...)
 * anywhere in the codebase. Always import from here.
 *
 * Why this matters: one typo in a raw string causes a silently broken event
 * that is nearly impossible to debug. Constants make every event name
 * grep-able, type-checkable, and refactorable in one place.
 *
 * Convention: CATEGORY_ACTION
 *
 * Usage:
 *   import { EVENTS } from '@/constants/events'
 *   socket.emit(EVENTS.REPO_JOIN, { repoId })
 *   socket.on(EVENTS.FILE_CREATED, handleFileCreated)
 */

export const EVENTS = {
  // ─── Repository room ──────────────────────────────────────────────────────
  // Client emits these to join/leave a repository's socket room
  REPO_JOIN:  'repo:join',
  REPO_LEAVE: 'repo:leave',

  // ─── User presence ────────────────────────────────────────────────────────
  // Server broadcasts when a collaborator's presence changes
  USER_JOINED:          'user:joined',
  USER_LEFT:            'user:left',
  USER_PRESENCE_UPDATE: 'user:presence-update', // File change, cursor move, idle toggle

  // ─── File operations ──────────────────────────────────────────────────────
  // Server broadcasts after a REST call has already persisted the operation.
  // Clients update their UI state when they receive these.
  FILE_CREATED: 'file:created',
  FILE_DELETED: 'file:deleted',
  FILE_RENAMED: 'file:renamed',

  // ─── Folder operations ────────────────────────────────────────────────────
  FOLDER_CREATED: 'folder:created',
  FOLDER_DELETED: 'folder:deleted',
  FOLDER_RENAMED: 'folder:renamed',

  // ─── Code synchronization ─────────────────────────────────────────────────
  // Emitted by the editing client, broadcast to all others in the room.
  // Payload: { fileId, content, cursorPosition }
  CODE_CHANGE: 'code:change',

  // ─── Cursor positions ─────────────────────────────────────────────────────
  // Fine-grained cursor movement for live cursor rendering in the editor.
  // Payload: { userId, fileId, position: { lineNumber, column } }
  CURSOR_MOVE: 'cursor:move',

  // ─── Connection lifecycle ─────────────────────────────────────────────────
  // Built-in Socket.IO events — kept here so they're all in one place
  CONNECT:           'connect',
  DISCONNECT:        'disconnect',
  CONNECT_ERROR:     'connect_error',
  RECONNECT:         'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
}
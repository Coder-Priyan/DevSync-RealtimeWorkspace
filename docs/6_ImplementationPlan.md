# Implementation Plan

**DevSync — Real-Time Collaborative Development Workspace**

*Documents build milestones and development strategy. For the resulting architecture, see the [TRD](2_TRD.md).*

---

## Table of Contents

- [Development Strategy](#development-strategy)
- [Milestones](#milestones)
- [Milestone Detail](#milestone-detail)
- [Highest-Risk Milestone](#highest-risk-milestone)
- [Future Milestones](#future-milestones)

---

## Development Strategy

DevSync was built bottom-up: authentication and persistence first, then a static workspace UI, then the real-time layer, and finally live collaborative editing — each phase building on a previously working foundation rather than building the full UI against a real-time layer that didn't exist yet. This let session handling, the file tree, and the editor UI all be verified against real REST data before any Socket.IO code had to be trusted.

---

## Milestones

| # | Milestone | Outcome |
|---|---|---|
| 1 | Auth + session handling | Register/login, JWT persistence, protected routing |
| 2 | Repository, file & folder REST API | Full CRUD backing the dashboard and file tree |
| 3 | Socket.IO foundation + presence | Authenticated socket connections, room join/leave, live online-user list |
| 4 | Real-time collaborative editor | Monaco integration, live `editor:change`/`editor:update` sync |
| 5 | Collaborator invitations | Send/accept/reject flow with TTL-based expiry |
| — | File/folder real-time broadcast | Emitted directly from REST controllers via `getIO()`; dedicated socket handlers remain unimplemented |

---

## Milestone Detail

**1 — Auth + Session Handling**
Implemented `User` model, bcrypt password hashing, JWT issuance on login, and the `protect` middleware for REST routes. On the frontend, built `ProtectedRoute` with an explicit three-phase check — restoring a session from `localStorage`, redirecting when no valid session exists, or rendering the matched route once authenticated.

**2 — Repository, File & Folder REST API**
Built `repositoryController`, `fileController`, and `folderController` with full CRUD, gated by an owner-or-collaborator check against `Repository.owner` / `Repository.collaborators`. Built the dashboard UI (`RepoCard`, `CreateRepoModal`) and the workspace's file explorer (`FileTree`, `TreeNode`) against this REST layer, with no real-time behavior yet.

**3 — Socket.IO Foundation + Presence**
Added `sockets/index.js` (server init), `sockets/middleware.js` (JWT-authenticated handshake), and `workspace.socket.js` to manage `repo:<id>` room membership. Implemented `presence.socket.js` as an in-memory, per-repository presence store, deduplicated by user across multiple tabs. At this stage, `file.socket.js` and `folder.socket.js` were scaffolded as placeholders for a planned dedicated file/folder event layer.

**4 — Real-Time Collaborative Editor**
Replaced the workspace's plain-text placeholder with Monaco Editor. Added `EDITOR_JOIN`, `EDITOR_CHANGE`, and `EDITOR_UPDATE` to the shared event catalog and implemented `editor.socket.js` to validate room membership before relaying a change to every other client with that file open. On the client, reworked hook ordering so `useSocket` establishes the connection before `useEditor` attaches its listener to the real socket instance, rather than a stale `null` reference — this was an explicit fix made mid-phase (see inline `Phase 4 fix` comments in `useEditor.js` and `useSocket.js`).

**5 — Collaborator Invitations**
Implemented the `Invitation` model with compound indexes for "pending invitations for a user" and "invitations for a repository," plus a TTL index for automatic expiry. Built `invitation.controller`, the invite/accept/reject routes, and the `InviteForm` / `ReceivedInvitations` components in the workspace's collaboration panel.

**File/Folder Real-Time Broadcast (cross-cutting)**
Rather than completing the dedicated `file.socket.js`/`folder.socket.js` handlers scaffolded in Milestone 3, live file-tree sync was instead wired directly from the REST layer: `fileController` and `folderController` call `getIO()` after a successful create/rename/delete and emit `file:*`/`folder:*` events to the repository's room. This achieves the same real-time effect through the controller layer rather than a separate socket handler, and is the reason those two handler files remain empty placeholders in the current codebase.

---

## Highest-Risk Milestone

Milestone 4 (real-time editor) carried the most iteration risk. The initial implementation called `useSocket` and `useEditor` in an order where `useEditor` captured the socket reference before it existed, so its `EDITOR_UPDATE` listener registered against `null` instead of the live connection — edits would broadcast out but never apply back in. This was resolved by passing the socket instance as an explicit parameter from `useSocket` into `useEditor`, guaranteeing listener registration only happens once a real socket exists, rather than relying on effect-ordering assumptions.

---

## Future Milestones

- Complete `file.socket.js` / `folder.socket.js` as proper dedicated handlers, or formally retire them in favor of the controller-driven broadcast pattern already in use
- Repository export as a ZIP archive (`exportService.js`, `zipRepository.js`)
- A dedicated `Collaborator` model, if repository membership outgrows a simple array on `Repository`
- Centralized error-handling middleware (`errorMiddleware.js`)
- Activity logs, version history, and repository snapshots
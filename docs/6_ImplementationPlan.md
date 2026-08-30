# Implementation Plan

## Project Name
DevSync

---

# 1. Approach

The plan is organized into sequential stages, each building on a stable version of the one before it. This ordering isn't arbitrary — it reflects the actual dependency chain of the system: authentication has to exist before anything can be "owned"; repositories have to exist before files/folders can belong to something; the file tree has to exist before an editor has anything to open; and the editor has to exist before real-time sync has content worth syncing.

---

# 2. Stage 1 — Authentication Foundation

**Goal:** A user can register, log in, and have a persistent session.

* `User` model (username, email, password hash, profileImage)
* `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`
* JWT issuance on login; `protect` middleware for guarded REST routes
* Frontend: `AuthContext`, `LoginForm`, `RegisterForm`, `ProtectedRoute` / `PublicOnlyRoute`, token persisted client-side and restored on load

**Exit criteria:** A user can register, log in, refresh the page, and remain logged in; unauthenticated users are redirected away from protected routes.

---

# 3. Stage 2 — Repository Management

**Goal:** A logged-in user can create and manage repositories.

* `Repository` model (name, description, owner, isPublic, collaborators)
* Full CRUD: `POST/GET/PUT/DELETE /api/repositories`, plus `GET /api/repositories/:id`
* Ownership-based authorization inline in each controller (owner-only for update/delete)
* Frontend: `DashboardPage`, `useDashboard`, `RepoList`, `RepoCard`, `CreateRepoModal`

**Exit criteria:** A user can create a repository, see it on their dashboard, update its details, and delete it; only the owner can modify or delete it.

---

# 4. Stage 3 — File & Folder Management (REST layer)

**Goal:** Repositories can hold a real file/folder structure, fully through REST first.

* `Folder` model (name, repository, parentFolder, createdBy) and `File` model (name, content, repository, createdBy, folder)
* Full CRUD for both: `POST/GET/PUT/DELETE /api/folders/...`, `/api/files/...`
* Authorization extended to "owner or collaborator" across file/folder endpoints
* Frontend: `FileTree`, `TreeNode`, `FileContextMenu`, `useFileTree`

**Exit criteria:** A collaborator can build out a folder/file structure inside a repository and see it correctly nested in the sidebar. Real-time propagation of these changes comes in a later stage — at this point the tree updates only for the user performing the action.

**Bug resolved during this stage:** the `File` schema was initially missing its `folder` reference field, so newly created files couldn't be correctly nested under a folder. Fixed by adding `folder: { type: ObjectId, ref: 'Folder', default: null }`.

---

# 5. Stage 4 — Real-Time Socket Layer (Presence + File/Folder Broadcast)

**Goal:** File/folder operations and online presence become visible live to every collaborator, not just the person who performed the action.

* Socket.IO server attached to the same HTTP server as Express; JWT-based handshake authentication (`socketAuthMiddleware`)
* Room model: one room per repository (`repo:<repositoryId>`), joined via `workspace:join`
* `workspace.socket.js` — room lifecycle; `presence.socket.js` — in-memory presence tracking and `presence:update` broadcasts
* REST controllers for file/folder create/rename/delete extended to emit their matching socket event after a successful write
* Frontend: `useSocket` hook owns the socket connection lifecycle end-to-end; `usePresence`, `PresenceList`, `UserPresenceRow`

**Exit criteria:** Two browser sessions in the same repository see each other's file/folder changes and each other's online status without refreshing.

---

# 6. Stage 5 — Real-Time Collaborative Editing

**Goal:** The Monaco editor supports live, multi-user text synchronization.

* `editor.socket.js` — `editor:join` / `editor:change` → `editor:update` broadcast (never echoed back to the sender)
* Frontend: `useEditor` hook — local keystrokes emit immediately over the socket for real-time feel, plus a debounced (~800ms) REST auto-save (`PUT /api/files/:fileId`) for persistence
* `ignoreRemoteChange` ref guard to prevent a remotely-applied update from being re-broadcast as if it were a local edit
* `EditorPane`, `TabBar`, `EditorPlaceHolder`, sync status indicator in `StatusBar`

**Exit criteria:** Two users with the same file open see each other's keystrokes appear live, and the content is durably saved regardless of socket connectivity.

**Bug resolved during this stage:** a timing bug where `useEditor` initialized before `useSocket` had created the socket instance, so `getSocket()` returned `null` and the `editor:update` listener never registered. Fixed by having `useSocket` hold the socket instance in state and pass it down explicitly as a parameter, so dependent effects re-run once the real instance exists.

---

# 7. Stage 6 — UI/UX Polish & Design System Consolidation

**Goal:** Bring the interface to a consistent, professional baseline before adding further features.

* Tailwind v4 migration, including moving custom design tokens into `@theme` CSS blocks (a v4 requirement, not a stylistic choice)
* Shared component layer (`Button`, `Input`, `Modal`, `AvatarBadge`, `EmptyState`, `FileIcon`) to remove one-off styled elements
* `AppShell`, `Navbar`, `Sidebar`, `StatusBar` finalized as the persistent layout frame
* Various import-path and API base-URL mismatches identified and corrected across the frontend (`AuthContext` import paths, Axios base URL config)

**Exit criteria:** The app has one consistent visual language end-to-end, with no ad-hoc inline styling competing with the design tokens.

---

# 8. Stage 7 — Repository Invitation System *(current stage)*

**Goal:** Replace ad-hoc, direct collaborator addition with a proper invite/accept flow.

* `Invitation` model with `pending`/`accepted`/`rejected` status, 7-day expiry, and three purpose-built indexes (see `5_BackendSchema.md`)
* `POST /api/invitations` (send), `GET /api/invitations/received` (list mine), `PUT /api/invitations/:id/accept`, `PUT /api/invitations/:id/reject`
* Ownership, duplicate-invite, self-invite, and already-collaborator checks in the send flow; ownership and expiry checks in accept/reject
* Frontend: `InviteForm`, `ReceivedInvitations`, `UserPresenceRow`, `useInvitations`, `invitation.service.js`

**Status:** Backend controller and routes are implemented; frontend hook and components are wired for the received-invitations list and the invite form. Remaining work: final UI polish on the invite/accept experience, and reconciling this flow with the older direct `addCollaborator` endpoint on `repositoryController` (see Section 10).

---

# 9. Stage 8 — Repository Export *(next up)*

**Goal:** Let a user download a repository's current file/folder structure as a ZIP archive.

* `utils/zipRepository.js` and `services/exportService.js` are scaffolded but currently empty — this is the next concrete implementation task.
* Planned approach: walk the repository's `Folder`/`File` documents to reconstruct the tree in-memory, stream it into a ZIP (e.g. via `archiver` or a similar library), and serve it as a file download from a new authenticated endpoint (e.g. `GET /api/repositories/:id/export`).
* Frontend `ExportButton` already exists in the workspace toolbar and simply needs to be wired to the new endpoint once it exists.

**Exit criteria:** A collaborator can click Export and receive a ZIP that, when extracted, reproduces the repository's folder/file structure and contents.

---

# 10. Cleanup Items Carried Forward

These are known rough edges, explicitly tracked rather than silently left in the codebase:

* **Duplicate collaborator-add paths.** `repositoryController.addCollaborator` (direct, by email, owner-only) still exists alongside the newer invitation flow. Decide whether direct-add is kept as an owner shortcut or removed in favor of invitations being the only path.
* **`Collaborator.js` model file is empty and unused.** Either remove it or repurpose it if per-collaborator roles are introduced later.
* **No cascade delete for repositories.** Deleting a repository currently orphans its files, folders, and invitations at the database level.
* **Socket handler placeholders.** `handlers/file.socket.js` and `handlers/folder.socket.js` exist as empty placeholder modules — real-time file/folder broadcasting is currently implemented directly inside the REST controllers instead. Either remove these placeholder files or formally document that this is the intended final architecture (per `2_TRD.md`, Section 3).

---

# 11. Interview-Readiness Checklist (Cross-Reference)

For placement/interview prep purposes, the stages above map directly onto talking points already prepared:

* Feature-Sliced Design → Stage 6
* Socket singleton pattern (`useSocket` owning the connection lifecycle) → Stage 4/5
* `ignoreRemoteChange` ref pattern → Stage 5
* REST-as-source-of-truth / sockets-only-broadcast architecture rule → Stage 4 (TRD Section 3)
* JWT reused across REST and socket auth → Stage 1 (TRD Section 4)

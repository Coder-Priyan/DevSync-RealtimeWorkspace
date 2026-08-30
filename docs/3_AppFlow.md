# Application Flow

## Project Name
DevSync

---

# 1. Route Map

| Route | Access | Component | Notes |
|---|---|---|---|
| `/` | Any | `RootRedirect` | Redirects to `/dashboard` if authenticated, `/login` otherwise |
| `/login` | Public only | `LoginPage` | Redirects authenticated users to `/dashboard` |
| `/register` | Public only | `RegisterPage` | Redirects authenticated users to `/dashboard` |
| `/dashboard` | Protected | `DashboardPage` | Repository list + creation |
| `/workspace/:repoId` | Protected | `WorkspacePage` | Live collaborative workspace |
| `*` | Any | `NotFoundPage` | Catch-all 404 |

All pages are lazy-loaded; `AppRouter.jsx` is the single source of truth for route definitions. "Protected" routes are wrapped in `ProtectedRoute`, which checks `AuthContext` and redirects to `/login` if there's no valid session — with a brief loading screen shown while the session is restored from storage, so an authenticated user never sees a login-page flash on refresh.

---

# 2. Authentication Flow

1. **New user** lands on `/register`, submits username/email/password.
2. Backend hashes the password, creates the `User` document, and returns a success response (registration does **not** auto-login in the current flow).
3. User is directed to `/login`, submits email/password.
4. Backend verifies credentials and returns a signed JWT plus basic user info.
5. Frontend stores the JWT (used both as an Axios bearer token and as the Socket.IO handshake auth token) and updates `AuthContext`.
6. User is redirected to `/dashboard`.
7. On every subsequent app load, `AuthContext` restores the session from stored token, verifies it (e.g. via `/api/auth/profile`), and either lands the user on `/dashboard` or bounces them to `/login` if the token is invalid/expired.

---

# 3. Dashboard Flow

1. On mount, `useDashboard` fetches the user's repositories: `GET /api/repositories`, which returns every repository where the user is either the `owner` or listed in `collaborators`.
2. Repositories render as cards (`RepoCard`) inside `RepoList`.
3. **Create repository**: `CreateRepoModal` collects name/description/visibility → `POST /api/repositories` → new repo appears in the list, owner = current user.
4. **Open repository**: clicking a card navigates to `/workspace/:repoId`.
5. **Received invitations**: pending invitations addressed to the logged-in user are fetched (`GET /api/invitations/received`) and surfaced so the user can accept/reject them without needing to already be inside a workspace.

---

# 4. Entering a Workspace

1. Navigating to `/workspace/:repoId` mounts `WorkspacePage`.
2. `useWorkspace` loads repository metadata (`GET /api/repositories/:id`), while `useFileTree` loads the folder/file structure (`GET /api/folders/:repositoryId`, `GET /api/files/:repositoryId`).
3. `useSocket(repoId, reloadTree)` establishes the Socket.IO connection (JWT handshake), and once connected, emits `workspace:join` with the `repositoryId`.
4. Server verifies the repository exists, moves the socket into `repo:<repositoryId>` (leaving any previous room first), registers presence, and responds with `workspace:joined` containing the current online-user list.
5. `WorkspacePage` renders `Sidebar` (file explorer), `EditorPane`/`TabBar` (open files), `CollabPane` (presence + invitations), and `StatusBar`.

---

# 5. File & Folder Operations

1. User right-clicks in `FileTree` or uses the toolbar to create/rename/delete a file or folder.
2. The corresponding service call fires (`file.service.js` / `folder.service.js`) → REST endpoint (`POST/PUT/DELETE /api/files/...` or `/api/folders/...`).
3. On success, the controller persists the change in MongoDB **and** emits the matching socket event (`file:created`, `file:renamed`, `file:deleted`, `folder:created`, `folder:renamed`, `folder:deleted`) to the `repo:<repositoryId>` room.
4. Every other connected collaborator's `useSocket` listener catches the event and calls `reloadTree()`, so their `FileTree` reflects the change without a manual refresh.
5. The user who performed the action updates their own tree from the direct REST response — they do not wait for their own socket broadcast.

---

# 6. Opening a File & Collaborative Editing

1. Clicking a file in `FileTree` opens it as a tab (`useTabs`) and calls `useEditor.loadFile()`, which fetches its content (`GET /api/files/single/:fileId`) if not already cached.
2. The socket emits `editor:join` with `{ repositoryId, fileId }` so the server knows this socket has the file open (used for validation, not currently for granular per-file rooms).
3. **Local typing**: every keystroke calls `setContent()`, which (a) updates local state immediately for a responsive feel, (b) emits `editor:change` over the socket instantly — no debounce, and (c) schedules a debounced (~800ms) `PUT /api/files/:fileId` call that persists the content and flips the status indicator from "saving" to "saved".
4. **Receiving a remote edit**: the server rebroadcasts the change as `editor:update` to every other socket in the room. If the receiving user has that same file open as their active tab, `applyRemoteUpdate()` sets the `ignoreRemoteChange` guard, pushes the new content into the Monaco instance, restores the cursor position, then clears the guard. If the file isn't the user's active tab, the content is cached silently so it's up to date if they switch to it later.

---

# 7. Presence Flow

1. On `workspace:join`, the server adds the socket to an in-memory presence map for that repository and broadcasts `presence:update` (deduplicated by user, so a user with two tabs open still shows once) to everyone in the room, including the joiner.
2. `CollabPane`'s `PresenceList` renders the online-user list live via `usePresence`.
3. On disconnect or `workspace:leave`, the server removes the socket from the presence map and re-broadcasts `presence:update` so everyone's list updates immediately.

---

# 8. Invitation Flow

1. From inside a workspace (or dashboard), the repository owner opens `InviteForm` and submits a collaborator's email.
2. `POST /api/invitations` runs a sequence of checks: repository exists, requester is the owner, the invited email belongs to a real user, the owner isn't inviting themself, the user isn't already a collaborator, and no pending invitation already exists for that pair — then creates an `Invitation` document with `status: pending` and a 7-day expiry.
3. The invited user, on their own dashboard, sees the invite via `GET /api/invitations/received` (rendered in `ReceivedInvitations`).
4. **Accept**: `PUT /api/invitations/:id/accept` re-validates ownership of the action, pending status, and non-expiry, then adds the invited user to the repository's `collaborators` array and marks the invitation `accepted`.
5. **Reject**: `PUT /api/invitations/:id/reject` marks the invitation `rejected` with the same guard checks, without touching the repository.
6. Once accepted, the new collaborator can open `/workspace/:repoId` like any other collaborator — the authorization check (`owner` or in `collaborators`) now passes for them across every file/folder/repository endpoint.

---

# 9. Leaving a Workspace / Disconnection

1. Navigating away, closing the tab, or losing connection triggers socket `disconnect`.
2. The server reads `socket.data.currentRepository`, removes the socket from that repository's presence map, and broadcasts the updated presence list to remaining collaborators.
3. No data is lost on disconnect: anything already auto-saved via the debounced REST call is persisted; only the in-flight, not-yet-debounced keystroke buffer for that session could be lost, matching the "sockets are not the source of truth" architecture rule.

---

# 10. Export Flow (In Progress)

1. `ExportButton` in the workspace toolbar is intended to trigger a repository ZIP download.
2. The backend export path (`services/exportService.js` and `utils/zipRepository.js`) is scaffolded but not yet implemented — this is the next major piece of committed scope after the invitation system.

# Technical Requirements Document (TRD)

## Project Name
DevSync

---

# 1. Purpose

This document defines the technical architecture, stack, and engineering conventions for DevSync. It is written as the technical contract the implementation follows — every decision here is one the codebase actually reflects, so that anyone (including future-us) can pick up the project and know exactly how it is wired together.

---

# 2. Technology Stack

### Frontend
* **React 19** with **Vite** as the build tool
* **React Router v6/v7** for client-side routing, using lazy-loaded route components
* **Tailwind CSS v4**, configured via the `@tailwindcss/vite` plugin and `@theme` blocks (Tailwind v4 no longer uses a `tailwind.config.js`-driven theme in the same way v3 did — custom design tokens are declared inside CSS with `@theme`)
* **Socket.IO Client** for the real-time layer
* **Monaco Editor** (`@monaco-editor/react`) as the in-browser code editor
* **Axios** for REST calls
* **lucide-react** for icons

### Backend
* **Node.js** with **Express 5**
* **Socket.IO** (server) for real-time communication, sharing the same HTTP server instance as Express
* **MongoDB** with **Mongoose** as the ODM
* **JWT** (`jsonwebtoken`) for stateless authentication
* **bcryptjs** for password hashing
* **CommonJS** module syntax throughout the backend (no ESM) — this is a deliberate, consistent choice, not a mix

### Tooling
* **nodemon** for backend dev reload
* **ESLint** on the frontend
* **dotenv** for environment configuration

---

# 3. System Architecture

```
┌─────────────────┐        REST (Axios, JWT bearer)        ┌──────────────────┐
│  React Frontend │ ──────────────────────────────────────▶│  Express API     │
│  (Vite, Tailwind)│◀────────────────────────────────────── │  (Node.js)       │
└─────────────────┘                                         └──────────────────┘
        │                                                            │
        │        Socket.IO (JWT handshake auth)                      │
        └───────────────────────────────────────────────────────────▶│
                                                                       ▼
                                                              ┌──────────────────┐
                                                              │  Socket.IO Server │
                                                              │  (shares httpServer)│
                                                              └──────────────────┘
                                                                       │
                                                                       ▼
                                                              ┌──────────────────┐
                                                              │  MongoDB (Mongoose)│
                                                              └──────────────────┘
```

The Express app and the Socket.IO server are attached to the **same** `http.Server` instance in `server.js`. There is one process, one port, two protocols.

### Core architectural rule: REST owns persistence, sockets only broadcast

This is the single most important rule in the system:

* Every create/update/delete for repositories, files, folders, and invitations happens through a REST endpoint, which is the only thing that writes to MongoDB.
* After a successful REST write, the controller emits a Socket.IO event to the relevant repository room (`repo:<repositoryId>`) so everyone else's UI updates.
* Sockets are **never** the source of truth for anything except two things that are intentionally ephemeral and never persisted: (1) live editor keystrokes broadcast between collaborators before the debounce auto-save lands, and (2) in-memory presence (who is online).

This means: if a socket message is lost, the data is not lost — the REST call already persisted it. Sockets are a UX layer on top of a REST backbone, not a replacement for it.

---

# 4. Authentication

* Registration and login are REST endpoints (`/api/auth/register`, `/api/auth/login`). Passwords are hashed with bcrypt before storage; plaintext passwords are never persisted or logged.
* On successful login, the server issues a signed JWT containing the user's id. The frontend stores this token and attaches it as a Bearer token on every REST call.
* REST routes that require a logged-in user go through an Express `protect` middleware that verifies the JWT and attaches `req.user`.
* The **same JWT** is reused to authenticate the Socket.IO connection: the token is passed in `socket.handshake.auth.token`, verified by a Socket.IO middleware (`socketAuthMiddleware`) before the connection is accepted, and the resulting user is attached as `socket.user`. There is one identity system, not two.
* If the token is missing, invalid, or expired, the socket connection is rejected before any event handlers run.

---

# 5. Real-Time Layer (Socket.IO)

### Room model
Each repository maps to exactly one Socket.IO room: `repo:<repositoryId>`. A socket joins this room via a `workspace:join` event after connecting, and the server tracks which repository each socket currently belongs to on `socket.data.currentRepository`. Switching repositories automatically leaves the previous room.

### Event naming
All event name strings live in a single constants file (`sockets/events.js` on the backend, mirrored in `constants/events.js` / `socket/events.js` on the frontend). No event name is ever hand-typed as a string literal elsewhere — this is a strict convention to prevent typo-based bugs between client and server.

### Socket responsibility split
Real-time behaviour is split into narrowly scoped handler modules, each owning one concern:

* **`workspace.socket.js`** — owns room join/leave lifecycle and disconnect handling. This is the only file that calls `socket.join()` / `socket.leave()`.
* **`presence.socket.js`** — owns the in-memory presence store (a map of repository → online users), and broadcasts `presence:update` whenever someone joins or leaves. It exposes join/leave callbacks that `workspace.socket.js` invokes; it does not touch room membership itself.
* **`editor.socket.js`** — owns live collaborative text sync. Listens for `editor:join` (user opened a file) and `editor:change` (user typed), and re-broadcasts changes as `editor:update` to every other socket in the room — never back to the sender.

File and folder real-time updates (`file:created`, `file:renamed`, `file:deleted`, `folder:created`, `folder:renamed`, `folder:deleted`) are emitted directly from the REST controllers after a successful database write, rather than from a dedicated socket handler — because the action originates from an HTTP request, not a socket event, so persistence and broadcast happen in the same place.

### Frontend socket lifecycle
The socket connection itself is managed exclusively by the `useSocket` hook — nothing else calls `connectSocket()`/`disconnectSocket()`. `useSocket` exposes the live socket instance in React state so that dependent hooks (like `useEditor`) receive it as a parameter once it exists, rather than reaching for a module-level getter that may return `null` before the socket is created. This ordering fix (socket instance as an explicit parameter through the component hierarchy) was necessary because effects that ran before the socket existed would silently register no listeners.

### Collaborative editing conflict avoidance
The editor uses an `ignoreRemoteChange` ref (not state, because it must be read synchronously inside Monaco's change callback) to distinguish a locally-typed change from a remotely-applied one:

1. Local keystroke → `setContent()` → emits `editor:change` immediately (no debounce, for real-time feel) → also schedules a debounced REST auto-save (~800ms) for persistence.
2. Remote update arrives → `applyRemoteUpdate()` sets the guard flag, calls `editor.setValue()`, restores cursor position, then clears the guard — so Monaco's own change event fired by `setValue()` does not get re-broadcast as if the local user typed it.

---

# 6. REST API Conventions

* Base path: `/api/<resource>` (`/api/auth`, `/api/repositories`, `/api/files`, `/api/folders`, `/api/invitations`).
* All protected routes use the `protect` middleware; there is no separate role-based middleware — authorization (owner vs. collaborator vs. neither) is checked inline inside each controller function against the resource being accessed.
* Every JSON response follows a consistent envelope: `{ success: boolean, message?: string, ...data }`.
* Mongoose `ObjectId` cast errors are caught explicitly and translated into a `404` ("not found") rather than leaking a `500`.
* Authorization pattern used throughout: a request is allowed if the requesting user is either the repository's `owner` or present in its `collaborators` array — this check is duplicated per-controller rather than centralized in middleware, which is a known area for future refactoring but is consistent in behaviour today.

---

# 7. Data Layer

* MongoDB via Mongoose, with all schemas using `{ timestamps: true }` for automatic `createdAt`/`updatedAt`.
* Relationships are modeled with `ObjectId` references (`ref: 'User'`, `ref: 'Repository'`, etc.) rather than embedded documents, so files/folders/invitations are separate collections that reference their parent repository.
* The `Invitation` model carries three indexes intentionally: a compound index on `(invitedUser, status)` for the "my pending invitations" query, a compound index on `(repository, invitedUser)` to detect duplicate pending invites, and a TTL index on `expiresAt` so MongoDB automatically deletes expired invitations without a manual cleanup job.
* Full schema definitions are covered in `5_BackendSchema.md`.

---

# 8. Frontend Architecture

* **Feature-Sliced Design**: code is organized by feature (`features/auth`, `features/dashboard`, `features/workspace`), each with its own `components/`, `hooks/`, and services, rather than by technical layer alone. Cross-cutting concerns (shared UI primitives, layout shell, generic hooks) live outside the feature folders.
* **Routing**: a single `AppRouter.jsx` is the only file that defines `<Route>` elements. Pages are lazy-loaded with `React.lazy()` so route bundles are code-split.
* **Auth guarding**: `ProtectedRoute` wraps authenticated routes and redirects to `/login` if there's no valid session; a `PublicOnlyRoute` wrapper does the inverse for `/login` and `/register` so an already-authenticated user is redirected to the dashboard instead of seeing the auth forms again.
* **State**: React Context (`AuthContext`) holds session/auth state; everything else is local component/hook state — there is no global store (Redux/Zustand) in the current architecture.

---

# 9. Environment & Configuration

* Backend environment variables (`.env`): Mongo connection string, `JWT_SECRET`, `PORT`, `CLIENT_URL` (used for Socket.IO CORS origin).
* CORS is enabled broadly on the Express app; Socket.IO CORS origin defaults to `CLIENT_URL` or `*` if unset.

---

# 10. Non-Functional Requirements

* **Consistency over cleverness**: REST is always the durable write path; sockets are always a broadcast layer. This rule must hold for any new real-time feature added later.
* **Predictable room semantics**: a socket belongs to at most one repository room at a time; joining a new one always leaves the previous one first.
* **Graceful degradation of real-time features**: if the socket disconnects, REST-based CRUD (file/folder create, rename, delete, repository management) must continue to work; only live keystroke sync and presence are affected.
* **Consistent event vocabulary**: no new socket event is introduced without adding it to the shared events constants file on both frontend and backend.

---

# 11. Out of Scope (Technical)

* Operational Transform / CRDT-based conflict resolution for simultaneous edits to the same character range — the current model is "last write broadcast wins" at the socket layer, which is acceptable for the product's target usage (small teams, not adversarial concurrent editing of the exact same line).
* Horizontal scaling of the Socket.IO layer (e.g. a Redis adapter for multi-instance deployments) — the current design assumes a single server process, matching in-memory presence storage.
* Server-side code execution/sandboxing.

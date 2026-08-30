# Application Flow

**DevSync — Real-Time Collaborative Development Workspace**

*Documents the complete request lifecycle through the system. For component-level design, see the [TRD](2_TRD.md).*

---

## Table of Contents

- [HTTP Request Lifecycle](#http-request-lifecycle)
- [Authentication Flow](#authentication-flow)
- [Socket Connection & Handshake Flow](#socket-connection--handshake-flow)
- [Workspace Join Flow](#workspace-join-flow)
- [Real-Time File/Folder Mutation Flow](#real-time-filefolder-mutation-flow)
- [Real-Time Collaborative Editing Flow](#real-time-collaborative-editing-flow)
- [Invitation Flow](#invitation-flow)
- [Disconnect Flow](#disconnect-flow)

---

## HTTP Request Lifecycle

Every REST request follows the same top-level path before diverging into resource-specific logic:

```mermaid
sequenceDiagram
    participant C as Client (Browser)
    participant E as Express App
    participant M as protect Middleware
    participant Ctrl as Controller
    participant DB as MongoDB

    C->>E: HTTP request + Authorization: Bearer <token>
    E->>M: verify JWT, load user
    M->>Ctrl: attach req.user, call next()
    Ctrl->>DB: query / mutate
    DB-->>Ctrl: result
    Ctrl-->>C: JSON response
```

Public routes (`/register`, `/login`) skip the `protect` middleware; every other route requires a valid JWT.

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as LoginForm (React)
    participant H as useLogin hook
    participant API as authController
    participant DB as MongoDB

    U->>UI: enter email + password
    UI->>H: submit
    H->>H: client-side validation
    H->>API: POST /api/auth/login
    API->>DB: User.findOne({ email })
    API->>API: bcrypt.compare(password, user.password)
    API-->>H: { token, user }
    H->>H: AuthContext.login(token, user) — saves to localStorage
    H->>UI: navigate to dashboard
```

On failure, `useLogin` maps the HTTP status to a specific message (invalid credentials, rate-limited, unreachable server) rather than a generic error.

---

## Socket Connection & Handshake Flow

A socket is only created when a user enters a repository workspace — not on login, registration, or the dashboard.

```mermaid
sequenceDiagram
    participant UI as WorkspacePage
    participant Hook as useSocket
    participant Lib as lib/socket.js
    participant MW as socketAuthMiddleware
    participant IO as Socket.IO Server

    UI->>Hook: mount with repoId
    Hook->>Lib: connectSocket()
    Lib->>IO: io.connect({ auth: { token } })
    IO->>MW: verify JWT before "connection"
    MW->>MW: jwt.verify() + User.findById()
    alt token valid
        MW-->>IO: next() — attach socket.user
        IO-->>Lib: "connect" event
        Lib-->>Hook: connected
        Hook->>IO: emit workspace:join { repositoryId }
    else token invalid/missing
        MW-->>IO: next(Error)
        IO-->>Lib: "connect_error"
    end
```

---

## Workspace Join Flow

```mermaid
sequenceDiagram
    participant Hook as useSocket (client)
    participant WS as workspace.socket.js
    participant Repo as Repository model
    participant PR as presence.socket.js
    participant Room as repo:&lt;id&gt; room

    Hook->>WS: workspace:join { repositoryId }
    WS->>Repo: Repository.findById(repositoryId)
    alt repository exists
        WS->>Room: socket.join(repo:<id>)
        WS->>WS: socket.data.currentRepository = repositoryId
        WS->>PR: onJoinRoom(repositoryId)
        PR->>PR: addToPresence() + broadcastPresence()
        PR-->>Room: presence:update { users, count }
        WS-->>Hook: workspace:joined { repositoryId, users }
    else repository not found
        WS-->>Hook: error { message: "Repository not found." }
    end
```

If the socket was already in a different repository room, `workspace.socket.js` leaves that room and fires `onLeaveRoom` before joining the new one, so a user is never counted as present in two repositories at once.

---

## Real-Time File/Folder Mutation Flow

Applies to creating, renaming, or deleting a file or folder. File and folder operations are persisted through REST, then broadcast over the socket layer.

```mermaid
sequenceDiagram
    participant U as User
    participant UI as WorkspacePage
    participant API as fileController / folderController
    participant DB as MongoDB
    participant IO as getIO() — Socket.IO instance
    participant Room as repo:&lt;id&gt; room

    U->>UI: create/rename/delete a file or folder
    UI->>API: POST/PUT/DELETE /api/files or /api/folders
    API->>API: verify requester is owner or collaborator
    API->>DB: persist change
    DB-->>API: saved document
    API->>IO: getIO().to(repo:<id>).emit(file:created / file:renamed / file:deleted, ...)
    IO-->>Room: event delivered to repo:<id>
    Room-->>UI: other clients' useSocket receives event
    API-->>UI: 200/201 response
    UI->>UI: reloadTree() — file tree refreshes without a manual refresh
```

The broadcast is fired directly from the controller after persistence, not from a separate socket handler — `handlers/file.socket.js` and `handlers/folder.socket.js` are unused placeholders in the current implementation.

---

## Real-Time Collaborative Editing Flow

Applies to keystrokes inside the Monaco editor.

```mermaid
sequenceDiagram
    participant A as User A (typing)
    participant Ed as useEditor (Client A)
    participant Sock as editor.socket.js
    participant Room as repo:&lt;id&gt; room
    participant B as User B (viewing same file)

    A->>Ed: types in Monaco editor
    Ed->>Sock: editor:change { repositoryId, fileId, content }
    Sock->>Sock: verify socket.data.currentRepository === repositoryId
    alt valid room membership
        Sock->>Room: broadcast editor:update { fileId, content } (excludes sender)
        Room-->>B: editor:update received
        B->>B: applyRemoteUpdate(fileId, content, activeTab)
    else room mismatch
        Sock->>Sock: reject silently, log warning
    end
```

`editor:join` is emitted first when a file is opened, recording `socket.data.activeFile` so future changes can be attributed and validated per file.

---

## Invitation Flow

```mermaid
sequenceDiagram
    participant O as Repository Owner
    participant API as invitation.controller
    participant DB as MongoDB (Invitation)
    participant R as Invited User

    O->>API: POST /api/invitations { repositoryId, invitedUserId }
    API->>DB: Invitation.create({ status: "pending", expiresAt })
    R->>API: GET /api/invitations/received
    API->>DB: find({ invitedUser: R, status: "pending" })
    DB-->>API: pending invitations
    API-->>R: invitation list (ReceivedInvitations component)
    R->>API: PUT /api/invitations/:id/accept
    API->>DB: update Invitation.status = "accepted"
    API->>DB: Repository.collaborators.push(R)
    API-->>R: repository now accessible
```

Invitations left unanswered are automatically removed once `expiresAt` passes, via MongoDB's TTL index on the `Invitation` model — no manual cleanup job is required.

---

## Disconnect Flow

```mermaid
sequenceDiagram
    participant Client
    participant IO as Socket.IO Server
    participant WS as workspace.socket.js
    participant PR as presence.socket.js
    participant Room as repo:&lt;id&gt; room

    Client--)IO: connection drops (tab close, network loss, navigation)
    IO->>WS: "disconnect" event
    WS->>PR: onLeaveRoom(currentRepository)
    PR->>PR: removeFromPresence(repositoryId, socketId)
    PR-->>Room: presence:update { users, count }
    WS->>WS: clear socket.data.currentRepository / activeFile
```

Presence is deduplicated by `userId`, so if the same user still has another tab open in the same repository, they remain in the online list — only the specific `socketId` that disconnected is removed.
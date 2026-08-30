# Backend Schema Design

## Project Name
DevSync

## Database
MongoDB (via Mongoose)

---

# 1. Overview

DevSync's data model is built around five collections: `User`, `Repository`, `Folder`, `File`, and `Invitation`. Relationships are modeled with `ObjectId` references rather than embedded documents — files and folders are their own collections referencing a parent `Repository`, not arrays nested inside it. Every schema uses Mongoose's `{ timestamps: true }` for automatic `createdAt`/`updatedAt` tracking.

---

# 2. User

```js
{
  username:     String,   required, trimmed
  email:        String,   required, unique, lowercase, trimmed
  password:     String,   required (bcrypt hash — never stored in plaintext)
  profileImage: String,   default: ""
  createdAt / updatedAt (auto)
}
```

**Notes:**
* `email` carries a unique index — this is the natural lookup key for login and for the invitation system's "find user by email" step.
* `password` is always a bcrypt hash by the time it reaches the database; hashing happens in the auth controller before `User.create()`.
* `profileImage` currently defaults to an empty string with no upload pipeline implemented yet — reserved for a future avatar feature.

---

# 3. Repository

```js
{
  name:          String,     required, trimmed
  description:   String,     default: ""
  owner:         ObjectId,   ref: 'User', required
  isPublic:      Boolean,    default: true
  collaborators: [ObjectId], ref: 'User'
  createdAt / updatedAt (auto)
}
```

**Notes:**
* `owner` is a single user and is never included in `collaborators` — ownership and collaboration are treated as distinct roles throughout the authorization checks (`isOwner` vs. `isCollaborator`).
* `collaborators` is a flat array of user references. Access checks across files, folders, and repository endpoints consistently allow an action if the requester is either the `owner` or present in this array.
* Deleting a repository does not currently cascade-delete its files/folders/invitations at the database level — this is a known gap to close before the export/cleanup feature is finalized (orphaned `File`/`Folder`/`Invitation` documents can currently outlive their parent `Repository`).

---

# 4. Folder

```js
{
  name:         String,   required, trimmed
  repository:   ObjectId, ref: 'Repository', required
  parentFolder: ObjectId, ref: 'Folder', default: null
  createdBy:    ObjectId, ref: 'User', required
  createdAt / updatedAt (auto)
}
```

**Notes:**
* `parentFolder: null` represents a top-level folder directly under the repository root — the tree is reconstructed on the frontend by walking `parentFolder` references, there is no materialized path field.
* Folder creation validates that a provided `parentFolderId` both exists and belongs to the same `repository` as the new folder, preventing cross-repository folder nesting.

---

# 5. File

```js
{
  name:       String,   required, trimmed
  content:    String,   default: ""
  repository: ObjectId, ref: 'Repository', required
  createdBy:  ObjectId, ref: 'User', required
  folder:     ObjectId, ref: 'Folder', default: null
  createdAt / updatedAt (auto)
}
```

**Notes:**
* `content` holds the file's full text and is what the collaborative editor reads/writes — there is no separate content-versioning or diffing at the schema level; the field is simply overwritten on each auto-save.
* `folder: null` means the file sits at the repository root, mirroring the `Folder` model's convention.
* This field was originally missing from the schema during early development (files could be created but not correctly associated with a folder) — it has since been added and is a required part of the working schema.

---

# 6. Invitation

```js
{
  repository:  ObjectId, ref: 'Repository', required
  invitedBy:   ObjectId, ref: 'User', required
  invitedUser: ObjectId, ref: 'User', required
  status:      String,   enum: ['pending', 'accepted', 'rejected'], default: 'pending'
  expiresAt:   Date
  createdAt / updatedAt (auto)
}
```

**Indexes:**
1. `{ invitedUser: 1, status: 1 }` — compound index covering the most frequent query, "fetch all pending invitations for a user," without a collection scan.
2. `{ repository: 1, invitedUser: 1 }` — compound index used to detect an existing pending invitation for the same (repository, user) pair before creating a new one, and to support "list all invitations for a repository."
3. `{ expiresAt: 1 }` with `expireAfterSeconds: 0` — a **TTL index**: MongoDB automatically deletes an invitation document once its `expiresAt` timestamp is reached. Documents with no `expiresAt` set are unaffected. This removes the need for a manual cleanup cron job.

**Notes:**
* `expiresAt` is set by the controller at creation time (currently 7 days out), not enforced by a schema default — the field itself is optional so invitations could exist without an expiry if a future product decision removes that constraint.
* Accepting an invitation pushes `invitedUser` into the target `Repository.collaborators` array and flips `status` to `accepted` — it does not delete the invitation document; accepted/rejected invitations remain as a historical record until their TTL (if any) expires.

---

# 7. Relationships Summary

```
User ──< owner ──── Repository
User ──< collaborators[] ──── Repository
Repository ──< repository ──── Folder
Repository ──< repository ──── File
Folder ──< parentFolder ──── Folder (self-referential tree)
Folder ──< folder ──── File
Repository ──< repository ──── Invitation
User ──< invitedBy / invitedUser ──── Invitation
```

---

# 8. Known Schema-Level Gaps (Tracked, Not Blocking)

* **`backend/src/models/Collaborator.js` exists as an empty file.** It is not used anywhere in the codebase — collaborator relationships are handled entirely through `Repository.collaborators` and the `Invitation` model. This file should either be removed or repurposed if a richer collaborator record (e.g. per-collaborator role/permissions) is introduced later.
* **No cascade deletes.** Deleting a `Repository` does not currently remove its associated `Folder`, `File`, or `Invitation` documents. This needs to be addressed (either via a pre-remove hook or an explicit cleanup step in `deleteRepository`) before repository deletion is considered production-safe.
* **No collaborator-level permissions.** Every collaborator currently has full read/write access — there is no owner/editor/viewer distinction. Acceptable for the current product scope, but worth flagging if role-based access is ever requested.

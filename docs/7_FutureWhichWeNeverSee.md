# Future Implementation Plan

## Project Name
DevSync

## Scope
Build order and exit criteria for the Phase 1–3 roadmap defined in `7_Future_PRD.md`, designed against the technical approach in `8_Future_TRD.md` and schema changes in `9_Future_BackendSchema.md`.

---

# 1. Recommended Build Order

The PRD groups features into Phase 1/2/3 by value and risk; this plan sequences them by **dependency**, which changes the order slightly — build the lowest-risk, no-dependency items first to regain momentum, then move into the item that unlocks the most other work (collaborator consolidation), then roles, then the rest.

1. Cascade Delete
2. Repository Export (ZIP)
3. Consolidate Collaborator Access
4. Role-Based Collaborator Permissions
5. Activity Log
6. In-App Notifications
7. Repository Settings Page
8. Phase 3 polish items (any order, pick what's most useful)

---

# 2. Stage-by-Stage Plan

### Stage F1 — Cascade Delete
**Why first:** self-contained, no schema migration, no frontend change, immediately closes a known data-integrity gap.

* Implement explicit `File.deleteMany` / `Folder.deleteMany` / `Invitation.deleteMany` sequence in `deleteRepository`.
* Manually test: create a repo, add files/folders/an invitation, delete the repo, confirm all four collections are clean.

**Exit criteria:** deleting a repository leaves zero orphaned documents in any related collection.

---

### Stage F2 — Repository Export (ZIP)
**Why second:** also self-contained, closes the last missing MVP feature, and the frontend button already exists and just needs wiring.

* Add `archiver` (or equivalent) dependency to the backend.
* Implement `exportService.js` + `zipRepository.js` per the tree-walk approach in the Future TRD.
* Add `GET /api/repositories/:id/export` route.
* Wire `ExportButton` to call it and trigger a browser download.
* Test with: an empty repository, a repository with nested empty folders, and a repository with a realistic file/folder mix.

**Exit criteria:** clicking Export on any repository the user has access to produces a ZIP that correctly reproduces the folder/file structure on extraction.

---

### Stage F3 — Consolidate Collaborator Access
**Why third:** simplifies the codebase before Role-Based Permissions is layered on top — cleaner to add roles to one flow than two.

* Confirm direction (recommended: invitations only).
* Remove `addCollaborator` route + controller function; decide on `removeCollaborator`'s fate (recommended: keep it as a direct owner action).
* Delete now-dead files: `collaboratorRoutes.js`, `collaboratorController.js` (currently empty stubs), `Collaborator.js` model (currently unused), and any frontend `collaborator.service.js` calls tied to direct-add.
* Update `3_AppFlow.md`'s collaborator section to reflect the single path.

**Exit criteria:** there is exactly one way, in code, to become a collaborator on a repository — via invitation.

---

### Stage F4 — Role-Based Collaborator Permissions
**Why fourth:** the highest-value Phase 2 item, and everything after it (settings page, notifications around role changes if added later) is easier with roles already in place.

* Update `Repository.collaborators` schema to `{ user, role }`.
* Write and test the one-time migration script against a copy of real data before running it for real.
* Add `role` to the `Invitation` schema; update `sendInvitation` to accept a role parameter; update `acceptInvitation` to push `{ user, role }` using the invitation's role.
* Update every authorization check in `fileController.js` and `folderController.js` to distinguish "is a collaborator" from "can write" (owner or editor role).
* Update frontend: `InviteForm` gets a role selector; Monaco editor gets a `readOnly` mode for viewers.
* Test explicitly: invite someone as Viewer, confirm they can open/read files but every write action (create/rename/delete/edit) is rejected by the backend even if attempted directly against the API (not just hidden in the UI).

**Exit criteria:** a Viewer collaborator can browse and read a repository but cannot mutate anything, verified at the API level, not just the UI level.

---

### Stage F5 — Activity Log
**Why fifth:** more valuable once roles exist, since role changes become a loggable action too, and the other Phase 1 features (export, cascade delete side effects) are already stable to log against.

* Add `ActivityLog` collection + index.
* Add a `logActivity()` helper, called from the same controller functions that already emit socket events for file/folder/collaborator actions.
* Add `GET /api/repositories/:id/activity`, paginated.
* Add a frontend panel/page to view it (can live inside the new Settings page from Stage F7, or standalone — either is fine).

**Exit criteria:** performing a sequence of test actions (create file, rename folder, invite collaborator, accept invitation) produces an accurate, correctly-ordered activity log for that repository.

---

### Stage F6 — In-App Notifications
**Why sixth:** benefits from the personal-room socket pattern being introduced cleanly, and pairs naturally with the invitation flow already being fresh from Stage F3/F4 work.

* Add `Notification` collection + index.
* Add the `user:<userId>` personal socket room, joined on connection.
* On `sendInvitation`, create a notification and emit `notification:new` to the recipient's personal room.
* Add `GET /api/notifications` and a mark-as-read endpoint.
* Add a navbar badge + dropdown on the frontend.

**Exit criteria:** a user sees a notification indicator update in real time when they're invited to a repository, without needing to be on the dashboard.

---

### Stage F7 — Repository Settings Page
**Why seventh:** a composition of everything above — building it last means every tab (General, Collaborators-with-roles, Export, Danger Zone) already has working functionality to wire in, rather than building UI ahead of the backend.

* New route `/workspace/:repoId/settings`, tabbed UI.
* Wire existing endpoints from all previous stages into their respective tabs.

**Exit criteria:** every repository-level management action (rename, visibility, collaborators + roles, export, delete) is reachable from one page.

---

### Stage F8 — Phase 3 Polish (pick freely)

These have no dependencies on each other or strict ordering — pick up whichever is most motivating or highest-value at the time:

* Markdown preview
* Repository search
* Recently opened files
* Richer presence text ("editing App.jsx")
* Optimistic UI updates

Each can be shipped independently and reverted independently if it doesn't feel right — treat these as a backlog, not a sequence.

---

# 3. What Not to Start Until the Above Is Done

Per `7_Future_PRD.md` Section 8, these remain explicitly out of scope until this entire roadmap is complete and reassessed:

* Live cursor sharing / follow-collaborator mode
* Version history / snapshots
* Code execution sandbox
* Inline code comments
* Git integration, CRDT/OT-based conflict resolution, AI coding assistant

If, after finishing Stage F8, there's appetite to keep going, revisit this list fresh rather than assuming the original reasoning still applies — priorities may have shifted.

---

# 4. Testing Checklist Before Calling This Roadmap "Done"

* [ ] Deleting a repository leaves no orphaned files, folders, or invitations.
* [ ] Export works correctly on an empty repo, a nested-folder repo, and a realistic repo.
* [ ] Only one collaborator-add path exists in the codebase.
* [ ] A Viewer role is verified read-only at the API level, not just hidden in the UI.
* [ ] Activity log accurately reflects a real sequence of actions.
* [ ] Notifications arrive live for a new invitation.
* [ ] Every repository management action is reachable from the Settings page.
* [ ] At least one Phase 3 polish item shipped.
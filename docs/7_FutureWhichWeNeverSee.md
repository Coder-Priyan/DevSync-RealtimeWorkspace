# Future Roadmap

**DevSync — Real-Time Collaborative Development Workspace**

*Sequences the next round of features by dependency, not just by value — so lower-risk, unblocking work happens first. For what's already built, see [Feature Status](README.md#feature-status) and the [Implementation Plan](6_ImplementationPlan.md).*

---

## Table of Contents

- [Sequencing Principle](#sequencing-principle)
- [Recommended Build Order](#recommended-build-order)
- [Stage Detail](#stage-detail)
- [Explicitly Out of Scope (For Now)](#explicitly-out-of-scope-for-now)
- [Exit Checklist](#exit-checklist)

---

## Sequencing Principle

Features here are grouped by value in the PRD's future-scope sense, but sequenced here by **dependency**: build the lowest-risk, no-dependency items first to close known gaps quickly, then the item that unlocks the most other work (consolidating collaborator access), then roles, then everything that becomes easier once roles exist.

---

## Recommended Build Order

| # | Stage | Unlocks |
|---|---|---|
| 1 | Cascade delete | Closes a data-integrity gap, no dependencies |
| 2 | Repository export (ZIP) | Completes a feature already scoped in the [PRD](1_PRD.md#scope) |
| 3 | Consolidate collaborator access | Simplifies the codebase before roles are layered on |
| 4 | Role-based collaborator permissions | Unlocks settings-page and notification work |
| 5 | Activity log | More valuable once roles exist (role changes become loggable) |
| 6 | In-app notifications | Pairs naturally with the invitation flow |
| 7 | Repository settings page | Composes everything above into one place |
| 8 | Polish backlog | No dependencies — pick up anytime |

---

## Stage Detail

### Stage 1 — Cascade Delete
**Why first:** self-contained, no schema migration, no frontend change, closes a known data-integrity gap immediately.

- Implement explicit `File.deleteMany` / `Folder.deleteMany` / `Invitation.deleteMany` inside `deleteRepository`.
- Verify manually: create a repo, add files/folders/an invitation, delete the repo, confirm all four collections are clean.

**Exit criteria:** deleting a repository leaves zero orphaned documents in any related collection.

---

### Stage 2 — Repository Export (ZIP)
**Why second:** also self-contained, closes the last missing feature from the original scope, and the frontend button placeholder (`ExportButton.jsx`) already exists and just needs wiring.

- Add a ZIP-generation dependency (e.g. `archiver`) to the backend.
- Implement `services/exportService.js` and `utils/zipRepository.js` with a tree-walk over a repository's folders and files.
- Add `GET /api/repositories/:id/export`.
- Wire `ExportButton` to call it and trigger a browser download.
- Test against: an empty repository, a repository with nested empty folders, and a repository with a realistic file/folder mix.

**Exit criteria:** clicking Export on any repository the user has access to produces a ZIP that correctly reproduces the folder/file structure on extraction.

---

### Stage 3 — Consolidate Collaborator Access
**Why third:** simplifies the codebase before role-based permissions are layered on top — cleaner to add roles to one access path than two.

- Confirm the single intended path (invitation-only, consistent with current usage).
- Remove any direct-add collaborator route/controller function not going through `Invitation`; decide whether `removeCollaborator` remains as a direct owner action.
- Delete the now-dead, currently-empty stubs: `collaboratorRoutes.js`, `collaboratorController.js`, and the unused `Collaborator.js` model.
- Update [Application Flow](3_AppFlow.md#invitation-flow) if the collaborator-access path changes.

**Exit criteria:** there is exactly one way, in code, to become a collaborator on a repository — via invitation.

---

### Stage 4 — Role-Based Collaborator Permissions
**Why fourth:** the highest-value remaining feature, and the settings page and role-aware notifications in later stages are easier to build once roles already exist.

- Change `Repository.collaborators` from `[ObjectId]` to `[{ user, role }]`.
- Write and test a one-time migration script against a copy of real data before running it against production data.
- Add `role` to the `Invitation` schema; update `sendInvitation` to accept a role and `acceptInvitation` to push `{ user, role }` accordingly.
- Update every authorization check in `fileController.js` / `folderController.js` to distinguish "is a collaborator" from "can write" (owner or editor role).
- On the frontend: add a role selector to `InviteForm`; add a Monaco `readOnly` mode for viewers.
- Test explicitly: invite someone as Viewer, confirm read access works but every write action (create/rename/delete/edit) is rejected by the backend even when attempted directly against the API — not just hidden in the UI.

**Exit criteria:** a Viewer collaborator can browse and read a repository but cannot mutate anything, verified at the API level, not just the UI level.

---

### Stage 5 — Activity Log
**Why fifth:** more valuable once roles exist (role changes become a loggable action too), and the earlier stages (export, cascade-delete side effects) are already stable to log against.

- Add an `ActivityLog` collection with an index suited to "recent activity for a repository."
- Add a `logActivity()` helper, called from the same controllers that already emit socket events for file/folder/collaborator actions.
- Add `GET /api/repositories/:id/activity`, paginated.
- Add a frontend panel to view it — this can live inside the Stage 7 settings page or stand alone.

**Exit criteria:** performing a sequence of test actions (create file, rename folder, invite collaborator, accept invitation) produces an accurate, correctly-ordered activity log for that repository.

---

### Stage 6 — In-App Notifications
**Why sixth:** benefits from a personal-room socket pattern introduced cleanly, and pairs naturally with the invitation flow already fresh from Stages 3–4.

- Add a `Notification` collection with an appropriate index.
- Add a `user:<userId>` personal socket room, joined automatically on connection (in addition to the existing `repo:<id>` room model).
- On `sendInvitation`, create a notification and emit `notification:new` to the recipient's personal room.
- Add `GET /api/notifications` and a mark-as-read endpoint.
- Add a navbar badge and dropdown on the frontend.

**Exit criteria:** a user sees a notification indicator update in real time when invited to a repository, without needing to be on the dashboard.

---

### Stage 7 — Repository Settings Page
**Why seventh:** a composition of everything above — building it last means every tab (General, Collaborators with roles, Export, Danger Zone) already has working functionality to wire in, rather than building UI ahead of the backend.

- New route `/workspace/:repoId/settings`, tabbed UI.
- Wire the endpoints from every previous stage into their respective tabs.

**Exit criteria:** every repository-level management action (rename, visibility, collaborators + roles, export, delete) is reachable from one page.

---

### Stage 8 — Polish Backlog (No Fixed Order)

These have no dependencies on each other — pick up whichever is most valuable at the time:

- Markdown preview
- Repository search
- Recently opened files
- Richer presence text (e.g. "editing App.jsx")
- Optimistic UI updates for file/folder mutations

Each can be shipped and reverted independently — treat this as a backlog, not a sequence.

---

## Explicitly Out of Scope (For Now)

These remain out of scope until the roadmap above is complete and reassessed:

- Live cursor sharing / follow-collaborator mode
- Version history / repository snapshots
- Built-in code execution sandbox
- Inline code comments
- Git integration, CRDT/OT-based conflict resolution, AI coding assistant

If there's appetite to keep going after Stage 8, revisit this list fresh rather than assuming the original reasoning still applies — priorities may have shifted by then.

---

## Exit Checklist

Before calling this roadmap "done":

- [ ] Deleting a repository leaves no orphaned files, folders, or invitations
- [ ] Export works correctly on an empty repo, a nested-folder repo, and a realistic repo
- [ ] Only one collaborator-add path exists in the codebase
- [ ] A Viewer role is verified read-only at the API level, not just hidden in the UI
- [ ] Activity log accurately reflects a real sequence of actions
- [ ] Notifications arrive live for a new invitation
- [ ] Every repository management action is reachable from the settings page
- [ ] At least one polish-backlog item has shipped
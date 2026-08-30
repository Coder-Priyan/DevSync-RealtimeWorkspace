# Product Requirements Document (PRD)

## Project Name
DevSync

## Product Category
Real-Time Collaborative Repository Workspace

---

# 1. Introduction

Modern software development is highly collaborative. Whether it is a college project, a hackathon submission, or a small team-based application, multiple developers are often required to work on the same codebase at the same time.

Traditional version control systems (like Git) are built around asynchronous collaboration — commit, push, pull. They are excellent at preserving history but were never designed for two people to see each other typing in the same file at the same moment.

DevSync fills that gap. It is a browser-based workspace where a repository is not a folder on someone's laptop, but a **shared live environment**: one canonical copy of the project, held on the server, that every collaborator edits directly and simultaneously.

---

# 2. Problem Statement

Small teams and student developers working on a shared codebase commonly run into:

* Duplicate project copies across teammates' machines
* Manual file sharing over chat apps before a proper Git setup exists
* "Merge conflict" confusion for beginners unfamiliar with branching
* No visibility into who is working on what, right now
* Delayed visibility of changes — a teammate's edit is invisible until they push and you pull

Git-based platforms solve version history well, but they add a layer of ceremony (branch, commit, push, pull, resolve conflicts) that is unnecessary overhead when a team just wants to **see the same file update live** while pair-programming or working through a hackathon deadline.

---

# 3. Product Vision

DevSync's vision is a workspace where a project exists as one shared live entity rather than a set of local copies stitched together at commit time.

Every collaborator on a repository should be able to:

* Open the same repository and see the same file tree
* Edit the same file at the same time as a teammate and see their keystrokes appear live
* See who else is currently online in that repository
* Trust that whatever they see is the current, persisted state — not a stale local copy

---

# 4. Proposed Solution

DevSync organizes everything around the **repository** as the unit of collaboration. A repository owns a tree of folders and files, an owner, and a list of collaborators.

When a user is inside a repository's workspace:

* File and folder operations (create/rename/delete) are saved through the REST API and then broadcast to everyone else currently viewing that repository, so their file tree updates without a manual refresh.
* Code changes inside the Monaco-based editor are streamed over a Socket.IO connection to every other collaborator with that file open, in addition to being auto-saved to the database on a short debounce.
* Presence (who is online, in which repository) is tracked in memory on the server and broadcast whenever someone joins or leaves.

Access to a repository is controlled through an **invitation flow**: an owner sends an invite by email, the invited user sees it in their pending-invitations list, and accepting it adds them as a collaborator with full read/write access to that repository's files and folders.

Repositories are also intended to be exportable as a ZIP archive so a collaborator can pull the current state down and run it locally — this is part of the product's initial scope, currently in progress.

---

# 5. Target Users

### College Students
Students working on academic assignments, minor/major projects, and final-year submissions who need a lightweight way to co-develop without setting up Git branching workflows.

### Hackathon Teams
Teams with a few hours to a couple of days who need to divide work across a shared codebase and see updates instantly instead of coordinating pushes.

### Beginner Developers
Developers still building comfort with collaborative workflows, for whom "everyone edits the same live file" is a gentler mental model than distributed version control.

### Small Development Teams
Teams that want real-time pair-programming style collaboration without configuring a self-hosted Git server or paying for enterprise tooling.

---

# 6. Product Objectives

* Let two or more people edit the same file at the same time and see each other's changes without refreshing.
* Remove the need to manually share project files or zip archives mid-development.
* Give every collaborator visibility into who else is active in the repository right now.
* Provide a controlled way to grant repository access (invite → accept) instead of open sharing.
* Persist every change so the repository state survives page reloads and server restarts.
* Allow a finished or in-progress repository to be exported for local use.

---

# 7. Core Functionalities

### User Authentication
Email/password registration and login, with JWT-based session persistence used for both REST calls and the Socket.IO connection.

### Repository Management
Create, list, view, rename/update, and delete repositories from a central dashboard. Repositories can be marked public or private.

### Collaborator & Invitation Management
Repository owners can send an email-based invitation to a user. The invited user sees pending invitations and can accept or reject them. Accepting adds them to the repository's collaborator list with edit access. Invitations expire automatically after 7 days.

### File & Folder Management
Collaborators can create, rename, and delete files and nested folders inside a repository. These operations persist through the REST API and are broadcast live to everyone else viewing the same repository.

### Real-Time Collaborative Editing
The in-browser code editor (Monaco) broadcasts every keystroke over Socket.IO to other collaborators who have the same file open, while the underlying content is auto-saved to MongoDB on a debounce so nothing is lost.

### Presence Awareness
Every repository workspace shows a live list of who is currently online in that repository, updated the moment someone joins or disconnects.

### Repository Persistence
All repository, folder, file, and user data is stored in MongoDB and survives sessions and restarts.

### Repository Export
Repositories can be downloaded as a ZIP archive for local development — this capability is part of the product's committed scope and is currently being built out.

---

# 8. Product Scope

**Included in initial release:**

* User authentication (register/login, JWT sessions)
* Repository management (CRUD)
* Invitation-based collaborator management
* File and folder management
* Real-time collaborative code editing
* Presence indicators
* Repository export as ZIP

**Excluded from initial release** (explicitly deferred):

* Built-in code execution / sandboxed running of the project
* Git-style version history or commit snapshots
* AI-assisted development features
* Repository analytics/activity logs

These are candidates for future releases, not gaps in the current plan.

---

# 9. Success Metrics

The product is successful if a team can:

* Register, create a repository, and invite a teammate without leaving the app.
* Have two browser sessions open the same file and see each other's edits appear within roughly a second, without refreshing.
* See an accurate, live online/offline presence list for a repository.
* Reload the page or restart the server and find the repository state unchanged.
* Export a repository as a ZIP and run it locally.

---

# 10. Future Direction

Planned long-term extensions, out of scope for the current build:

* Activity logs / audit trail of who changed what and when
* Version history and repository snapshots
* Built-in project execution inside the browser
* AI-assisted coding features (chat-based help, inline suggestions)
* Repository analytics (contribution breakdowns, activity heatmaps)

---

# Product Summary

DevSync is a real-time collaborative repository workspace built to remove the friction of shared development for small teams and students. By combining repository and invitation-based access management with a live, socket-driven editing layer, it lets multiple developers work inside the same project simultaneously — without manual file sharing, without Git ceremony, and without losing track of who is working on what.

# Product Requirements Document

**DevSync — Real-Time Collaborative Development Workspace**

*Defines the problem, objectives, and scope for the product. For technical architecture, see the [TRD](2_TRD.md).*

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Target Users](#target-users)
- [Functional Requirements](#functional-requirements)
- [Non-Functional Requirements](#non-functional-requirements)
- [Scope](#scope)
- [Constraints](#constraints)
- [Future Scope](#future-scope)
- [Success Metrics](#success-metrics)

---

## Problem Statement

Collaborative software development is typically built around *asynchronous* workflows — commit, push, pull, merge. Git-based platforms are excellent at preserving history, but they were never designed for two people to see each other editing the same file at the same moment.

This creates friction for small teams and student developers, who commonly deal with:

- Duplicate project copies across teammates' machines
- Manual file sharing over chat apps before a proper Git setup exists
- No visibility into who is working on what, right now
- Delayed visibility of changes — a teammate's edit is invisible until they push and you pull

There is no lightweight, self-contained workspace that lets a small team treat a repository as one shared live entity — edited directly and simultaneously — rather than a set of local copies reconciled at commit time.

DevSync addresses this gap directly.

---

## Objectives

| Objective | Description |
|---|---|
| Live Synchronization | Two or more collaborators must be able to edit the same file at the same time and see each other's changes without refreshing |
| Access Control | Repository access must be explicitly granted through an invitation flow, not open sharing |
| Presence Visibility | Every collaborator must be able to see who else is currently online in a repository, in real time |
| Persistence | Every repository, file, folder, and edit must survive page reloads and server restarts |
| Low Ceremony | Achieve real-time collaboration without requiring branch/commit/push/pull mechanics |

---

## Target Users

| User | Interest |
|---|---|
| College students | A lightweight way to co-develop assignments and projects without setting up Git branching workflows |
| Hackathon teams | Dividing work across a shared codebase and seeing updates instantly instead of coordinating pushes under time pressure |
| Beginner developers | A gentler collaboration model ("everyone edits the same live file") than distributed version control |
| Small development teams | Real-time, pair-programming-style collaboration without a self-hosted Git server or enterprise tooling |

---

## Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | System shall support user registration and login via email/password, issuing a JWT session used for both REST calls and the Socket.IO connection |
| FR-2 | System shall support full CRUD operations on repositories, files, and folders via REST |
| FR-3 | System shall broadcast file and folder create/rename/delete operations in real time to every collaborator viewing the same repository |
| FR-4 | System shall broadcast code changes made in the in-browser editor to every other collaborator with that file open, over Socket.IO |
| FR-5 | System shall re-authenticate every socket connection against the same JWT used by the REST API before allowing it to join a repository room |
| FR-6 | System shall track and broadcast live presence (who is online) per repository, deduplicated per user across multiple open tabs |
| FR-7 | System shall support sending, receiving, accepting, and rejecting collaborator invitations to a repository |
| FR-8 | System shall persist all repository, file, folder, user, and invitation data in MongoDB |
| FR-9 | System shall support exporting a repository as a downloadable ZIP archive |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | Real-time propagation of an edit to other collaborators should occur within roughly one second under normal network conditions |
| NFR-2 | Socket connections must not be established outside a workspace (e.g. during login/registration/dashboard), to avoid unnecessary open connections |
| NFR-3 | Presence state does not need to survive a server restart — it is derived from live connections and is correct to reset with them |
| NFR-4 | Repository, file, and folder state must remain consistent and durable across page reloads and server restarts |
| NFR-5 | Socket-level actions (editing, presence) must be scoped to a single repository's room and never leak to a client viewing a different repository |

---

## Scope

**In scope**

- Email/password authentication with JWT sessions
- Repository management (create, read, update, delete)
- File and folder management with real-time tree sync
- Real-time collaborative code editing via Socket.IO
- Live presence indicators per repository
- Invitation-based collaborator access (send/accept/reject)
- Repository persistence in MongoDB
- Repository export as ZIP *(in progress — see [Feature Status](../README.md#feature-status))*

**Out of scope**

- Built-in code execution / sandboxed running of the project
- Git-style version history or commit snapshots
- AI-assisted development features
- Repository analytics or activity/audit logs

---

## Constraints

- Presence state is held in-memory on the server, not in the database — it is intentionally not durable across restarts
- Real-time sync depends on an active Socket.IO connection; there is no offline-edit/merge-on-reconnect model
- A single server instance handles both the REST API and the Socket.IO layer — no distributed/multi-node scaling in the current build
- Editor auto-save and broadcast both depend on a live socket; a dropped connection pauses both until it reconnects

---

## Future Scope

- Activity logs / audit trail of who changed what and when
- Version history and repository snapshots
- Built-in project execution inside the browser
- AI-assisted coding features (chat-based help, inline suggestions)
- Repository analytics (contribution breakdowns, activity heatmaps)

---

## Success Metrics

| Metric | Definition of Success |
|---|---|
| Live edit propagation | Two browser sessions with the same file open see each other's edits appear within roughly a second, without refreshing |
| Access control correctness | A user only gains repository access after sending and accepting an invitation — never through open sharing |
| Presence accuracy | The online-users list for a repository reflects exactly who is currently connected, deduplicated across multiple tabs |
| State durability | Reloading the page or restarting the server leaves repository, file, and folder state unchanged |
| End-to-end workflow | A team can register, create a repository, invite a teammate, and collaboratively edit a file without leaving the app |
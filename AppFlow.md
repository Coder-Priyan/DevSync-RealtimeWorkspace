# App Flow Document

## Project Name

DevSync

## Overview

DevSync follows a repository-based workflow where users can create repositories, invite collaborators, and work together on project files in real time. The application is designed to ensure that all collaborators always have access to the latest version of the project without manually sharing files or performing synchronization operations.

---

## User Authentication Flow

A new user creates an account using their email and password.

After successful registration, the user can log in to the platform. Once authenticated, a JWT token is issued and the user is redirected to the dashboard.

Unauthenticated users cannot access repository resources or workspace routes.

---

## Dashboard Flow

After login, the user lands on the dashboard.

The dashboard displays:

* Repositories owned by the user
* Repositories shared with the user
* Recent repositories

From the dashboard, the user can:

* Create a new repository
* Open an existing repository
* Delete a repository (if owner)

---

## Repository Creation Flow

The user selects the "Create Repository" option and provides a repository name.

Once created:

* A repository record is stored in the database.
* The current user becomes the repository owner.
* The repository is added to the user's dashboard.

The user is then redirected to the repository workspace.

---

## Collaborator Management Flow

Repository owners can invite collaborators using their registered email address.

When an invitation is accepted:

* The collaborator is added to the repository.
* Repository access permissions are granted.
* The repository becomes visible in the collaborator's dashboard.

All repository members can access the same workspace.

---

## Workspace Flow

When a repository is opened, the system loads:

* Repository information
* File structure
* Folder hierarchy
* Collaborator details

A Socket.IO connection is established to enable real-time synchronization between active collaborators.

Each connected user joins the repository workspace channel.

---

## File Management Flow

Inside the workspace, users can:

* Create files
* Create folders
* Rename files
* Rename folders
* Delete files
* Delete folders

Whenever a file operation occurs:

1. The action is saved to the database.
2. The update is emitted through Socket.IO.
3. Connected collaborators receive the update instantly.
4. Their workspace is updated without requiring a refresh.

---

## Code Editing Flow

Users can open any file from the repository and start editing.

When a code change occurs:

1. The editor captures the modification.
2. The update is sent to the server through Socket.IO.
3. The server broadcasts the change to other connected collaborators.
4. Collaborators receive and apply the update immediately.

This allows multiple users to work on the same project simultaneously.

---

## Online Presence Flow

When a user enters a repository workspace:

* Their status is marked as active.
* Other collaborators can see that the user is online.

When a user leaves the workspace or disconnects:

* Their online status is removed.
* The active members list is updated.

---

## Repository Persistence Flow

All repository data is stored in MongoDB.

Changes made to:

* Files
* Folders
* Repository structure
* Repository metadata

are persisted automatically.

When a user returns to the repository later, the latest saved state is restored.

---

## Export Flow

Repository owners and authorized collaborators can export the repository.

During export:

1. The system collects all repository files and folders.
2. A ZIP archive is generated.
3. The archive is downloaded to the user's local machine.

The exported repository can then be opened and executed locally using development environments such as VS Code.

---

## High-Level Application Flow

User Authentication

→ Dashboard

→ Repository Creation / Repository Selection

→ Repository Workspace

→ File & Folder Management

→ Real-Time Collaboration

→ Automatic Persistence

→ Repository Export

→ Local Development & Execution

---

## Expected User Experience

A user should be able to create a repository, invite collaborators, edit project files in real time, and export the completed project without relying on ZIP sharing, repeated file transfers, or continuous manual synchronization.

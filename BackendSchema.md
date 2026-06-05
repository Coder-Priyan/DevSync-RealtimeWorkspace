# Backend Schema Design Document

## Project Name

DevSync

## Project Type

Real-Time Collaborative Repository Workspace

---

# 1. Overview

The backend data model is designed around repositories as the primary unit of collaboration.

Each repository represents an isolated workspace containing project files, folders, collaborators, and repository metadata.

The schema is designed to support:

* Repository management
* Real-time collaboration
* File organization
* User permissions
* Repository persistence

The architecture should remain flexible enough to support future features such as version history, activity tracking, and AI-assisted development.

---

# 2. Data Architecture

The system consists of five primary entities:

* Users
* Repositories
* Collaborators
* Files
* Folders

These entities collectively define the structure of a collaborative workspace.

---

# 3. User Entity

The User entity represents an authenticated platform user.

A user can:

* Create repositories
* Join repositories
* Collaborate on projects
* Export repositories

### Fields

User ID

Username

Email

Password Hash

Profile Image

Created At

Updated At

### Relationships

One user can own multiple repositories.

One user can collaborate in multiple repositories.

---

# 4. Repository Entity

The Repository entity acts as the central workspace of the platform.

Every project exists inside a repository.

A repository contains:

* Files
* Folders
* Collaborators
* Metadata

### Fields

Repository ID

Repository Name

Description

Owner ID

Visibility

Created At

Updated At

### Relationships

One repository belongs to one owner.

One repository can contain multiple collaborators.

One repository can contain multiple files and folders.

---

# 5. Collaborator Entity

The Collaborator entity manages repository access.

This entity defines which users can access a repository.

### Fields

Collaborator ID

Repository ID

User ID

Role

Joined At

### Roles

Owner

Editor

Viewer

### Relationships

A collaborator belongs to one repository.

A collaborator references one user.

---

# 6. Folder Entity

The Folder entity manages repository structure.

Folders allow users to organize project resources.

### Fields

Folder ID

Repository ID

Parent Folder ID

Folder Name

Created By

Created At

Updated At

### Relationships

A folder belongs to one repository.

A folder can contain multiple files.

A folder can contain nested folders.

---

# 7. File Entity

The File entity stores project source files.

Files are the primary collaborative resources inside a repository.

### Fields

File ID

Repository ID

Parent Folder ID

File Name

Extension

Content

Created By

Created At

Updated At

### Relationships

A file belongs to one repository.

A file belongs to one folder.

Multiple collaborators may edit the same file.

---

# 8. Entity Relationships

User

↓

Repository (Owner)

↓

Collaborators

↓

Folders

↓

Files

---

Relationship Summary

User → Repository

One-to-Many

Repository → Collaborators

One-to-Many

Repository → Folders

One-to-Many

Folder → Files

One-to-Many

Folder → Folder

Self-Referencing

---

# 9. Repository Structure Example

Repository

Frontend Project

│

├── src

│ ├── App.js

│ ├── Navbar.js

│ └── Home.js

│

├── public

│ └── index.html

│

└── backend

├── server.js

└── routes.js

The folder hierarchy should be represented dynamically within the database and reconstructed whenever a repository is loaded.

---

# 10. Repository Permissions

Access control is enforced at repository level.

### Owner

Can:

* Manage repository
* Invite collaborators
* Remove collaborators
* Delete repository

### Editor

Can:

* Create files
* Edit files
* Delete files
* Create folders

### Viewer

Can:

* View repository contents
* Access project structure

Cannot modify repository resources.

---

# 11. Real-Time Synchronization Layer

Real-time collaboration data should not be permanently stored through Socket.IO.

Socket.IO is only responsible for transmitting events.

Persistent storage remains the responsibility of MongoDB.

Example:

User edits file

↓

Database updated

↓

Socket event emitted

↓

Connected collaborators updated

This approach ensures repository consistency across sessions.

---

# 12. Data Persistence Strategy

All repository operations should be persisted immediately.

Persisted operations include:

* Repository creation
* File creation
* File deletion
* Folder creation
* Folder deletion
* File renaming
* Folder renaming
* Code modifications

No repository state should depend solely on active socket connections.

---

# 13. Future Schema Extensions

The current schema is intentionally modular to support future features.

Potential future collections:

### Activity Logs

Tracks repository actions.

Examples:

* File created
* File deleted
* Collaborator added

---

### Repository Versions

Stores repository snapshots.

Used for version history and rollback.

---

### Notifications

Stores repository invitations and updates.

---

### AI Context Storage

Stores AI-generated suggestions and repository insights.

---

# Schema Summary

The DevSync backend follows a repository-centric architecture where repositories serve as the primary collaboration unit. Users, collaborators, folders, and files are organized around repositories, creating a scalable structure capable of supporting real-time collaboration while maintaining long-term repository persistence.

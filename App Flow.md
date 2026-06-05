# App Flow Document

## Project Name

DevSync

## Application Type

Real-Time Collaborative Repository Workspace

---

# 1. User Journey Overview

User

↓

Register / Login

↓

Dashboard

↓

Create Repository

↓

Invite Collaborators

↓

Open Repository Workspace

↓

Manage Files & Folders

↓

Real-Time Collaboration

↓

Export Repository

↓

Run Locally

---

# 2. Authentication Flow

Landing Page

↓

Register

OR

Login

↓

JWT Authentication

↓

Dashboard

---

# 3. Dashboard Flow

Dashboard

↓

View Repositories

↓

Create Repository

OR

Open Existing Repository

OR

Delete Repository

---

# 4. Create Repository Flow

Dashboard

↓

Create Repository

↓

Enter Repository Name

↓

Create

↓

Repository Created

↓

Redirect To Workspace

---

# 5. Collaborator Flow

Repository Workspace

↓

Manage Members

↓

Invite Collaborator

↓

User Accepts Invitation

↓

Added To Repository

↓

Repository Visible In Dashboard

---

# 6. Repository Workspace Flow

Open Repository

↓

Workspace Loaded

↓

File Explorer + Editor

↓

Real-Time Collaboration Enabled

---

# 7. File Management Flow

Workspace

↓

Create File

↓

File Added To Repository

↓

File Appears For All Members

↓

Open File

↓

Edit File

↓

Auto Save

↓

Database Update

↓

Real-Time Sync

---

# 8. Folder Management Flow

Workspace

↓

Create Folder

↓

Folder Added

↓

Visible To All Collaborators

↓

Add Files Inside Folder

↓

Auto Synchronization

---

# 9. Real-Time Collaboration Flow

User A Opens Repository

↓

User B Opens Repository

↓

Socket Connection Established

↓

Repository Room Joined

↓

User A Edits Code

↓

Change Sent To Server

↓

Server Broadcasts Change

↓

User B Receives Update

↓

Editor Updated Instantly

---

# 10. Online Presence Flow

User Enters Repository

↓

Socket Connected

↓

Status Updated

↓

Online Members List Updated

↓

Visible To All Collaborators

---

# 11. Repository Persistence Flow

User Edits Repository

↓

Auto Save Triggered

↓

MongoDB Updated

↓

Repository Stored

↓

User Logs Out

↓

User Logs In Again

↓

Repository Restored

---

# 12. Export Flow

Repository Workspace

↓

Click Export

↓

Server Collects Repository Files

↓

Generate ZIP

↓

Download ZIP

↓

Open In VS Code

↓

Run Locally

---

# 13. Error Handling Flow

User Action

↓

Validation Check

↓

If Success

Continue Flow

↓

If Error

Display Error Message

↓

Stay On Current Screen

---

# 14. Screen Structure

1. Landing Page

2. Register Page

3. Login Page

4. Dashboard

5. Create Repository Modal

6. Repository Workspace

7. Collaborator Management Modal

8. Export Repository Modal

---

# 15. Workspace Layout Flow

Repository Workspace

│

├── Top Navbar
│     ├── Repository Name
│     ├── Export Button
│     └── Members

│
├── Left Sidebar
│     ├── Files
│     └── Folders

│
├── Center Panel
│     └── Code Editor

│
└── Right Sidebar
├── Online Members
└── Activity Feed

---

# 16. MVP User Story

Priyan creates repository

↓

Invites Rahul and Akash

↓

All members join repository

↓

Priyan creates Login.js

↓

File instantly appears for Rahul and Akash

↓

Rahul writes code

↓

Code appears instantly for all members

↓

Repository automatically saves

↓

Priyan exports repository

↓

ZIP downloaded

↓

Project opened in VS Code

↓

Project runs locally

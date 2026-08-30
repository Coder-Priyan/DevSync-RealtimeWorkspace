# UI/UX Design Brief

## Project Name
DevSync

---

# 1. Design Philosophy

DevSync's visual language borrows deliberately from developer tools its users already live in daily — the aesthetic is dark, IDE-like, and quiet, so the interface disappears and the code/collaboration stays the focus. Nothing about the UI should compete with the Monaco editor for attention.

Core principles:
* **Dark-first**: there is no light theme in scope — the entire app is designed against a single dark palette.
* **Developer-familiar**: layout patterns (sidebar file tree, tabbed editor, status bar) mirror VS Code so the tool feels immediately usable with zero onboarding.
* **Quiet chrome, loud content**: navigation and surfaces use muted, low-contrast tones; accent color is reserved for actionable/interactive elements only.

---

# 2. Design Tokens

Defined once via Tailwind v4's `@theme` block and reused everywhere — no raw hex codes elsewhere in the codebase.

| Token | Value | Usage |
|---|---|---|
| `ds-base` | `#0D1117` | App background (matches GitHub dark base) |
| `ds-surface` | `#161B22` | Panels, cards, sidebar background |
| `ds-elevated` | `#21262D` | Modals, dropdowns, hovered rows |
| `ds-border` | `#30363D` | All hairline borders/dividers |
| `ds-text` | `#E6EDF3` | Primary text |
| `ds-text-muted` | `#8B949E` | Secondary text, labels |
| `ds-text-faint` | `#484F58` | Placeholder/disabled text |
| `ds-accent` | `#7C5CFC` | Primary actions, links, active states |
| `ds-accent-hover` | `#6B4EE6` | Hover state for accent elements |
| `ds-danger` | `#F85149` | Destructive actions, error states |
| `ds-success` | `#3FB950` | Saved/online/success indicators |
| `ds-warning` | `#D29922` | Warnings, expiring invitations |
| `ds-info` | `#58A6FF` | Informational badges |

### Typography
* **UI font**: Inter (weights 300–700)
* **Code font**: JetBrains Mono (with italics for comments), used in the Monaco editor and anywhere file content or code-like values are shown
* **Base size**: 13px, line-height 1.5 — deliberately compact to match dense developer-tool UIs rather than a marketing-site's larger type scale

---

# 3. Layout Structure

### App Shell
`AppShell` is the persistent frame for all authenticated pages, composed of:
* `Navbar` — top bar: app identity, user menu
* `Sidebar` — left rail: repository file tree (workspace) or repo list (dashboard context)
* Main content region — page-specific
* `StatusBar` — bottom strip: connection state, save status, active file info

### Dashboard Layout
* `DashboardHeader` — page title + "new repository" entry point
* `RepoList` → grid/list of `RepoCard`s, each showing name, description, visibility badge, and last-updated
* Empty state (`EmptyState`) when the user has no repositories yet, with a clear call-to-action to create one

### Workspace Layout
Three-pane IDE-style layout:
1. **Left — File Explorer**: `FileTree` built from `TreeNode` recursion, with `FileContextMenu` for create/rename/delete actions on right-click
2. **Center — Editor**: `WorkspaceNavbar` (repo name, `BreadcrumbNav`, `ExportButton`) above `TabBar` (open files) above `EditorPane` (Monaco instance); `EditorPlaceHolder` shown when no file is open
3. **Right — Collaboration Pane**: `PresenceList` (who's online, via `UserPresenceRow`), `InviteForm`, and `ReceivedInvitations`

`StatusBar` at the very bottom reflects live socket connection state and the editor's save status (`saving` / `saved` / `error`), giving the user constant, low-effort confidence that their work is persisted.

---

# 4. Component Inventory

### UI primitives (`components/ui`)
* `Button` — single component handling all button variants (primary/accent, secondary, danger, ghost) rather than one-off styled buttons per feature
* `Input` — shared text input with consistent focus/error states
* `Modal` — shared modal shell used by `CreateRepoModal` and any future dialogs

### Shared components (`components/shared`)
* `AvatarBadge` — user avatar with initials fallback, used in presence lists and collaborator rows
* `EmptyState` — reusable empty/zero-data illustration + message + CTA
* `FileIcon` — maps file extension to an appropriate icon

### Feature components
* Auth: `LoginForm`, `RegisterForm`
* Dashboard: `CreateRepoModal`, `DashboardHeader`, `RepoCard`, `RepoList`
* Workspace / Editor: `EditorPane`, `EditorPlaceHolder`, `TabBar`
* Workspace / File Explorer: `FileTree`, `TreeNode`, `FileContextMenu`
* Workspace / Toolbar: `BreadcrumbNav`, `ExportButton`, `WorkspaceNavbar`
* Workspace / Collaboration: `InviteForm`, `PresenceList`, `ReceivedInvitations`, `UserPresenceRow`

---

# 5. Key Interaction Patterns

### Presence & Live Status
Online collaborators render as avatar badges with a live-updating count; the status bar reflects real-time socket connection health so a dropped connection is visible immediately rather than silently failing.

### Save Status Feedback
The editor status indicator cycles through three states tied directly to the auto-save debounce: `saving` (user is actively typing, change is queued), `saved` (debounced REST write succeeded), `error` (write failed — surfaced rather than swallowed).

### Invitations as a First-Class Surface
Pending invitations are not buried in settings — `ReceivedInvitations` is a visible panel so a user is never left wondering why they can't see a repo they were told about.

### Context Menus Over Modals for File Ops
Create/rename/delete for files and folders use inline context menus (`FileContextMenu`) rather than modal dialogs, keeping frequent, low-stakes actions fast — modals are reserved for higher-stakes or multi-field actions (creating a repository, inviting a collaborator).

---

# 6. Accessibility & Responsiveness Notes

* Sufficient contrast is maintained between `ds-text` / `ds-text-muted` and their respective backgrounds (`ds-base`/`ds-surface`) to remain readable at the compact 13px base size.
* The three-pane workspace layout is the primary target; collapsing the collaboration pane and/or file explorer on narrower viewports is a known follow-up rather than a solved requirement in the current build.
* Loading states (`AppLoadingScreen`, route-level `PageLoader`) are intentionally minimal and fast — sessions restore from a stored token in well under a second in normal conditions, so loaders are a safety net, not a feature.

---

# 7. Design Non-Goals

* No light theme.
* No custom per-user theming/branding.
* No animation-heavy transitions — motion is limited to small, functional cues (pulsing loading dots, hover states), consistent with the "quiet chrome" principle.

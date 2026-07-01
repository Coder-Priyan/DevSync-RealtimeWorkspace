// frontend/src/features/workspace/hooks/usePresence.js
// Milestone 3: no longer returns mock data.
// WorkspacePage passes onlineUsers from useSocket directly.
// This hook is now a thin pass-through kept for architectural consistency —
// Phase 4 will extend it with activeFile tracking per user.

export function usePresence(onlineUsers = []) {
  // Phase 4: derive per-user activeFile from onlineUsers here
  return { onlineUsers }
}
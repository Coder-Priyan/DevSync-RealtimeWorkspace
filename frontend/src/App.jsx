/**
 * App.jsx — Root of the DevSync React application.
 *
 * RESPONSIBILITY:
 *   - Mount global context providers in the correct nesting order.
 *   - Render AppRouter as the child so all routes have access to all contexts.
 *   - Nothing else. No UI. No logic. No state.
 *
 * PROVIDER ORDER (outer → inner):
 *   AuthProvider         — must be outermost so AppRouter and all routes can read auth state
 *   └── AppRouter        — all routes live here
 *
 * Future providers slot in here as the app grows:
 *   AuthProvider
 *   └── ThemeProvider      (Stage 8+ — if dark/light toggle is added)
 *       └── ToastProvider  (Stage 5+ — global toast notifications)
 *           └── AppRouter
 *
 * App.css is imported here for any global style overrides beyond index.css.
 * Most global styles live in index.css — App.css is for edge cases.
 */

import AppRouter from "./routes/AppRouter";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App

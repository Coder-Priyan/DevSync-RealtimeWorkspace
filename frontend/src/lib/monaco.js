/**
 * lib/monaco.js — Monaco Editor configuration for DevSync.
 *
 * Monaco (~2MB) is NEVER imported synchronously.
 * The EditorPane component (Stage 6) lazy-loads it with React.lazy() + Suspense.
 * This file provides the configuration defaults that Monaco will use.
 *
 * Centralizing config here means:
 * - One place to change theme, font, or editor behavior
 * - The EditorPane component stays clean — just passes these options
 * - Future: swap theme or add keybindings without touching components
 */

// ─── Language Map ─────────────────────────────────────────────────────────────
// Maps file extension → Monaco language identifier.
// Used by EditorPane to enable syntax highlighting when a file is opened.
export const EXTENSION_TO_LANGUAGE = {
  // Web
  js:    'javascript',
  jsx:   'javascript',
  ts:    'typescript',
  tsx:   'typescript',
  html:  'html',
  htm:   'html',
  css:   'css',
  scss:  'scss',
  sass:  'scss',
  less:  'less',

  // Data / Config
  json:  'json',
  yaml:  'yaml',
  yml:   'yaml',
  toml:  'ini',       // Monaco doesn't have TOML, ini is closest
  env:   'plaintext',
  xml:   'xml',

  // Backend languages
  py:    'python',
  java:  'java',
  kt:    'kotlin',
  go:    'go',
  rs:    'rust',
  cpp:   'cpp',
  c:     'c',
  cs:    'csharp',
  php:   'php',
  rb:    'ruby',

  // Shell / DevOps
  sh:    'shell',
  bash:  'shell',
  zsh:   'shell',
  dockerfile: 'dockerfile',

  // Docs / Markup
  md:    'markdown',
  mdx:   'markdown',
  txt:   'plaintext',
  gitignore: 'plaintext',

  // Database
  sql:   'sql',
  prisma: 'plaintext', // Monaco doesn't have Prisma schema — future extension
}

/**
 * getLanguageFromFilename — Returns the Monaco language ID for a given filename.
 *
 * @param {string} filename — e.g. 'App.jsx', '.gitignore', 'dockerfile'
 * @returns {string} — Monaco language ID, defaults to 'plaintext'
 *
 * Usage (in EditorPane):
 *   const language = getLanguageFromFilename(activeFile.name)
 *   <MonacoEditor language={language} ... />
 */
export const getLanguageFromFilename = (filename = '') => {
  if (!filename) return 'plaintext'

  // Handle dotfiles like '.gitignore', '.env', '.eslintrc'
  if (filename.startsWith('.')) {
    const name = filename.slice(1).toLowerCase()
    return EXTENSION_TO_LANGUAGE[name] ?? 'plaintext'
  }

  // Handle filenames like 'Dockerfile' (no extension)
  const lower = filename.toLowerCase()
  if (EXTENSION_TO_LANGUAGE[lower]) {
    return EXTENSION_TO_LANGUAGE[lower]
  }

  // Extract extension
  const ext = filename.split('.').pop()?.toLowerCase()
  return EXTENSION_TO_LANGUAGE[ext] ?? 'plaintext'
}

// ─── Editor Options ───────────────────────────────────────────────────────────
// These are the default Monaco editor options for DevSync.
// Passed directly to the <MonacoEditor options={...} /> prop in EditorPane.
export const MONACO_DEFAULT_OPTIONS = {
  // Typography
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  fontSize: 13,
  lineHeight: 21,
  fontLigatures: true,    // Enable => !== -> ligatures

  // Layout
  minimap:          { enabled: false }, // Minimap adds clutter — disabled for now
  lineNumbers:      'on',
  lineNumbersMinChars: 3,
  glyphMargin:      false,              // Space for breakpoint icons — not needed
  folding:          true,
  renderLineHighlight: 'line',          // Highlight the current line

  // Editing
  wordWrap:         'off',              // Developers expect horizontal scroll
  tabSize:          2,
  insertSpaces:     true,
  formatOnPaste:    false,             // Don't reformat — respect the user's code
  formatOnType:     false,

  // Scrolling
  scrollBeyondLastLine: false,         // Don't add empty space after last line
  smoothScrolling:  true,
  scrollbar: {
    vertical:   'auto',
    horizontal: 'auto',
    verticalScrollbarSize:   6,
    horizontalScrollbarSize: 6,
  },

  // Suggestions & hints
  quickSuggestions: false,             // Off by default — Stage 6 can enable
  parameterHints:   { enabled: false },
  suggestOnTriggerCharacters: false,

  // Cursor
  cursorStyle:      'line',
  cursorBlinking:   'smooth',
  cursorSmoothCaretAnimation: 'on',

  // General
  automaticLayout:  true,             // Resize with container — REQUIRED for flex layouts
  contextmenu:      false,            // Use DevSync's own context menu, not Monaco's
  overviewRulerLanes: 0,             // Remove the overview ruler on the right edge
  renderWhitespace: 'none',
}

// ─── Monaco Theme Override ────────────────────────────────────────────────────
// Extends VS Code Dark+ to match DevSync's exact background colors.
// Registered via monaco.editor.defineTheme() in EditorPane before mounting.
export const DEVSYNC_MONACO_THEME = {
  base: 'vs-dark',
  inherit: true,          // Start from VS Code Dark+ and override only what's needed
  rules: [],
  colors: {
    'editor.background':           '#0D1117', // ds-base
    'editor.lineHighlightBackground': '#161B22', // ds-surface
    'editorLineNumber.foreground': '#484F58', // ds-text-faint
    'editorLineNumber.activeForeground': '#8B949E', // ds-text-muted
    'editor.selectionBackground':  '#7C5CFC44', // ds-accent at 26% opacity
    'editorCursor.foreground':     '#E6EDF3',
    'editorWhitespace.foreground': '#30363D',
  },
}
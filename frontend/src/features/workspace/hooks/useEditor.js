// features/workspace/hooks/useEditor.js
// Manages file content in the editor. Stage 5 = mock content only.

import { useState, useCallback } from 'react'

const MOCK_CONTENT = {
  'file-1': `import React from 'react'\nimport './index.css'\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Hello DevSync</h1>\n    </div>\n  )\n}\n\nexport default App`,
  'file-2': `import { StrictMode } from 'react'\nimport { createRoot } from 'react-dom/client'\nimport App from './App.jsx'\n\ncreateRoot(document.getElementById('root')).render(\n  <StrictMode>\n    <App />\n  </StrictMode>\n)`,
  'file-3': `* {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\nbody {\n  font-family: Inter, sans-serif;\n  background: #0D1117;\n  color: #E6EDF3;\n}`,
  'file-4': `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <title>DevSync</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>`,
  'file-5': `{\n  "name": "my-project",\n  "version": "1.0.0",\n  "dependencies": {}\n}`,
  'file-6': `node_modules\n.env\ndist\n.DS_Store`,
}

export function useEditor() {
  // content map: fileId → string
  const [contentMap, setContentMap] = useState(MOCK_CONTENT)
  const [syncStatus, setSyncStatus] = useState('saved') // 'saved' | 'saving' | 'error'

  const getContent = useCallback((fileId) => {
    return contentMap[fileId] ?? ''
  }, [contentMap])

  const setContent = useCallback((fileId, value) => {
    setContentMap((prev) => ({ ...prev, [fileId]: value }))
    setSyncStatus('saving')
    // Stage 6: debounced API call goes here
    // For now just flip back to saved after a moment
    setTimeout(() => setSyncStatus('saved'), 800)
  }, [])

  return { getContent, setContent, syncStatus }
}
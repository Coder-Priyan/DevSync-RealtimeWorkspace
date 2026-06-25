// features/workspace/components/Editor/EditorPane.jsx
// Stage 5: plain textarea. Stage 6: replace with Monaco editor.

import { getFileColor } from '@/utils/fileHelpers'

export function EditorPane({ file, content, onChange }) {
  if (!file) return null

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#0D1117' }}>
      <textarea
        value={content}
        onChange={(e) => onChange(file._id, e.target.value)}
        spellCheck={false}
        style={{
          flex: 1, width: '100%', height: '100%',
          backgroundColor: '#0D1117',
          color: '#E6EDF3',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: '13px', lineHeight: '21px',
          padding: '20px 24px',
          border: 'none', outline: 'none',
          resize: 'none',
          boxSizing: 'border-box',
          tabSize: 2,
        }}
      />
    </div>
  )
}

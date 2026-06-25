// features/workspace/components/Editor/EditorPlaceHolder.jsx

export function EditorPlaceHolder({ repoName }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#0D1117', gap: '16px',
      userSelect: 'none',
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '10px',
        backgroundColor: 'rgba(124,92,252,0.1)',
        border: '1px solid rgba(124,92,252,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C5CFC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#8B949E', fontSize: '14px', margin: '0 0 4px', fontWeight: '500' }}>
          {repoName ?? 'Repository'}
        </p>
        <p style={{ color: '#484F58', fontSize: '12px', margin: 0 }}>
          Select a file from the explorer to start editing.
        </p>
      </div>
    </div>
  )
}

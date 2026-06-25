import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader'
import { RepoCard } from '@/features/dashboard/components/RepoCard'
import { CreateRepoModal } from '@/features/dashboard/components/CreateRepoModal'

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ onCreateRepo }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '16px', padding: '80px 24px', textAlign: 'center',
    }}>
      <div style={{
        width: '56px', height: '56px', borderRadius: '12px',
        backgroundColor: 'rgba(124,92,252,0.1)',
        border: '1px solid rgba(124,92,252,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C5CFC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          <line x1="12" y1="11" x2="12" y2="17"/>
          <line x1="9" y1="14" x2="15" y2="14"/>
        </svg>
      </div>
      <div>
        <p style={{ color: '#E6EDF3', fontWeight: '500', fontSize: '15px', margin: '0 0 6px' }}>
          No repositories yet
        </p>
        <p style={{ color: '#8B949E', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
          Create your first repository to start collaborating.
        </p>
      </div>
      <button
        onClick={onCreateRepo}
        style={{
          padding: '8px 18px', borderRadius: '6px', fontSize: '13px',
          fontWeight: '500', border: 'none', backgroundColor: '#7C5CFC',
          color: 'white', cursor: 'pointer', fontFamily: 'inherit',
          marginTop: '4px',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6B4EE6'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7C5CFC'}
      >
        Create Repository
      </button>
    </div>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function RepoCardSkeleton() {
  const shimmer = {
    backgroundColor: '#21262D',
    borderRadius: '4px',
    animation: 'pulse 1.5s ease-in-out infinite',
  }
  return (
    <div style={{
      backgroundColor: '#161B22', border: '1px solid #30363D',
      borderRadius: '8px', padding: '20px',
      display: 'flex', flexDirection: 'column', gap: '12px',
    }}>
      <div style={{ ...shimmer, height: '16px', width: '55%' }} />
      <div style={{ ...shimmer, height: '12px', width: '80%' }} />
      <div style={{ ...shimmer, height: '11px', width: '30%' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}

// ── DashboardPage ─────────────────────────────────────────────────────────────
function DashboardPage() {
  const {
    repos,
    isLoading,
    error,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    handleCreateRepo,
    handleDeleteRepo,
  } = useDashboard()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D1117', display: 'flex', flexDirection: 'column' }}>

      <DashboardHeader onCreateRepo={openCreateModal} />

      <main style={{ flex: 1, maxWidth: '960px', width: '100%', margin: '0 auto', padding: '40px 24px' }}>

        {/* Page title */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ color: '#E6EDF3', fontWeight: '600', fontSize: '22px', margin: '0 0 6px' }}>
            Repositories
          </h1>
          <p style={{ color: '#8B949E', fontSize: '13px', margin: 0 }}>
            Your workspaces and shared projects.
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div style={{
            padding: '14px 18px', borderRadius: '8px', marginBottom: '24px',
            backgroundColor: 'rgba(248,81,73,0.1)',
            border: '1px solid rgba(248,81,73,0.3)',
            color: '#F85149', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {[1, 2, 3].map((n) => <RepoCardSkeleton key={n} />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && repos.length === 0 && (
          <EmptyState onCreateRepo={openCreateModal} />
        )}

        {/* Repo grid */}
        {!isLoading && repos.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {repos.map((repo) => (
              <RepoCard
                key={repo._id}
                repo={repo}
                onDelete={handleDeleteRepo}
              />
            ))}
          </div>
        )}

      </main>

      {/* Create repo modal */}
      <CreateRepoModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onCreate={handleCreateRepo}
      />

    </div>
  )
}

export default DashboardPage

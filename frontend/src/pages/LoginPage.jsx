import { LoginForm } from '@/features/auth/components/LoginForm'

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '6px',
        backgroundColor: '#7C5CFC', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{ color: 'white', fontWeight: '700', fontSize: '16px', lineHeight: 1 }}>D</span>
      </div>
      <span style={{ color: '#E6EDF3', fontWeight: '600', fontSize: '20px', letterSpacing: '-0.02em' }}>
        DevSync
      </span>
    </div>
  )
}

function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0D1117',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '384px' }}>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <Logo />
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: '#E6EDF3', fontWeight: '600', fontSize: '18px', margin: '4px 0 0' }}>
              Sign in to your workspace
            </h1>
            <p style={{ color: '#8B949E', fontSize: '14px', margin: '4px 0 0' }}>
              Your repositories are waiting.
            </p>
          </div>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#161B22',
          border: '1px solid #30363D',
          borderRadius: '8px',
          padding: '28px 24px',
        }}>
          <LoginForm />
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#484F58', marginTop: '24px' }}>
          By signing in, you agree to DevSync's{' '}
          <span style={{ color: '#8B949E' }}>Terms of Service</span>
          {' '}and{' '}
          <span style={{ color: '#8B949E' }}>Privacy Policy</span>.
        </p>

      </div>
    </div>
  )
}

export default LoginPage

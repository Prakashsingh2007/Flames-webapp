import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'
import {
  calculateFlamesApi,
  getFlamesHistoryApi,
  getMyResultsApi,
} from './api/flamesApi'
import { loginApi, logoutApi, registerApi } from './api/authApi'

const relationshipThemes = {
  Friends: { emoji: '🤝', gradient: 'theme-friends' },
  Love: { emoji: '❤️', gradient: 'theme-love' },
  Affection: { emoji: '💖', gradient: 'theme-affection' },
  Marriage: { emoji: '💍', gradient: 'theme-marriage' },
  Enemies: { emoji: '⚡', gradient: 'theme-enemies' },
  Siblings: { emoji: '🫶', gradient: 'theme-siblings' },
}

function App() {
  const MotionDiv = motion.div
  const MotionLi = motion.li
  const [name1, setName1] = useState('')
  const [name2, setName2] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resultVersion, setResultVersion] = useState(0)

  const [activeTab, setActiveTab] = useState('calculate')
  const [historyRows, setHistoryRows] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('flames_theme') || 'dark')

  const [authMode, setAuthMode] = useState('login')
  const [authUsername, setAuthUsername] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('flames_auth_user')
    return stored ? JSON.parse(stored) : null
  })

  const relationshipMeta = useMemo(() => {
    if (!result?.relationship) {
      return { emoji: '✨', gradient: '' }
    }

    return relationshipThemes[result.relationship] || { emoji: '✨', gradient: '' }
  }, [result])

  // Keep theme state synchronized with the document and local storage.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode)
    localStorage.setItem('flames_theme', themeMode)
  }, [themeMode])

  // Refresh history whenever the history tab is open.
  useEffect(() => {
    if (activeTab !== 'history') {
      return
    }

    const loadHistory = async () => {
      setHistoryLoading(true)
      setHistoryError('')

      try {
        const payload = currentUser ? await getMyResultsApi() : await getFlamesHistoryApi(20)
        const rows = Array.isArray(payload) ? payload : payload.results || []
        setHistoryRows(rows)
      } catch (requestError) {
        setHistoryError(requestError.message || 'Unable to load history.')
      } finally {
        setHistoryLoading(false)
      }
    }

    loadHistory()
  }, [activeTab, currentUser, resultVersion])

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setIsLoading(true)

    try {
      const payload = await calculateFlamesApi({
        name1,
        name2,
      })

      setResult(payload)
      setResultVersion((value) => value + 1)
    } catch (requestError) {
      setResult(null)
      setError(requestError.message || 'Could not calculate FLAMES right now.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setName1('')
    setName2('')
    setResult(null)
    setError('')
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      const payload =
        authMode === 'register'
          ? await registerApi({
              username: authUsername.trim(),
              email: authEmail.trim(),
              password: authPassword,
            })
          : await loginApi({
              username: authUsername.trim(),
              password: authPassword,
            })

      localStorage.setItem('flames_auth_token', payload.token)
      localStorage.setItem('flames_auth_user', JSON.stringify(payload.user))
      setCurrentUser(payload.user)
      setAuthPassword('')
    } catch (requestError) {
      setAuthError(requestError.message || 'Authentication failed.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    setAuthError('')
    setAuthLoading(true)

    try {
      await logoutApi()
    } catch (requestError) {
      setAuthError(requestError.message || 'Logout failed.')
    } finally {
      localStorage.removeItem('flames_auth_token')
      localStorage.removeItem('flames_auth_user')
      setCurrentUser(null)
      setAuthLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="topbar-card">
        <h1>FLAMES Studio</h1>
        <div className="topbar-actions">
          <button
            type="button"
            className="chip-btn"
            onClick={() => setThemeMode((value) => (value === 'dark' ? 'light' : 'dark'))}
          >
            {themeMode === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
          </button>
          <button
            type="button"
            className={`chip-btn ${activeTab === 'calculate' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculate')}
          >
            Calculate
          </button>
          <button
            type="button"
            className={`chip-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>
      </section>

      <section className="content-grid">
        <article className="panel auth-panel">
          <h2>Account</h2>
          {currentUser ? (
            <div className="signed-in-box">
              <p>
                Logged in as <strong>{currentUser.username}</strong>
              </p>
              <button type="button" className="ghost-btn" onClick={handleLogout} disabled={authLoading}>
                {authLoading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          ) : (
            <>
              <div className="switch-row">
                <button
                  type="button"
                  className={`chip-btn ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => setAuthMode('login')}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`chip-btn ${authMode === 'register' ? 'active' : ''}`}
                  onClick={() => setAuthMode('register')}
                >
                  Register
                </button>
              </div>

              <form className="stack" onSubmit={handleAuthSubmit}>
                <input
                  type="text"
                  placeholder="Username"
                  value={authUsername}
                  onChange={(event) => setAuthUsername(event.target.value)}
                  required
                />
                {authMode === 'register' ? (
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={authEmail}
                    onChange={(event) => setAuthEmail(event.target.value)}
                  />
                ) : null}
                <input
                  type="password"
                  placeholder="Password"
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  required
                />
                <button className="primary-btn" type="submit" disabled={authLoading}>
                  {authLoading ? 'Please wait...' : authMode === 'register' ? 'Create account' : 'Login'}
                </button>
              </form>
            </>
          )}
          {authError ? <p className="error-text">{authError}</p> : null}
        </article>

        <article className="panel main-panel">
          <AnimatePresence mode="wait">
            {activeTab === 'calculate' ? (
              <MotionDiv
                key="calculate-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <form className="stack" onSubmit={handleSubmit}>
                  <h2>Calculate FLAMES</h2>
                  <input
                    type="text"
                    placeholder="First name"
                    value={name1}
                    onChange={(event) => setName1(event.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Second name"
                    value={name2}
                    onChange={(event) => setName2(event.target.value)}
                  />

                  <div className="switch-row">
                    <button className="primary-btn" type="submit" disabled={isLoading}>
                      {isLoading ? 'Calculating...' : 'Calculate'}
                    </button>
                    <button className="ghost-btn" type="button" onClick={handleClear} disabled={isLoading}>
                      Clear
                    </button>
                  </div>
                </form>

                {error ? <p className="error-text">{error}</p> : null}

                <section className={`result-card ${relationshipMeta.gradient}`}>
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <MotionDiv
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="loader-wrap"
                      >
                        <span className="loader" />
                        <p>Running FLAMES elimination...</p>
                      </MotionDiv>
                    ) : result ? (
                      <MotionDiv
                        key={`result-${resultVersion}`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                      >
                        <h3>
                          {relationshipMeta.emoji} {result.relationship}
                        </h3>
                        <p>{result.explanation}</p>

                        <div className="meta-grid">
                          <div>
                            <strong>Cleaned 1:</strong> {result.cleaned_name1}
                          </div>
                          <div>
                            <strong>Cleaned 2:</strong> {result.cleaned_name2}
                          </div>
                          <div>
                            <strong>Remaining count:</strong> {result.remaining_count}
                          </div>
                          <div>
                            <strong>Saved at:</strong>{' '}
                            {result.created_at ? new Date(result.created_at).toLocaleString() : '-'}
                          </div>
                        </div>

                        <h4>Step-by-step elimination</h4>
                        <ul className="steps-list">
                          {result.elimination_steps?.map((stepItem) => (
                            <MotionLi
                              key={`${stepItem.step}-${stepItem.removed}`}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: Math.min(stepItem.step * 0.06, 0.4) }}
                            >
                              <span>Step {stepItem.step}:</span> Removed{' '}
                              <strong>{stepItem.removed}</strong>
                              <em> → Remaining: {stepItem.remaining.join(', ')}</em>
                            </MotionLi>
                          ))}
                        </ul>
                      </MotionDiv>
                    ) : (
                      <MotionDiv key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <h3>✨ Waiting for names</h3>
                        <p>Enter two names and we will calculate the relationship with full elimination steps.</p>
                      </MotionDiv>
                    )}
                  </AnimatePresence>
                </section>
              </MotionDiv>
            ) : (
              <MotionDiv
                key="history-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <div className="history-head">
                  <h2>{currentUser ? 'My FLAMES History' : 'Recent FLAMES History'}</h2>
                  <button
                    className="ghost-btn"
                    type="button"
                    onClick={() => setResultVersion((value) => value + 1)}
                    disabled={historyLoading}
                  >
                    Refresh
                  </button>
                </div>

                {historyLoading ? <p>Loading history...</p> : null}
                {historyError ? <p className="error-text">{historyError}</p> : null}

                {!historyLoading && !historyError ? (
                  <ul className="history-list">
                    {historyRows.length === 0 ? (
                      <li className="history-empty">No records yet. Calculate a result to get started.</li>
                    ) : (
                      historyRows.map((item) => (
                        <li key={item.id}>
                          <div>
                            <strong>
                              {item.name1} + {item.name2}
                            </strong>
                            <p>{item.relationship}</p>
                            <small>{item.explanation || 'No explanation available.'}</small>
                          </div>
                          <time>{new Date(item.created_at).toLocaleString()}</time>
                        </li>
                      ))
                    )}
                  </ul>
                ) : null}
              </MotionDiv>
            )}
          </AnimatePresence>
        </article>
      </section>
    </main>
  )
}

export default App

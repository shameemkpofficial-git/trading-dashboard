import { useEffect } from 'react'
import { useTradingStore } from './store/useTradingStore'
import DashboardLayout from './components/layout/DashboardLayout'
import AuthPage from './components/auth/AuthPage'
import DashboardHeader from './components/layout/DashboardHeader'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { API_BASE } from './constants'

function App() {
  useKeyboardShortcuts();
  const {
    selectedTicker,
    setTickers,
    setSelectedTicker,
    setHistory,
    connectWebSocket,
    disconnectWebSocket,
    token,
    user,
    logout,
    bootstrapAuth,
  } = useTradingStore()

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE}/tickers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTickers(data)
          if (data.length > 0 && !selectedTicker) setSelectedTicker(data[0])
        }
      })
      .catch(() => logout())
  }, [setTickers, setSelectedTicker, selectedTicker, token, logout])

  useEffect(() => {
    if (!selectedTicker || !token) return

    fetch(`${API_BASE}/history/${selectedTicker}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHistory(selectedTicker, data)
        }
      })
  }, [selectedTicker, setHistory, token])

  useEffect(() => {
    if (token) {
      connectWebSocket()
      return () => disconnectWebSocket()
    }
  }, [connectWebSocket, disconnectWebSocket, token])

  if (!token) {
    return <AuthPage />;
  }

  return (
    <div className="dashboard">
      <DashboardHeader username={user?.username} onLogout={logout} />
      <main className="dashboard-main">
        <DashboardLayout />
      </main>
    </div>
  )
}

export default App

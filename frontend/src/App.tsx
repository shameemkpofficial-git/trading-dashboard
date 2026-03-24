import { useEffect } from 'react'
import { useTradingStore } from './store/useTradingStore'
import DashboardLayout from './components/DashboardLayout'
import AuthPage from './components/AuthPage'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { LogOut, User } from 'lucide-react'

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
    bootstrapAuth
  } = useTradingStore()

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  useEffect(() => {
    if (!token) return;

    // Fetch available tickers
    fetch('http://localhost:3000/tickers', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTickers(data)
          if (data.length > 0 && !selectedTicker) setSelectedTicker(data[0])
        }
      })
      .catch(() => logout())
  }, [setTickers, setSelectedTicker, selectedTicker, token, logout])

  useEffect(() => {
    if (!selectedTicker || !token) return

    // Fetch history for selected ticker
    fetch(`http://localhost:3000/history/${selectedTicker}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
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
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Trading Dashboard PRO</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <User size={16} />
            <span>{user?.username}</span>
          </div>
          <button className="icon-button logout-btn" onClick={logout} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        <DashboardLayout />
      </main>
    </div>
  )
}


export default App


import { useEffect } from 'react'
import { useTradingStore } from './store/useTradingStore'
import DashboardLayout from './components/DashboardLayout'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

function App() {
  useKeyboardShortcuts();
  const { 
    selectedTicker, 
    setTickers, 
    setSelectedTicker, 
    setHistory, 
    connectWebSocket, 
    disconnectWebSocket 
  } = useTradingStore()

  useEffect(() => {
    // Fetch available tickers
    fetch('http://localhost:3000/tickers')
      .then(res => res.json())
      .then(data => {
        setTickers(data)
        if (data.length > 0 && !selectedTicker) setSelectedTicker(data[0])
      })
  }, [setTickers, setSelectedTicker, selectedTicker])

  useEffect(() => {
    if (!selectedTicker) return

    // Fetch history for selected ticker
    fetch(`http://localhost:3000/history/${selectedTicker}`)
      .then(res => res.json())
      .then(data => {
        setHistory(selectedTicker, data)
      })
  }, [selectedTicker, setHistory])

  useEffect(() => {
    connectWebSocket()
    return () => disconnectWebSocket()
  }, [connectWebSocket, disconnectWebSocket])

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Trading Dashboard PRO</h1>
      </header>
      <main className="dashboard-main">
        <DashboardLayout />
      </main>
    </div>
  )
}


export default App


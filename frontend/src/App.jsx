import { useState, useEffect } from 'react'
import './App.css'
import apiService from './services/api.js'
import DataExplorer from './components/DataExplorer.jsx'
import AIChatbot from './components/AIChatbot.jsx'
import LoginPage from './components/LoginPage.jsx'

function App() {
  const [backendStatus, setBackendStatus] = useState('checking...')
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showDataExplorer, setShowDataExplorer] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkBackend()
  }, [])

  const checkBackend = async () => {
    try {
      await apiService.checkHealth()
      setBackendStatus('connected ✅')
      
      try {
        const data = await apiService.getDatasets()
        setDatasets(data.datasets || [])
      } catch (dataError) {
        setDatasets([])
      }
    } catch (error) {
      setBackendStatus('disconnected ❌')
    }
  }

  const loadDatasets = async () => {
    setLoading(true)
    setMessage('Loading datasets...')
    try {
      const data = await apiService.getDatasets()
      setDatasets(data.datasets || [])
      setMessage(`Loaded ${data.datasets?.length || 0} datasets successfully!`)
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    }
    setLoading(false)
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    setMessage(`Welcome ${userData.name}! You have ${userData.role} access.`)
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setShowDataExplorer(false)
    setShowChatbot(false)
    setMessage('')
  }

  const openChatbot = () => {
    if (!user?.permissions.includes('ai_analysis')) {
      setMessage('AI Analysis requires educator or scientist access level.')
      return
    }
    setShowChatbot(true)
    setMessage('AI Assistant opened! Ask questions about space biology data.')
  }

  const openDataExplorer = () => {
    if (!user?.permissions.includes('view_data')) {
      setMessage('Data access restricted. Please contact administrator.')
      return
    }
    setShowDataExplorer(true)
  }

  const refreshConnection = async () => {
    setLoading(true)
    setMessage('Refreshing connection...')
    setBackendStatus('checking...')
    try {
      await apiService.checkHealth()
      setBackendStatus('connected ✅')
      setMessage('✅ Connection refreshed successfully!')
    } catch (error) {
      setBackendStatus('disconnected ❌')
      setMessage('❌ Connection failed!')
    }
    setLoading(false)
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>🚀 NASA Space Biology Engine</h1>
          <p>Analyzing biological data from space missions with AI-powered insights</p>
          <div className="user-info">
            <span className="status">Backend: {backendStatus}</span>
            {user && (
              <div className="user-details">
                <span>{user.role === 'scientist' ? '🔬' : user.role === 'teacher' ? '👨‍🏫' : '🎓'} {user.name} ({user.role})</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="main">
        <div className="container">
          <div className="hero">
            <h2>Explore Space Biology Data</h2>
            <p>Access comprehensive biological datasets from NASA missions and discover insights about life in space.</p>
            
            <div className="action-buttons">
              <button onClick={openDataExplorer} disabled={loading}>
                🔍 Open Data Explorer
              </button>
              <button onClick={openChatbot} disabled={loading}>
                🤖 AI Analysis Chat
              </button>
              <button onClick={refreshConnection} disabled={loading}>
                {loading ? 'Checking...' : '🔄 Refresh Connection'}
              </button>
            </div>
            
            {message && (
              <div className="message">
                {message}
              </div>
            )}
          </div>
          
          <div className="features">
            <div className="feature-card">
              <h3>🔬 Data Explorer</h3>
              <p>Advanced search across GeneLab and NASA biological datasets</p>
              <div className="dataset-count">{datasets.length} datasets available</div>
            </div>
            <div className="feature-card">
              <h3>🤖 AI Analysis</h3>
              <p>Machine learning powered insights and predictive modeling</p>
            </div>
            <div className="feature-card">
              <h3>📊 Visualization</h3>
              <p>Interactive charts and 3D visualizations of biological data</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="footer">
        <div className="container">
          <p>© 2024 NASA Space Biology Engine - Open Source Project</p>
        </div>
      </footer>
      
      <DataExplorer 
        isOpen={showDataExplorer} 
        onClose={() => setShowDataExplorer(false)} 
      />
      
      <AIChatbot 
        isOpen={showChatbot} 
        onClose={() => setShowChatbot(false)} 
      />
    </div>
  )
}

export default App
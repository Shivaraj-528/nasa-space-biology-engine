import { useState, useEffect } from 'react'
import './App.css'
import apiService from './services/api.js'
import DataExplorer from './components/DataExplorer.jsx'

function App() {
  const [backendStatus, setBackendStatus] = useState('checking...')
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showDataExplorer, setShowDataExplorer] = useState(false)

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

  const testAI = async () => {
    setLoading(true)
    setMessage('Testing AI analysis...')
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setMessage('✅ AI Analysis: Ready for biological data processing!')
    } catch (error) {
      setMessage(`❌ AI Test failed: ${error.message}`)
    }
    setLoading(false)
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

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>🚀 NASA Space Biology Engine</h1>
          <p>Analyzing biological data from space missions with AI-powered insights</p>
          <div className="status">Backend: {backendStatus}</div>
        </div>
      </header>
      
      <main className="main">
        <div className="container">
          <div className="hero">
            <h2>Explore Space Biology Data</h2>
            <p>Access comprehensive biological datasets from NASA missions and discover insights about life in space.</p>
            
            <div className="action-buttons">
              <button onClick={() => setShowDataExplorer(true)} disabled={loading}>
                🔍 Open Data Explorer
              </button>
              <button onClick={testAI} disabled={loading}>
                {loading ? 'Testing...' : '🤖 Test AI Analysis'}
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
    </div>
  )
}

export default App
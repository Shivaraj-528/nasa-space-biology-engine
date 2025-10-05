import { useState, useEffect } from 'react'
import './App.css'
import apiService from './services/api.js'
import ConnectionTest from './components/ConnectionTest.jsx'

function App() {
  const [backendStatus, setBackendStatus] = useState('checking...')
  const [datasets, setDatasets] = useState([])

  useEffect(() => {
    // Check backend connection
    const checkBackend = async () => {
      try {
        console.log('Checking backend at:', apiService.baseURL)
        const healthResponse = await apiService.checkHealth()
        console.log('Health response:', healthResponse)
        setBackendStatus('connected ✅')
        
        // Load datasets
        try {
          const data = await apiService.getDatasets()
          setDatasets(data.datasets || [])
        } catch (dataError) {
          console.log('Datasets not available, but backend is connected')
          setDatasets([])
        }
      } catch (error) {
        setBackendStatus(`disconnected ❌ (${error.message})`)
        console.error('Backend connection failed:', error)
        console.error('API URL:', apiService.baseURL)
      }
    }

    checkBackend()
  }, [])

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
          <ConnectionTest />
          
          <div className="hero">
            <h2>Explore Space Biology Data</h2>
            <p>Access comprehensive biological datasets from NASA missions and discover insights about life in space.</p>
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
    </div>
  )
}

export default App

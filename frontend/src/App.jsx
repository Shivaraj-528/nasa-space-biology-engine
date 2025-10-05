import { useState, useEffect } from 'react'
import './App.css'
import apiService from './services/api.js'
import DataExplorer from './components/DataExplorer.jsx'
import AIChatbot from './components/AIChatbot.jsx'
import Quiz from './components/Quiz.jsx'
import GraphVisualization from './components/GraphVisualization.jsx'

function App() {
  const [backendStatus, setBackendStatus] = useState('checking...')
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showDataExplorer, setShowDataExplorer] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showGraphs, setShowGraphs] = useState(false)

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

  const openGraphs = () => {
    setShowGraphs(true)
    setMessage('Analytics dashboard opened! Explore research trends and statistics.')
  }

  const openQuiz = () => {
    setShowQuiz(true)
    setMessage('Quiz started! Test your space biology knowledge.')
  }

  const openChatbot = () => {
    setShowChatbot(true)
    setMessage('AI Assistant opened! Ask questions about space biology data.')
  }

  const openDataExplorer = () => {
    setShowDataExplorer(true)
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
              <button onClick={openDataExplorer} disabled={loading}>
                🔍 Data Explorer
              </button>
              <button onClick={openChatbot} disabled={loading}>
                🤖 AI Assistant
              </button>
              <button onClick={openQuiz} disabled={loading}>
                🧠 Take Quiz
              </button>
              <button onClick={openGraphs} disabled={loading}>
                📈 Analytics
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
      
      <Quiz 
        isOpen={showQuiz} 
        onClose={() => setShowQuiz(false)}
        userRole="scientist"
      />
      
      <GraphVisualization 
        isOpen={showGraphs} 
        onClose={() => setShowGraphs(false)}
      />
    </div>
  )
}

export default App
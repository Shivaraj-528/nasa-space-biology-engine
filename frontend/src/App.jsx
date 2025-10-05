import './App.css'

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>🚀 NASA Space Biology Engine</h1>
          <p>Analyzing biological data from space missions with AI-powered insights</p>
        </div>
      </header>
      
      <main className="main">
        <div className="container">
          <div className="hero">
            <h2>Explore Space Biology Data</h2>
            <p>Access comprehensive biological datasets from NASA missions and discover insights about life in space.</p>
          </div>
          
          <div className="features">
            <div className="feature-card">
              <h3>🔬 Data Explorer</h3>
              <p>Advanced search across GeneLab and NASA biological datasets</p>
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

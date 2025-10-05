import { useState, useEffect } from 'react';
import apiService from '../services/api.js';

function DataExplorer({ isOpen, onClose }) {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDatasets();
    }
  }, [isOpen]);

  const loadDatasets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getDatasets();
      setDatasets(response.datasets || []);
    } catch (err) {
      setError(`Failed to load datasets: ${err.message}`);
      // Mock data for demo
      setDatasets([
        { id: 'GLDS-1', title: 'Spaceflight Effects on Mouse Liver', organism: 'Mouse', year: 2023 },
        { id: 'GLDS-2', title: 'Plant Growth in Microgravity', organism: 'Arabidopsis', year: 2023 },
        { id: 'GLDS-3', title: 'Astronaut Microbiome Study', organism: 'Human', year: 2022 }
      ]);
    }
    setLoading(false);
  };

  const filteredDatasets = datasets.filter(dataset =>
    dataset.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dataset.organism?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>🔬 Data Explorer</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search datasets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="modal-body">
          {loading && <div className="loading">Loading datasets...</div>}
          {error && <div className="error">{error}</div>}
          
          <div className="datasets-grid">
            {filteredDatasets.map((dataset, index) => (
              <div key={dataset.id || index} className="dataset-card">
                <h3>{dataset.title || `Dataset ${index + 1}`}</h3>
                <p><strong>ID:</strong> {dataset.id || 'N/A'}</p>
                <p><strong>Organism:</strong> {dataset.organism || 'Unknown'}</p>
                <p><strong>Year:</strong> {dataset.year || 'N/A'}</p>
                <button className="view-btn">View Details</button>
              </div>
            ))}
          </div>
          
          {filteredDatasets.length === 0 && !loading && (
            <div className="no-data">No datasets found</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DataExplorer;
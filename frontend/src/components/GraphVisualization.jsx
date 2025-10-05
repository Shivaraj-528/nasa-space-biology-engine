import { useState, useEffect } from 'react';

function GraphVisualization({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('publications');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    // Simulate API call - replace with real backend call
    setTimeout(() => {
      setData({
        publications: {
          byYear: [
            { year: '2020', count: 45 },
            { year: '2021', count: 62 },
            { year: '2022', count: 78 },
            { year: '2023', count: 94 },
            { year: '2024', count: 67 }
          ],
          byCategory: [
            { category: 'Plant Biology', count: 89, color: '#4f9cf9' },
            { category: 'Human Health', count: 76, color: '#00d4ff' },
            { category: 'Microbiology', count: 54, color: '#7c3aed' },
            { category: 'Cell Biology', count: 43, color: '#f59e0b' },
            { category: 'Genetics', count: 38, color: '#10b981' }
          ]
        },
        institutions: [
          { name: 'NASA Ames Research Center', publications: 156, country: 'USA' },
          { name: 'MIT', publications: 89, country: 'USA' },
          { name: 'Stanford University', publications: 76, country: 'USA' },
          { name: 'ESA', publications: 65, country: 'Europe' },
          { name: 'JAXA', publications: 54, country: 'Japan' },
          { name: 'University of California', publications: 48, country: 'USA' },
          { name: 'Harvard Medical School', publications: 42, country: 'USA' }
        ],
        authors: [
          { name: 'Dr. Sarah Johnson', publications: 34, institution: 'NASA Ames', field: 'Plant Biology' },
          { name: 'Dr. Michael Chen', publications: 28, institution: 'MIT', field: 'Human Health' },
          { name: 'Dr. Elena Rodriguez', publications: 25, institution: 'Stanford', field: 'Microbiology' },
          { name: 'Dr. James Wilson', publications: 23, institution: 'NASA JSC', field: 'Cell Biology' },
          { name: 'Dr. Anna Kowalski', publications: 21, institution: 'ESA', field: 'Genetics' },
          { name: 'Dr. Robert Kim', publications: 19, institution: 'JAXA', field: 'Plant Biology' },
          { name: 'Dr. Lisa Thompson', publications: 18, institution: 'UC Berkeley', field: 'Human Health' }
        ]
      });
      setLoading(false);
    }, 1000);
  };

  const BarChart = ({ data, title, xKey, yKey, color = '#4f9cf9' }) => {
    const maxValue = Math.max(...data.map(item => item[yKey]));
    
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="bar-chart">
          {data.map((item, index) => (
            <div key={index} className="bar-item">
              <div className="bar-label">{item[xKey]}</div>
              <div className="bar-wrapper">
                <div 
                  className="bar" 
                  style={{ 
                    height: `${(item[yKey] / maxValue) * 200}px`,
                    backgroundColor: item.color || color
                  }}
                ></div>
                <div className="bar-value">{item[yKey]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PieChart = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    let currentAngle = 0;
    
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="pie-chart-container">
          <svg className="pie-chart" viewBox="0 0 200 200">
            {data.map((item, index) => {
              const percentage = (item.count / total) * 100;
              const angle = (item.count / total) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
              const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
              const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
              const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
              
              const largeArc = angle > 180 ? 1 : 0;
              const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
              
              currentAngle += angle;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color}
                  stroke="#1a2332"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
          <div className="pie-legend">
            {data.map((item, index) => (
              <div key={index} className="legend-item">
                <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                <span>{item.category}: {item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const TableChart = ({ data, title, columns }) => (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="table-chart">
        <table>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                {columns.map(col => (
                  <td key={col.key}>{item[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="viz-modal">
        <div className="viz-header">
          <h2>📊 Research Analytics Dashboard</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="viz-tabs">
          <button 
            className={`tab-btn ${activeTab === 'publications' ? 'active' : ''}`}
            onClick={() => setActiveTab('publications')}
          >
            📈 Publications
          </button>
          <button 
            className={`tab-btn ${activeTab === 'institutions' ? 'active' : ''}`}
            onClick={() => setActiveTab('institutions')}
          >
            🏛️ Institutions
          </button>
          <button 
            className={`tab-btn ${activeTab === 'authors' ? 'active' : ''}`}
            onClick={() => setActiveTab('authors')}
          >
            👨‍🔬 Top Authors
          </button>
        </div>

        <div className="viz-content">
          {loading ? (
            <div className="viz-loading">
              <div className="loading-spinner"></div>
              <p>Loading analytics data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'publications' && data && (
                <div className="charts-grid">
                  <BarChart 
                    data={data.publications.byYear}
                    title="Publications by Year"
                    xKey="year"
                    yKey="count"
                    color="#4f9cf9"
                  />
                  <PieChart 
                    data={data.publications.byCategory}
                    title="Publications by Research Category"
                  />
                </div>
              )}

              {activeTab === 'institutions' && data && (
                <div className="charts-grid">
                  <BarChart 
                    data={data.institutions.slice(0, 7)}
                    title="Publications by Institution"
                    xKey="name"
                    yKey="publications"
                    color="#00d4ff"
                  />
                  <TableChart 
                    data={data.institutions}
                    title="Institution Rankings"
                    columns={[
                      { key: 'name', label: 'Institution' },
                      { key: 'publications', label: 'Publications' },
                      { key: 'country', label: 'Country' }
                    ]}
                  />
                </div>
              )}

              {activeTab === 'authors' && data && (
                <div className="charts-grid">
                  <BarChart 
                    data={data.authors.slice(0, 7)}
                    title="Top Authors by Publication Count"
                    xKey="name"
                    yKey="publications"
                    color="#7c3aed"
                  />
                  <TableChart 
                    data={data.authors}
                    title="Author Details"
                    columns={[
                      { key: 'name', label: 'Author' },
                      { key: 'publications', label: 'Publications' },
                      { key: 'institution', label: 'Institution' },
                      { key: 'field', label: 'Field' }
                    ]}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default GraphVisualization;
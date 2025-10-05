import { useState } from 'react';

function ConnectionTest() {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setTestResult('Testing...');
    
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    
    try {
      // Test 1: Basic fetch to root
      console.log('Testing backend URL:', backendUrl);
      const response = await fetch(backendUrl);
      const data = await response.json();
      
      setTestResult(`✅ Connected! Backend says: ${data.message}`);
      console.log('Backend response:', data);
      
    } catch (error) {
      setTestResult(`❌ Failed: ${error.message}`);
      console.error('Connection error:', error);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      background: 'rgba(255,255,255,0.1)'
    }}>
      <h3>🔧 Connection Test</h3>
      <p>Backend URL: {import.meta.env.VITE_API_URL || 'Not set'}</p>
      <button onClick={testConnection} disabled={loading}>
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
      <div style={{ marginTop: '10px', fontFamily: 'monospace' }}>
        {testResult}
      </div>
    </div>
  );
}

export default ConnectionTest;
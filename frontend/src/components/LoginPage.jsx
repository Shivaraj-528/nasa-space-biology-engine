import { useState } from 'react';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectedRole, setDetectedRole] = useState('');

  const detectUserRole = (email) => {
    const domain = email.toLowerCase().split('@')[1];
    
    // Student domains
    const studentDomains = ['.edu', '.ac.', 'student.', 'university.', 'college.'];
    // Scientist domains  
    const scientistDomains = ['nasa.gov', 'nih.gov', 'nsf.gov', 'research.', 'lab.', 'institute.'];
    // Teacher domains
    const teacherDomains = ['school.', 'k12.', 'teacher.', 'faculty.'];
    
    if (scientistDomains.some(d => domain.includes(d))) {
      return 'scientist';
    } else if (teacherDomains.some(d => domain.includes(d))) {
      return 'teacher';
    } else if (studentDomains.some(d => domain.includes(d))) {
      return 'student';
    }
    return 'general';
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (newEmail.includes('@')) {
      const role = detectUserRole(newEmail);
      setDetectedRole(role);
    } else {
      setDetectedRole('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const role = detectUserRole(email);
    
    if (role === 'general') {
      setError('Access restricted. Please use an institutional email (.edu, nasa.gov, etc.)');
      setLoading(false);
      return;
    }

    try {
      // Simulate login process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData = {
        email,
        role,
        name: email.split('@')[0],
        permissions: getPermissions(role)
      };
      
      onLogin(userData);
    } catch (err) {
      setError('Login failed. Please try again.');
    }
    
    setLoading(false);
  };

  const getPermissions = (role) => {
    switch (role) {
      case 'scientist':
        return ['view_data', 'export_data', 'ai_analysis', 'advanced_features'];
      case 'teacher':
        return ['view_data', 'ai_analysis', 'educational_tools'];
      case 'student':
        return ['view_data', 'basic_analysis'];
      default:
        return [];
    }
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case 'scientist':
        return { icon: '🔬', label: 'Scientist', color: '#4f9cf9' };
      case 'teacher':
        return { icon: '👨‍🏫', label: 'Educator', color: '#00d4ff' };
      case 'student':
        return { icon: '🎓', label: 'Student', color: '#7c3aed' };
      default:
        return { icon: '👤', label: 'General', color: '#6b7280' };
    }
  };

  const roleInfo = getRoleInfo(detectedRole);

  return (
    <div className="login-overlay">
      <div className="login-container">
        <div className="login-header">
          <h1>🚀 NASA Space Biology Engine</h1>
          <p>Sign in to access space biology research tools</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your institutional email"
              required
            />
            {detectedRole && (
              <div className="role-indicator" style={{ color: roleInfo.color }}>
                {roleInfo.icon} Detected: {roleInfo.label}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="access-info">
          <h3>Access Levels</h3>
          <div className="access-grid">
            <div className="access-item">
              <span>🔬 Scientists</span>
              <small>Full access + data export</small>
            </div>
            <div className="access-item">
              <span>👨‍🏫 Educators</span>
              <small>Teaching tools + analysis</small>
            </div>
            <div className="access-item">
              <span>🎓 Students</span>
              <small>Basic data exploration</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
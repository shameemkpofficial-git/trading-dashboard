import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useTradingStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(username, password);
        if (!result.ok) setError(result.error || 'Login failed');
      } else {
        const result = await register(username, password);
        if (result.ok) {
          setIsLogin(true);
          setError('Registration successful! Please login.');
        } else {
          setError(result.error || 'Registration failed');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">TP</div>
            <h1>Trading PRO</h1>
          </div>
          <p>{isLogin ? 'Welcome back to the dashboard' : 'Create your professional account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {error && (
            <div className={`auth-message ${error.includes('successful') ? 'success' : 'error'}`}>
              {error.includes('successful') ? null : <AlertCircle size={16} />}
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              isLogin ? <><LogIn size={20} /> Login</> : <><UserPlus size={20} /> Register</>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="toggle-button">
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

import React, { useState } from 'react';
import { useTradingStore } from '../../store/useTradingStore';
import { LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import {
  APP_SHORT_NAME,
  APP_LOGO_INITIALS,
  AUTH_WELCOME_SUBTITLE,
  AUTH_REGISTER_SUBTITLE,
  LABEL_USERNAME,
  LABEL_PASSWORD,
  PLACEHOLDER_USERNAME,
  PLACEHOLDER_PASSWORD,
  BTN_LOGIN,
  BTN_REGISTER,
  LINK_NO_ACCOUNT,
  LINK_HAS_ACCOUNT,
  ERR_LOGIN_FAILED,
  ERR_REGISTER_FAILED,
  MSG_REGISTER_SUCCESS,
} from '../../constants/strings';

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
        if (!result.ok) setError(result.error || ERR_LOGIN_FAILED);
      } else {
        const result = await register(username, password);
        if (result.ok) {
          setIsLogin(true);
          setError(MSG_REGISTER_SUCCESS);
        } else {
          setError(result.error || ERR_REGISTER_FAILED);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = error.includes('successful');

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">{APP_LOGO_INITIALS}</div>
            <h1>{APP_SHORT_NAME}</h1>
          </div>
          <p>{isLogin ? AUTH_WELCOME_SUBTITLE : AUTH_REGISTER_SUBTITLE}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{LABEL_USERNAME}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={PLACEHOLDER_USERNAME}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>{LABEL_PASSWORD}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={PLACEHOLDER_PASSWORD}
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <div className={`auth-message ${isSuccess ? 'success' : 'error'}`}>
              {!isSuccess && <AlertCircle size={16} />}
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isLogin ? (
              <><LogIn size={20} /> {BTN_LOGIN}</>
            ) : (
              <><UserPlus size={20} /> {BTN_REGISTER}</>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="toggle-button"
          >
            {isLogin ? LINK_NO_ACCOUNT : LINK_HAS_ACCOUNT}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

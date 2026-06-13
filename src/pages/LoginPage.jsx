import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/chatStore';
import { USERS } from '../api/mockData';
import { ROLE_LABELS } from '../api/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'operator') navigate('/dialogs');
      else navigate('/chat');
    } catch {}
  };

  const fillDemo = (user) => {
    setEmail(user.email);
    setPassword(user.password);
  };

  const demoAccounts = USERS.filter(u => ['client', 'operator', 'admin'].includes(u.role))
    .slice(0, 4);

  const roleIcons = { client: '👤', operator: '🎧', admin: '⚙️' };
  const roleColors = { client: 'var(--accent)', operator: 'var(--success)', admin: 'var(--warning)' };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">💬</div>
          <span className="login-logo-text">SupportChat</span>
        </div>

        <h1 className="login-title">Добро пожаловать!</h1>
        <p className="login-sub">Войдите в систему поддержки</p>

        {error && (
          <div className="login-error">⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="example@mail.ru"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="login-password">Пароль</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                Вход...
              </span>
            ) : 'Войти →'}
          </button>
        </form>

        {/* Demo accounts */}
        <div className="login-demo-accounts">
          <div className="login-demo-title">Демо-аккаунты</div>
          <div className="demo-accounts-grid">
            {demoAccounts.map(u => (
              <button
                key={u.id}
                id={`demo-account-${u.id}`}
                className="demo-account-btn"
                onClick={() => fillDemo(u)}
                type="button"
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: `${roleColors[u.role]}22`,
                    border: `1px solid ${roleColors[u.role]}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {roleIcons[u.role]}
                </div>
                <div>
                  <div className="demo-account-name">{u.name}</div>
                  <div className="demo-account-role">{ROLE_LABELS[u.role]} — {u.email}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

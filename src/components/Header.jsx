import { useAuthStore } from '../store/chatStore';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import Avatar from './Avatar';
import { ROLE_LABELS } from '../api/utils';

export default function Header() {
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/chat', label: 'Чат', icon: '💬', roles: ['client', 'operator', 'admin'] },
    { path: '/dialogs', label: 'Диалоги', icon: '📋', roles: ['operator', 'admin'] },
    { path: '/history', label: 'История', icon: '📜', roles: ['operator', 'admin'] },
    { path: '/admin', label: 'Панель', icon: '⚙️', roles: ['admin'] },
  ];

  const visibleNav = navItems.filter(n => n.roles.includes(currentUser?.role));

  return (
    <header className="header">
      <div className="header-logo">
        <div className="header-logo-icon">💬</div>
        <span className="header-logo-name">SupportChat</span>
      </div>

      <nav style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
        {visibleNav.map(item => (
          <button
            key={item.path}
            id={`nav-${item.path.slice(1)}`}
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(item.path)}
            style={{
              border: location.pathname === item.path
                ? '1px solid var(--accent)'
                : undefined,
              color: location.pathname === item.path
                ? 'var(--accent)'
                : undefined,
              background: location.pathname === item.path
                ? 'var(--accent-soft)'
                : undefined,
            }}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>

      <div className="header-spacer" />

      <div className="header-actions">
        <NotificationBell />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8 }}>
          {currentUser && <Avatar user={currentUser} size="sm" showOnline={false} />}
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
              {currentUser?.name}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {ROLE_LABELS[currentUser?.role]}
            </div>
          </div>
        </div>

        <button
          id="logout-btn"
          className="btn btn-secondary btn-sm"
          onClick={handleLogout}
          style={{ marginLeft: 4 }}
        >
          Выйти
        </button>
      </div>
    </header>
  );
}

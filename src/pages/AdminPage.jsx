import { useChatStore, useAuthStore } from '../store/chatStore';
import Header from '../components/Header';
import Avatar from '../components/Avatar';
import { StatusBadge, CategoryBadge, PriorityDot } from '../components/Badges';
import { ROLE_LABELS, formatRelative } from '../api/utils';
import { USERS } from '../api/mockData';

export default function AdminPage() {
  const { dialogs, getUserById, messages } = useChatStore();
  const { currentUser } = useAuthStore();

  const totalMessages = Object.values(messages).reduce((acc, msgs) => acc + msgs.length, 0);
  const openDialogs = dialogs.filter(d => d.status === 'open').length;
  const resolvedDialogs = dialogs.filter(d => d.status === 'resolved').length;
  const pendingDialogs = dialogs.filter(d => d.status === 'pending').length;

  const operators = USERS.filter(u => u.role === 'operator');
  const clients = USERS.filter(u => u.role === 'client');

  const roleColors = {
    client: 'var(--accent)',
    operator: 'var(--success)',
    admin: 'var(--warning)',
  };

  const roleIcons = { client: '👤', operator: '🎧', admin: '⚙️' };

  return (
    <div className="app-layout">
      <Header />
      <div className="main-layout" style={{ overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Stats bar */}
          <div className="admin-stats">
            {[
              { label: 'Всего диалогов', value: dialogs.length, icon: '💬', color: 'var(--accent)' },
              { label: 'Открытых', value: openDialogs, icon: '📂', color: 'var(--info)' },
              { label: 'Ожидают', value: pendingDialogs, icon: '⏳', color: 'var(--warning)' },
              { label: 'Решено', value: resolvedDialogs, icon: '✅', color: 'var(--success)' },
              { label: 'Сообщений', value: totalMessages, icon: '✉️', color: 'var(--text-secondary)' },
              { label: 'Операторов', value: operators.length, icon: '🎧', color: 'var(--success)' },
            ].map((stat, i) => (
              <div key={i} className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 12,
                    fontSize: 28,
                    opacity: 0.15,
                  }}
                >
                  {stat.icon}
                </div>
                <div
                  className="stat-value"
                  style={{
                    fontSize: 'var(--text-3xl)',
                    fontWeight: 800,
                    background: 'none',
                    WebkitBackgroundClip: 'unset',
                    WebkitTextFillColor: 'unset',
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Main content */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Dialogs list */}
            <div className="admin-section" style={{ flex: 2 }}>
              <div className="admin-section-title">📋 Все диалоги</div>
              {dialogs.map(d => {
                const client = getUserById(d.clientId);
                const operator = getUserById(d.operatorId);
                return (
                  <div
                    key={d.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: 14,
                      marginBottom: 8,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-normal)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                      <PriorityDot priority={d.priority} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 4 }}>
                          {d.subject}
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <StatusBadge status={d.status} />
                          <CategoryBadge category={d.category} />
                        </div>
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', flexShrink: 0 }}>
                        {formatRelative(d.updatedAt)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 16 }}>
                      {client && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Avatar user={client} size="sm" showOnline={false} />
                          <div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Клиент</div>
                            <div style={{ fontSize: 'var(--text-sm)' }}>{client.name}</div>
                          </div>
                        </div>
                      )}
                      {operator ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Avatar user={operator} size="sm" showOnline={false} />
                          <div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Оператор</div>
                            <div style={{ fontSize: 'var(--text-sm)' }}>{operator.name}</div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: 'var(--bg-tertiary)',
                              border: '1px dashed var(--border-normal)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            ?
                          </div>
                          <div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Оператор</div>
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--warning)' }}>Не назначен</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Users list */}
            <div className="admin-section" style={{ flex: 1, borderLeft: '1px solid var(--border-subtle)' }}>
              <div className="admin-section-title">🎧 Операторы</div>
              {operators.map(u => {
                const handled = dialogs.filter(d => d.operatorId === u.id).length;
                return (
                  <div key={u.id} className="user-row">
                    <Avatar user={u} size="sm" />
                    <div className="user-row-info">
                      <div className="user-row-name">{u.name}</div>
                      <div className="user-row-email">{handled} диалогов</div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 'var(--text-xs)',
                        color: u.status === 'online' ? 'var(--success)' : 'var(--text-muted)',
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: u.status === 'online' ? 'var(--success)' : 'var(--text-muted)',
                          display: 'inline-block',
                        }}
                      />
                      {u.status === 'online' ? 'Онлайн' : 'Офлайн'}
                    </div>
                  </div>
                );
              })}

              <div className="divider" />
              <div className="admin-section-title">👤 Клиенты</div>
              {clients.map(u => {
                const userDialogs = dialogs.filter(d => d.clientId === u.id).length;
                return (
                  <div key={u.id} className="user-row">
                    <Avatar user={u} size="sm" />
                    <div className="user-row-info">
                      <div className="user-row-name">{u.name}</div>
                      <div className="user-row-email">{u.email}</div>
                    </div>
                    <span
                      className="badge"
                      style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                    >
                      {userDialogs} обр.
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

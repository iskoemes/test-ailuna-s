import { useChatStore, useAuthStore } from '../store/chatStore';
import Header from '../components/Header';
import { StatusBadge, CategoryBadge, PriorityDot } from '../components/Badges';
import Avatar from '../components/Avatar';
import { formatDate, formatTime, formatRelative } from '../api/utils';
import { useNavigate } from 'react-router-dom';

export default function DialogsHistoryPage() {
  const { currentUser } = useAuthStore();
  const { dialogs, getFilteredDialogs, setActiveDialog, getUserById, getMessagesByDialog } = useChatStore();
  const navigate = useNavigate();

  const allDialogs = getFilteredDialogs(currentUser?.id, currentUser?.role);

  const handleOpenDialog = (dialogId) => {
    setActiveDialog(dialogId);
    if (['operator', 'admin'].includes(currentUser?.role)) {
      navigate('/chat');
    } else {
      navigate('/chat');
    }
  };

  return (
    <div className="app-layout">
      <Header />
      <div className="main-layout" style={{ overflow: 'auto', flexDirection: 'column' }}>
        <div style={{ padding: 24, flex: 1 }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 6 }}>
                История диалогов
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                {allDialogs.length} диалогов
              </p>
            </div>

            {allDialogs.map(d => {
              const client = getUserById(d.clientId);
              const operator = getUserById(d.operatorId);
              const msgs = getMessagesByDialog(d.id);
              const lastMsg = msgs[msgs.length - 1];

              return (
                <div
                  key={d.id}
                  id={`history-dialog-${d.id}`}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 20,
                    marginBottom: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => handleOpenDialog(d.id)}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.background = 'var(--bg-hover)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.background = 'var(--bg-card)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
                    {client && <Avatar user={client} size="md" />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>
                          {d.subject}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <PriorityDot priority={d.priority} />
                        <StatusBadge status={d.status} />
                        <CategoryBadge category={d.category} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {formatRelative(d.createdAt)}
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-muted)',
                          marginTop: 2,
                        }}
                      >
                        {msgs.length} сообщ.
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 16,
                      paddingTop: 12,
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    {client && (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                          Клиент:
                        </span>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                          {client.name}
                        </span>
                      </div>
                    )}
                    {operator ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                          Оператор:
                        </span>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                          {operator.name}
                        </span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--warning)' }}>
                        Оператор не назначен
                      </div>
                    )}
                    {lastMsg && (
                      <div
                        style={{
                          marginLeft: 'auto',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-muted)',
                          maxWidth: 200,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        💬 {lastMsg.text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {allDialogs.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: 60,
                  color: 'var(--text-muted)',
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 8 }}>
                  История пуста
                </div>
                <div>Здесь появятся ваши диалоги</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

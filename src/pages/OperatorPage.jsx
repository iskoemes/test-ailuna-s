import { useChatStore, useAuthStore } from '../store/chatStore';
import DialogItem from '../components/DialogItem';
import ChatWindow from '../components/ChatWindow';
import Header from '../components/Header';
import { CATEGORIES } from '../api/mockData';
import Avatar from '../components/Avatar';
import { USERS } from '../api/mockData';

export default function OperatorPage() {
  const { currentUser } = useAuthStore();
  const {
    activeDialogId, setActiveDialog, getFilteredDialogs,
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
    filterCategory, setFilterCategory,
    filterPriority, setFilterPriority,
    dialogs,
  } = useChatStore();

  const allDialogs = getFilteredDialogs(currentUser?.id, currentUser?.role);

  const statusCounts = {
    all: dialogs.length,
    open: dialogs.filter(d => d.status === 'open').length,
    pending: dialogs.filter(d => d.status === 'pending').length,
    resolved: dialogs.filter(d => d.status === 'resolved').length,
    closed: dialogs.filter(d => d.status === 'closed').length,
  };

  const statusFilters = [
    { id: 'all', label: 'Все' },
    { id: 'open', label: 'Открытые' },
    { id: 'pending', label: 'Ожидание' },
    { id: 'resolved', label: 'Решённые' },
    { id: 'closed', label: 'Закрытые' },
  ];

  const priorityFilters = [
    { id: 'all', label: 'Все' },
    { id: 'high', label: '🔴 Высокий' },
    { id: 'medium', label: '🟡 Средний' },
    { id: 'low', label: '⚪ Низкий' },
  ];

  return (
    <div className="app-layout">
      <Header />
      <div className="main-layout">
        {/* Sidebar */}
        <div className="sidebar" style={{ width: 340 }}>
          <div className="sidebar-header">
            {/* Operator info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 0',
                marginBottom: 12,
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <Avatar user={currentUser} size="sm" />
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{currentUser?.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 'var(--text-xs)', color: 'var(--success)' }}>
                  <span style={{ width: 6, height: 6, background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }} />
                  Онлайн
                </div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {statusCounts.open + statusCounts.pending} активных
              </div>
            </div>

            <div className="sidebar-title">Диалоги</div>

            {/* Search */}
            <div className="search-bar" style={{ marginBottom: 10 }}>
              <span className="search-bar-icon">🔍</span>
              <input
                id="operator-search-input"
                type="text"
                placeholder="Поиск по имени или теме..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status filters */}
            <div className="filters-row" style={{ marginBottom: 6 }}>
              {statusFilters.map(f => (
                <button
                  key={f.id}
                  id={`op-status-${f.id}`}
                  className={`filter-chip ${filterStatus === f.id ? 'active' : ''}`}
                  onClick={() => setFilterStatus(f.id)}
                >
                  {f.label}
                  {f.id !== 'all' && statusCounts[f.id] > 0 && (
                    <span
                      style={{
                        background: 'var(--accent)',
                        color: 'white',
                        borderRadius: 'var(--radius-full)',
                        padding: '0 5px',
                        fontSize: 9,
                        fontWeight: 700,
                        marginLeft: 4,
                      }}
                    >
                      {statusCounts[f.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Priority filters */}
            <div className="filters-row" style={{ marginBottom: 6 }}>
              {priorityFilters.map(f => (
                <button
                  key={f.id}
                  id={`op-priority-${f.id}`}
                  className={`filter-chip ${filterPriority === f.id ? 'active' : ''}`}
                  onClick={() => setFilterPriority(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Category filter */}
            <select
              id="op-category-filter"
              className="form-select"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              style={{ marginTop: 6 }}
            >
              <option value="all">Все категории</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="sidebar-list">
            {allDialogs.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                Нет диалогов
              </div>
            ) : (
              allDialogs.map(d => (
                <DialogItem
                  key={d.id}
                  dialog={d}
                  isActive={activeDialogId === d.id}
                  onClick={() => setActiveDialog(d.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <ChatWindow dialogId={activeDialogId} />
      </div>
    </div>
  );
}

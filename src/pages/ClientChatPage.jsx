import { useState } from 'react';
import { useChatStore, useAuthStore } from '../store/chatStore';
import DialogItem from '../components/DialogItem';
import ChatWindow from '../components/ChatWindow';
import NewDialogModal from '../components/NewDialogModal';
import Header from '../components/Header';
import { CATEGORIES } from '../api/mockData';

export default function ClientChatPage() {
  const { currentUser } = useAuthStore();
  const { activeDialogId, setActiveDialog, getFilteredDialogs, searchQuery, setSearchQuery, filterStatus, setFilterStatus } = useChatStore();
  const [showNewDialog, setShowNewDialog] = useState(false);

  const dialogs = getFilteredDialogs(currentUser?.id, 'client');

  const statusFilters = [
    { id: 'all', label: 'Все' },
    { id: 'open', label: 'Открытые' },
    { id: 'pending', label: 'Ожидание' },
    { id: 'resolved', label: 'Решённые' },
    { id: 'closed', label: 'Закрытые' },
  ];

  return (
    <div className="app-layout">
      <Header />
      <div className="main-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title">Мои обращения</div>

            {/* Search */}
            <div className="search-bar" style={{ marginBottom: 10 }}>
              <span className="search-bar-icon">🔍</span>
              <input
                id="client-search-input"
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status filters */}
            <div className="filters-row">
              {statusFilters.map(f => (
                <button
                  key={f.id}
                  id={`filter-${f.id}`}
                  className={`filter-chip ${filterStatus === f.id ? 'active' : ''}`}
                  onClick={() => setFilterStatus(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-list">
            {dialogs.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                Нет обращений
              </div>
            ) : (
              dialogs.map(d => (
                <DialogItem
                  key={d.id}
                  dialog={d}
                  isActive={activeDialogId === d.id}
                  onClick={() => setActiveDialog(d.id)}
                />
              ))
            )}
          </div>

          <div style={{ padding: 12, borderTop: '1px solid var(--border-subtle)' }}>
            <button
              id="new-dialog-btn"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => setShowNewDialog(true)}
            >
              + Новое обращение
            </button>
          </div>
        </div>

        {/* Chat Window */}
        <ChatWindow dialogId={activeDialogId} />
      </div>

      {showNewDialog && <NewDialogModal onClose={() => setShowNewDialog(false)} />}
    </div>
  );
}

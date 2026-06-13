import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { formatRelative } from '../api/utils';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, markNotificationRead, markAllNotificationsRead, setActiveDialog } = useChatStore();
  const ref = useRef(null);
  const navigate = useNavigate();

  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNotifClick = (n) => {
    markNotificationRead(n.id);
    setActiveDialog(n.dialogId);
    navigate('/chat');
    setOpen(false);
  };

  return (
    <div className="notif-wrapper" ref={ref}>
      <button className="notif-btn" id="notif-bell-btn" onClick={() => setOpen(o => !o)}>
        🔔
        {unread > 0 && <span className="notif-count">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span className="notif-dropdown-title">Уведомления</span>
            {unread > 0 && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={markAllNotificationsRead}
              >
                Прочитать все
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notif-empty">
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔕</div>
              Нет уведомлений
            </div>
          ) : (
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {notifications.slice().reverse().map(n => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.read ? 'unread' : ''}`}
                  onClick={() => handleNotifClick(n)}
                >
                  <div className="notif-item-icon">💬</div>
                  <div>
                    <div className="notif-item-text">{n.text}</div>
                    <div className="notif-item-time">{formatRelative(n.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

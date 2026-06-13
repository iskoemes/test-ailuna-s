import { useChatStore } from '../store/chatStore';
import { StatusBadge, PriorityDot } from './Badges';
import { formatRelative } from '../api/utils';
import Avatar from './Avatar';

export default function DialogItem({ dialog, isActive, onClick }) {
  const { getUserById, getMessagesByDialog } = useChatStore();

  const client = getUserById(dialog.clientId);
  const messages = getMessagesByDialog(dialog.id);
  const lastMsg = messages[messages.length - 1];

  const unreadCount = dialog.unreadClient + dialog.unreadOperator;

  return (
    <div
      className={`dialog-item ${isActive ? 'active' : ''}`}
      id={`dialog-item-${dialog.id}`}
      onClick={onClick}
    >
      <div className="dialog-item-header">
        <div className="dialog-item-avatar">
          {client && <Avatar user={client} size="sm" />}
        </div>
        <div className="dialog-item-info">
          <div className="dialog-item-name">
            {client?.name || 'Неизвестный'}
          </div>
        </div>
        <div className="dialog-item-time">{formatRelative(dialog.updatedAt)}</div>
      </div>

      <div className="dialog-item-subject">{dialog.subject}</div>

      <div className="dialog-item-footer">
        <PriorityDot priority={dialog.priority} />
        <StatusBadge status={dialog.status} />
        {lastMsg && (
          <span
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 120,
            }}
          >
            {lastMsg.text}
          </span>
        )}
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </div>
    </div>
  );
}

import { STATUS_LABELS, CATEGORY_LABELS } from '../api/utils';

export function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function CategoryBadge({ category }) {
  return (
    <span
      className="badge"
      style={{
        background: 'var(--bg-tertiary)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {CATEGORY_LABELS[category] || category}
    </span>
  );
}

export function PriorityDot({ priority }) {
  return <span className={`priority-dot priority-${priority}`} title={`Приоритет: ${priority}`} />;
}

export function MessageStatusIcon({ status }) {
  const icons = {
    sent: '✓',
    delivered: '✓✓',
    read: '✓✓',
  };
  const colors = {
    sent: 'rgba(255,255,255,0.5)',
    delivered: 'rgba(255,255,255,0.7)',
    read: '#6478ff',
  };
  return (
    <span
      className="message-status-icon"
      style={{ color: colors[status] || 'rgba(255,255,255,0.5)' }}
    >
      {icons[status] || '✓'}
    </span>
  );
}

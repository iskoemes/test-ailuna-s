import { getInitials } from '../api/utils';

const GRADIENT_MAP = {
  client: 'linear-gradient(135deg, #6478ff, #9b80ff)',
  operator: 'linear-gradient(135deg, #22c55e, #16a34a)',
  admin: 'linear-gradient(135deg, #f59e0b, #d97706)',
};

export default function Avatar({ user, size = 'md', showOnline = true }) {
  if (!user) return null;

  const sizeClass = `avatar-${size}`;
  const roleClass = `avatar-${user.role}`;

  return (
    <div className={`avatar ${sizeClass} ${roleClass}`} title={user.name}>
      {getInitials(user.name)}
      {showOnline && user.status === 'online' && (
        <span className="online-dot" />
      )}
    </div>
  );
}

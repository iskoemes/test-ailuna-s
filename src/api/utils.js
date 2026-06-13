import { format, isToday, isYesterday } from 'date-fns';
import { ru } from 'date-fns/locale';

export function formatTime(dateString) {
  const date = new Date(dateString);
  return format(date, 'HH:mm');
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  if (isToday(date)) return 'Сегодня';
  if (isYesterday(date)) return 'Вчера';
  return format(date, 'd MMMM', { locale: ru });
}

export function formatRelative(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return `Вчера ${format(date, 'HH:mm')}`;
  return format(date, 'd MMM', { locale: ru });
}

export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const STATUS_LABELS = {
  open: 'Открыт',
  pending: 'Ожидает',
  resolved: 'Решён',
  closed: 'Закрыт',
};

export const CATEGORY_LABELS = {
  delivery: 'Доставка',
  payment: 'Оплата',
  returns: 'Возврат',
  consultation: 'Консультация',
  other: 'Прочее',
};

export const PRIORITY_LABELS = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

export const ROLE_LABELS = {
  client: 'Клиент',
  operator: 'Оператор',
  admin: 'Администратор',
};

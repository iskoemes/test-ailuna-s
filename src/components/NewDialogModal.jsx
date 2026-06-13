import { useState } from 'react';
import { useChatStore, useAuthStore } from '../store/chatStore';
import { CATEGORIES } from '../api/mockData';

export default function NewDialogModal({ onClose }) {
  const { currentUser } = useAuthStore();
  const { createDialog } = useChatStore();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('other');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setLoading(true);
    setTimeout(() => {
      createDialog(currentUser.id, subject.trim(), category, message.trim());
      setLoading(false);
      onClose();
    }, 400);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" id="new-dialog-modal">
        <div className="modal-header">
          <span className="modal-title">Новое обращение</span>
          <button className="modal-close" id="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label className="form-label">Тема обращения</label>
              <input
                id="dialog-subject-input"
                className="form-input"
                placeholder="Кратко опишите проблему"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label">Категория</label>
              <select
                id="dialog-category-select"
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Сообщение</label>
              <textarea
                id="dialog-message-input"
                className="form-textarea"
                placeholder="Опишите вашу проблему подробно..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button
              type="submit"
              id="create-dialog-btn"
              className="btn btn-primary"
              disabled={loading || !subject.trim() || !message.trim()}
            >
              {loading ? '...' : '📤 Отправить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

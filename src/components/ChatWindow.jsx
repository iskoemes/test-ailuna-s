import { useState, useEffect, useRef } from 'react';
import { useChatStore, useAuthStore } from '../store/chatStore';
import { formatTime, formatDate, CATEGORY_LABELS } from '../api/utils';
import Avatar from './Avatar';
import { MessageStatusIcon } from './Badges';
import { StatusBadge, CategoryBadge } from './Badges';

function TypingIndicator() {
  return (
    <div className="message-row" style={{ marginBottom: 8 }}>
      <div className="message-avatar-placeholder" />
      <div className="typing-indicator">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}

function MessageBubble({ msg, isOutgoing, senderUser, showAvatar, showName }) {
  return (
    <div>
      {showName && !isOutgoing && (
        <div className="message-sender-name">{senderUser?.name}</div>
      )}
      <div className={`message-row ${isOutgoing ? 'outgoing' : ''}`}>
        {!isOutgoing && (
          showAvatar
            ? <Avatar user={senderUser} size="sm" showOnline={false} />
            : <div className="message-avatar-placeholder" />
        )}
        <div className={`message-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`}>
          {msg.text}
          <div className="message-meta">
            <span>{formatTime(msg.createdAt)}</span>
            {isOutgoing && <MessageStatusIcon status={msg.status} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatWindow({ dialogId }) {
  const {
    getMessagesByDialog,
    getDialogById,
    getUserById,
    sendMessage,
    closeDialog,
    resolveDialog,
    assignOperator,
    quickReplies,
    isTyping,
    setTyping,
  } = useChatStore();
  const { currentUser } = useAuthStore();
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const dialog = getDialogById(dialogId);
  const messages = getMessagesByDialog(dialogId);

  const clientUser = dialog ? getUserById(dialog.clientId) : null;
  const operatorUser = dialog ? getUserById(dialog.operatorId) : null;

  const chatPartner = currentUser?.role === 'client' ? operatorUser : clientUser;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!text.trim() || !dialog) return;
    sendMessage(dialogId, text.trim(), currentUser.id);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }
    // Simulate typing indicator
    setTyping(true);
    setTimeout(() => setTyping(false), 2500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = '24px';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  };

  // Group messages by date
  const groupedMessages = [];
  let currentDate = null;
  messages.forEach((msg, i) => {
    const dateLabel = formatDate(msg.createdAt);
    if (dateLabel !== currentDate) {
      groupedMessages.push({ type: 'date', label: dateLabel, key: `date-${i}` });
      currentDate = dateLabel;
    }
    const prev = messages[i - 1];
    const showAvatar = !prev || prev.senderId !== msg.senderId;
    const showName = showAvatar && msg.senderId !== currentUser?.id;
    groupedMessages.push({ type: 'message', msg, showAvatar, showName });
  });

  if (!dialog) {
    return (
      <div className="chat-container">
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <div className="empty-state-title">Выберите диалог</div>
          <div className="empty-state-text">
            Выберите диалог из списка слева, чтобы начать общение
          </div>
        </div>
      </div>
    );
  }

  const isClosed = dialog.status === 'closed' || dialog.status === 'resolved';
  const isOperatorOrAdmin = ['operator', 'admin'].includes(currentUser?.role);

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        {chatPartner
          ? <Avatar user={chatPartner} size="sm" />
          : <div style={{ fontSize: 28 }}>🤖</div>
        }
        <div className="chat-header-info">
          <div className="chat-header-name">
            {chatPartner?.name || (currentUser?.role === 'client' ? 'Служба поддержки' : 'Оператор не назначен')}
          </div>
          <div className="chat-header-status" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <StatusBadge status={dialog.status} />
            <CategoryBadge category={dialog.category} />
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
              # {dialog.subject}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {isOperatorOrAdmin && dialog.status === 'pending' && !dialog.operatorId && (
            <button
              id="assign-self-btn"
              className="btn btn-primary btn-sm"
              onClick={() => assignOperator(dialogId, currentUser.id)}
            >
              Взять в работу
            </button>
          )}
          {isOperatorOrAdmin && dialog.status === 'open' && (
            <button
              id="resolve-dialog-btn"
              className="btn btn-success btn-sm"
              onClick={() => resolveDialog(dialogId)}
            >
              ✓ Решить
            </button>
          )}
          {isOperatorOrAdmin && dialog.status !== 'closed' && (
            <button
              id="close-dialog-btn"
              className="btn btn-danger btn-sm"
              onClick={() => closeDialog(dialogId)}
            >
              Закрыть
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {groupedMessages.length === 0 && (
          <div className="empty-state" style={{ flex: 'none', paddingTop: 60 }}>
            <div className="empty-state-icon">👋</div>
            <div className="empty-state-title">Начните диалог</div>
            <div className="empty-state-text">Отправьте первое сообщение</div>
          </div>
        )}

        {groupedMessages.map((item) => {
          if (item.type === 'date') {
            return (
              <div key={item.key} className="chat-messages-date-divider">
                <span>{item.label}</span>
              </div>
            );
          }
          const { msg, showAvatar, showName } = item;
          const isOutgoing = msg.senderId === currentUser?.id;
          const senderUser = getUserById(msg.senderId);
          return (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isOutgoing={isOutgoing}
              senderUser={senderUser}
              showAvatar={showAvatar}
              showName={showName}
            />
          );
        })}

        {isTyping && !isClosed && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isClosed ? (
        <div
          style={{
            padding: '14px 24px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 'var(--text-sm)',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
          }}
        >
          Диалог закрыт
        </div>
      ) : (
        <div className="chat-input-area">
          {/* Quick replies for operators */}
          {isOperatorOrAdmin && (
            <div style={{ marginBottom: 8 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowQuickReplies(v => !v)}
                style={{ marginBottom: showQuickReplies ? 8 : 0 }}
              >
                ⚡ Быстрые ответы
              </button>
              {showQuickReplies && (
                <div className="quick-replies">
                  {quickReplies.map((qr, i) => (
                    <button
                      key={i}
                      id={`quick-reply-${i}`}
                      className="quick-reply-btn"
                      onClick={() => { setText(qr); setShowQuickReplies(false); textareaRef.current?.focus(); }}
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="chat-input-row">
            <textarea
              ref={textareaRef}
              id="chat-message-input"
              className="chat-input"
              placeholder="Напишите сообщение..."
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              id="send-message-btn"
              className="send-btn"
              onClick={handleSend}
              disabled={!text.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

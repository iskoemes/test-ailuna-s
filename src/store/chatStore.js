import { create } from 'zustand';
import { USERS, DIALOGS, MESSAGES, QUICK_REPLIES } from '../api/mockData';

let messageIdCounter = 100;
let dialogIdCounter = 10;

const generateId = (prefix) => `${prefix}${++messageIdCounter}`;

export const useAuthStore = create((set, get) => ({
  currentUser: null,
  isLoading: false,
  error: null,

  login: (email, password) => {
    set({ isLoading: true, error: null });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = USERS.find(
          (u) => u.email === email && u.password === password
        );
        if (user) {
          set({ currentUser: user, isLoading: false });
          resolve(user);
        } else {
          set({ error: 'Неверный email или пароль', isLoading: false });
          reject(new Error('Invalid credentials'));
        }
      }, 800);
    });
  },

  logout: () => set({ currentUser: null, error: null }),
}));

export const useChatStore = create((set, get) => ({
  dialogs: [...DIALOGS],
  messages: { ...MESSAGES },
  activeDialogId: null,
  searchQuery: '',
  filterStatus: 'all',
  filterCategory: 'all',
  filterPriority: 'all',
  notifications: [],
  isTyping: false,
  typingTimeout: null,
  quickReplies: QUICK_REPLIES,
  users: [...USERS],

  setActiveDialog: (dialogId) => {
    set({ activeDialogId: dialogId });
    // Mark messages as read
    if (dialogId) {
      const { dialogs } = get();
      const currentUser = useAuthStore.getState().currentUser;
      const updatedDialogs = dialogs.map((d) => {
        if (d.id === dialogId) {
          if (currentUser?.role === 'client') return { ...d, unreadClient: 0 };
          if (currentUser?.role === 'operator') return { ...d, unreadOperator: 0 };
        }
        return d;
      });
      set({ dialogs: updatedDialogs });
    }
  },

  sendMessage: (dialogId, text, senderId) => {
    const newMsg = {
      id: generateId('msg'),
      dialogId,
      senderId,
      text,
      type: 'text',
      status: 'sent',
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const existingMsgs = state.messages[dialogId] || [];
      const updatedMsgs = { ...state.messages, [dialogId]: [...existingMsgs, newMsg] };

      // Update dialog's updatedAt and unread counts
      const currentUser = useAuthStore.getState().currentUser;
      const updatedDialogs = state.dialogs.map((d) => {
        if (d.id === dialogId) {
          const isClient = currentUser?.role === 'client';
          return {
            ...d,
            updatedAt: new Date().toISOString(),
            unreadOperator: isClient ? d.unreadOperator + 1 : d.unreadOperator,
            unreadClient: !isClient ? d.unreadClient + 1 : d.unreadClient,
            status: d.status === 'pending' ? 'open' : d.status,
          };
        }
        return d;
      });

      // Simulate status update: sent -> delivered after 1s
      setTimeout(() => {
        set((s) => ({
          messages: {
            ...s.messages,
            [dialogId]: s.messages[dialogId].map((m) =>
              m.id === newMsg.id ? { ...m, status: 'delivered' } : m
            ),
          },
        }));
      }, 1000);

      // Simulate operator auto-response for clients
      if (currentUser?.role === 'client') {
        setTimeout(() => {
          const autoMsg = {
            id: generateId('msg'),
            dialogId,
            senderId: 'op1',
            text: 'Спасибо за сообщение! Мы рассматриваем ваш вопрос и скоро ответим.',
            type: 'text',
            status: 'sent',
            createdAt: new Date().toISOString(),
          };
          set((s) => ({
            messages: {
              ...s.messages,
              [dialogId]: [...(s.messages[dialogId] || []), autoMsg],
            },
            notifications: [
              ...s.notifications,
              {
                id: generateId('notif'),
                text: 'Новый ответ от оператора',
                dialogId,
                createdAt: new Date().toISOString(),
                read: false,
              },
            ],
          }));
        }, 3000);
      }

      return { messages: updatedMsgs, dialogs: updatedDialogs };
    });
  },

  createDialog: (clientId, subject, category, firstMessage) => {
    const newDialogId = generateId('d');
    const newDialog = {
      id: newDialogId,
      clientId,
      operatorId: null,
      subject,
      status: 'pending',
      priority: 'medium',
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unreadClient: 0,
      unreadOperator: 1,
    };

    const firstMsg = {
      id: generateId('msg'),
      dialogId: newDialogId,
      senderId: clientId,
      text: firstMessage,
      type: 'text',
      status: 'sent',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      dialogs: [newDialog, ...state.dialogs],
      messages: { ...state.messages, [newDialogId]: [firstMsg] },
      activeDialogId: newDialogId,
    }));

    return newDialogId;
  },

  closeDialog: (dialogId) => {
    set((state) => ({
      dialogs: state.dialogs.map((d) =>
        d.id === dialogId ? { ...d, status: 'closed' } : d
      ),
    }));
  },

  resolveDialog: (dialogId) => {
    set((state) => ({
      dialogs: state.dialogs.map((d) =>
        d.id === dialogId ? { ...d, status: 'resolved' } : d
      ),
    }));
  },

  assignOperator: (dialogId, operatorId) => {
    set((state) => ({
      dialogs: state.dialogs.map((d) =>
        d.id === dialogId ? { ...d, operatorId, status: 'open' } : d
      ),
    }));
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilterStatus: (s) => set({ filterStatus: s }),
  setFilterCategory: (c) => set({ filterCategory: c }),
  setFilterPriority: (p) => set({ filterPriority: p }),

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  setTyping: (val) => {
    const { typingTimeout } = get();
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = val
      ? setTimeout(() => set({ isTyping: false }), 3000)
      : null;
    set({ isTyping: val, typingTimeout: timeout });
  },

  getFilteredDialogs: (userId, role) => {
    const { dialogs, searchQuery, filterStatus, filterCategory, filterPriority } = get();
    return dialogs
      .filter((d) => {
        if (role === 'client') return d.clientId === userId;
        return true; // operator and admin see all
      })
      .filter((d) => {
        if (filterStatus !== 'all') return d.status === filterStatus;
        return true;
      })
      .filter((d) => {
        if (filterCategory !== 'all') return d.category === filterCategory;
        return true;
      })
      .filter((d) => {
        if (filterPriority !== 'all') return d.priority === filterPriority;
        return true;
      })
      .filter((d) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const client = USERS.find((u) => u.id === d.clientId);
        return (
          d.subject.toLowerCase().includes(q) ||
          client?.name.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  getUserById: (id) => USERS.find((u) => u.id === id),
  getDialogById: (id) => get().dialogs.find((d) => d.id === id),
  getMessagesByDialog: (id) => get().messages[id] || [],
  getUnreadCount: () => {
    const { dialogs } = get();
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return 0;
    if (currentUser.role === 'client') {
      return dialogs
        .filter((d) => d.clientId === currentUser.id)
        .reduce((acc, d) => acc + d.unreadClient, 0);
    }
    return dialogs.reduce((acc, d) => acc + d.unreadOperator, 0);
  },
}));

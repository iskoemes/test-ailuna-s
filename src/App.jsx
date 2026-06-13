import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/chatStore';
import LoginPage from './pages/LoginPage';
import ClientChatPage from './pages/ClientChatPage';
import OperatorPage from './pages/OperatorPage';
import AdminPage from './pages/AdminPage';
import DialogsHistoryPage from './pages/DialogsHistoryPage';

function RequireAuth({ children, roles }) {
  const { currentUser } = useAuthStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(currentUser.role)) {
    // Redirect to appropriate home
    if (currentUser.role === 'admin') return <Navigate to="/admin" replace />;
    if (currentUser.role === 'operator') return <Navigate to="/dialogs" replace />;
    return <Navigate to="/chat" replace />;
  }
  return children;
}

function DefaultRedirect() {
  const { currentUser } = useAuthStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'admin') return <Navigate to="/admin" replace />;
  if (currentUser.role === 'operator') return <Navigate to="/dialogs" replace />;
  return <Navigate to="/chat" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/chat"
          element={
            <RequireAuth roles={['client', 'operator', 'admin']}>
              <ClientChatPage />
            </RequireAuth>
          }
        />
        <Route
          path="/dialogs"
          element={
            <RequireAuth roles={['operator', 'admin']}>
              <OperatorPage />
            </RequireAuth>
          }
        />
        <Route
          path="/history"
          element={
            <RequireAuth roles={['operator', 'admin']}>
              <DialogsHistoryPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth roles={['admin']}>
              <AdminPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

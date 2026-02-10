import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CategoryPage from './pages/CategoryPage';
import { TRANSLATIONS } from './lib/translations';

import AdminMessagesPage from './pages/AdminMessagesPage';
import ResidentMessagesPage from './pages/ResidentMessagesPage';
import UnreadManagementPage from './pages/UnreadManagementPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import InstallPrompt from './components/InstallPrompt';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const isAuthenticated = !!user;
  const [language, setLanguage] = React.useState(() => localStorage.getItem('app_language') || 'ja');
  const [fontSize, setFontSize] = React.useState(() => localStorage.getItem('app_fontSize') || 'medium');

  React.useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  React.useEffect(() => {
    const sizeMap = {
      medium: '16px',
      large: '20px',
    };
    document.documentElement.style.fontSize = sizeMap[fontSize];
    localStorage.setItem('app_fontSize', fontSize);
  }, [fontSize]);

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <InstallPrompt />
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          element={
            isAuthenticated ? (
              <Layout
                isAdmin={isAdmin}
                onLogout={logout}
                language={language}
                setLanguage={setLanguage}
                fontSize={fontSize}
                setFontSize={setFontSize}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/dashboard" element={<Dashboard user={user} language={language} isAdmin={isAdmin} />} />
          <Route
            path="/announcements"
            element={<CategoryPage title={language === 'ja' ? "お知らせ" : TRANSLATIONS[language].categories.announcements.title} category="announcements" isAdmin={isAdmin} currentUser={user} language={language} />}
          />


          <Route
            path="/unread-management"
            element={<UnreadManagementPage />}
          />

          <Route
            path="/messages"
            element={<AdminMessagesPage language={language} />}
          />
          <Route
            path="/my-messages"
            element={<ResidentMessagesPage currentUser={user} language={language} />}
          />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

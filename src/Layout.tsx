import React, { useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme as toggleThemeAction } from './store/themeSlice';
import type { RootState } from './store';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

export const Layout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const isDarkMode = themeMode === 'dark';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Map URL path to nav ID
  const getCurrentPageId = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path.includes('/employees')) return 'employees';
    if (path.includes('/teams')) return 'teams';
    if (path.includes('/clients')) return 'clients';
    if (path === '/settings') return 'settings';
    return 'dashboard';
  };

  const handleNavigate = (pageId: string) => {
    switch (pageId) {
      case 'dashboard':
        navigate('/');
        break;
      case 'employees':
        navigate('/employees');
        break;
      case 'teams':
        navigate('/teams');
        break;
      case 'clients':
        navigate('/clients');
        break;
      case 'settings':
        navigate('/settings');
        break;
    }
    setIsSidebarOpen(false);
  };

  const toggleTheme = () => {
    dispatch(toggleThemeAction());
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-row bg-white dark:bg-[#101922] transition-colors duration-200"
      data-theme={isDarkMode ? 'dark' : 'light'}
      style={{
        backgroundColor: isDarkMode ? '#101922' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#111418',
      }}
    >
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        currentPage={getCurrentPageId()}
        onNavigate={handleNavigate}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <Header
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          toggleTheme={toggleTheme}
        />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

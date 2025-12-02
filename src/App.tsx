import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme as toggleThemeAction } from './store/themeSlice';
import type { RootState } from './store';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Header } from './components/Header';
// import { Employees } from './pages/Employees';
// import { Teams } from './pages/Teams';
// import { Clients } from './pages/Clients';
// import { Settings } from './pages/Settings';

export default function App() {
  const dispatch = useDispatch();
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const isDarkMode = themeMode === 'dark';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Apply theme class and persist to localStorage when the store theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      console.log("dark mode activated")
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    dispatch(toggleThemeAction());
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <Dashboard />;
      case 'teams':
        return <Dashboard />;
      case 'clients':
        return <Dashboard />;
      case 'settings':
        return <Dashboard />;
      default:
        return <Dashboard />;
    }
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
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          setIsSidebarOpen(false);
        }}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <Header 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          toggleTheme={toggleTheme}
        />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] scrollbar-hide">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
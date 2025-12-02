import React from 'react';
import { useTheme } from '../theme/useTheme';

interface SidebarProps {
  isOpen: boolean;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentPage, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'employees', icon: 'group', label: 'Employees' },
    { id: 'teams', icon: 'diversity_3', label: 'Teams' },
    { id: 'clients', icon: 'business_center', label: 'Clients' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  const { isDark, palette } = useTheme();

  return (
    <aside 
      style={{
        backgroundColor: palette.surface,
        borderRight: `1px solid ${palette.border}`,
        color: palette.textPrimary,
      }}
      className={`
        fixed top-0 left-0 z-50 h-screen w-64 transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="flex flex-col gap-4 p-4 h-full">
        <div className="flex items-center gap-3 px-3 py-2">
          <div style={{ backgroundColor: palette.primary }} className="text-white flex items-center justify-center rounded-lg size-10 shadow-sm">
            <span className="material-symbols-outlined !text-2xl">query_stats</span>
          </div>
          <div className="flex flex-col">
            <h1 style={{ color: palette.textPrimary }} className="text-base font-bold leading-normal">InfoPortal</h1>
            <p style={{ color: palette.textSecondary }} className="text-sm font-normal leading-normal">HR Management</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 mt-4">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={isActive ? {
                  backgroundColor: isDark ? 'rgba(0, 102, 255, 0.12)' : 'rgba(0, 102, 255, 0.08)',
                  color: palette.primary,
                } : {
                  color: palette.textPrimary,
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left ${isActive ? 'font-semibold' : 'font-medium'}`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <p className="text-sm leading-normal">{item.label}</p>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto">
          {/* Bottom spacing or footer items if needed */}
        </div>
      </div>
    </aside>
  );
};
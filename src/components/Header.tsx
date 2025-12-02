import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../theme/useTheme';

interface HeaderProps {
  onMenuClick: () => void;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, toggleTheme }) => {
  const { isDark, palette } = useTheme();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Dashboard Overview';
    if (path === '/employees' || path.startsWith('/employees')) {
      if (path === '/employees/add') return 'Add Employee';
      if (/^\/employees\/[^/]+/.test(path)) return 'Employee Details';
      return 'Employees';
    }
    if (path === '/teams' || path === '/teams/') return 'Teams';
    if (path === '/teams/add') return 'Add Team';
    if (/^\/teams\/[^/]+/.test(path)) return 'Team Details';
    if (path === '/clients' || path === '/clients/') return 'Clients';
    if (path === '/clients/add') return 'Add Client';
    if (/^\/clients\/[^/]+/.test(path)) return 'Client Details';
    if (path === '/settings') return 'Settings';
    return 'Dashboard Overview';
  };
  const [isThemeHover, setIsThemeHover] = useState(false);
  const [isNotifHover, setIsNotifHover] = useState(false);
  const hoverBg = (hover: boolean) => (hover ? (isDark ? 'rgba(255,255,255,0.06)' : '#f0f2f5') : 'transparent');

  return (
    <header
      style={{
        backgroundColor: palette.surface,
        color: palette.textPrimary,
        borderBottom: `1px solid ${palette.border}`,
      }}
      className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 md:px-10 transition-colors duration-200"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          style={{ color: palette.textPrimary }}
          className="lg:hidden p-1 rounded"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 style={{ color: palette.textPrimary }} className="text-lg font-bold leading-tight tracking-[-0.015em]">{getPageTitle()}</h2>
      </div>

      <div className="flex flex-1 justify-end items-center gap-3 md:gap-4">
        <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-sm w-full">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div style={{ color: '#60758a', backgroundColor: isDark ? '#111827' : '#f0f2f5' }} className="flex items-center justify-center pl-4 rounded-l-lg border-r-0 transition-colors">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              placeholder="Search employees, teams..."
              style={{
                color: palette.textPrimary,
                backgroundColor: isDark ? '#111827' : '#f0f2f5',
                border: 'none',
              }}
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal transition-colors"
            />
          </div>
        </label>

        <button
          onClick={toggleTheme}
          onMouseEnter={() => setIsThemeHover(true)}
          onMouseLeave={() => setIsThemeHover(false)}
          style={{
            color: palette.textPrimary,
            backgroundColor: hoverBg(isThemeHover),
            borderRadius: 8,
          }}
          className="flex cursor-pointer items-center justify-center rounded-lg h-10 w-10 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="material-symbols-outlined">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <button
          onMouseEnter={() => setIsNotifHover(true)}
          onMouseLeave={() => setIsNotifHover(false)}
          style={{
            color: palette.textPrimary,
            backgroundColor: hoverBg(isNotifHover),
            borderRadius: 8,
          }}
          className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 transition-colors"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full"
          style={{ backgroundImage: 'url("https://picsum.photos/200/200")', border: `1px solid ${palette.border}`, width: 40, height: 40 }}
          role="img"
          aria-label="User avatar"
        ></div>
      </div>
    </header>
  );
};
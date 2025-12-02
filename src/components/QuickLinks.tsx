import React from 'react';
import { useTheme } from '../theme/useTheme';

export const QuickLinks: React.FC = () => {
  const { palette } = useTheme();

  return (
    <div>
      <h2 style={{ color: palette.textPrimary }} className="text-xl font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">
        Quick Links
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button style={{ backgroundColor: palette.primary, color: 'white' }} className="flex items-center justify-center gap-2 rounded-lg p-6 shadow-sm hover:opacity-90 transition-colors">
          <span className="material-symbols-outlined">person_add</span>
          <span className="text-base font-semibold">Add Employee</span>
        </button>
        
        <button style={{ backgroundColor: palette.surface, color: palette.textPrimary, borderColor: palette.border }} className="flex items-center justify-center gap-2 rounded-lg p-6 border shadow-sm transition-colors">
          <span className="material-symbols-outlined">groups</span>
          <span className="text-base font-semibold">View All Teams</span>
        </button>
        
        <button style={{ backgroundColor: palette.surface, color: palette.textPrimary, borderColor: palette.border }} className="flex items-center justify-center gap-2 rounded-lg p-6 border shadow-sm transition-colors">
          <span className="material-symbols-outlined">manage_accounts</span>
          <span className="text-base font-semibold">Manage Clients</span>
        </button>
      </div>
    </div>
  );
};
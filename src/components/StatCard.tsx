import React from 'react';
import { useTheme } from '../theme/useTheme';
import type { StatCardProps } from '../types';
// import { StatCardProps } from '../types.ts';

export const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
  const { palette } = useTheme();

  return (
    <div style={{ backgroundColor: palette.surface, borderColor: palette.border, color: palette.textPrimary }} className="flex flex-col gap-2 rounded-xl p-6 border shadow-sm transition-transform hover:scale-[1.01] duration-200">
      <p style={{ color: palette.textSecondary }} className="text-base font-medium leading-normal">{label}</p>
      <p style={{ color: palette.textPrimary }} className="tracking-light text-3xl font-bold leading-tight">{value}</p>
    </div>
  );
};
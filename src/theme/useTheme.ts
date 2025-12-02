import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export const useTheme = () => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const isDark = themeMode === 'dark';

  const palette = useMemo(() => ({
    background: isDark ? '#0F1419' : '#FFFFFF',
    surface: isDark ? '#101922' : '#FFFFFF',
    cardBg: isDark ? '#0F1419' : '#FFFFFF',
    textPrimary: isDark ? '#FFFFFF' : '#111418',
    textSecondary: isDark ? '#9CA3AF' : '#6C757D',
    border: isDark ? '#2D3748' : '#E9ECEF',
    primary: '#0066FF',
    primaryLight: '#E3F2FD',
  }), [isDark]);

  return { isDark, palette };
}

export default useTheme;

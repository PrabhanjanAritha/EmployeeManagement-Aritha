import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import type { RootState } from "../store";

export const useTheme = () => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const location = useLocation();

  // Force light theme on login route
  const forceLight = location.pathname === "/login";
  const isDark = forceLight ? false : themeMode === "dark";

  const palette = useMemo(
    () => ({
      background: isDark ? "#0F1419" : "#FFFFFF",
      surface: isDark ? "#101922" : "#FFFFFF",
      cardBg: isDark ? "#0F1419" : "#FFFFFF",
      textPrimary: isDark ? "#FFFFFF" : "#111418",
      textSecondary: isDark ? "#9CA3AF" : "#6C757D",
      border: isDark ? "#2D3748" : "#E9ECEF",
      primary: "#0066FF",
      primaryLight: "#E3F2FD",
      background_w: "#FFFFFF",
      surface_w: "#FFFFFF",
      cardBg_w: "#FFFFFF",
      textPrimary_w: "#111418",
      textSecondary_w: "#6C757D",
      border_w: "#E9ECEF",
    }),
    [isDark]
  );

  return { isDark, palette };
};

export default useTheme;

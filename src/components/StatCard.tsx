import React from "react";
import { useTheme } from "../theme/useTheme";

export interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  trend,
}) => {
  const { palette } = useTheme();

  return (
    <div
      style={{
        backgroundColor: palette.surface,
        borderColor: palette.border,
        color: palette.textPrimary,
      }}
      className="flex flex-col gap-2 rounded-xl p-6 border shadow-sm transition-transform hover:scale-[1.01] duration-200"
    >
      {/* Header with label and optional icon */}
      <div className="flex items-center justify-between">
        <p
          style={{ color: palette.textSecondary }}
          className="text-base font-medium leading-normal"
        >
          {label}
        </p>
        {icon && (
          <span
            className="material-symbols-outlined text-2xl"
            style={{ color: palette.textSecondary, opacity: 0.6 }}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Main value */}
      <p
        style={{ color: palette.textPrimary }}
        className="tracking-light text-3xl font-bold leading-tight"
      >
        {value}
      </p>

      {/* Subtitle or trend */}
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-1">
          {subtitle && (
            <p
              style={{ color: palette.textSecondary }}
              className="text-sm font-normal"
            >
              {subtitle}
            </p>
          )}

          {trend && (
            <div className="flex items-center gap-1">
              <span
                className="material-symbols-outlined text-sm"
                style={{
                  color: trend.isPositive ? "#10B981" : "#EF4444",
                }}
              >
                {trend.isPositive ? "trending_up" : "trending_down"}
              </span>
              <span
                style={{
                  color: trend.isPositive ? "#10B981" : "#EF4444",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

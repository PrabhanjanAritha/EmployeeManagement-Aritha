import React from 'react';
import { useTheme } from '../theme/useTheme';
import type { ActivityItem } from '../types';

const activities: ActivityItem[] = [
  {
    id: 1,
    type: 'add_person',
    content: "Jane Doe was added to the Engineering team.",
    time: "2 hours ago",
    theme: 'emerald'
  },
  {
    id: 2,
    type: 'status_update',
    content: "Project Alpha status updated to 'In Progress'.",
    time: "5 hours ago",
    theme: 'sky'
  },
  {
    id: 3,
    type: 'pto_request',
    content: "New PTO request from John Smith.",
    time: "1 day ago",
    theme: 'amber'
  },
  {
    id: 4,
    type: 'add_person',
    content: "Markus Brown was added to the Sales team.",
    time: "2 days ago",
    theme: 'emerald'
  },
  {
    id: 5,
    type: 'contract_expiry',
    content: "Client contract for 'Innovate Inc.' is expiring soon.",
    time: "3 days ago",
    theme: 'rose'
  }
];

const getIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'add_person': return 'person_add';
    case 'status_update': return 'task_alt';
    case 'pto_request': return 'approval_delegation';
    case 'contract_expiry': return 'work';
    default: return 'circle';
  }
};

const getThemeColors = (theme: ActivityItem['theme'], isDark: boolean) => {
  const themes = {
    emerald: { light: { bg: '#D1FAE5', text: '#059669' }, dark: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981' } },
    sky: { light: { bg: '#E0F2FE', text: '#0284C7' }, dark: { bg: 'rgba(3, 169, 244, 0.1)', text: '#0EA5E9' } },
    amber: { light: { bg: '#FEF3C7', text: '#D97706' }, dark: { bg: 'rgba(217, 119, 6, 0.1)', text: '#F59E0B' } },
    rose: { light: { bg: '#FFE4E6', text: '#E11D48' }, dark: { bg: 'rgba(225, 29, 72, 0.1)', text: '#F43F5E' } },
  };
  return isDark ? themes[theme].dark : themes[theme].light;
};

export const ActivityFeed: React.FC = () => {
  const { isDark, palette } = useTheme();

  return (
    <div style={{ backgroundColor: palette.surface, borderColor: palette.border, color: palette.textPrimary }} className="rounded-xl p-6 border shadow-sm mt-0 lg:mt-14 h-full">
      <h2 style={{ color: palette.textPrimary }} className="text-xl font-bold leading-tight tracking-[-0.015em] mb-6">
        Latest Updates
      </h2>
      <div className="flex flex-col gap-6">
        {activities.map((activity) => {
          const colors = getThemeColors(activity.theme, isDark);
          return (
            <div key={activity.id} className="flex items-start gap-4">
              <div style={{ backgroundColor: colors.bg, color: colors.text }} className="flex items-center justify-center min-w-10 size-10 rounded-full">
                <span className="material-symbols-outlined text-xl">{getIcon(activity.type)}</span>
              </div>
              <div>
                <p style={{ color: palette.textPrimary }} className="font-medium text-sm leading-snug">
                  {activity.content}
                </p>
                <p style={{ color: palette.textSecondary }} className="text-xs mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
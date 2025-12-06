/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useTheme } from "../theme/useTheme";
import { getEmployees } from "../api/employees";
import { Spin } from "antd";

interface ActivityItem {
  id: number;
  type: "new_hire" | "note_added" | "status_change" | "team_assignment";
  content: string;
  time: string;
  theme: "emerald" | "sky" | "amber" | "rose";
  employeeId?: number;
}

const getIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "new_hire":
      return "person_add";
    case "note_added":
      return "note_add";
    case "status_change":
      return "toggle_on";
    case "team_assignment":
      return "group_add";
    default:
      return "circle";
  }
};

const getThemeColors = (theme: ActivityItem["theme"], isDark: boolean) => {
  const themes = {
    emerald: {
      light: { bg: "#D1FAE5", text: "#059669" },
      dark: { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" },
    },
    sky: {
      light: { bg: "#E0F2FE", text: "#0284C7" },
      dark: { bg: "rgba(3, 169, 244, 0.1)", text: "#0EA5E9" },
    },
    amber: {
      light: { bg: "#FEF3C7", text: "#D97706" },
      dark: { bg: "rgba(217, 119, 6, 0.1)", text: "#F59E0B" },
    },
    rose: {
      light: { bg: "#FFE4E6", text: "#E11D48" },
      dark: { bg: "rgba(225, 29, 72, 0.1)", text: "#F43F5E" },
    },
  };
  return isDark ? themes[theme].dark : themes[theme].light;
};

const getTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const ActivityFeed: React.FC = () => {
  const { isDark, palette } = useTheme();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);

        // Fetch recent employees (all, including notes)
        const response = await getEmployees({
          page: 1,
          pageSize: 20,
          sortBy: "createdAt",
          sortOrder: "desc",
        });

        const employees = Array.isArray(response)
          ? response
          : (response as any)?.data || [];

        const activityList: ActivityItem[] = [];

        // Process employees
        employees.forEach((emp: any) => {
          // New hire activity (if joined recently - last 30 days)
          if (emp.dateOfJoining) {
            const joinDate = new Date(emp.dateOfJoining);
            const daysSinceJoin = Math.floor(
              (new Date().getTime() - joinDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            if (daysSinceJoin <= 30 && daysSinceJoin >= 0) {
              activityList.push({
                id: emp.id,
                type: "new_hire",
                content: `${emp.firstName} ${emp.lastName} joined ${
                  emp.team?.name || "the company"
                }.`,
                time: getTimeAgo(joinDate),
                theme: "emerald",
                employeeId: emp.id,
              });
            }
          }

          // Team assignment (if has team)
          if (emp.team && emp.createdAt) {
            const createdDate = new Date(emp.createdAt);
            const daysSinceCreated = Math.floor(
              (new Date().getTime() - createdDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            if (daysSinceCreated <= 14) {
              activityList.push({
                id: emp.id + 100000, // Unique ID
                type: "team_assignment",
                content: `${emp.firstName} ${emp.lastName} assigned to ${emp.team.name} team.`,
                time: getTimeAgo(createdDate),
                theme: "sky",
                employeeId: emp.id,
              });
            }
          }

          // Status changes (if inactive)
          if (!emp.active && emp.updatedAt) {
            const updatedDate = new Date(emp.updatedAt);
            const daysSinceUpdate = Math.floor(
              (new Date().getTime() - updatedDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            if (daysSinceUpdate <= 7) {
              activityList.push({
                id: emp.id + 200000, // Unique ID
                type: "status_change",
                content: `${emp.firstName} ${emp.lastName} status changed to inactive.`,
                time: getTimeAgo(updatedDate),
                theme: "amber",
                employeeId: emp.id,
              });
            }
          }

          // Notes activities (if employee has notes)
          if (emp._count?.notes > 0 && emp.updatedAt) {
            const updatedDate = new Date(emp.updatedAt);
            const daysSinceUpdate = Math.floor(
              (new Date().getTime() - updatedDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            if (daysSinceUpdate <= 7) {
              activityList.push({
                id: emp.id + 300000, // Unique ID
                type: "note_added",
                content: `New note added for ${emp.firstName} ${emp.lastName}.`,
                time: getTimeAgo(updatedDate),
                theme: "rose",
                employeeId: emp.id,
              });
            }
          }
        });

        // Sort by most recent and take top 5
        activityList.sort((a, b) => {
          // Simple sorting - in real app would parse time strings
          return a.id > b.id ? -1 : 1;
        });

        setActivities(activityList.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch activities:", error);
        // Set default activities on error
        setActivities([
          {
            id: 1,
            type: "new_hire",
            content: "Welcome to the HR Portal!",
            time: "Just now",
            theme: "emerald",
          },
          {
            id: 2,
            type: "note_added",
            content: "Start by adding employees and teams.",
            time: "1 minute ago",
            theme: "sky",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div
      style={{
        backgroundColor: palette.surface,
        borderColor: palette.border,
        color: palette.textPrimary,
      }}
      className="rounded-xl p-6 border shadow-sm mt-0 lg:mt-14 h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h2
          style={{ color: palette.textPrimary }}
          className="text-xl font-bold leading-tight tracking-[-0.015em]"
        >
          Latest Updates
        </h2>
        {loading && <Spin size="small" />}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Spin />
        </div>
      ) : activities.length === 0 ? (
        <div
          className="text-center py-8"
          style={{ color: palette.textSecondary }}
        >
          <p className="text-sm">No recent activities</p>
          <p className="text-xs mt-2">
            Activities will appear here as they occur
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {activities.map((activity) => {
            const colors = getThemeColors(activity.theme, isDark);
            return (
              <div key={activity.id} className="flex items-start gap-4">
                <div
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                  className="flex items-center justify-center min-w-10 size-10 rounded-full"
                >
                  <span className="material-symbols-outlined text-xl">
                    {getIcon(activity.type)}
                  </span>
                </div>
                <div className="flex-1">
                  <p
                    style={{ color: palette.textPrimary }}
                    className="font-medium text-sm leading-snug"
                  >
                    {activity.content}
                  </p>
                  <p
                    style={{ color: palette.textSecondary }}
                    className="text-xs mt-1"
                  >
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

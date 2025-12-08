/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useTheme } from "../theme/useTheme";
import { StatCard } from "../components/StatCard";
import { QuickLinks } from "../components/QuickLinks";
import { ActivityFeed } from "../components/ActivityFeed";
import { RecentHiresChart } from "../components/RecentHiresChart";
import { getEmployeeStats } from "../api/employees";
import { getTeams } from "../api/teams";
import { getClients } from "../api/clients";
import { Spin } from "antd";

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalTeams: number;
  totalClients: number;
}

export const Dashboard: React.FC = () => {
  const { palette } = useTheme();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    totalTeams: 0,
    totalClients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch stats in parallel
        const [employeeStats, teamsData, clientsData] = await Promise.all([
          getEmployeeStats().catch(() => ({
            total: 0,
            active: 0,
            inactive: 0,
          })),
          getTeams().catch(() => []),
          getClients().catch(() => []),
        ]);

        // Process employee stats
        const empStats = (employeeStats as any).data || employeeStats;

        // Process teams
        const teams = Array.isArray(teamsData)
          ? teamsData
          : (teamsData as any)?.data || [];

        // Process clients
        const clients = Array.isArray(clientsData)
          ? clientsData
          : (clientsData as any)?.data || [];

        setStats({
          totalEmployees: empStats.total || 0,
          activeEmployees: empStats.active || 0,
          inactiveEmployees: empStats.inactive || 0,
          totalTeams: teams.length,
          totalClients: clients.length,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }
  const role = localStorage.getItem("role") ?? "";
  const isEditable = role.toLowerCase() === "admin";
  const displayRole =
    role.toLowerCase() === "hr"
      ? "HR"
      : role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto animate-fade-in">
      <h1
        style={{ color: palette.textPrimary }}
        className="tracking-light text-2xl md:text-[32px] font-bold leading-tight pb-3 pt-2 md:pt-6 transition-colors pl-2"
      >
        Welcome back, {displayRole}!
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 py-3">
        <StatCard
          label="Total Employees"
          value={stats.totalEmployees.toString()}
          subtitle={`${stats.activeEmployees} active`}
        />
        <StatCard label="Active Teams" value={stats.totalTeams.toString()} />
        <StatCard label="Total Clients" value={stats.totalClients.toString()} />
        <StatCard
          label="Inactive Employees"
          value={stats.inactiveEmployees.toString()}
          subtitle="Deactivated"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-2">
        {/* Left Column (Links & Chart) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <QuickLinks isEditable={isEditable} />
          <RecentHiresChart />
        </div>

        {/* Right Column (Activity Feed) */}
        <div className="xl:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
};

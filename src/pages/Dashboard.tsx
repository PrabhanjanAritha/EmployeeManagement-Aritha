import React from 'react';
import { useTheme } from '../theme/useTheme';
import { StatCard } from '../components/StatCard.tsx';
import { QuickLinks } from '../components/QuickLinks.tsx';
import { ActivityFeed } from '../components/ActivityFeed.tsx';
import { RecentHiresChart } from '../components/RecentHiresChart.tsx';


export const Dashboard: React.FC = () => {
  const { palette } = useTheme();

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto animate-fade-in">
      <h1 style={{ color: palette.textPrimary }} className="tracking-light text-2xl md:text-[32px] font-bold leading-tight pb-3 pt-2 md:pt-6 transition-colors">
        Welcome back, Alex!
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 py-4">
        <StatCard label="Total Employees" value="1,204" />
        <StatCard label="Active Teams" value="87" />
        <StatCard label="Total Clients" value="312" />
        <StatCard label="Pending Requests" value="12" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        {/* Left Column (Links & Chart) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <QuickLinks />
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
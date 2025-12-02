import React from 'react';
import { useTheme } from '../theme/useTheme';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ChartData } from '../types';

const data: ChartData[] = [
  { name: 'Jan', hires: 45 },
  { name: 'Feb', hires: 60 },
  { name: 'Mar', hires: 30 },
  { name: 'Apr', hires: 75 },
  { name: 'May', hires: 55 },
  { name: 'Jun', hires: 90 },
];

export const RecentHiresChart: React.FC = () => {
  const { palette } = useTheme();

  return (
    <div style={{ backgroundColor: palette.surface, borderColor: palette.border, color: palette.textPrimary }} className="rounded-xl p-6 border shadow-sm h-[400px] flex flex-col">
      <h2 style={{ color: palette.textPrimary }} className="text-xl font-bold leading-tight tracking-[-0.015em] mb-4">
        Recent Hires
      </h2>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: palette.textSecondary, fontSize: 14 }}
              dy={10}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ 
                backgroundColor: palette.surface, 
                borderRadius: '8px', 
                border: `1px solid ${palette.border}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                color: palette.textPrimary,
              }}
            />
            <Bar dataKey="hires" radius={[8, 8, 8, 8]} barSize={60}>
              {data.map((_entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === data.length - 1 ? '#0f7ff0' : '#dbeafe'} // Dark blue for last, light blue for others to match image
                  className={index !== data.length - 1 ? "dark:fill-blue-900/40" : ""}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
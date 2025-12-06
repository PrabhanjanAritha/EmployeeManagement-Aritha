import React, { useEffect, useState } from "react";
import { useTheme } from "../theme/useTheme";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getEmployees } from "../api/employees";
import { Spin } from "antd";

interface ChartData {
  name: string;
  hires: number;
  month: number;
  year: number;
}

export const RecentHiresChart: React.FC = () => {
  const { palette } = useTheme();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHiresData = async () => {
      try {
        setLoading(true);

        // Fetch all employees
        const response = await getEmployees({ status: "active" });
        const employees = Array.isArray(response)
          ? response
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (response as any)?.data || [];

        // Get last 6 months
        const now = new Date();
        const last6Months: ChartData[] = [];

        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = date.toLocaleDateString("en-US", {
            month: "short",
          });

          last6Months.push({
            name: monthName,
            hires: 0,
            month: date.getMonth(),
            year: date.getFullYear(),
          });
        }

        // Count hires per month based on dateOfJoining
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        employees.forEach((emp: any) => {
          if (emp.dateOfJoining) {
            const joinDate = new Date(emp.dateOfJoining);
            const joinMonth = joinDate.getMonth();
            const joinYear = joinDate.getFullYear();

            const monthData = last6Months.find(
              (m) => m.month === joinMonth && m.year === joinYear
            );

            if (monthData) {
              monthData.hires++;
            }
          }
        });

        setData(last6Months);
      } catch (error) {
        console.error("Failed to fetch hires data:", error);
        // Set default data on error
        const now = new Date();
        const defaultData: ChartData[] = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          defaultData.push({
            name: date.toLocaleDateString("en-US", { month: "short" }),
            hires: 0,
            month: date.getMonth(),
            year: date.getFullYear(),
          });
        }
        setData(defaultData);
      } finally {
        setLoading(false);
      }
    };

    fetchHiresData();
  }, []);

  return (
    <div
      style={{
        backgroundColor: palette.surface,
        borderColor: palette.border,
        color: palette.textPrimary,
      }}
      className="rounded-xl p-6 border shadow-sm h-[400px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          style={{ color: palette.textPrimary }}
          className="text-xl font-bold leading-tight tracking-[-0.015em]"
        >
          Recent Hires
        </h2>
        <span style={{ color: palette.textSecondary }} className="text-sm">
          Last 6 months
        </span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spin />
        </div>
      ) : (
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: palette.textSecondary, fontSize: 14 }}
                dy={10}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  backgroundColor: palette.surface,
                  borderRadius: "8px",
                  border: `1px solid ${palette.border}`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  color: palette.textPrimary,
                }}
                labelStyle={{ color: palette.textPrimary }}
              />
              <Bar dataKey="hires" radius={[8, 8, 8, 8]} barSize={60}>
                {data.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === data.length - 1 ? palette.primary : "#dbeafe"
                    }
                    className={
                      index !== data.length - 1 ? "dark:fill-blue-900/40" : ""
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && data.every((d) => d.hires === 0) && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ color: palette.textSecondary }}
        >
          <p className="text-sm">
            No hiring data available for the last 6 months
          </p>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTheme } from "../theme/useTheme";
import { getEmployees } from "../api/employees";


export const Employees: React.FC = () => {
  const navigate = useNavigate();
  const { palette } = useTheme();

  type EmployeeRow = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    title?: string;
    team?: { id: number; name: string };
    createdAt?: string;
  };

  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await getEmployees(); // should return Employee[]
        setEmployees(data);
      } catch (err) {
        console.error("Failed to fetch employees", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const columns: ColumnsType<EmployeeRow> = [
    {
      title: "Employee ID",
      dataIndex: "id",
      key: "id",
      render: (id: number) => `EMP${id.toString().padStart(3, "0")}`,
    },
    {
      title: "Name",
      key: "name",
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: "Team",
      dataIndex: ["team", "name"],
      key: "team",
      render: (teamName: string | undefined) => teamName || "-",
    },
    {
      title: "Date of Joining",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string | undefined) =>
        value ? new Date(value).toLocaleDateString() : "-",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title?: string) => title || "-",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <button
            onClick={() => navigate(`/employees/${record.id}`)}
            style={{ color: palette.textSecondary, marginRight: 12 }}
            title={`Edit ${record.firstName} ${record.lastName}`}
          >
            ✏️
          </button>
          <button
            onClick={() => {
              // TODO: add delete API call here
              console.log("Delete employee", record.id);
            }}
            style={{ color: palette.textSecondary }}
            title={`Delete ${record.firstName} ${record.lastName}`}
          >
            🗑️
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2
              style={{
                color: palette.textPrimary,
                fontSize: 20,
                fontWeight: 600,
                margin: 0,
              }}
            >
              All Employees
            </h2>
            <p
              style={{
                color: palette.textSecondary,
                fontSize: 14,
                fontWeight: 400,
                margin: "6px 0 0 0",
              }}
            >
              A quick view of all employees
            </p>
          </div>
          <button
            onClick={() => navigate("/employees/add")}
            style={{ backgroundColor: palette.primary, color: "#fff" }}
            className="px-5 py-2 rounded-lg whitespace-nowrap"
          >
            + Add Employee
          </button>
        </div>
      </div>

      {/* Filters stay as you had them */}
      <div
        style={{
          backgroundColor: palette.surface,
          borderColor: palette.border,
        }}
        className="rounded-lg p-4 border mb-6"
      >
        <div className="flex gap-4 items-center">
          <input
            placeholder="Search by EmployeeID or Name"
            style={{
              backgroundColor: palette.surface,
              border: `1px solid ${palette.border}`,
              color: palette.textPrimary,
            }}
            className="flex-1 p-3 rounded-md"
          />
          <select
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.border,
              border: `1px solid ${palette.border}`,
              color: palette.textPrimary,
            }}
            className="p-3 rounded-md"
          >
            <option>All Teams</option>
          </select>
          <input
            placeholder="Min Exp"
            style={{
              width: 110,
              backgroundColor: palette.surface,
              border: `1px solid ${palette.border}`,
              color: palette.textPrimary,
            }}
            className="p-3 rounded-md"
          />
          <input
            placeholder="Max Exp"
            style={{
              width: 110,
              backgroundColor: palette.surface,
              border: `1px solid ${palette.border}`,
              color: palette.textPrimary,
            }}
            className="p-3 rounded-md"
          />
        </div>
      </div>

      {/* AntD Table */}
      <div
        style={{
          backgroundColor: palette.surface,
          borderColor: palette.border,
        }}
        className="rounded-lg border overflow-hidden"
      >
        <Table<EmployeeRow>
          columns={columns}
          dataSource={employees}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: employees.length,
            showSizeChanger: true,
            onChange: (page, pageSize) =>
              setPagination({ current: page, pageSize }),
          }}
        />
      </div>
    </div>
  );
};

export default Employees;

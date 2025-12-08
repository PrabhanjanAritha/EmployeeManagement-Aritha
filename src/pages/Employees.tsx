/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Switch, Modal, message, Badge } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTheme } from "../theme/useTheme";
import { getEmployees, toggleEmployeeStatus } from "../api/employees";
import { getTeams } from "../api/teams"; // <- add
import { getClients } from "../api/clients"; // <- add
import "../theme/antd-table-theme.css";

// Employee type definition
interface EmployeeRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  team?: { id: number; name: string } | null;
  client?: { id: number; name: string; industry?: string } | null;
  createdAt?: string;
  dateOfJoining?: string;
  gender?: string;
  managerName?: string;
  clients?: string[];
  experienceYearsAtJoining?: number;
  active: boolean;
  currentExperience: any;
}

export const Employees: React.FC = () => {
  const role = localStorage.getItem("role") ?? "";
  const isEditable = role.toLowerCase() === "admin";
  const navigate = useNavigate();
  const { palette } = useTheme();
  const [modal, contextHolder] = Modal.useModal();
  const [messageApi, contextHolder2] = message.useMessage();

  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Backend filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false); // ✅ NEW: Toggle for inactive employees
  const [teamFilter, setTeamFilter] = useState<string>("");
  const [clientFilter, setClientFilter] = useState<string>("");
  const [genderFilter, setGenderFilter] = useState<string>("");
  const [titleFilter, setTitleFilter] = useState<string>("");
  const [minExp, setMinExp] = useState<string>("");
  const [maxExp, setMaxExp] = useState<string>("");
  const [sortBy] = useState<string>("createdAt");
  const [sortOrder] = useState<"asc" | "desc">("desc");

  // Teams & clients from API
  const [teams, setTeams] = useState<{ id: number; name: string }[]>([]);
  const [clients, setClients] = useState<{ id: number; name: string }[]>([]);
  useEffect(() => {
    let mounted = true;

    const fetchLookups = async () => {
      try {
        const [teamsResp, clientsResp] = await Promise.all([
          getTeams(), // expected to return array of { id, name }
          getClients(), // expected to return array of { id, name }
        ]);

        if (!mounted) return;

        // Normalize responses in case API wraps them
        const normalize = (r: any) => {
          if (!r) return [];
          if (Array.isArray(r)) return r;
          if (r.data && Array.isArray(r.data)) return r.data;
          return [];
        };

        setTeams(normalize(teamsResp));
        setClients(normalize(clientsResp));
      } catch (err) {
        console.error("Failed to fetch teams/clients", err);
        // optional: message.error("Failed to load teams/clients");
      }
    };

    fetchLookups();

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch employees with backend filtering
  const fetchEmployees = async () => {
    try {
      setLoading(true);

      // Build query params
      const params: Record<string, string | number> = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        sortBy,
        sortOrder,
      };

      if (searchTerm) params.search = searchTerm;
      if (teamFilter) params.teamId = teamFilter;
      if (clientFilter) params.clientId = clientFilter;
      if (genderFilter && genderFilter !== "all") params.gender = genderFilter;
      if (titleFilter) params.title = titleFilter;
      if (minExp) params.minExp = minExp;
      if (maxExp) params.maxExp = maxExp;

      // ✅ Filter by status based on showInactive toggle
      if (showInactive) {
        params.status = "inactive";
      } else {
        params.status = "active";
      }

      const response = await getEmployees(params);

      // Handle both old and new API response formats
      if (response && typeof response === "object" && "success" in response) {
        setEmployees((response as any).data || []);
        setTotalCount((response as any).pagination?.total || 0);
      } else {
        // Fallback for old API format
        setEmployees(Array.isArray(response) ? response : []);
        setTotalCount(Array.isArray(response) ? response.length : 0);
      }
    } catch (err) {
      console.error("Failed to fetch employees", err);
      message.error("Failed to fetch employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagination.current,
    pagination.pageSize,
    searchTerm,
    showInactive, // ✅ Added to dependencies
    teamFilter,
    clientFilter,
    genderFilter,
    titleFilter,
    minExp,
    maxExp,
    sortBy,
    sortOrder,
  ]);

  // Derived options from current data
  // teamOptions / clientOptions derived from API lookups
  const teamOptions = useMemo(
    () => teams.map((t) => ({ id: t.id, name: t.name })),
    [teams]
  );

  const clientOptions = useMemo(
    () => clients.map((c) => ({ id: c.id, name: c.name })),
    [clients]
  );

  // // Handle active/inactive toggle in table
  // const handleToggleStatus = async (
  //   employeeId: number,
  //   currentStatus: boolean
  // ) => {
  //   try {
  //     await toggleEmployeeStatus(employeeId);
  //     message.success(
  //       `Employee ${currentStatus ? "deactivated" : "activated"} successfully`
  //     );
  //     fetchEmployees();
  //   } catch (err) {
  //     console.error("Failed to toggle status", err);
  //     message.error("Failed to update employee status");
  //   }
  // };

  // ✅ Handle delete - just toggles status (soft delete)
  const handleDelete = (employee: EmployeeRow) => {
    console.log("coming here");
    modal.confirm({
      title: employee.active ? "Deactivate Employee" : "Activate Employee",
      content: employee.active
        ? `Are you sure you want to deactivate ${employee.firstName} ${employee.lastName}? They will be moved to inactive employees.`
        : `Are you sure you want to activate ${employee.firstName} ${employee.lastName}? They will be moved back to active employees.`,
      okText: employee.active ? "Deactivate" : "Activate",
      okType: employee.active ? "danger" : "primary",
      cancelText: "Cancel",
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          toggleEmployeeStatus(employee.id)
            .then(() => {
              messageApi.success(
                `Employee ${
                  employee.active ? "deactivated" : "activated"
                } successfully`
              );

              // In case fetchEmployees is not async, normalize it:
              return Promise.resolve(fetchEmployees());
            })
            .then(() => {
              // ✅ All good: close modal
              resolve();
            })
            .catch((err) => {
              console.error("Failed to toggle employee status", err);
              messageApi.error("Failed to update employee status");
              // ❌ Tell AntD it failed (keeps the modal open / stops spinner)
              reject(err);
            });
        }),
    });
  };

  const columns: ColumnsType<EmployeeRow> = [
    // {
    //   title: "Status",
    //   key: "active",
    //   width: 80,
    //   fixed: "left",
    //   align: "center",
    //   render: (_: any, record: EmployeeRow) => (
    //     <Switch
    //       checked={record.active}
    //       onChange={() => handleToggleStatus(record.id, record.active)}
    //       checkedChildren="Active"
    //       unCheckedChildren="Inactive"
    //       style={{
    //         backgroundColor: record.active ? palette.primary : "#999",
    //       }}
    //     />
    //   ),
    // },
    {
      title: "Employee ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (id: number) => `EMP${id.toString().padStart(3, "0")}`,
    },
    {
      title: "Name",
      key: "name",
      width: 180,
      render: (_: any, record: EmployeeRow) => (
        <span
          style={{
            color: record.active ? palette.textPrimary : palette.textSecondary,
            opacity: record.active ? 1 : 0.6,
          }}
        >
          {record.firstName} {record.lastName}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
      ellipsis: true,
      render: (email: string, record: EmployeeRow) => (
        <span
          style={{
            color: record.active ? palette.textPrimary : palette.textSecondary,
            opacity: record.active ? 1 : 0.6,
          }}
        >
          {email || "-"}
        </span>
      ),
    },
    {
      title: "Current Exp",
      dataIndex: "currentExperience",
      key: "experience",
      width: 100,

      render: (_teamName: string | undefined, record: EmployeeRow) => (
        <span
          style={{
            color: record.active ? palette.textPrimary : palette.textSecondary,
            opacity: record.active ? 1 : 0.6,
          }}
        >
          {record?.currentExperience?.formatted || "-"}
        </span>
      ),
    },
    {
      title: "Team",
      dataIndex: ["team", "name"],
      key: "team",
      width: 150,
      ellipsis: true,
      render: (teamName: string | undefined, record: EmployeeRow) => (
        <span
          style={{
            color: record.active ? palette.textPrimary : palette.textSecondary,
            opacity: record.active ? 1 : 0.6,
          }}
        >
          {teamName || "-"}
        </span>
      ),
    },
    {
      title: "Client",
      dataIndex: ["client", "name"],
      key: "client",
      width: 165,
      ellipsis: true,
      render: (clientName: string | undefined, record: EmployeeRow) => (
        <span
          style={{
            color: record.active ? palette.textPrimary : palette.textSecondary,
            opacity: record.active ? 1 : 0.6,
          }}
        >
          {clientName || "-"}
        </span>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 160,
      ellipsis: true,
      render: (title: string | undefined, record: EmployeeRow) => (
        <span
          style={{
            color: record.active ? palette.textPrimary : palette.textSecondary,
            opacity: record.active ? 1 : 0.6,
          }}
        >
          {title || "-"}
        </span>
      ),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 100,
      render: (gender: string | undefined, record: EmployeeRow) => (
        <span
          style={{
            color: record.active ? palette.textPrimary : palette.textSecondary,
            opacity: record.active ? 1 : 0.6,
          }}
        >
          {gender || "-"}
        </span>
      ),
    },

    {
      title: "Date of Joining",
      dataIndex: "dateOfJoining",
      key: "dateOfJoining",
      width: 140,
      render: (value: string | undefined, record: EmployeeRow) => (
        <span
          style={{
            color: record.active ? palette.textPrimary : palette.textSecondary,
            opacity: record.active ? 1 : 0.6,
          }}
        >
          {value ? new Date(value).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      align: "center",
      width: 100,
      render: (_: any, record: EmployeeRow) =>
        isEditable ? (
          <div className="flex items-center gap-2 justify-center">
            <button
              onClick={() => navigate(`/employees/${record.id}`)}
              style={{
                color: palette.textSecondary,
                fontSize: 16,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
              }}
              title={`Edit ${record.firstName} ${record.lastName}`}
            >
              ✏️
            </button>
            <button
              onClick={() => handleDelete(record)}
              style={{
                color: record.active ? "#ff4d4f" : "#52c41a",
                fontSize: 16,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
              }}
              title={
                record.active
                  ? `Deactivate ${record.firstName} ${record.lastName}`
                  : `Activate ${record.firstName} ${record.lastName}`
              }
            >
              {record.active ? "🗑️" : "✅"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 justify-center">
            <button
              onClick={() => navigate(`/employees/${record.id}`)}
              style={{
                color: palette.textSecondary,
                fontSize: 16,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
              }}
              title={`view ${record.firstName} ${record.lastName}`}
            >
              <span className="material-symbols-outlined">visibility</span>
            </button>
          </div>
        ),
    },
  ];
  // whether any filter (including search or showInactive) is active
  const hasActiveFilters = useMemo(() => {
    // consider these as "filters" for the red dot
    const anyFilter =
      Boolean(searchTerm?.trim()) ||
      Boolean(showInactive) || // if toggled from default (active)
      Boolean(teamFilter) ||
      Boolean(clientFilter) ||
      (genderFilter && genderFilter !== "all") ||
      Boolean(titleFilter?.trim()) ||
      Boolean(minExp) ||
      Boolean(maxExp);

    return anyFilter;
  }, [
    searchTerm,
    showInactive,
    teamFilter,
    clientFilter,
    genderFilter,
    titleFilter,
    minExp,
    maxExp,
  ]);

  return (
    <div className="w-full">
      {contextHolder}
      {contextHolder2}
      {/* TOP BAR */}
      <div className="mb-4">
        <div className="flex items-center justify-between gap-4 pl-1">
          <div>
            <h2
              style={{
                color: palette.textPrimary,
                fontSize: 20,
                fontWeight: 600,
                margin: 0,
              }}
            >
              {showInactive ? "Inactive Employees" : "Active Employees"}
            </h2>
            <p
              style={{
                color: palette.textSecondary,
                fontSize: 13,
                margin: "6px 0 0 0",
              }}
            >
              {totalCount} employees {showInactive ? "inactive" : "active"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* ✅ Show Inactive Toggle */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-md"
              style={{
                backgroundColor: palette.surface,
                border: `1px solid ${palette.border}`,
              }}
            >
              <span
                style={{
                  color: palette.textSecondary,
                  fontSize: 13,
                }}
              >
                Show Inactive
              </span>
              <Switch
                checked={showInactive}
                onChange={(checked) => {
                  setShowInactive(checked);
                  setPagination((prev) => ({ ...prev, current: 1 }));
                }}
                size="small"
              />
            </div>

            <input
              placeholder="Search by ID, name or email"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              style={{
                backgroundColor: palette.surface,
                border: `1px solid ${palette.border}`,
                color: palette.textPrimary,
              }}
              className="p-2 rounded-md text-sm min-w-[220px]"
            />
            <Badge dot={hasActiveFilters} offset={[-2, 4]}>
              <button
                type="button"
                onClick={() => setFiltersOpen((prev) => !prev)}
                style={{
                  border: `1px solid ${palette.border}`,
                  backgroundColor: filtersOpen
                    ? palette.primary
                    : palette.surface,
                  color: filtersOpen ? "#fff" : palette.textPrimary,
                }}
                className="px-3 py-2 rounded-md text-sm flex items-center gap-1"
              >
                <span>⚙️</span>
                <span>Filters</span>
              </button>
            </Badge>

            {isEditable && (
              <button
                onClick={() => navigate("/employees/add")}
                style={{
                  backgroundColor: palette.primary,
                  color: "#fff",
                }}
                className="px-4 py-2 rounded-lg text-sm flex items-center gap-1 whitespace-nowrap"
              >
                <span>+</span>
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTER PANEL */}
      {filtersOpen && (
        <div
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.border,
          }}
          className="rounded-lg p-4 border mb-4"
        >
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {/* Team */}
            <div className="flex flex-col gap-1">
              <label
                style={{
                  color: palette.textSecondary,
                  fontSize: 12,
                }}
              >
                Team
              </label>
              <select
                value={teamFilter}
                onChange={(e) => {
                  setTeamFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, current: 1 }));
                }}
                style={{
                  backgroundColor: palette.surface,
                  border: `1px solid ${palette.border}`,
                  color: palette.textPrimary,
                }}
                className="p-2 rounded-md text-sm"
              >
                <option value="">All Teams</option>
                {teamOptions.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Client */}
            <div className="flex flex-col gap-1">
              <label
                style={{
                  color: palette.textSecondary,
                  fontSize: 12,
                }}
              >
                Client
              </label>
              <select
                value={clientFilter}
                onChange={(e) => {
                  setClientFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, current: 1 }));
                }}
                style={{
                  backgroundColor: palette.surface,
                  border: `1px solid ${palette.border}`,
                  color: palette.textPrimary,
                }}
                className="p-2 rounded-md text-sm"
              >
                <option value="">All Clients</option>
                {clientOptions.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1">
              <label
                style={{
                  color: palette.textSecondary,
                  fontSize: 12,
                }}
              >
                Gender
              </label>
              <select
                value={genderFilter}
                onChange={(e) => {
                  setGenderFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, current: 1 }));
                }}
                style={{
                  backgroundColor: palette.surface,
                  border: `1px solid ${palette.border}`,
                  color: palette.textPrimary,
                }}
                className="p-2 rounded-md text-sm"
              >
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1">
              <label
                style={{
                  color: palette.textSecondary,
                  fontSize: 12,
                }}
              >
                Title
              </label>
              <input
                placeholder="Job title"
                value={titleFilter}
                onChange={(e) => {
                  setTitleFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, current: 1 }));
                }}
                style={{
                  backgroundColor: palette.surface,
                  border: `1px solid ${palette.border}`,
                  color: palette.textPrimary,
                }}
                className="p-2 rounded-md text-sm"
              />
            </div>

            {/* Experience range */}
            <div className="flex flex-col gap-1">
              <label
                style={{
                  color: palette.textSecondary,
                  fontSize: 12,
                }}
              >
                Joining Experience (Min / Max years)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minExp}
                  onChange={(e) => {
                    setMinExp(e.target.value);
                    setPagination((prev) => ({ ...prev, current: 1 }));
                  }}
                  style={{
                    backgroundColor: palette.surface,
                    border: `1px solid ${palette.border}`,
                    color: palette.textPrimary,
                  }}
                  className="p-2 rounded-md text-sm w-1/2"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxExp}
                  onChange={(e) => {
                    setMaxExp(e.target.value);
                    setPagination((prev) => ({ ...prev, current: 1 }));
                  }}
                  style={{
                    backgroundColor: palette.surface,
                    border: `1px solid ${palette.border}`,
                    color: palette.textPrimary,
                  }}
                  className="p-2 rounded-md text-sm w-1/2"
                />
              </div>
            </div>
          </div>

          {/* Reset filters button */}
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setTeamFilter("");
                setClientFilter("");
                setGenderFilter("");
                setTitleFilter("");
                setMinExp("");
                setMaxExp("");
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              style={{
                color: palette.textSecondary,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              className="text-xs underline"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div
        style={{
          backgroundColor: palette.surface,
          borderColor: palette.border,
        }}
        className="rounded-lg border overflow-hidden"
      >
        <div
          className="custom-employee-table"
          style={
            {
              "--surface": palette.surface,
              "--surfaceHover": palette.surface,
              "--textPrimary": palette.textPrimary,
              "--textSecondary": palette.textSecondary,
              "--border": palette.border,
              "--primary": palette.primary,
            } as React.CSSProperties
          }
        >
          <Table<EmployeeRow>
            size="small"
            columns={columns}
            dataSource={employees}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: totalCount,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} employees`,
              onChange: (page, pageSize) =>
                setPagination({ current: page, pageSize }),
              className: "employee-pagination",
            }}
            style={{
              backgroundColor: palette.surface,
              color: palette.textPrimary,
              fontSize: 13,
            }}
            onRow={(record) => ({
              style: {
                backgroundColor: palette.surface,
                color: palette.textPrimary,
                opacity: record.active ? 1 : 0.7,
              },
            })}
            onHeaderRow={() => ({
              style: {
                backgroundColor: palette.surface,
                color: palette.textSecondary,
                fontWeight: 500,
              },
            })}
            scroll={{ x: 1400 }}
          />
        </div>
      </div>
    </div>
  );
};

export default Employees;

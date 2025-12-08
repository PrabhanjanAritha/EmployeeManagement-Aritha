/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, message, Badge } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTheme } from "../theme/useTheme";
import { getTeams } from "../api/teams";
import { getClients } from "../api/clients";
import "../theme/antd-table-theme.css";

interface Client {
  id: number;
  name: string;
  pocInternalName?: string | null;
  pocInternalEmail?: string | null;
}

interface TeamRow {
  id: number;
  name: string;
  title?: string | null;
  managerName?: string | null;
  managerEmail?: string | null;
  client?: Client | null;
  clientId?: number | null;
  _count?: {
    employees: number;
  };
}

export const Teams: React.FC = () => {
  const role = localStorage.getItem("role") ?? "";
  const isEditable = role.toLowerCase() === "admin";
  const { palette } = useTheme();
  const navigate = useNavigate();

  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [clientFilter, setClientFilter] = useState<string>("");

  // debounce ref
  const debounceRef = useRef<number | null>(null);

  // Fetch clients once (separate lookup)
  const fetchClients = async () => {
    try {
      const resp = await getClients();
      if (resp && typeof resp === "object" && "success" in resp) {
        setClients((resp as any).data || []);
      } else {
        setClients(Array.isArray(resp) ? resp : []);
      }
    } catch (err) {
      console.error("Failed to fetch clients", err);
      // not fatal for teams UI, but show a message optionally
    }
  };

  // Fetch teams with optional params
  const fetchTeams = async (params?: {
    search?: string;
    clientId?: string | number;
  }) => {
    try {
      setLoading(true);
      const query: Record<string, string | number> = {};
      if (params?.search) query.search = params.search;
      if (params?.clientId) query.clientId = params.clientId;
      const resp = await getTeams(query);
      if (resp && typeof resp === "object" && "success" in resp) {
        setTeams((resp as any).data || []);
      } else {
        setTeams(Array.isArray(resp) ? resp : []);
      }
    } catch (err) {
      console.error("Failed to fetch teams", err);
      message.error("Failed to fetch teams");
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  // initial fetch of both teams and clients
  useEffect(() => {
    fetchClients();
    fetchTeams();
  }, []);

  // refetch when clientFilter or searchTerm changes (debounced for search)
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    const clientIdParam = clientFilter ? clientFilter : undefined;

    if (searchTerm && searchTerm.trim().length > 0) {
      debounceRef.current = window.setTimeout(() => {
        fetchTeams({ search: searchTerm.trim(), clientId: clientIdParam });
      }, 350);
    } else {
      // immediate fetch when search cleared or only client changed
      fetchTeams({ clientId: clientIdParam });
    }

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [searchTerm, clientFilter]);

  // derive clientOptions from clients lookup (not from teams)
  const clientOptions = useMemo(() => {
    return clients.map((c) => ({ id: c.id, name: c.name }));
  }, [clients]);

  // Badge dot when any filter/search is active
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      (searchTerm && searchTerm.trim().length > 0) ||
        (clientFilter && clientFilter !== "")
    );
  }, [searchTerm, clientFilter]);

  const totalCount = teams.length;

  const columns: ColumnsType<TeamRow> = [
    {
      title: "Team",
      dataIndex: "name",
      key: "name",
      width: 220,
      render: (_name: string, record: TeamRow) => (
        <div>
          <div
            style={{
              color: palette.textPrimary,
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            {record.name}
          </div>
          {record.title && (
            <div
              style={{
                color: palette.textSecondary,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {record.title}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Client",
      dataIndex: ["client", "name"],
      key: "client",
      width: 180,
      render: (clientName: string | undefined) => (
        <span
          style={{
            color: palette.textPrimary,
          }}
        >
          {clientName || "-"}
        </span>
      ),
    },
    {
      title: "Manager",
      key: "manager",
      width: 220,
      render: (_: any, record: TeamRow) => (
        <div>
          <div
            style={{
              color: palette.textPrimary,
              fontSize: 14,
            }}
          >
            {record.managerName || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Manager Email",
      key: "managerEmail",
      width: 220,
      render: (_: any, record: TeamRow) => (
        <div>
          <div
            style={{
              color: palette.textPrimary,
              fontSize: 14,
            }}
          >
            {record.managerEmail || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Employees",
      key: "employees",
      width: 140,
      align: "right",
      render: (_: any, record: TeamRow) => {
        const count = record._count?.employees ?? 0;
        return (
          <span
            style={{
              color: palette.textPrimary,
            }}
          >
            {count} {count === 1 ? "employee" : "employees"}
          </span>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      align: "center",
      render: (_: any, record: TeamRow) =>
        isEditable ? (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => navigate(`/teams/${record.id}`)}
              style={{
                color: palette.textSecondary,
                fontSize: 14,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
              }}
              title={`Edit ${record.name}`}
            >
              ✏️
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => navigate(`/teams/${record.id}`)}
              style={{
                color: palette.textSecondary,
                fontSize: 14,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
              }}
              title={`View ${record.name}`}
            >
              <span className="material-symbols-outlined">visibility</span>
            </button>
          </div>
        ),
    },
  ];

  return (
    <div className="w-full">
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
              All Teams
            </h2>
            <p
              style={{
                color: palette.textSecondary,
                fontSize: 13,
                margin: "6px 0 0 0",
              }}
            >
              {totalCount} teams
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <input
              placeholder="Search by team, manager or client"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: palette.surface,
                border: `1px solid ${palette.border}`,
                color: palette.textPrimary,
              }}
              className="p-2 rounded-md text-sm min-w-[220px]"
            />

            {/* Filters toggle wrapped with AntD Badge dot */}
            <Badge dot={hasActiveFilters}>
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

            {/* Add Team */}
            {isEditable && (
              <button
                onClick={() => navigate("/teams/add")}
                style={{
                  backgroundColor: palette.primary,
                  color: "#fff",
                }}
                className="px-4 py-2 rounded-lg text-sm flex items-center gap-1 whitespace-nowrap"
              >
                <span>+</span>
                <span>Add Team</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTER PANEL (client lookup uses separate clients API) */}
      {filtersOpen && (
        <div
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.border,
          }}
          className="rounded-lg p-4 border mb-4"
        >
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {/* Client filter */}
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
                onChange={(e) => setClientFilter(e.target.value)}
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
          </div>

          {/* Clear filters */}
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setClientFilter("");
                setSearchTerm("");
                // re-fetch w/o params
                fetchTeams();
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
          <Table<TeamRow>
            size="small"
            columns={columns}
            dataSource={teams}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              total: totalCount,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} teams`,
              className: "employee-pagination",
            }}
            style={{
              backgroundColor: palette.surface,
              color: palette.textPrimary,
              fontSize: 13,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Teams;

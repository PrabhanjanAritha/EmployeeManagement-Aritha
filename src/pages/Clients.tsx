/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTheme } from "../theme/useTheme";
import { getClients } from "../api/clients";
import "../theme/antd-table-theme.css";

interface ClientRow {
  id: number;
  name: string;
  pocInternalName?: string | null;
  pocInternalEmail?: string | null;
  pocExternalName?: string | null;
  pocExternalEmail?: string | null;
  address?: string | null;
  _count?: {
    teams: number;
    employees: number;
  };
  teams?: Array<{
    id: number;
    name: string;
    title?: string | null;
  }>;
  employees?: Array<{
    id: number;
    firstName: string;
    lastName: string;
  }>;
}

export const Clients: React.FC = () => {
  const role = localStorage.getItem("role") ?? "";
  const isEditable = role.toLowerCase() === "admin";
  const { palette } = useTheme();
  const navigate = useNavigate();

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Feature flag: hide Filters button when false
  const showFilters = false;

  // debounce ref for search
  const searchDebounceRef = useRef<number | null>(null);

  // Fetch clients - accepts optional params (for future backend integration)
  const fetchClients = async (params?: { search?: string }) => {
    try {
      setLoading(true);

      // If your getClients helper accepts an options object that it serializes to query
      // (e.g. getClients({ search: 'foo' })), this will work. If your helper expects a string
      // url, adapt accordingly.
      const resp = await getClients(params || {});

      if (resp && typeof resp === "object" && "success" in resp) {
        setClients((resp as any).data || []);
      } else {
        setClients(Array.isArray(resp) ? resp : []);
      }
    } catch (err) {
      console.error("Failed to fetch clients", err);
      message.error("Failed to fetch clients");
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchClients();
  }, []);

  // Debounced search effect (ready for backend integration)
  useEffect(() => {
    if (searchDebounceRef.current)
      window.clearTimeout(searchDebounceRef.current);

    const q = searchTerm?.trim();

    if (q && q.length > 0) {
      searchDebounceRef.current = window.setTimeout(() => {
        fetchClients({ search: q });
      }, 350);
    } else {
      // empty search - fetch all
      fetchClients();
    }

    return () => {
      if (searchDebounceRef.current)
        window.clearTimeout(searchDebounceRef.current);
    };
  }, [searchTerm]);

  // Apply search filter locally as a fallback / UX improvement while server search isn't wired
  const filteredClients = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return clients.filter((client) => {
      // search across name, POCs, address
      const matchesSearch =
        !q ||
        client.name.toLowerCase().includes(q) ||
        (client.pocInternalName ?? "").toLowerCase().includes(q) ||
        (client.pocExternalName ?? "").toLowerCase().includes(q) ||
        (client.pocInternalEmail ?? "").toLowerCase().includes(q) ||
        (client.pocExternalEmail ?? "").toLowerCase().includes(q) ||
        (client.address ?? "").toLowerCase().includes(q);

      return matchesSearch;
    });
  }, [clients, searchTerm]);

  const totalCount = filteredClients.length;

  const columns: ColumnsType<ClientRow> = [
    {
      title: "Client Name",
      dataIndex: "name",
      key: "name",
      width: 220,
      render: (name: string, record: ClientRow) => (
        <div>
          <div
            style={{
              color: palette.textPrimary,
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            {name}
          </div>
          {record.address && (
            <div
              style={{
                color: palette.textSecondary,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {record.address}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Internal POC",
      key: "internalPOC",
      width: 220,
      render: (_: any, record: ClientRow) => (
        <div>
          <div
            style={{
              color: palette.textPrimary,
              fontSize: 14,
            }}
          >
            {record.pocInternalName || "-"}
          </div>
          {record.pocInternalEmail && (
            <div
              style={{
                color: palette.textSecondary,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {record.pocInternalEmail}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "External POC",
      key: "externalPOC",
      width: 220,
      render: (_: any, record: ClientRow) => (
        <div>
          <div
            style={{
              color: palette.textPrimary,
              fontSize: 14,
            }}
          >
            {record.pocExternalName || "-"}
          </div>
          {record.pocExternalEmail && (
            <div
              style={{
                color: palette.textSecondary,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {record.pocExternalEmail}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Teams",
      key: "teams",
      width: 100,
      align: "right",
      render: (_: any, record: ClientRow) => {
        const count = record._count?.teams ?? 0;
        return (
          <span
            style={{
              color: palette.textPrimary,
            }}
          >
            {count}
          </span>
        );
      },
    },
    {
      title: "Employees",
      key: "employees",
      width: 120,
      align: "right",
      render: (_: any, record: ClientRow) => {
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
      render: (_: any, record: ClientRow) =>
        isEditable ? (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => navigate(`/clients/${record.id}`)}
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
              onClick={() => navigate(`/clients/${record.id}`)}
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
              All Clients
            </h2>
            <p
              style={{
                color: palette.textSecondary,
                fontSize: 13,
                margin: "6px 0 0 0",
              }}
            >
              {totalCount} clients
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <input
              placeholder="Search by name, POC, or address"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: palette.surface,
                border: `1px solid ${palette.border}`,
                color: palette.textPrimary,
              }}
              className="p-2 rounded-md text-sm min-w-[220px]"
            />

            {/* Filters toggle (hidden when showFilters=false) */}
            {showFilters && (
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
            )}

            {/* Add Client */}
            {isEditable && (
              <button
                onClick={() => navigate("/clients/add")}
                style={{
                  backgroundColor: palette.primary,
                  color: "#fff",
                }}
                className="px-4 py-2 rounded-lg text-sm flex items-center gap-1 whitespace-nowrap"
              >
                <span>+</span>
                <span>Add Client</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTER PANEL (expandable for future filters) */}
      {filtersOpen && (
        <div
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.border,
          }}
          className="rounded-lg p-4 border mb-4"
        >
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {/* Placeholder for future filters */}
            <div className="flex flex-col gap-1">
              <label
                style={{
                  color: palette.textSecondary,
                  fontSize: 12,
                }}
              >
                Filter Options
              </label>
              <select
                style={{
                  backgroundColor: palette.surface,
                  border: `1px solid ${palette.border}`,
                  color: palette.textPrimary,
                }}
                className="p-2 rounded-md text-sm"
                disabled
              >
                <option value="">Coming Soon</option>
              </select>
            </div>
          </div>

          {/* Clear filters */}
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => {
                // Clear filters when implemented
                setSearchTerm("");
                // re-fetch all
                fetchClients();
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
          <Table<ClientRow>
            size="small"
            columns={columns}
            dataSource={filteredClients}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              total: totalCount,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} clients`,
              className: "employee-pagination",
            }}
            style={{
              backgroundColor: palette.surface,
              color: palette.textPrimary,
              fontSize: 13,
            }}
            onRow={() => ({
              style: {
                backgroundColor: palette.surface,
                color: palette.textPrimary,
              },
            })}
            onHeaderRow={() => ({
              style: {
                backgroundColor: palette.surface,
                color: palette.textSecondary,
                fontWeight: 500,
              },
            })}
            scroll={{ x: 1000 }}
          />
        </div>
      </div>
    </div>
  );
};

export default Clients;

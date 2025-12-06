/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
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
  const { palette } = useTheme();
  const navigate = useNavigate();

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Fetch all clients
  const fetchClients = async () => {
    try {
      setLoading(true);

      const response = await getClients();

      if (response && typeof response === "object" && "success" in response) {
        setClients((response as any).data || []);
      } else {
        setClients(Array.isArray(response) ? response : []);
      }
    } catch (err) {
      console.error("Failed to fetch clients", err);
      message.error("Failed to fetch clients");
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Apply search filter locally
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
      render: (_: any, record: ClientRow) => (
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
            title={`View / Edit ${record.name}`}
          >
            ✏️
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

            {/* Filters toggle */}
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

            {/* Add Client */}
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

import React, { useEffect, useState } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Breadcrumb,
  message,
  Table,
  Tag,
} from "antd";
import type { ColumnsType, TableRowSelection } from "antd/es/table/interface";
import { StyleProvider } from "@ant-design/cssinjs";
import { useTheme } from "../theme/useTheme";
import { getClients } from "../api/clients";
import { getEmployees } from "../api/employees";
import { createTeam } from "../api/teams";

const { Option } = Select;

interface Client {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  team?: {
    id: number;
    name: string;
  };
  active: boolean;
}

type FormValues = {
  name: string;
  title?: string;
  clientId?: number;
  managerName?: string;
  managerEmail?: string;
};

export const AddTeam: React.FC = () => {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();

  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Employee table states
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  // Derive dark/light mode
  const isDark =
    (palette as any)?.mode === "dark" || (palette as any)?.isDark || false;

  const pageBg = isDark ? palette.background ?? "#020617" : "#f3f4f6";
  const cardBg = isDark ? palette.surface ?? "#020617" : "#f9fafb";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingClients(true);
        const clientsData = await getClients();
        let normalized: Client[];

        if (Array.isArray(clientsData)) {
          normalized = clientsData;
        } else if ("data" in clientsData && Array.isArray(clientsData.data)) {
          normalized = clientsData.data;
        } else {
          normalized = []; // single client
        }

        setClients(normalized);
      } catch (err) {
        console.error("Failed to fetch clients:", err);
        messageApi.warning("Could not load clients");
      } finally {
        setLoadingClients(false);
      }

      try {
        setLoadingEmployees(true);
        // Fetch only active employees for assignment
        const employeesData = await getEmployees({ status: "active" });
        setEmployees(
          Array.isArray(employeesData)
            ? employeesData
            : employeesData.data || []
        );
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        messageApi.warning("Could not load employees");
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchData();
  }, [messageApi]);

  // Filter employees based on search
  const filteredEmployees = employees.filter((emp) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const code = emp.employeeCode?.toLowerCase() || "";
    const email = emp.email?.toLowerCase() || "";
    const title = emp.title?.toLowerCase() || "";

    return (
      fullName.includes(searchLower) ||
      code.includes(searchLower) ||
      email.includes(searchLower) ||
      title.includes(searchLower)
    );
  });

  // Employee table columns
  const employeeColumns: ColumnsType<Employee> = [
    {
      title: "Employee Code",
      dataIndex: "employeeCode",
      key: "employeeCode",
      width: 130,
      render: (code: string) => code || "-",
    },
    {
      title: "Name",
      key: "name",
      width: 180,
      render: (_: any, record: Employee) => (
        <span>{`${record.firstName} ${record.lastName}`}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 150,
      render: (title: string) => title || "-",
    },
    {
      title: "Current Team",
      dataIndex: ["team", "name"],
      key: "team",
      width: 150,
      render: (teamName: string) =>
        teamName ? (
          <Tag color="blue">{teamName}</Tag>
        ) : (
          <Tag color="default">Unassigned</Tag>
        ),
    },
  ];

  // Row selection configuration
  const rowSelection: TableRowSelection<Employee> = {
    selectedRowKeys: selectedEmployeeIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedEmployeeIds(selectedRowKeys as number[]);
    },
    getCheckboxProps: (record: Employee) => ({
      name: `${record.firstName} ${record.lastName}`,
    }),
  };

  const onFinish = async (values: FormValues) => {
    try {
      setSubmitting(true);

      const payload = {
        name: values.name.trim(),
        title: values.title?.trim() || undefined,
        managerName: values.managerName?.trim() || undefined,
        managerEmail: values.managerEmail?.trim() || undefined,
        clientId: values.clientId ?? undefined,
        employeeIds: selectedEmployeeIds,
      };

      await createTeam(payload);

      messageApi.success("Team created successfully");

      setTimeout(() => {
        navigate("/teams");
      }, 1200);
    } catch (err: any) {
      console.error("Create team error:", err);
      const backendMsg = err?.response?.data?.message;

      if (err?.response?.status === 409) {
        messageApi.error("Team name already exists");
      } else if (err?.response?.status === 400) {
        const errors = err?.response?.data?.errors;
        if (errors && Array.isArray(errors)) {
          errors.forEach((error: string) => messageApi.error(error));
        } else {
          messageApi.error(backendMsg || "Validation failed");
        }
      } else {
        messageApi.error(backendMsg || "Failed to create team");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: pageBg,
        padding: 24,
        borderRadius: 18,
      }}
    >
      {contextHolder}

      <Breadcrumb
        items={[
          { title: "Teams", onClick: () => navigate("/teams") },
          { title: "Add Team" },
        ]}
        style={{ marginBottom: 24, cursor: "pointer" }}
      />

      <StyleProvider autoClear>
        <div
          style={{
            backgroundColor: cardBg,
            borderColor: palette.border,
          }}
          className="rounded-xl p-6 border shadow-sm"
        >
          <div className="mb-6">
            <h2
              style={{
                color: palette.textPrimary_w,
                fontSize: 20,
                fontWeight: 600,
                margin: 0,
              }}
            >
              Add New Team
            </h2>
            <p
              style={{
                color: palette.textSecondary,
                fontSize: 14,
                margin: "8px 0 0 0",
              }}
            >
              Define the team details and assign employees
            </p>
          </div>

          <Form<FormValues>
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{}}
          >
            {/* Team Details Section */}
            <Row gutter={[16, 16]}>
              {/* Team Name */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="name"
                  label="Team Name"
                  rules={[
                    { required: true, message: "Team name is required" },
                    {
                      min: 2,
                      message: "Team name must be at least 2 characters",
                    },
                  ]}
                  tooltip="Unique name for this team"
                >
                  <Input placeholder="e.g., Platform Engineering" />
                </Form.Item>
              </Col>

              {/* Team Title */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="title"
                  label="Team Title/Description"
                  tooltip="Brief description of the team's focus"
                >
                  <Input placeholder="e.g., Backend Development" />
                </Form.Item>
              </Col>

              {/* Client */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="clientId"
                  label="Associated Client"
                  tooltip="Client this team primarily works for"
                >
                  <Select
                    placeholder="Select client"
                    loading={loadingClients}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                  >
                    {clients.map((client) => (
                      <Option key={client.id} value={client.id}>
                        {client.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Manager Name */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="managerName"
                  label="Manager Name"
                  tooltip="Person leading this team (not required to be an employee in system)"
                >
                  <Input placeholder="e.g., Jane Doe" />
                </Form.Item>
              </Col>

              {/* Manager Email */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="managerEmail"
                  label="Manager Email"
                  rules={[{ type: "email", message: "Enter a valid email" }]}
                >
                  <Input placeholder="jane.doe@company.com" />
                </Form.Item>
              </Col>
            </Row>

            {/* Employee Assignment Section */}
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3
                    style={{
                      color: palette.textPrimary_w,
                      fontSize: 16,
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    Assign Employees
                  </h3>
                  <p
                    style={{
                      color: palette.textSecondary,
                      fontSize: 13,
                      margin: "4px 0 0 0",
                    }}
                  >
                    {selectedEmployeeIds.length} employee
                    {selectedEmployeeIds.length !== 1 ? "s" : ""} selected
                  </p>
                </div>

                {/* Search Input */}
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPagination({ ...pagination, current: 1 });
                  }}
                  style={{
                    width: 250,
                    backgroundColor: palette.surface,
                    border: `1px solid ${palette.border}`,
                    color: palette.textPrimary,
                  }}
                  prefix={
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 18 }}
                    >
                      search
                    </span>
                  }
                />
              </div>

              {/* Employee Table */}
              <div
                style={{
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                }}
                className="rounded-lg border overflow-hidden"
              >
                <Table<Employee>
                  size="small"
                  columns={employeeColumns}
                  dataSource={filteredEmployees}
                  rowKey="id"
                  loading={loadingEmployees}
                  rowSelection={rowSelection}
                  pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: filteredEmployees.length,
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "20", "50"],
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} employees`,
                    onChange: (page, pageSize) =>
                      setPagination({ current: page, pageSize }),
                  }}
                  style={{
                    backgroundColor: palette.surface,
                    color: palette.textPrimary,
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
                  scroll={{ x: 800 }}
                />
              </div>

              {/* Selected Employees Summary */}
              {selectedEmployeeIds.length > 0 && (
                <div
                  className="mt-4 p-3 rounded-lg"
                  style={{
                    backgroundColor: isDark ? "#1e293b" : "#eff6ff",
                    border: `1px solid ${isDark ? "#334155" : "#bfdbfe"}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        color: palette.textPrimary_w,
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      Selected Employees: {selectedEmployeeIds.length}
                    </span>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setSelectedEmployeeIds([])}
                      style={{ color: palette.primary }}
                    >
                      Clear Selection
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedEmployeeIds.map((id) => {
                      const emp = employees.find((e) => e.id === id);
                      if (!emp) return null;
                      return (
                        <Tag
                          key={id}
                          closable
                          onClose={() =>
                            setSelectedEmployeeIds(
                              selectedEmployeeIds.filter((eid) => eid !== id)
                            )
                          }
                          // color={palette.primary}
                          // variant="outlined"
                          style={{
                            // backgroundColor: palette.primary,
                            // color: "#fff",
                            border: "none",
                          }}
                        >
                          {emp.firstName} {emp.lastName}
                          {emp.employeeCode && ` (${emp.employeeCode})`}
                        </Tag>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end gap-3">
              <Button
                type="default"
                onClick={() => navigate("/teams")}
                style={{
                  border: `1px solid ${palette.border_w}`,
                  background: "transparent",
                  color: palette.textPrimary_w,
                }}
              >
                <span className="material-symbols-outlined">close</span>
                <span style={{ marginLeft: 8 }}>Cancel</span>
              </Button>

              <Button
                type="default"
                onClick={() => {
                  form.resetFields();
                  setSelectedEmployeeIds([]);
                  setSearchTerm("");
                }}
                style={{
                  border: `1px solid ${palette.border_w}`,
                  background: "transparent",
                  color: palette.textPrimary_w,
                }}
              >
                <span className="material-symbols-outlined">refresh</span>
                <span style={{ marginLeft: 8 }}>Reset</span>
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                disabled={!form.getFieldValue("name")}
              >
                <span className="material-symbols-outlined">save</span>
                <span style={{ marginLeft: 8 }}>
                  Save Team
                  {selectedEmployeeIds.length > 0 &&
                    ` (${selectedEmployeeIds.length})`}
                </span>
              </Button>
            </div>
          </Form>
        </div>
      </StyleProvider>
    </div>
  );
};

export default AddTeam;

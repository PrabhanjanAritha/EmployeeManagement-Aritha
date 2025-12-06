import React, { useEffect, useState } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom";
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
  Spin,
  Modal,
  Tabs,
  Card,
  Descriptions,
} from "antd";
import type { ColumnsType, TableRowSelection } from "antd/es/table/interface";
import { StyleProvider } from "@ant-design/cssinjs";
import { useTheme } from "../theme/useTheme";
import { getClients } from "../api/clients";
import { getEmployees } from "../api/employees";
import { getTeamById, updateTeam, deleteTeam } from "../api/teams";

const { Option } = Select;

interface Client {
  id: number;
  name: string;
  pocInternalName?: string;
  pocInternalEmail?: string;
  pocExternalName?: string;
  pocExternalEmail?: string;
  address?: string;
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
  } | null;
  active: boolean;
}

interface Team {
  id: number;
  name: string;
  title?: string;
  managerName?: string;
  managerEmail?: string;
  clientId?: number;
  client?: Client;
  employees?: Employee[];
  _count?: {
    employees: number;
  };
}

type FormValues = {
  name: string;
  title?: string;
  clientId?: number;
  managerName?: string;
  managerEmail?: string;
};

export const EditTeam: React.FC = () => {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const teamId = id ? Number(id) : NaN;
  const [form] = Form.useForm<FormValues>();

  const [team, setTeam] = useState<Team | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isEditing, setIsEditing] = useState(false);

  // Employee table states
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  const isDark =
    (palette as any)?.mode === "dark" || (palette as any)?.isDark || false;
  const pageBg = isDark ? palette.background ?? "#020617" : "#f3f4f6";
  const cardBg = isDark ? palette.surface ?? "#020617" : "#f9fafb";

  // Fetch team data
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!teamId || isNaN(teamId)) {
        messageApi.error("Invalid team ID");
        navigate("/teams");
        return;
      }

      try {
        setLoading(true);
        const teamData = await getTeamById(teamId);

        const teamObj: Team = (teamData as any).success
          ? (teamData as any).data
          : (teamData as unknown as Team);

        setTeam(teamObj);

        // Set form values
        form.setFieldsValue({
          name: teamObj.name,
          title: teamObj.title || "",
          clientId: teamObj.clientId || undefined,
          managerName: teamObj.managerName || "",
          managerEmail: teamObj.managerEmail || "",
        });

        // Set selected employees
        if (teamObj.employees) {
          setSelectedEmployeeIds(teamObj.employees.map((e: Employee) => e.id));
        }
      } catch (err) {
        console.error("Failed to fetch team:", err);
        messageApi.error("Failed to load team details");
        navigate("/teams");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId, form, messageApi, navigate]);

  // Fetch clients and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingClients(true);
        const clientsData = await getClients();
        const clientsArray = Array.isArray(clientsData)
          ? clientsData
          : (clientsData as any).data || [];
        setClients(clientsArray);
      } catch (err) {
        console.error("Failed to fetch clients:", err);
        messageApi.warning("Could not load clients");
      } finally {
        setLoadingClients(false);
      }

      try {
        setLoadingEmployees(true);
        const employeesData = await getEmployees({ status: "active" });
        const employeesArray = Array.isArray(employeesData)
          ? employeesData
          : (employeesData as any).data || [];
        setAllEmployees(employeesArray);
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
  const filteredEmployees = allEmployees.filter((emp) => {
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
      title: "Code",
      dataIndex: "employeeCode",
      key: "employeeCode",
      width: 100,
      render: (code: string | undefined) => code || "-",
    },
    {
      title: "Name",
      key: "name",
      width: 150,
      render: (_: any, record: Employee) => (
        <span>{`${record.firstName} ${record.lastName}`}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 180,
      ellipsis: true,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 130,
      render: (title: string | undefined) => title || "-",
    },
    {
      title: "Current Team",
      dataIndex: ["team", "name"],
      key: "team",
      width: 130,
      render: (teamName: string | undefined) => {
        if (teamName === team?.name) {
          return <Tag color="blue">This Team</Tag>;
        }
        return teamName ? (
          <Tag color="orange">{teamName}</Tag>
        ) : (
          <Tag color="default">Unassigned</Tag>
        );
      },
    },
  ];

  const rowSelection: TableRowSelection<Employee> = {
    selectedRowKeys: selectedEmployeeIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedEmployeeIds(selectedRowKeys as number[]);
    },
  };

  const onFinish = async (values: FormValues) => {
    if (!team) return;

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

      await updateTeam(team.id, payload);
      messageApi.success("Team updated successfully");

      // Refresh team data
      const updatedTeam = await getTeamById(team.id);
      const teamObj: Team = (updatedTeam as any).success
        ? (updatedTeam as any).data
        : (updatedTeam as unknown as Team);
      setTeam(teamObj);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Update team error:", err);
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
        messageApi.error(backendMsg || "Failed to update team");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!team) return;

    Modal.confirm({
      title: "Delete Team",
      content: `Are you sure you want to delete "${team.name}"? Employee associations will be removed but employees won't be deleted.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteTeam(team.id);
          messageApi.success("Team deleted successfully");
          setTimeout(() => navigate("/teams"), 1000);
        } catch (err: any) {
          console.error("Delete team error:", err);
          messageApi.error(
            err?.response?.data?.message || "Failed to delete team"
          );
        }
      },
    });
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!team) {
    return null;
  }

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
          { title: team.name },
        ]}
        style={{ marginBottom: 24, cursor: "pointer" }}
      />

      <StyleProvider autoClear>
        <Tabs
          defaultActiveKey="details"
          style={{
            backgroundColor: cardBg,
            borderRadius: 12,
            padding: 16,
          }}
        >
          {/* Details Tab */}
          <Tabs.TabPane tab="Team Details" key="details">
            <div
              style={{
                backgroundColor: cardBg,
                borderColor: palette.border,
              }}
              className="rounded-xl p-6 border shadow-sm"
            >
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2
                    style={{
                      color: palette.textPrimary_w,
                      fontSize: 20,
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    {isEditing ? "Edit Team" : team.name}
                  </h2>
                  <p
                    style={{
                      color: palette.textSecondary,
                      fontSize: 14,
                      margin: "8px 0 0 0",
                    }}
                  >
                    {isEditing
                      ? "Update team details and employee assignments"
                      : team.title || "View team information"}
                  </p>
                </div>

                {!isEditing && (
                  <div className="flex gap-2">
                    <Button
                      type="primary"
                      onClick={() => setIsEditing(true)}
                      style={{
                        backgroundColor: palette.primary,
                      }}
                    >
                      <span className="material-symbols-outlined">edit</span>
                      <span style={{ marginLeft: 8 }}>Edit</span>
                    </Button>
                    <Button danger onClick={handleDelete}>
                      <span className="material-symbols-outlined">delete</span>
                      <span style={{ marginLeft: 8 }}>Delete</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* View Mode */}
              {!isEditing ? (
                <div>
                  <Descriptions
                    bordered
                    column={{ xs: 1, sm: 2, md: 2 }}
                    style={{
                      backgroundColor: palette.surface,
                    }}
                  >
                    <Descriptions.Item label="Team Name">
                      {team.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Team Title">
                      {team.title || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Manager Name">
                      {team.managerName || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Manager Email">
                      {team.managerEmail || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Client">
                      {team.client?.name || "Not assigned"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Employees">
                      {team._count?.employees || 0} assigned
                    </Descriptions.Item>
                  </Descriptions>

                  {/* Current Employees List */}
                  {team.employees && team.employees.length > 0 && (
                    <div className="mt-6">
                      <h3
                        style={{
                          color: palette.textPrimary_w,
                          fontSize: 16,
                          fontWeight: 600,
                          marginBottom: 16,
                        }}
                      >
                        Team Members ({team.employees.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {team.employees.map((emp) => (
                          <Card
                            key={emp.id}
                            size="small"
                            style={{
                              backgroundColor: palette.surface,
                              borderColor: palette.border,
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div
                                  style={{
                                    color: palette.textPrimary_w,
                                    fontWeight: 500,
                                  }}
                                >
                                  {emp.firstName} {emp.lastName}
                                </div>
                                <div
                                  style={{
                                    color: palette.textSecondary,
                                    fontSize: 12,
                                  }}
                                >
                                  {emp.email}
                                </div>
                                {emp.title && (
                                  <Tag style={{ marginTop: 4 }}>
                                    {emp.title}
                                  </Tag>
                                )}
                              </div>
                              {emp.employeeCode && (
                                <Tag color="blue">{emp.employeeCode}</Tag>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Edit Mode */
                <Form<FormValues>
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                >
                  {/* Team Details */}
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name="name"
                        label="Team Name"
                        rules={[
                          { required: true, message: "Team name is required" },
                          { min: 2, message: "Min 2 characters" },
                        ]}
                      >
                        <Input placeholder="Team name" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name="title" label="Team Title">
                        <Input placeholder="Team description" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name="clientId" label="Client">
                        <Select
                          placeholder="Select client"
                          loading={loadingClients}
                          allowClear
                          showSearch
                        >
                          {clients.map((client) => (
                            <Option key={client.id} value={client.id}>
                              {client.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name="managerName" label="Manager Name">
                        <Input placeholder="Manager name" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name="managerEmail"
                        label="Manager Email"
                        rules={[{ type: "email", message: "Invalid email" }]}
                      >
                        <Input placeholder="manager@company.com" />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Employee Assignment */}
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
                          {selectedEmployeeIds.length} selected
                        </p>
                      </div>

                      <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPagination({ ...pagination, current: 1 });
                        }}
                        style={{ width: 200 }}
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
                          pageSizeOptions: ["5", "10", "20"],
                          showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total}`,
                          onChange: (page, pageSize) =>
                            setPagination({ current: page, pageSize }),
                        }}
                        scroll={{ x: 700 }}
                      />
                    </div>

                    {/* Selected Summary */}
                    {selectedEmployeeIds.length > 0 && (
                      <div
                        className="mt-4 p-3 rounded-lg"
                        style={{
                          backgroundColor: isDark ? "#1e293b" : "#eff6ff",
                          border: `1px solid ${isDark ? "#334155" : "#bfdbfe"}`,
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <span
                            style={{
                              color: palette.textPrimary_w,
                              fontWeight: 500,
                            }}
                          >
                            Selected: {selectedEmployeeIds.length}
                          </span>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => setSelectedEmployeeIds([])}
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex justify-end gap-3">
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        form.setFieldsValue({
                          name: team.name,
                          title: team.title || "",
                          clientId: team.clientId || undefined,
                          managerName: team.managerName || "",
                          managerEmail: team.managerEmail || "",
                        });
                        if (team.employees) {
                          setSelectedEmployeeIds(
                            team.employees.map((e) => e.id)
                          );
                        }
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={submitting}
                    >
                      <span className="material-symbols-outlined">save</span>
                      <span style={{ marginLeft: 8 }}>Save Changes</span>
                    </Button>
                  </div>
                </Form>
              )}
            </div>
          </Tabs.TabPane>

          {/* Client Info Tab */}
          {team.client && (
            <Tabs.TabPane tab="Client Information" key="client">
              <Card
                style={{
                  backgroundColor: cardBg,
                  borderColor: palette.border,
                }}
              >
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Client Name">
                    {team.client.name}
                  </Descriptions.Item>
                  {team.client.pocInternalName && (
                    <Descriptions.Item label="Internal POC">
                      {team.client.pocInternalName}
                      {team.client.pocInternalEmail && (
                        <span style={{ color: palette.textSecondary }}>
                          {" "}
                          ({team.client.pocInternalEmail})
                        </span>
                      )}
                    </Descriptions.Item>
                  )}
                  {team.client.pocExternalName && (
                    <Descriptions.Item label="External POC">
                      {team.client.pocExternalName}
                      {team.client.pocExternalEmail && (
                        <span style={{ color: palette.textSecondary }}>
                          {" "}
                          ({team.client.pocExternalEmail})
                        </span>
                      )}
                    </Descriptions.Item>
                  )}
                  {team.client.address && (
                    <Descriptions.Item label="Address">
                      {team.client.address}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Tabs.TabPane>
          )}
        </Tabs>
      </StyleProvider>
    </div>
  );
};

export default EditTeam;

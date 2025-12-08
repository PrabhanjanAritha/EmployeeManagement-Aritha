import React, { useEffect, useState } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Breadcrumb,
  message,
  Spin,
  Modal,
  Tabs,
  Card,
  Descriptions,
  Divider,
  Tag,
  List,
} from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import { useTheme } from "../theme/useTheme";
import {
  getClientById,
  updateClient,
  deleteClient,
  //   getClientTeams,
  //   getClientEmployees,
} from "../api/clients";

interface Client {
  id: number;
  name: string;
  pocInternalName?: string;
  pocInternalEmail?: string;
  pocExternalName?: string;
  pocExternalEmail?: string;
  address?: string;
  teams?: Array<{
    id: number;
    name: string;
    title?: string;
    managerName?: string;
    _count?: { employees: number };
  }>;
  employees?: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    title?: string;
    employeeCode?: string;
    team?: { id: number; name: string };
  }>;
  _count?: {
    teams: number;
    employees: number;
  };
}

type FormValues = {
  name: string;
  pocInternalName?: string;
  pocInternalEmail?: string;
  pocExternalName?: string;
  pocExternalEmail?: string;
  address?: string;
};

export const EditClient: React.FC = () => {
  const role = localStorage.getItem("role") ?? "";
  const isEditable = role.toLowerCase() === "admin";
  const { palette } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const clientId = id ? Number(id) : NaN;
  const [form] = Form.useForm<FormValues>();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isEditing, setIsEditing] = useState(false);

  const isDark =
    (palette as any)?.mode === "dark" || (palette as any)?.isDark || false;
  const pageBg = isDark ? palette.background ?? "#020617" : "#f3f4f6";
  const cardBg = isDark ? palette.surface ?? "#020617" : "#f9fafb";

  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      if (!clientId || isNaN(clientId)) {
        messageApi.error("Invalid client ID");
        navigate("/clients");
        return;
      }

      try {
        setLoading(true);
        const clientData = await getClientById(clientId);
        const clientObj: Client = (clientData as any).success
          ? (clientData as any).data
          : (clientData as unknown as Client);

        setClient(clientObj);

        // Set form values
        form.setFieldsValue({
          name: clientObj.name,
          pocInternalName: clientObj.pocInternalName || "",
          pocInternalEmail: clientObj.pocInternalEmail || "",
          pocExternalName: clientObj.pocExternalName || "",
          pocExternalEmail: clientObj.pocExternalEmail || "",
          address: clientObj.address || "",
        });
      } catch (err) {
        console.error("Failed to fetch client:", err);
        messageApi.error("Failed to load client details");
        navigate("/clients");
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [clientId, form, messageApi, navigate]);

  const onFinish = async (values: FormValues) => {
    if (!client) return;

    try {
      setSubmitting(true);

      const payload = {
        name: values.name.trim(),
        pocInternalName: values.pocInternalName?.trim() || undefined,
        pocInternalEmail: values.pocInternalEmail?.trim() || undefined,
        pocExternalName: values.pocExternalName?.trim() || undefined,
        pocExternalEmail: values.pocExternalEmail?.trim() || undefined,
        address: values.address?.trim() || undefined,
      };

      await updateClient(client.id, payload);
      messageApi.success("Client updated successfully");

      // Refresh client data
      const updatedClient = await getClientById(client.id);
      const clientObj: Client = (updatedClient as any).success
        ? (updatedClient as any).data
        : (updatedClient as unknown as Client);
      setClient(clientObj);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Update client error:", err);
      const backendMsg = err?.response?.data?.message;

      if (err?.response?.status === 409) {
        messageApi.error("Client name already exists");
      } else if (err?.response?.status === 400) {
        const errors = err?.response?.data?.errors;
        if (errors && Array.isArray(errors)) {
          errors.forEach((error: string) => messageApi.error(error));
        } else {
          messageApi.error(backendMsg || "Validation failed");
        }
      } else {
        messageApi.error(backendMsg || "Failed to update client");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!client) return;

    const hasTeams = client._count?.teams || 0;
    const hasEmployees = client._count?.employees || 0;

    if (hasTeams > 0 || hasEmployees > 0) {
      Modal.warning({
        title: "Cannot Delete Client",
        content: `This client has ${hasTeams} team(s) and ${hasEmployees} employee(s) associated. Please remove these associations first.`,
      });
      return;
    }

    Modal.confirm({
      title: "Delete Client",
      content: `Are you sure you want to delete "${client.name}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteClient(client.id);
          messageApi.success("Client deleted successfully");
          setTimeout(() => navigate("/clients"), 1000);
        } catch (err: any) {
          console.error("Delete client error:", err);
          messageApi.error(
            err?.response?.data?.message || "Failed to delete client"
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

  if (!client) {
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
          { title: "Clients", onClick: () => navigate("/clients") },
          { title: client.name },
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
          <Tabs.TabPane tab="Client Details" key="details">
            <div
              style={{
                backgroundColor: cardBg,
                borderColor: palette.border,
              }}
              className="rounded-xl p-6 border shadow-sm"
            >
              {/* Header */}
              {isEditable && (
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
                      {isEditing ? "Edit Client" : client.name}
                    </h2>
                    <p
                      style={{
                        color: palette.textSecondary,
                        fontSize: 14,
                        margin: "8px 0 0 0",
                      }}
                    >
                      {isEditing
                        ? "Update client information"
                        : "View client details"}
                    </p>
                  </div>

                  {!isEditing && (
                    <div className="flex gap-2">
                      <Button
                        type="primary"
                        onClick={() => setIsEditing(true)}
                        style={{ backgroundColor: palette.primary }}
                      >
                        <span className="material-symbols-outlined">edit</span>
                        <span style={{ marginLeft: 8 }}>Edit</span>
                      </Button>
                      <Button danger onClick={handleDelete}>
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                        <span style={{ marginLeft: 8 }}>Delete</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {/* View Mode */}
              {!isEditing ? (
                <div>
                  {/* Basic Info */}
                  <Descriptions
                    bordered
                    column={1}
                    style={{ backgroundColor: palette.surface_w }}
                  >
                    <Descriptions.Item label="Client Name">
                      {client.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Address">
                      {client.address || "-"}
                    </Descriptions.Item>
                  </Descriptions>

                  <Divider style={{ borderColor: palette.border }} />

                  {/* Internal POC */}
                  <h3
                    style={{
                      color: palette.textPrimary_w,
                      fontSize: 16,
                      fontWeight: 600,
                      margin: "0 0 16px 0",
                    }}
                  >
                    Internal Point of Contact
                  </h3>
                  <Descriptions
                    bordered
                    column={1}
                    style={{ backgroundColor: palette.surface_w }}
                  >
                    <Descriptions.Item label="Name">
                      {client.pocInternalName || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {client.pocInternalEmail || "-"}
                    </Descriptions.Item>
                  </Descriptions>

                  <Divider style={{ borderColor: palette.border }} />

                  {/* External POC */}
                  <h3
                    style={{
                      color: palette.textPrimary_w,
                      fontSize: 16,
                      fontWeight: 600,
                      margin: "0 0 16px 0",
                    }}
                  >
                    External Point of Contact
                  </h3>
                  <Descriptions
                    bordered
                    column={1}
                    style={{ backgroundColor: palette.surface_w }}
                  >
                    <Descriptions.Item label="Name">
                      {client.pocExternalName || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {client.pocExternalEmail || "-"}
                    </Descriptions.Item>
                  </Descriptions>

                  <Divider style={{ borderColor: palette.border }} />

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <Card
                      size="small"
                      style={{
                        backgroundColor: palette.surface_w,
                        borderColor: palette.border,
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 32,
                            fontWeight: 600,
                            color: palette.primary,
                          }}
                        >
                          {client._count?.teams || 0}
                        </div>
                        <div style={{ color: palette.textSecondary }}>
                          Teams
                        </div>
                      </div>
                    </Card>
                    <Card
                      size="small"
                      style={{
                        backgroundColor: palette.surface_w,
                        borderColor: palette.border,
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 32,
                            fontWeight: 600,
                            color: palette.primary,
                          }}
                        >
                          {client._count?.employees || 0}
                        </div>
                        <div style={{ color: palette.textSecondary }}>
                          Employees
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <Form<FormValues>
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                >
                  {/* Basic Information */}
                  <h3
                    style={{
                      color: palette.textPrimary_w,
                      fontSize: 16,
                      fontWeight: 600,
                      margin: "0 0 16px 0",
                    }}
                  >
                    Basic Information
                  </h3>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="name"
                        label="Client Name"
                        rules={[
                          { required: true, message: "Client name required" },
                          { min: 2, message: "Min 2 characters" },
                        ]}
                      >
                        <Input placeholder="Client name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="address" label="Address">
                        <Input.TextArea
                          rows={3}
                          placeholder="Address"
                          style={{ resize: "none" }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider style={{ borderColor: palette.border }} />

                  {/* Internal POC */}
                  <h3
                    style={{
                      color: palette.textPrimary_w,
                      fontSize: 16,
                      fontWeight: 600,
                      margin: "0 0 16px 0",
                    }}
                  >
                    Internal Point of Contact
                  </h3>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="pocInternalName"
                        label="Internal POC Name"
                      >
                        <Input placeholder="Name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="pocInternalEmail"
                        label="Internal POC Email"
                        rules={[{ type: "email", message: "Invalid email" }]}
                      >
                        <Input placeholder="email@company.com" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider style={{ borderColor: palette.border }} />

                  {/* External POC */}
                  <h3
                    style={{
                      color: palette.textPrimary_w,
                      fontSize: 16,
                      fontWeight: 600,
                      margin: "0 0 16px 0",
                    }}
                  >
                    External Point of Contact
                  </h3>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="pocExternalName"
                        label="External POC Name"
                      >
                        <Input placeholder="Name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="pocExternalEmail"
                        label="External POC Email"
                        rules={[{ type: "email", message: "Invalid email" }]}
                      >
                        <Input placeholder="email@clientcompany.com" />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Action Buttons */}
                  <div className="mt-8 flex justify-end gap-3">
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        form.setFieldsValue({
                          name: client.name,
                          pocInternalName: client.pocInternalName || "",
                          pocInternalEmail: client.pocInternalEmail || "",
                          pocExternalName: client.pocExternalName || "",
                          pocExternalEmail: client.pocExternalEmail || "",
                          address: client.address || "",
                        });
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

          {/* Teams Tab */}
          <Tabs.TabPane
            tab={`Teams (${client._count?.teams || 0})`}
            key="teams"
          >
            <Card
              style={{
                backgroundColor: cardBg,
                borderColor: palette.border,
              }}
            >
              {client.teams && client.teams.length > 0 ? (
                <List
                  dataSource={client.teams}
                  renderItem={(team) => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          onClick={() => navigate(`/teams/${team.id}`)}
                        >
                          View
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={team.name}
                        description={
                          <div>
                            {team.title && (
                              <div style={{ color: palette.textSecondary }}>
                                {team.title}
                              </div>
                            )}
                            {team.managerName && (
                              <div style={{ color: palette.textSecondary }}>
                                Manager: {team.managerName}
                              </div>
                            )}
                            <Tag style={{ marginTop: 4 }}>
                              {team._count?.employees || 0} employees
                            </Tag>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: palette.textSecondary,
                  }}
                >
                  No teams assigned to this client
                </div>
              )}
            </Card>
          </Tabs.TabPane>

          {/* Employees Tab */}
          <Tabs.TabPane
            tab={`Employees (${client._count?.employees || 0})`}
            key="employees"
          >
            <Card
              style={{
                backgroundColor: cardBg,
                borderColor: palette.border,
              }}
            >
              {client.employees && client.employees.length > 0 ? (
                <List
                  dataSource={client.employees}
                  renderItem={(emp) => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          onClick={() => navigate(`/employees/${emp.id}`)}
                        >
                          View
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={`${emp.firstName} ${emp.lastName}`}
                        description={
                          <div>
                            <div style={{ color: palette.textSecondary }}>
                              {emp.email}
                            </div>
                            {emp.title && (
                              <Tag style={{ marginTop: 4 }}>{emp.title}</Tag>
                            )}
                            {emp.team && (
                              <Tag color="blue" style={{ marginTop: 4 }}>
                                {emp.team.name}
                              </Tag>
                            )}
                          </div>
                        }
                      />
                      {emp.employeeCode && (
                        <Tag color="blue">{emp.employeeCode}</Tag>
                      )}
                    </List.Item>
                  )}
                />
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: palette.textSecondary,
                  }}
                >
                  No employees assigned to this client
                </div>
              )}
            </Card>
          </Tabs.TabPane>
        </Tabs>
      </StyleProvider>
    </div>
  );
};

export default EditClient;

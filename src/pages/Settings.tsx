/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/useTheme";
import {
  Form,
  Input,
  Button,
  Table,
  Modal,
  message,
  Switch,
  Card,
  Tag,
  Space,
  Select,
  Dropdown,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import {
  getUsers,
  registerUser,
  updateUserStatus,
  updateUserRole,
} from "../api/users";

interface User {
  id: number;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export const Settings: React.FC = () => {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [roleInfo, setRoleInfo] = useState("");
  // Check if current user is admin
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);

      // Redirect if not admin
      if (user.email !== "admin@arithaconsulting.com") {
        messageApi.error("Access denied. Admin only.");
        navigate("/dashboard");
        return;
      }
    } else {
      navigate("/login");
    }
  }, [navigate, messageApi]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      messageApi.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.email === "admin@arithaconsulting.com") {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Handle add user
  const handleAddUser = async (values: {
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      setSubmitting(true);

      await registerUser({
        email: values.email,
        password: values.password,
        role: values.role || "hr",
      });

      messageApi.success("User registered successfully");
      setShowAddUserModal(false);
      form.resetFields();
      fetchUsers();
    } catch (error: any) {
      console.error("Failed to register user:", error);
      const errorMsg =
        error?.response?.data?.message || "Failed to register user";
      messageApi.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle user status toggle
  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    try {
      await updateUserStatus(userId, !currentStatus);
      messageApi.success(
        `User ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user status:", error);
      messageApi.error("Failed to update user status");
    }
  };

  // Handle role update
  const handleRoleUpdate = async (userId: number, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      messageApi.success(`User role updated to ${newRole.toUpperCase()}`);
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user role:", error);
      messageApi.error("Failed to update user role");
    }
  };

  // Table columns
  const columns: ColumnsType<User> = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => (
        <div>
          <div style={{ color: palette.textPrimary, fontWeight: 500 }}>
            {email}
          </div>
          {email === "admin@arithaconsulting.com" && (
            <Tag color="gold" style={{ marginTop: 4 }}>
              TN-Admin
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 150,
      render: (role: string, record: User) => {
        const isCurrentAdmin = record.email === "admin@arithaconsulting.com";

        const menuItems: MenuProps["items"] = [
          {
            key: "hr",
            label: "HR",
            onClick: () => handleRoleUpdate(record.id, "hr"),
            disabled: role === "hr" || isCurrentAdmin,
          },
          {
            key: "admin",
            label: "Admin",
            onClick: () => handleRoleUpdate(record.id, "admin"),
            disabled: role === "admin" || isCurrentAdmin,
          },
        ];

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            disabled={isCurrentAdmin}
          >
            <Tag
              color="blue"
              style={{
                textTransform: "uppercase",
                cursor: isCurrentAdmin ? "default" : "pointer",
              }}
            >
              {role}
              {!isCurrentAdmin && (
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 14, marginLeft: 4 }}
                >
                  arrow_drop_down
                </span>
              )}
            </Tag>
          </Dropdown>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      width: 120,
      align: "center",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      align: "center",
      render: (_: any, record: User) => {
        // Prevent admin from deactivating themselves
        const isCurrentAdmin = record.email === "admin@arithaconsulting.com";

        return (
          <Switch
            checked={record.active}
            onChange={() => handleStatusToggle(record.id, record.active)}
            disabled={isCurrentAdmin}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            title={
              isCurrentAdmin
                ? "Cannot deactivate admin account"
                : "Toggle user status"
            }
          />
        );
      },
    },
  ];

  // Only show settings if admin
  if (currentUser?.email !== "admin@arithaconsulting.com") {
    return null;
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      {contextHolder}

      {/* Header
      <div className="mb-6">
        <h1
          style={{ color: palette.textPrimary }}
          className="text-2xl font-bold mb-2"
        >
          Settings
        </h1>
        <p style={{ color: palette.textSecondary }} className="text-sm">
          Manage system users and access control
        </p>
      </div> */}

      {/* User Management Card */}
      <Card
        style={{
          backgroundColor: palette.surface,
          borderColor: palette.border,
        }}
        className="shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              style={{ color: palette.textPrimary }}
              className="text-lg font-semibold mb-1"
            >
              User Management
            </h2>
            <p style={{ color: palette.textSecondary }} className="text-sm">
              {users.length} users registered
            </p>
          </div>
          <Button
            type="primary"
            icon={<span className="material-symbols-outlined">person_add</span>}
            onClick={() => setShowAddUserModal(true)}
            style={{ backgroundColor: palette.primary }}
          >
            Add User
          </Button>
        </div>

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
            <Table
              size="small"
              columns={columns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                className: "employee-pagination",
              }}
              style={{
                backgroundColor: palette.surface,
              }}
            />
          </div>
        </div>
      </Card>

      {/* Add User Modal */}
      <Modal
        title="Register New User"
        open={showAddUserModal}
        onCancel={() => {
          setShowAddUserModal(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddUser}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input
              placeholder="user@example.com"
              prefix={
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18, marginRight: 8 }}
                >
                  email
                </span>
              }
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Password is required" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password
              placeholder="Enter password"
              prefix={
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18, marginRight: 8 }}
                >
                  lock
                </span>
              }
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            initialValue="hr"
            rules={[{ required: true, message: "Role is required" }]}
          >
            <Select
              placeholder="Select role"
              onChange={(value) => {
                if (value === "admin") {
                  setRoleInfo("Admin can edit the data.");
                } else if (value === "hr") {
                  setRoleInfo("HR can only view the data.");
                } else {
                  setRoleInfo("");
                }
              }}
            >
              <Select.Option value="hr">HR</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>

            {roleInfo && (
              <div
                style={{
                  marginTop: 8,
                  padding: "8px 12px",
                  background: "#f0f5ff",
                  border: "1px solid #adc6ff",
                  borderRadius: 4,
                  color: "#1d39c4",
                }}
              >
                {roleInfo}
              </div>
            )}
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setShowAddUserModal(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                style={{ backgroundColor: palette.primary }}
              >
                Register User
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings;

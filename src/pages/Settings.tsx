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
  Divider,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import {
  getUsers,
  registerUser,
  updateUserStatus,
  updateUserRole,
  checkRecoveryConfigured,
} from "../api/users";
import {
  changePassword,
  setRecoveryAnswer,
  updateRecoveryAnswer,
} from "../api/auth";

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
  const [recoveryForm] = Form.useForm();
  const [updateRecoveryForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showUpdateRecoveryModal, setShowUpdateRecoveryModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [roleInfo, setRoleInfo] = useState("");
  const [hasRecovery, setHasRecovery] = useState(false);
  const [checkingRecovery, setCheckingRecovery] = useState(false);

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

  // Check if recovery is configured
  const checkRecoveryStatus = async () => {
    setCheckingRecovery(true);

    try {
      const res = await checkRecoveryConfigured();
      setHasRecovery(res.configured);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingRecovery(false);
    }
  };

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
      checkRecoveryStatus();
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

  const handleSetRecovery = async (values: { answer: string }) => {
    try {
      setSubmitting(true);

      const res = await setRecoveryAnswer(values.answer);

      messageApi.success(res.message || "Recovery answer set successfully");
      setShowRecoveryModal(false);
      recoveryForm.resetFields();
      // call your status checker (ensure it returns or updates state)
      checkRecoveryStatus();
    } catch (error: any) {
      // error may be { error: string } or other shape
      const errMsg =
        error?.error || error?.message || "Failed to set recovery answer";
      console.error("Failed to set recovery answer:", error);
      messageApi.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle update recovery answer
  const handleUpdateRecovery = async (values: {
    oldAnswer: string;
    newAnswer: string;
  }) => {
    try {
      setSubmitting(true);

      const res = await updateRecoveryAnswer(
        values.oldAnswer,
        values.newAnswer
      );

      messageApi.success(res.message || "Recovery answer updated successfully");
      setShowUpdateRecoveryModal(false);
      updateRecoveryForm.resetFields();
    } catch (error: any) {
      const errMsg =
        error?.error || error?.message || "Failed to update recovery answer";
      console.error("Failed to update recovery answer:", error);
      messageApi.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle change password
  const handleChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      setSubmitting(true);

      const res = await changePassword(
        values.currentPassword,
        values.newPassword
      );

      messageApi.success(res.message || "Password changed successfully");
      setShowPasswordModal(false);
      passwordForm.resetFields();
    } catch (error: any) {
      const errMsg =
        error?.error || error?.message || "Failed to change password";
      console.error("Failed to change password:", error);
      messageApi.error(errMsg);
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

      {/* Admin Security Settings Card */}
      <Card
        style={{
          backgroundColor: palette.surface,
          borderColor: palette.border,
          marginBottom: 24,
        }}
        className="shadow-sm"
      >
        <div className="mb-4">
          <h2
            style={{ color: palette.textPrimary }}
            className="text-lg font-semibold mb-1"
          >
            Admin Security Settings
          </h2>
          <p style={{ color: palette.textSecondary }} className="text-sm">
            Manage your password and recovery options
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Change Password */}
          <Card
            size="small"
            style={{
              backgroundColor: palette.background,
              borderColor: palette.border,
            }}
            className="hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div
                style={{
                  backgroundColor: palette.primary + "15",
                  color: palette.primary,
                }}
                className="p-2 rounded-lg"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 24 }}
                >
                  lock_reset
                </span>
              </div>
              <div className="flex-1">
                <h3
                  style={{ color: palette.textPrimary }}
                  className="font-medium mb-1"
                >
                  Change Password
                </h3>
                <p
                  style={{ color: palette.textSecondary }}
                  className="text-xs mb-3"
                >
                  Update your account password
                </p>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => setShowPasswordModal(true)}
                  style={{ backgroundColor: palette.primary }}
                >
                  Change
                </Button>
              </div>
            </div>
          </Card>

          {/* Set/Update Recovery Answer */}
          <Card
            size="small"
            style={{
              backgroundColor: palette.background,
              borderColor: palette.border,
            }}
            className="hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div
                style={{
                  backgroundColor: hasRecovery ? "#52c41a15" : "#ff4d4f15",
                  color: hasRecovery ? "#52c41a" : "#ff4d4f",
                }}
                className="p-2 rounded-lg"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 24 }}
                >
                  {hasRecovery ? "verified_user" : "security"}
                </span>
              </div>
              <div className="flex-1">
                <h3
                  style={{ color: palette.textPrimary }}
                  className="font-medium mb-1"
                >
                  Recovery Answer
                </h3>
                <p
                  style={{ color: palette.textSecondary }}
                  className="text-xs mb-3"
                >
                  {checkingRecovery
                    ? "Checking..."
                    : hasRecovery
                    ? "Recovery configured ✓"
                    : "Not configured"}
                </p>
                <Space size="small">
                  {!hasRecovery ? (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => setShowRecoveryModal(true)}
                      style={{ backgroundColor: palette.primary }}
                      disabled={checkingRecovery}
                    >
                      Set Up
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      onClick={() => setShowUpdateRecoveryModal(true)}
                    >
                      Update
                    </Button>
                  )}
                </Space>
              </div>
            </div>
          </Card>

          {/* Info Card */}
          <Card
            size="small"
            style={{
              backgroundColor: palette.background,
              borderColor: palette.border,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                style={{
                  backgroundColor: "#1890ff15",
                  color: "#1890ff",
                }}
                className="p-2 rounded-lg"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 24 }}
                >
                  info
                </span>
              </div>
              <div className="flex-1">
                <h3
                  style={{ color: palette.textPrimary }}
                  className="font-medium mb-1"
                >
                  Security Info
                </h3>
                <p style={{ color: palette.textSecondary }} className="text-xs">
                  Recovery answer helps you reset password if you forget it.
                  Keep it secure and memorable.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Card>

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

      {/* Set Recovery Answer Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined"
              style={{ color: palette.primary }}
            >
              security
            </span>
            <span>Set Recovery Answer</span>
          </div>
        }
        open={showRecoveryModal}
        onCancel={() => {
          setShowRecoveryModal(false);
          recoveryForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <p style={{ color: palette.textSecondary, marginBottom: 24 }}>
          Set a recovery answer that you can use to reset your password if you
          forget it. Choose something memorable but secure.
        </p>

        <Form
          form={recoveryForm}
          layout="vertical"
          onFinish={handleSetRecovery}
        >
          <Form.Item
            name="answer"
            label="Recovery Answer"
            rules={[
              { required: true, message: "Recovery answer is required" },
              {
                min: 3,
                message: "Answer must be at least 3 characters",
              },
            ]}
          >
            <Input.TextArea
              placeholder="Example: My first pet's name was Fluffy"
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <div
            style={{
              backgroundColor: "#fff7e6",
              border: "1px solid #ffd591",
              padding: 12,
              borderRadius: 4,
              marginBottom: 24,
            }}
          >
            <div className="flex items-start gap-2">
              <span
                className="material-symbols-outlined"
                style={{ color: "#fa8c16", fontSize: 20 }}
              >
                warning
              </span>
              <div style={{ fontSize: 12, color: "#873800" }}>
                <strong>Important:</strong> Keep this answer secure and
                memorable. You'll need it to recover your account if you forget
                your password.
              </div>
            </div>
          </div>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setShowRecoveryModal(false);
                  recoveryForm.resetFields();
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
                Set Recovery Answer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Update Recovery Answer Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined"
              style={{ color: palette.primary }}
            >
              update
            </span>
            <span>Update Recovery Answer</span>
          </div>
        }
        open={showUpdateRecoveryModal}
        onCancel={() => {
          setShowUpdateRecoveryModal(false);
          updateRecoveryForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <p style={{ color: palette.textSecondary, marginBottom: 24 }}>
          To update your recovery answer, first verify your current answer.
        </p>

        <Form
          form={updateRecoveryForm}
          layout="vertical"
          onFinish={handleUpdateRecovery}
        >
          <Form.Item
            name="oldAnswer"
            label="Current Recovery Answer"
            rules={[{ required: true, message: "Current answer is required" }]}
          >
            <Input.TextArea
              placeholder="Enter your current recovery answer"
              rows={2}
            />
          </Form.Item>

          <Divider />

          <Form.Item
            name="newAnswer"
            label="New Recovery Answer"
            rules={[
              { required: true, message: "New answer is required" },
              {
                min: 3,
                message: "Answer must be at least 3 characters",
              },
            ]}
          >
            <Input.TextArea
              placeholder="Enter your new recovery answer"
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setShowUpdateRecoveryModal(false);
                  updateRecoveryForm.resetFields();
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
                Update Answer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined"
              style={{ color: palette.primary }}
            >
              lock_reset
            </span>
            <span>Change Password</span>
          </div>
        }
        open={showPasswordModal}
        onCancel={() => {
          setShowPasswordModal(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[
              { required: true, message: "Current password is required" },
            ]}
          >
            <Input.Password
              placeholder="Enter current password"
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
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "New password is required" },
              {
                min: 8,
                message: "Password must be at least 8 characters",
              },
            ]}
          >
            <Input.Password
              placeholder="Enter new password"
              prefix={
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18, marginRight: 8 }}
                >
                  lock_open
                </span>
              }
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm new password"
              prefix={
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18, marginRight: 8 }}
                >
                  check_circle
                </span>
              }
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setShowPasswordModal(false);
                  passwordForm.resetFields();
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
                Change Password
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings;

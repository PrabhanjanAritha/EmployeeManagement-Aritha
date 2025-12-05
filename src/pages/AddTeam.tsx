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
} from "antd";
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
  email?: string;
}

type FormValues = {
  name: string;
  clientId?: number;
  managerName?: string;
  managerEmail?: string;
  employeeIds?: number[];
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

  // derive a simple dark / light flag from palette (same as AddEmployee)
  const isDark =
    (palette as any)?.mode === "dark" || (palette as any)?.isDark || false;

  const pageBg = isDark ? palette.background ?? "#020617" : "#f3f4f6";
  const cardBg = isDark ? palette.surface ?? "#020617" : "#f9fafb";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingClients(true);
        const clientsData = await getClients();
        setClients(
          Array.isArray(clientsData) ? clientsData : clientsData.data || []
        );
      } catch (err) {
        console.error("Failed to fetch clients:", err);
        messageApi.warning("Could not load clients");
      } finally {
        setLoadingClients(false);
      }

      try {
        setLoadingEmployees(true);
        const employeesData = await getEmployees();
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

  const onFinish = async (values: FormValues) => {
    try {
      setSubmitting(true);

      const payload = {
        name: values.name.trim(),
        managerName: values.managerName?.trim() || undefined,
        managerEmail: values.managerEmail?.trim() || undefined,
        clientId: values.clientId ?? undefined,
        employeeIds: values.employeeIds ?? [],
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
            <Row gutter={[16, 16]}>
              {/* Team Name (required, maps to `name` in backend) */}
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

              {/* Client (maps to clientId) */}
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
                  tooltip="Person leading this team"
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

              {/* Assign Employees (employeeIds) */}
              <Col xs={24}>
                <Form.Item
                  name="employeeIds"
                  label="Assign Employees"
                  tooltip="Select employees to associate with this team"
                >
                  <Select
                    mode="multiple"
                    placeholder="Select employees"
                    loading={loadingEmployees}
                    showSearch
                    optionFilterProp="children"
                  >
                    {employees.map((e) => (
                      <Option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName}
                        {e.employeeCode && ` (${e.employeeCode})`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
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
                onClick={() => form.resetFields()}
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
                style={{
                  backgroundColor: palette.primary,
                  borderColor: palette.primary,
                }}
                loading={submitting}
              >
                <span className="material-symbols-outlined">save</span>
                <span style={{ marginLeft: 8 }}>Save Team</span>
              </Button>
            </div>
          </Form>
        </div>
      </StyleProvider>
    </div>
  );
};

export default AddTeam;

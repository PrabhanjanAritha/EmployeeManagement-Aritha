import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/useTheme";
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Button,
  Breadcrumb,
  message,
  Switch,
} from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import { createEmployee } from "../api/employees";
import { getTeams } from "../api/teams";
import { getClients } from "../api/clients";

const { Option } = Select;

interface Team {
  id: number;
  name: string;
}

interface Client {
  id: number;
  name: string;
  industry?: string;
}

type FormValues = {
  employeeCode?: string;
  teamId?: number;
  clientId?: number;
  firstName: string;
  lastName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dob?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doj?: any;
  personalEmail?: string;
  companyEmail?: string;
  phone?: string;
  experienceYears?: number;
  experienceMonths?: number;
  title?: string;
  gender?: string;
  active?: boolean;
};

export const AddEmployee: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { palette } = useTheme();
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // derive a simple dark / light flag from palette
  const isDark =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (palette as any)?.mode === "dark" || (palette as any)?.isDark || false;

  const pageBg = isDark ? palette.background ?? "#020617" : "#f3f4f6"; // subtle gray for light
  const cardBg = isDark ? palette.surface ?? "#020617" : "#f9fafb"; // off-white for light

  // Fetch teams and clients on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingTeams(true);
        const teamsData = await getTeams();
        setTeams(Array.isArray(teamsData) ? teamsData : teamsData.data || []);
      } catch (err) {
        console.error("Failed to fetch teams:", err);
        messageApi.warning("Could not load teams");
      } finally {
        setLoadingTeams(false);
      }

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
    };

    fetchData();
  }, [messageApi]);

  const onFinish = async (values: FormValues) => {
    try {
      setLoading(true);

      const payload = {
        employeeCode: values.employeeCode?.trim() || undefined,
        teamId: values.teamId || undefined,
        clientId: values.clientId || undefined,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        personalEmail: values.personalEmail?.trim() || undefined,
        companyEmail: values.companyEmail?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        title: values.title?.trim() || undefined,
        gender: values.gender || undefined,
        experienceYears: values.experienceYears ?? undefined,
        experienceMonths: values.experienceMonths ?? undefined,
        dob: values.dob ? values.dob.toISOString() : undefined,
        doj: values.doj ? values.doj.toISOString() : undefined,
        active: values.active ?? true, // Default to active
      };

      await createEmployee(payload);
      messageApi.success("Employee created successfully");

      setTimeout(() => {
        navigate("/employees");
      }, 1500);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Create employee error:", err);
      const backendMsg = err?.response?.data?.message;

      // Handle specific error cases
      if (err?.response?.status === 409) {
        messageApi.error("Employee code or email already exists");
      } else if (err?.response?.status === 400) {
        const errors = err?.response?.data?.errors;
        if (errors && Array.isArray(errors)) {
          errors.forEach((error: string) => messageApi.error(error));
        } else {
          messageApi.error(backendMsg || "Validation failed");
        }
      } else {
        messageApi.error(backendMsg || "Failed to create employee");
      }
    } finally {
      setLoading(false);
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
          { title: "Employees", onClick: () => navigate("/employees") },
          { title: "Add Employee" },
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
              Add New Employee
            </h2>
            <p
              style={{
                color: palette.textSecondary,
                fontSize: 14,
                margin: "8px 0 0 0",
              }}
            >
              Fill in the employee details below
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ active: true }}
          >
            <Row gutter={[16, 16]}>
              {/* Employee Code */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="employeeCode"
                  label="Employee Code"
                  tooltip="Unique identifier for the employee"
                >
                  <Input placeholder="e.g., EMP001" />
                </Form.Item>
              </Col>

              {/* Active Status */}

              {/* First Name */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[
                    { required: true, message: "First name is required" },
                    {
                      min: 2,
                      message: "First name must be at least 2 characters",
                    },
                  ]}
                >
                  <Input placeholder="John" />
                </Form.Item>
              </Col>

              {/* Last Name */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[
                    { required: true, message: "Last name is required" },
                    {
                      min: 2,
                      message: "Last name must be at least 2 characters",
                    },
                  ]}
                >
                  <Input placeholder="Doe" />
                </Form.Item>
              </Col>

              {/* Personal Email */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="personalEmail"
                  label="Personal Email"
                  rules={[{ type: "email", message: "Enter a valid email" }]}
                  tooltip="At least one email (personal or company) is required"
                >
                  <Input placeholder="john.doe@gmail.com" />
                </Form.Item>
              </Col>

              {/* Company Email */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="companyEmail"
                  label="Company Email"
                  rules={[
                    { type: "email", message: "Enter a valid company email" },
                  ]}
                >
                  <Input placeholder="john.doe@company.com" />
                </Form.Item>
              </Col>

              {/* Phone Number */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[
                    {
                      // eslint-disable-next-line no-useless-escape
                      pattern: /^[\d\s\-\+\(\)]{10,15}$/,
                      message: "Enter a valid phone number",
                    },
                  ]}
                >
                  <Input placeholder="+1 (555) 123-4567" />
                </Form.Item>
              </Col>

              {/* Gender */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="gender" label="Gender">
                  <Select placeholder="Select gender">
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                    <Option value="Other">Other</Option>
                    <Option value="Prefer not to say">Prefer not to say</Option>
                  </Select>
                </Form.Item>
              </Col>

              {/* Date of Birth */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="dob" label="Date of Birth">
                  <DatePicker format="MM/DD/YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              {/* Date of Joining */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="doj"
                  label="Date of Joining"
                  rules={[
                    { required: true, message: "Date of joining is required" },
                  ]}
                >
                  <DatePicker format="MM/DD/YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              {/* Job Title */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="title" label="Job Title">
                  <Input placeholder="e.g., Software Engineer" />
                </Form.Item>
              </Col>

              {/* Team */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="teamId"
                  label="Team"
                  tooltip="Select the team this employee belongs to"
                >
                  <Select
                    placeholder="Select a team"
                    loading={loadingTeams}
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {teams.map((team) => (
                      <Option key={team.id} value={team.id}>
                        {team.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Client */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="clientId"
                  label="Client"
                  tooltip="Assign employee to a client"
                >
                  <Select
                    placeholder="Select a client"
                    loading={loadingClients}
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {clients.map((client) => (
                      <Option key={client.id} value={client.id}>
                        {client.name}
                        {client.industry && (
                          <span style={{ color: palette.textSecondary }}>
                            {" "}
                            - {client.industry}
                          </span>
                        )}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Experience */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item label="Experience While Joining">
                  <Row gutter={8}>
                    <Col span={12}>
                      <Form.Item name="experienceYears" noStyle>
                        <InputNumber
                          min={0}
                          max={70}
                          placeholder="Years"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="experienceMonths" noStyle>
                        <InputNumber
                          min={0}
                          max={11}
                          placeholder="Months"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <div
                    style={{
                      color: palette.textSecondary,
                      marginTop: 8,
                      fontSize: 12,
                    }}
                  >
                    Enter total prior experience at the time of joining
                  </div>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="active"
                  label="Status"
                  valuePropName="checked"
                  tooltip="Set employee as active or inactive"
                >
                  <Switch
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                    style={{
                      backgroundColor: form.getFieldValue("active")
                        ? palette.primary
                        : "#999",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="default"
                onClick={() => navigate("/employees")}
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
                loading={loading}
              >
                <span className="material-symbols-outlined">save</span>
                <span style={{ marginLeft: 8 }}>Save Employee</span>
              </Button>
            </div>
          </Form>
        </div>
      </StyleProvider>
    </div>
  );
};

export default AddEmployee;

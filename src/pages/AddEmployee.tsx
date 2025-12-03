import React, { useState } from "react";
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
} from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import { createEmployee } from "../api/employees";
const { Option } = Select;

export const AddEmployee: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { palette } = useTheme();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  type FormValues = {
    employeeId?: string;
    team?: string;
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
  };

  const onFinish = async (values: FormValues) => {
    try {
      setLoading(true);

      const payload = {
        employeeId: values.employeeId,
        team: values.team,
        firstName: values.firstName,
        lastName: values.lastName,
        personalEmail: values.personalEmail,
        companyEmail: values.companyEmail,
        phone: values.phone,
        experienceYears: values.experienceYears,
        experienceMonths: values.experienceMonths,
        dob: values.dob ? values.dob.toISOString() : null,
        doj: values.doj ? values.doj.toISOString() : null,
      };

      await createEmployee(payload);

      messageApi.success("Employee created successfully");

      // ⏳ delay 1.5 seconds before redirect
      setTimeout(() => {
        navigate("/employees");
      }, 1500);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Create employee error:", err);
      const backendMsg = err?.response?.data?.message;
      messageApi.error(backendMsg || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
            backgroundColor: palette.surface,
            borderColor: palette.border,
          }}
          className="rounded-xl p-6 border shadow-sm"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ team: "" }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="employeeId"
                  label="Employee ID"
                  rules={[
                    { required: true, message: "Employee ID is required" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="team" label="Team">
                  <Select placeholder="Select a team">
                    <Option value="engineering">Engineering</Option>
                    <Option value="design">Design</Option>
                    <Option value="marketing">Marketing</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[
                    { required: true, message: "First name is required" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true, message: "Last name is required" }]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="dob"
                  label="Date of Birth"
                  rules={[
                    { required: true, message: "Date of Birth is required" },
                  ]}
                >
                  <DatePicker format="MM/DD/YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="doj"
                  label="Date of Joining"
                  rules={[
                    { required: true, message: "Date of Joining is required" },
                  ]}
                >
                  <DatePicker format="MM/DD/YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="personalEmail"
                  label="Personal Email"
                  rules={[
                    {
                      type: "email",
                      message: "Enter a valid email",
                      required: true,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[
                    {
                      pattern: /^\+?[0-9\- ]{7,15}$/,
                      message: "Enter a valid phone",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="companyEmail"
                  label="Company Email"
                  rules={[
                    { type: "email", message: "Enter a valid company email" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Experience While Joining">
                  <Row gutter={8} align="middle">
                    <Col xs={12} md={12}>
                      <Form.Item name="experienceYears" noStyle>
                        <InputNumber
                          min={0}
                          max={60}
                          placeholder="Years"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={12} md={12}>
                      {/* <div style={{ color: palette.textSecondary, marginBottom: 6 }}>Months</div> */}
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
                  <div style={{ color: palette.textSecondary, marginTop: 8 }}>
                    Enter total prior experience at the time of joining (years
                    and months).
                  </div>
                </Form.Item>
              </Col>
            </Row>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="default"
                onClick={() => navigate("/employees")}
                style={{
                  border: `1px solid ${palette.border}`,
                  background: "transparent",
                  color: palette.textPrimary,
                }}
              >
                <span className="material-symbols-outlined">close</span>
                <span style={{ marginLeft: 8 }}>Cancel</span>
              </Button>

              <Button
                type="default"
                onClick={() => form.resetFields()}
                style={{
                  border: `1px solid ${palette.border}`,
                  background: "transparent",
                  color: palette.textPrimary,
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
                <span style={{ marginLeft: 8 }}>Save</span>
              </Button>
            </div>
          </Form>
        </div>
      </StyleProvider>
    </div>
  );
};

export default AddEmployee;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Breadcrumb,
  message,
  Divider,
} from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import { useTheme } from "../theme/useTheme";
import { createClient } from "../api/clients";

/* eslint-disable @typescript-eslint/no-explicit-any */

type FormValues = {
  name: string;
  pocInternalName?: string;
  pocInternalEmail?: string;
  pocExternalName?: string;
  pocExternalEmail?: string;
  address?: string;
};

export const AddClient: React.FC = () => {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Derive dark/light mode
  const isDark =
    (palette as any)?.mode === "dark" || (palette as any)?.isDark || false;
  const pageBg = isDark ? palette.background ?? "#020617" : "#f3f4f6";
  const cardBg = isDark ? palette.surface ?? "#020617" : "#f9fafb";

  const onFinish = async (values: FormValues) => {
    try {
      setLoading(true);

      const payload = {
        name: values.name.trim(),
        pocInternalName: values.pocInternalName?.trim() || undefined,
        pocInternalEmail: values.pocInternalEmail?.trim() || undefined,
        pocExternalName: values.pocExternalName?.trim() || undefined,
        pocExternalEmail: values.pocExternalEmail?.trim() || undefined,
        address: values.address?.trim() || undefined,
      };

      await createClient(payload);
      messageApi.success("Client created successfully");

      setTimeout(() => {
        navigate("/clients");
      }, 1200);
    } catch (err: any) {
      console.error("Create client error:", err);
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
        messageApi.error(backendMsg || "Failed to create client");
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
          { title: "Clients", onClick: () => navigate("/clients") },
          { title: "Add Client" },
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
          {/* Header */}
          <div className="mb-6">
            <h2
              style={{
                color: palette.textPrimary_w,
                fontSize: 20,
                fontWeight: 600,
                margin: 0,
              }}
            >
              Add New Client
            </h2>
            <p
              style={{
                color: palette.textSecondary,
                fontSize: 14,
                margin: "8px 0 0 0",
              }}
            >
              Enter client details and point of contact information
            </p>
          </div>

          <Form<FormValues>
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{}}
          >
            {/* Basic Information */}
            <div className="mb-6">
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
                {/* Client Name */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="Client Name"
                    rules={[
                      { required: true, message: "Client name is required" },
                      {
                        min: 2,
                        message: "Client name must be at least 2 characters",
                      },
                    ]}
                    tooltip="Official name of the client organization"
                  >
                    <Input placeholder="e.g., Acme Corporation" />
                  </Form.Item>
                </Col>

                {/* Address */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="address"
                    label="Address"
                    tooltip="Physical address or headquarters location"
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="123 Main St, City, State, ZIP"
                      style={{ resize: "none" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider style={{ borderColor: palette.border }} />

            {/* Internal POC (Your Company) */}
            <div className="mb-6">
              <h3
                style={{
                  color: palette.textPrimary_w,
                  fontSize: 16,
                  fontWeight: 600,
                  margin: "0 0 8px 0",
                }}
              >
                Internal Point of Contact
              </h3>
              <p
                style={{
                  color: palette.textSecondary,
                  fontSize: 13,
                  margin: "0 0 16px 0",
                }}
              >
                Primary contact person from your organization who manages this
                client
              </p>

              <Row gutter={[16, 16]}>
                {/* Internal POC Name */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="pocInternalName"
                    label="Internal POC Name"
                    tooltip="Name of your team member managing this client"
                  >
                    <Input placeholder="e.g., John Smith" />
                  </Form.Item>
                </Col>

                {/* Internal POC Email */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="pocInternalEmail"
                    label="Internal POC Email"
                    rules={[
                      { type: "email", message: "Enter a valid email address" },
                    ]}
                    tooltip="Email of your team member"
                  >
                    <Input placeholder="john.smith@yourcompany.com" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider style={{ borderColor: palette.border }} />

            {/* External POC (Client Side) */}
            <div className="mb-6">
              <h3
                style={{
                  color: palette.textPrimary_w,
                  fontSize: 16,
                  fontWeight: 600,
                  margin: "0 0 8px 0",
                }}
              >
                External Point of Contact
              </h3>
              <p
                style={{
                  color: palette.textSecondary,
                  fontSize: 13,
                  margin: "0 0 16px 0",
                }}
              >
                Primary contact person from the client's organization
              </p>

              <Row gutter={[16, 16]}>
                {/* External POC Name */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="pocExternalName"
                    label="External POC Name"
                    tooltip="Name of the client's contact person"
                  >
                    <Input placeholder="e.g., Jane Doe" />
                  </Form.Item>
                </Col>

                {/* External POC Email */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="pocExternalEmail"
                    label="External POC Email"
                    rules={[
                      { type: "email", message: "Enter a valid email address" },
                    ]}
                    tooltip="Email of the client's contact person"
                  >
                    <Input placeholder="jane.doe@clientcompany.com" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end gap-3">
              <Button
                type="default"
                onClick={() => navigate("/clients")}
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
                loading={loading}
                // disabled={!form.getFieldValue("name")}
                // style={{
                //   backgroundColor: palette.primary,
                //   borderColor: palette.primary,
                // }}
              >
                <span className="material-symbols-outlined">save</span>
                <span style={{ marginLeft: 8 }}>Save Client</span>
              </Button>
            </div>
          </Form>
        </div>
      </StyleProvider>
    </div>
  );
};

export default AddClient;

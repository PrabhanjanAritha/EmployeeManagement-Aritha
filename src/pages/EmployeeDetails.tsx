import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DatePicker,
  Input,
  Button,
  List,
  message,
  Form,
  Row,
  Col,
  InputNumber,
  Select,
  Switch,
  Breadcrumb,
  Tabs,
  Descriptions,
  Card,
  Spin,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useTheme } from "../theme/useTheme";
import { getEmployeeById, updateEmployee } from "../api/employees";
import { getEmployeeNotes, addEmployeeNote } from "../api/notes";

import { DefaultEditor } from "react-simple-wysiwyg";
import { StyleProvider } from "@ant-design/cssinjs";

const { Option } = Select;

type Employee = {
  id: number;
  employeeCode?: string | null;
  firstName: string;
  lastName: string;
  dateOfJoining?: string | null;
  dateOfBirth?: string | null;
  experienceYearsAtJoining?: number | null;
  experienceMonthsAtJoining?: number | null;
  personalEmail?: string | null;
  companyEmail?: string | null;
  phone?: string | null;
  gender?: string | null;
  title?: string | null;
  active?: boolean | null;
  currentExperience?: {
    years: number;
    months: number;
    totalMonths: number;
    formatted: string;
    experienceAtJoining: {
      years: number;
      months: number;
      formatted: string;
    };
    experienceSinceJoining: {
      years: number;
      months: number;
      formatted: string;
    };
  } | null;
};

type EmployeeNote = {
  id: number;
  content: string;
  noteDate: string;
  createdAt: string;
  author: {
    id: number;
    email: string;
  };
};

type FormValues = {
  employeeId?: string;
  firstName: string;
  lastName: string;
  dob?: Dayjs | null;
  doj?: Dayjs | null;
  personalEmail?: string;
  companyEmail?: string;
  phone?: string;
  experienceYears?: number;
  experienceMonths?: number;
  gender?: string;
  title?: string;
  active?: boolean;
};

export const EmployeeDetails: React.FC = () => {
  const role = localStorage.getItem("role") ?? "";
  const isEditable = role.toLowerCase() === "admin";
  const { palette } = useTheme();
  const { id } = useParams<{ id: string }>();
  const isDark =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (palette as any)?.mode === "dark" || (palette as any)?.isDark || false;

  const pageBg = isDark ? palette.background ?? "#020617" : "#f3f4f6";
  const cardBg = isDark ? palette.surface ?? "#020617" : "#f9fafb";
  const employeeId = Number(id);
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [notes, setNotes] = useState<EmployeeNote[]>([]);
  const [noteDate, setNoteDate] = useState<Dayjs | null>(dayjs());
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!employeeId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await getEmployeeById(employeeId);

        const emp: Employee =
          "success" in response && response.success
            ? response.data
            : (response as unknown as Employee);

        setEmployee(emp);

        form.setFieldsValue({
          employeeId: emp.employeeCode || "",
          firstName: emp.firstName,
          lastName: emp.lastName,
          dob: emp.dateOfBirth ? dayjs(emp.dateOfBirth) : null,
          doj: emp.dateOfJoining ? dayjs(emp.dateOfJoining) : null,
          personalEmail: emp.personalEmail || "",
          companyEmail: emp.companyEmail || "",
          phone: emp.phone || "",
          experienceYears: emp.experienceYearsAtJoining ?? undefined,
          experienceMonths: emp.experienceMonthsAtJoining ?? undefined,
          gender: emp.gender || undefined,
          title: emp.title || "",
          active: emp.active ?? true,
        });

        const notesResponse = await getEmployeeNotes(employeeId);
        const notesData = Array.isArray(notesResponse)
          ? notesResponse
          : (notesResponse as { data?: EmployeeNote[] }).data || [];
        setNotes(notesData);
      } catch (err) {
        console.error("Failed to load employee details", err);
        messageApi.error("Failed to load employee details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const onAddNote = async () => {
    const plainText = noteText.replace(/<[^>]+>/g, "").trim();
    if (!plainText) {
      messageApi.warning("Please enter a note");
      return;
    }

    try {
      setNoteLoading(true);

      const payload = {
        content: noteText,
        noteDate: noteDate ? noteDate.toISOString() : null,
      };

      const newNote = await addEmployeeNote(employeeId, payload);
      setNotes((prev) => [newNote, ...prev]);
      setNoteText("");
      setNoteDate(dayjs());

      messageApi.success("Note added");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Add note error:", err);
      const backendMsg = err?.response?.data?.message;
      messageApi.error(backendMsg || "Failed to add note");
    } finally {
      setNoteLoading(false);
    }
  };

  const SuffixInput = ({
    value,
    disabled,
    onChange,
    suffix,
  }: {
    value?: number;
    disabled?: boolean;
    suffix: string;
    onChange?: (v: number | null) => void;
  }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        position: "relative",
      }}
    >
      <InputNumber
        value={value}
        disabled={disabled}
        onChange={onChange}
        style={{
          width: "100%",
          paddingRight: 50,
        }}
      />
      <span
        style={{
          position: "absolute",
          right: 10,
          color: palette.textSecondary,
          fontSize: 12,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {suffix}
      </span>
    </div>
  );

  const onFinish = async (values: FormValues) => {
    try {
      setLoading(true);

      const payload = {
        employeeId: values.employeeId,
        firstName: values.firstName,
        lastName: values.lastName,
        personalEmail: values.personalEmail,
        companyEmail: values.companyEmail,
        phone: values.phone,
        experienceYears: values.experienceYears,
        experienceMonths: values.experienceMonths,
        dob: values.dob ? values.dob.toISOString() : null,
        doj: values.doj ? values.doj.toISOString() : null,
        gender: values.gender,
        title: values.title,
        active: values.active,
      };

      const updatedEmp = await updateEmployee(employeeId, payload);

      // Update local state with the response
      const emp: Employee =
        "success" in updatedEmp && updatedEmp.success
          ? updatedEmp.data
          : (updatedEmp as unknown as Employee);

      setEmployee(emp);
      messageApi.success("Employee updated successfully");
      setIsEditing(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Update employee error:", err);
      const backendMsg = err?.response?.data?.message;
      messageApi.error(backendMsg || "Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (employee) {
      form.setFieldsValue({
        employeeId: employee.employeeCode || "",
        firstName: employee.firstName,
        lastName: employee.lastName,
        dob: employee.dateOfBirth ? dayjs(employee.dateOfBirth) : null,
        doj: employee.dateOfJoining ? dayjs(employee.dateOfJoining) : null,
        personalEmail: employee.personalEmail || "",
        companyEmail: employee.companyEmail || "",
        phone: employee.phone || "",
        experienceYears: employee.experienceYearsAtJoining ?? undefined,
        experienceMonths: employee.experienceMonthsAtJoining ?? undefined,
        gender: employee.gender || undefined,
        title: employee.title || "",
        active: employee.active ?? true,
      });
    }
    setIsEditing(false);
  };

  if (loading && !employee) {
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

  if (!employee && !loading) {
    return (
      <div style={{ color: palette.textPrimary }}>
        {contextHolder}
        Employee not found
      </div>
    );
  }

  const fullName = employee ? `${employee.firstName} ${employee.lastName}` : "";

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
          { title: fullName || "View Employee" },
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
          <Tabs.TabPane tab="Employee Details" key="details">
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
                    {isEditing ? "Edit Employee" : fullName}
                  </h2>
                  <p
                    style={{
                      color: palette.textSecondary,
                      fontSize: 14,
                      margin: "8px 0 0 0",
                    }}
                  >
                    {isEditing
                      ? "Update employee information"
                      : `Employee ${
                          employee?.employeeCode || `#${employee?.id}`
                        }`}
                  </p>
                </div>

                {!isEditing && isEditable && (
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
                )}
              </div>

              {/* View Mode */}
              {!isEditing ? (
                <div>
                  <Descriptions
                    bordered
                    column={{ xs: 1, sm: 2, md: 3 }}
                    style={{
                      backgroundColor: palette.surface,
                    }}
                  >
                    <Descriptions.Item label="Employee ID">
                      {employee?.employeeCode || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="First Name">
                      {employee?.firstName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Name">
                      {employee?.lastName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Gender">
                      {employee?.gender || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Date of Birth">
                      {employee?.dateOfBirth
                        ? dayjs(employee.dateOfBirth).format("MM/DD/YYYY")
                        : "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Date of Joining">
                      {employee?.dateOfJoining
                        ? dayjs(employee.dateOfJoining).format("MM/DD/YYYY")
                        : "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Job Title">
                      {employee?.title || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Company Email">
                      {employee?.companyEmail || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Personal Email">
                      {employee?.personalEmail || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone Number">
                      {employee?.phone || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      {employee?.active ? (
                        <span style={{ color: "#52c41a" }}>Active</span>
                      ) : (
                        <span style={{ color: "#ff4d4f" }}>Inactive</span>
                      )}
                    </Descriptions.Item>
                  </Descriptions>

                  {/* Experience Section */}
                  <div className="mt-6">
                    <h3
                      style={{
                        color: palette.textPrimary_w,
                        fontSize: 16,
                        fontWeight: 600,
                        marginBottom: 16,
                      }}
                    >
                      Experience Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card
                        size="small"
                        title="Experience at Joining"
                        style={{
                          backgroundColor: palette.surface,
                          borderColor: palette.border,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 600,
                            color: palette.primary,
                          }}
                        >
                          {employee?.currentExperience?.experienceAtJoining
                            ?.formatted || "0y 0m"}
                        </div>
                      </Card>

                      <Card
                        size="small"
                        title="Experience Since Joining"
                        style={{
                          backgroundColor: palette.surface,
                          borderColor: palette.border,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 600,
                            color: palette.primary,
                          }}
                        >
                          {employee?.currentExperience?.experienceSinceJoining
                            ?.formatted || "0y 0m"}
                        </div>
                      </Card>

                      <Card
                        size="small"
                        title="Total Current Experience"
                        style={{
                          backgroundColor: palette.surface,
                          borderColor: palette.border,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 600,
                            color: palette.primary,
                          }}
                        >
                          {employee?.currentExperience?.formatted || "0y 0m"}
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <Form<FormValues>
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                >
                  <Row gutter={[16, 16]}>
                    {/* Employee ID */}
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name="employeeId"
                        label="Employee ID"
                        rules={[
                          {
                            required: true,
                            message: "Employee ID is required",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>

                    {/* First Name */}
                    <Col xs={24} sm={12} md={8}>
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

                    {/* Last Name */}
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name="lastName"
                        label="Last Name"
                        rules={[
                          { required: true, message: "Last name is required" },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>

                    {/* Gender */}
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name="gender" label="Gender">
                        <Select placeholder="Select gender">
                          <Option value="Male">Male</Option>
                          <Option value="Female">Female</Option>
                          <Option value="Other">Other</Option>
                          <Option value="Prefer not to say">
                            Prefer not to say
                          </Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    {/* Date of Birth */}
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name="dob"
                        label="Date of Birth"
                        rules={[
                          {
                            required: true,
                            message: "Date of Birth is required",
                          },
                        ]}
                      >
                        <DatePicker
                          format="MM/DD/YYYY"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>

                    {/* Date of Joining */}
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name="doj"
                        label="Date of Joining"
                        rules={[
                          {
                            required: true,
                            message: "Date of Joining is required",
                          },
                        ]}
                      >
                        <DatePicker
                          format="MM/DD/YYYY"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>

                    {/* Job Title */}
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name="title" label="Job Title">
                        <Input placeholder="e.g., Software Engineer" />
                      </Form.Item>
                    </Col>

                    {/* Company Email */}
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name="companyEmail"
                        label="Company Email"
                        rules={[
                          {
                            type: "email",
                            message: "Enter a valid company email",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>

                    {/* Personal Email */}
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name="personalEmail"
                        label="Personal Email"
                        rules={[
                          {
                            required: true,
                            message: "Personal email is required",
                          },
                          { type: "email", message: "Enter a valid email" },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>

                    {/* Phone */}
                    <Col xs={24} sm={12} md={8}>
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

                    {/* Experience While Joining */}
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item label="Experience While Joining">
                        <Row gutter={8} align="middle">
                          <Col xs={12}>
                            <Form.Item name="experienceYears" noStyle>
                              <SuffixInput suffix="years" />
                            </Form.Item>
                          </Col>

                          <Col xs={12}>
                            <Form.Item name="experienceMonths" noStyle>
                              <SuffixInput suffix="months" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Form.Item>
                    </Col>

                    {/* Current Experience (Read-only) */}
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item label="Current Experience">
                        <Row gutter={8} align="middle">
                          <Col xs={12}>
                            <SuffixInput
                              suffix="years"
                              disabled={true}
                              value={employee?.currentExperience?.years || 0}
                            />
                          </Col>
                          <Col xs={12}>
                            <SuffixInput
                              suffix="months"
                              disabled={true}
                              value={employee?.currentExperience?.months || 0}
                            />
                          </Col>
                        </Row>
                      </Form.Item>
                    </Col>

                    {/* Status */}
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name="active"
                        label="Status"
                        valuePropName="checked"
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
                      color="danger"
                      variant="dashed"
                      disabled
                      style={{
                        background: "transparent",
                        color: palette.textPrimary_w,
                      }}
                    >
                      <span className="material-symbols-outlined">delete</span>
                      Delete
                    </Button>
                    <Button
                      type="default"
                      onClick={handleCancelEdit}
                      style={{
                        border: `1px solid ${palette.border_w}`,
                        background: "transparent",
                        color: palette.textPrimary_w,
                      }}
                    >
                      <span className="material-symbols-outlined">close</span>
                      Cancel
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
                      Reset
                    </Button>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      style={{
                        backgroundColor: palette.primary,
                        borderColor: palette.primary,
                      }}
                    >
                      <span className="material-symbols-outlined">save</span>
                      <span style={{ marginLeft: 8 }}>Save Changes</span>
                    </Button>
                  </div>
                </Form>
              )}
            </div>
          </Tabs.TabPane>

          {/* Notes Tab */}
          <Tabs.TabPane
            // tab="Notes (`${client._count?.teams || 0})"
            tab={`Notes (${notes.length || 0})`}
            key="notes"
          >
            <div
              style={{
                backgroundColor: cardBg,
                borderColor: palette.border,
              }}
              className="rounded-xl p-6 border shadow-sm"
            >
              <h3
                style={{ color: palette.textPrimary_w }}
                className="text-lg font-semibold mb-4"
              >
                Employee Notes
              </h3>

              {isEditable && (
                <>
                  {/* Date Pill */}
                  <div
                    style={{
                      backgroundColor: palette.surface_w,
                      border: `1px solid ${palette.border_w}`,
                      color: palette.textSecondary_w,
                      padding: "6px 12px",
                      fontSize: 13,
                      borderRadius: 8,
                      width: "fit-content",
                      marginBottom: 12,
                    }}
                  >
                    Note Date: {noteDate?.format("MM/DD/YYYY")}
                  </div>

                  {/* Editor */}
                  <div
                    style={{
                      borderRadius: 8,
                      border: `1px solid ${palette.border_w}`,
                      overflow: "hidden",
                      backgroundColor: palette.surface_w,
                      marginBottom: 16,
                    }}
                  >
                    <DefaultEditor
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add a new note..."
                    />
                  </div>

                  <div className="flex justify-end mb-4">
                    <Button
                      type="primary"
                      onClick={onAddNote}
                      loading={noteLoading}
                      style={{
                        backgroundColor: palette.primary,
                        borderColor: palette.primary,
                      }}
                    >
                      <span className="material-symbols-outlined">add</span>
                      <span style={{ marginLeft: 8 }}>Add Note</span>
                    </Button>
                  </div>
                </>
              )}

              {/* Notes List */}
              <List
                itemLayout="vertical"
                dataSource={notes}
                locale={{ emptyText: "No notes yet" }}
                renderItem={(note) => (
                  <List.Item
                    style={{
                      borderRadius: 8,
                      border: `1px solid ${palette.border}`,
                      marginBottom: 8,
                      padding: 12,
                      backgroundColor: palette.surface,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          color: palette.textSecondary_w,
                          fontSize: 12,
                        }}
                      >
                        {new Date(note.noteDate).toLocaleDateString()}
                      </span>
                      <span
                        style={{
                          color: palette.textSecondary_w,
                          fontSize: 12,
                        }}
                      >
                        Added by {note.author?.email ?? "Unknown"}
                      </span>
                    </div>

                    <div
                      style={{ color: palette.textPrimary_w, fontSize: 14 }}
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    />
                  </List.Item>
                )}
              />
            </div>
          </Tabs.TabPane>
        </Tabs>
      </StyleProvider>
    </div>
  );
};

export default EmployeeDetails;

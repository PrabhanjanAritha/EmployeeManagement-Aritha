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
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useTheme } from "../theme/useTheme";
import { getEmployeeById, updateEmployee } from "../api/employees";
import { getEmployeeNotes, addEmployeeNote } from "../api/notes";

import { DefaultEditor } from "react-simple-wysiwyg";
import { StyleProvider } from "@ant-design/cssinjs";
// import "react-simple-wysiwyg/dist/styles.css";

const { Option } = Select;

type Employee = {
  id: number;
  employeeCode?: string | null;
  firstName: string;
  lastName: string;
  teamName?: string | null;
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
};

type EmployeeNote = {
  id: number;
  content: string; // HTML
  noteDate: string;
  createdAt: string;
  author: {
    id: number;
    email: string;
  };
};

type FormValues = {
  employeeId?: string;
  team?: string;
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
  const { palette } = useTheme();
  const { id } = useParams<{ id: string }>();
  const isDark =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (palette as any)?.mode === "dark" || (palette as any)?.isDark || false;

  const pageBg = isDark ? palette.background ?? "#020617" : "#f3f4f6"; // subtle gray for light
  const cardBg = isDark ? palette.surface ?? "#020617" : "#f9fafb"; // off-white for light
  const employeeId = Number(id);
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [notes, setNotes] = useState<EmployeeNote[]>([]);
  const [noteDate, setNoteDate] = useState<Dayjs | null>(dayjs());
  const [noteText, setNoteText] = useState(""); // HTML
  const [loading, setLoading] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const readOnlyFieldStyle = !isEditing
    ? {
        backgroundColor: "transparent",
        color: palette.textPrimary,
        opacity: 1,
        cursor: "default",
      }
    : undefined;
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
          team: emp.teamName || "",
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
    // simple content check: strip tags
    const plainText = noteText.replace(/<[^>]+>/g, "").trim();
    if (!plainText) {
      messageApi.warning("Please enter a note");
      return;
    }

    try {
      setNoteLoading(true);

      const payload = {
        content: noteText, // HTML from editor
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
          paddingRight: 50, // space for suffix
          ...(readOnlyFieldStyle || {}),
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
        gender: values.gender,
        title: values.title,
        active: values.active,
      };

      await updateEmployee(employeeId, payload);

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
        team: employee.teamName || "",
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

      {/* breadcrumb */}
      <Breadcrumb
        items={[
          { title: "Employees", onClick: () => navigate("/employees") },
          { title: "View Employee" },
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1
                style={{ color: palette.textPrimary }}
                className="text-2xl font-bold"
              >
                {fullName || "Employee Details"}
              </h1>
              <p style={{ color: palette.textSecondary }}>
                Details for employee{" "}
                {employee?.employeeCode || `#${employee?.id}`}
              </p>
            </div>
            <div>
              {!isEditing ? (
                <Button
                  style={{ backgroundColor: palette.primary, color: "#fff" }}
                  className="px-2 py-1 rounded"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Employee
                </Button>
              ) : null}
            </div>
          </div>

          {/* Editable form section */}
          {/* Editable form section */}
          <div
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.border,
            }}
            className="rounded-xl p-6 border shadow-sm mb-6"
          >
            <Form<FormValues> form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={[16, 16]}>
                {/* Employee ID */}
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="employeeId"
                    label="Employee ID"
                    rules={[
                      { required: true, message: "Employee ID is required" },
                    ]}
                  >
                    <Input disabled={!isEditing} style={readOnlyFieldStyle} />
                  </Form.Item>
                </Col>

                {/* Team */}
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="team" label="Team">
                    <Select
                      placeholder="Select a team"
                      disabled={!isEditing}
                      style={readOnlyFieldStyle}
                    >
                      <Option value="Engineering">Engineering</Option>
                      <Option value="Design">Design</Option>
                      <Option value="Marketing">Marketing</Option>
                    </Select>
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
                    <Input disabled={!isEditing} style={readOnlyFieldStyle} />
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
                    <Input disabled={!isEditing} style={readOnlyFieldStyle} />
                  </Form.Item>
                </Col>

                {/* Date of Birth */}
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="dob"
                    label="Date of Birth"
                    rules={[
                      { required: true, message: "Date of Birth is required" },
                    ]}
                  >
                    <DatePicker
                      format="MM/DD/YYYY"
                      disabled={!isEditing}
                      style={{
                        width: "100%",
                        ...(readOnlyFieldStyle || {}),
                      }}
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
                      disabled={!isEditing}
                      style={{
                        width: "100%",
                        ...(readOnlyFieldStyle || {}),
                      }}
                    />
                  </Form.Item>
                </Col>

                {/* Personal Email */}
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="personalEmail"
                    label="Personal Email"
                    rules={[
                      { required: true, message: "Personal email is required" },
                      { type: "email", message: "Enter a valid email" },
                    ]}
                  >
                    <Input disabled={!isEditing} style={readOnlyFieldStyle} />
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
                    <Input disabled={!isEditing} style={readOnlyFieldStyle} />
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
                    <Input disabled={!isEditing} style={readOnlyFieldStyle} />
                  </Form.Item>
                </Col>

                {/* Job Title */}
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="title" label="Job Title">
                    <Input
                      disabled={!isEditing}
                      placeholder="e.g., Software Engineer"
                      style={readOnlyFieldStyle}
                    />
                  </Form.Item>
                </Col>

                {/* Gender */}
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="gender" label="Gender">
                    <Select
                      placeholder="Select gender"
                      disabled={!isEditing}
                      style={readOnlyFieldStyle}
                    >
                      <Option value="Male">Male</Option>
                      <Option value="Female">Female</Option>
                      <Option value="Other">Other</Option>
                      <Option value="Prefer not to say">
                        Prefer not to say
                      </Option>
                    </Select>
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
                      disabled={!isEditing}
                      style={{
                        backgroundColor: form.getFieldValue("active")
                          ? palette.primary
                          : "#999",
                      }}
                    />
                  </Form.Item>
                </Col>

                {/* Experience While Joining */}
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Experience While Joining">
                    <Row gutter={8} align="middle">
                      <Col xs={12}>
                        <Form.Item name="experienceYears" noStyle>
                          <SuffixInput
                            suffix="years"
                            disabled={!isEditing}
                            // value + onChange are handled by Form
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={12}>
                        <Form.Item name="experienceMonths" noStyle>
                          <SuffixInput suffix="months" disabled={!isEditing} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Current Experience">
                    <Row gutter={8} align="middle">
                      <Col xs={12}>
                        <SuffixInput
                          suffix="years"
                          disabled={!isEditing}
                          // value + onChange are handled by Form
                        />
                      </Col>
                      <Col xs={12}>
                        <SuffixInput suffix="months" disabled={!isEditing} />
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
              </Row>

              {isEditing && (
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    type="default"
                    onClick={handleCancelEdit}
                    style={{
                      border: `1px solid ${palette.border}`,
                      background: "transparent",
                      color: palette.textPrimary,
                    }}
                  >
                    Cancel
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
                    Update
                  </Button>
                </div>
              )}
            </Form>
          </div>

          {/* Notes section */}
          <div
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.border,
            }}
            className="rounded-xl p-6 border shadow-sm"
          >
            <h3
              style={{ color: palette.textPrimary }}
              className="text-lg font-semibold mb-3"
            >
              Notes
            </h3>

            {/* SMALL READ-ONLY DATE PILL */}
            <div
              style={{
                backgroundColor: palette.cardBg ?? palette.surface,
                border: `1px solid ${palette.border}`,
                color: palette.textSecondary,
                padding: "6px 12px",
                fontSize: 13,
                borderRadius: 8,
                width: "fit-content",
                marginBottom: 12,
              }}
            >
              Note Date: {noteDate?.format("MM/DD/YYYY")}
            </div>

            {/* FULL WIDTH EDITOR */}
            <div
              style={{
                borderRadius: 8,
                border: `1px solid ${palette.border}`,
                overflow: "hidden",
                backgroundColor: palette.surface,
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
                Add Note
              </Button>
            </div>

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
                        color: palette.textSecondary,
                        fontSize: 12,
                      }}
                    >
                      {new Date(note.noteDate).toLocaleDateString()}
                    </span>
                    <span
                      style={{
                        color: palette.textSecondary,
                        fontSize: 12,
                      }}
                    >
                      Added by {note.author?.email ?? "Unknown"}
                    </span>
                  </div>

                  {/* Render HTML */}
                  <div
                    style={{ color: palette.textPrimary, fontSize: 14 }}
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                </List.Item>
              )}
            />
          </div>
        </div>
      </StyleProvider>
    </div>
  );
};

export default EmployeeDetails;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useTheme } from "../theme/useTheme";
import { getEmployeeById, updateEmployee } from "../api/employees";
import { getEmployeeNotes, addEmployeeNote } from "../api/notes";

const { TextArea } = Input;
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
};

export const EmployeeDetails: React.FC = () => {
  const { palette } = useTheme();
  const { id } = useParams<{ id: string }>();
  const employeeId = Number(id);

  const [form] = Form.useForm<FormValues>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [notes, setNotes] = useState<EmployeeNote[]>([]);
  const [noteDate, setNoteDate] = useState<Dayjs | null>(dayjs());
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!employeeId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const emp = await getEmployeeById(employeeId);
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
        });

        const notesData = await getEmployeeNotes(employeeId);
        setNotes(notesData);
      } catch (err) {
        console.error("Failed to load employee details", err);
        messageApi.error("Failed to load employee details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId, form, messageApi]);

  const onAddNote = async () => {
    if (!noteText.trim()) {
      messageApi.warning("Please enter a note");
      return;
    }

    try {
      setNoteLoading(true);

      const payload = {
        content: noteText.trim(),
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
    // reset form back to original employee values and exit edit mode
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
    <div>
      {contextHolder}

      {/* breadcrumb */}
      <nav style={{ color: palette.textSecondary }} className="text-sm mb-3">
        Home / Employees /{" "}
        <strong style={{ color: palette.textPrimary }}>
          {fullName || "Employee"}
        </strong>
      </nav>

      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            style={{ color: palette.textPrimary }}
            className="text-2xl font-bold"
          >
            {fullName || "Employee Details"}
          </h1>
          <p style={{ color: palette.textSecondary }}>
            Details for employee {employee?.employeeCode || `#${employee?.id}`}
          </p>
        </div>
        <div>
          {!isEditing ? (
            <button
              style={{ backgroundColor: palette.primary, color: "#fff" }}
              className="px-4 py-2 rounded"
              onClick={() => setIsEditing(true)}
            >
              Edit Employee
            </button>
          ) : null}
        </div>
      </div>

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
            <Col xs={24} md={12}>
              <Form.Item
                name="employeeId"
                label="Employee ID"
                rules={[{ required: true, message: "Employee ID is required" }]}
              >
                <Input disabled={!isEditing} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="team" label="Team">
                <Select placeholder="Select a team" disabled={!isEditing}>
                  <Option value="Engineering">Engineering</Option>
                  <Option value="Design">Design</Option>
                  <Option value="Marketing">Marketing</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: "First name is required" }]}
              >
                <Input disabled={!isEditing} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: "Last name is required" }]}
              >
                <Input disabled={!isEditing} />
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
                <DatePicker
                  format="MM/DD/YYYY"
                  style={{ width: "100%" }}
                  disabled={!isEditing}
                />
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
                <DatePicker
                  format="MM/DD/YYYY"
                  style={{ width: "100%" }}
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="personalEmail"
                label="Personal Email"
                rules={[
                  { required: true, message: "Personal email is required" },
                  { type: "email", message: "Enter a valid email" },
                ]}
              >
                <Input disabled={!isEditing} />
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
                <Input disabled={!isEditing} />
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
                <Input disabled={!isEditing} />
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
                        disabled={!isEditing}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={12} md={12}>
                    <Form.Item name="experienceMonths" noStyle>
                      <InputNumber
                        min={0}
                        max={11}
                        placeholder="Months"
                        style={{ width: "100%" }}
                        disabled={!isEditing}
                      />
                    </Form.Item>
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

      {/* Notes section - keep as non-editable (only add new note) */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <DatePicker
            value={noteDate}
            onChange={(value) => setNoteDate(value)}
            format="MM/DD/YYYY"
            style={{
              width: "100%",
              padding: 4,
              borderRadius: 8,
              border: `1px solid ${palette.border}`,
            }}
          />
          <TextArea
            rows={3}
            placeholder="Add a new note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${palette.border}`,
            }}
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
                  {note.noteDate
                    ? new Date(note.noteDate).toLocaleDateString()
                    : ""}
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
              <div style={{ color: palette.textPrimary }}>{note.content}</div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default EmployeeDetails;

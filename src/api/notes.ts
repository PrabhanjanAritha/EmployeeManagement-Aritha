import api from "./axios";

export type EmployeeNote = {
  id: number;
  content: string;
  noteDate: string;
  createdAt: string;
  author: {
    id: number;
    email: string;
  };
};

export async function getEmployeeNotes(employeeId: number) {
  const res = await api.get(`/employees/${employeeId}/notes`);
  return res.data as EmployeeNote[];
}

export async function addEmployeeNote(
  employeeId: number,
  data: { content: string; noteDate?: string | null }
) {
  const res = await api.post(`/employees/${employeeId}/notes`, data);
  return res.data as EmployeeNote;
}

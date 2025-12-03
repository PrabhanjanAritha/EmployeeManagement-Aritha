/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./axios";

export async function getEmployees() {
  const res = await api.get("/employees");
  return res.data;
}

export async function createEmployee(data: any) {
  const res = await api.post("/employees", data);
  return res.data;
}
export async function getEmployeeById(id: number) {
  const res = await api.get(`/employees/${id}`);
  return res.data;
}
export async function updateEmployee(id: number, data: any) {
  const res = await api.put(`/employees/${id}`, data);
  return res.data;
}

export async function deleteEmployee(id: number) {
  const res = await api.delete(`/employees/${id}`);
  return res.data;
}

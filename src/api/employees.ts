/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./axios";

// Types
export interface Employee {
  id: number;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  personalEmail?: string;
  companyEmail?: string;
  phone?: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  experienceYearsAtJoining?: number;
  experienceMonthsAtJoining?: number;
  title?: string;
  teamName?: string;
  gender?: string;
  active: boolean;
  teamId?: number;
  clientId?: number;
  team?: {
    id: number;
    name: string;
  };
  client?: {
    id: number;
    name: string;
    industry?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeResponse {
  success: boolean;
  data: Employee[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface SingleEmployeeResponse {
  success: boolean;
  data: Employee;
  message?: string;
}

export interface EmployeeStatsResponse {
  success: boolean;
  data: {
    total: number;
    active: number;
    inactive: number;
    byTeam: Array<{ teamId: number; _count: number }>;
    byClient: Array<{ clientId: number; _count: number }>;
  };
}

/**
 * Get all employees with filtering, search, and pagination
 * @param params - Query parameters for filtering and pagination
 */
export async function getEmployees(params?: Record<string, string | number>) {
  // Build query string from params
  const queryString = params
    ? "?" +
      Object.entries(params)
        .filter(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ([_, value]) => value !== undefined && value !== null && value !== ""
        )
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&")
    : "";

  const res = await api.get(`/employees${queryString}`);
  return res.data;
}

/**
 * Get a single employee by ID
 * @param id - Employee ID
 */
export async function getEmployeeById(id: number) {
  const res = await api.get<SingleEmployeeResponse>(`/employees/${id}`);
  return res.data;
}

/**
 * Create a new employee
 * @param data - Employee data
 */
export async function createEmployee(data: any) {
  const res = await api.post<SingleEmployeeResponse>("/employees", data);
  return res.data;
}

/**
 * Update an existing employee
 * @param id - Employee ID
 * @param data - Updated employee data
 */
export async function updateEmployee(id: number, data: any) {
  const res = await api.put<SingleEmployeeResponse>(`/employees/${id}`, data);
  return res.data;
}

/**
 * Delete an employee (soft delete by default, hard delete with permanent flag)
 * @param id - Employee ID
 * @param permanent - If true, permanently deletes the employee (hard delete)
 */
export async function deleteEmployee(id: number, permanent: boolean = false) {
  const queryString = permanent ? "?hard=true" : "";
  const res = await api.delete(`/employees/${id}${queryString}`);
  return res.data;
}

/**
 * Toggle employee active/inactive status
 * @param id - Employee ID
 */
export async function toggleEmployeeStatus(id: number) {
  const res = await api.patch<SingleEmployeeResponse>(
    `/employees/${id}/toggle-status`
  );
  return res.data;
}

/**
 * Get employee statistics
 */
export async function getEmployeeStats() {
  const res = await api.get<EmployeeStatsResponse>("/employees/stats");
  return res.data;
}

// Export all functions as default
export default {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeStatus,
  getEmployeeStats,
};

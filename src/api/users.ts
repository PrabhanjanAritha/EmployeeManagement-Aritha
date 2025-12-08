// api/users.ts
import api from "./axios";

export interface User {
  id: number;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterUserData {
  email: string;
  password: string;
  role?: string;
}

/**
 * Get all users (admin only)
 */
export const getUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Register a new user (admin only)
 */
export const registerUser = async (data: RegisterUserData) => {
  try {
    const response = await api.post("/auth/register", data);
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

/**
 * Update user status (activate/deactivate)
 */
export const updateUserStatus = async (userId: number, active: boolean) => {
  try {
    const response = await api.patch(`/users/${userId}/status`, { active });
    return response.data;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};
export const updateUserRole = async (userId: number, role: string) => {
  try {
    const response = await api.patch(`/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};
/**
 * Delete a user (admin only)
 */
export const deleteUser = async (userId: number) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export default {
  getUsers,
  registerUser,
  updateUserStatus,
  deleteUser,
};

// api/teams.ts
import api from "./axios";

export interface Team {
  id: number;
  name: string;
  title?: string;
  managerName?: string;
  managerEmail?: string;
  clientId?: number;
  client?: {
    id: number;
    name: string;
    pocInternalName?: string;
    pocInternalEmail?: string;
    pocExternalName?: string;
    pocExternalEmail?: string;
    address?: string;
  };
  employees?: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    employeeCode?: string;
    title?: string;
  }>;
  _count?: {
    employees: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamResponse {
  success: boolean;
  data: Team[] | Team;
  message?: string;
}

/**
 * Get all teams
 */
export const getTeams = async (params?: {
  clientId?: number;
  search?: string;
  includeEmployees?: boolean;
}): Promise<TeamResponse | Team[]> => {
  try {
    const queryString = params
      ? "?" +
        Object.entries(params)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([_, v]) => v !== undefined && v !== null)
          .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
          .join("&")
      : "";

    const response = await api.get<TeamResponse>(`/teams${queryString}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
};

/**
 * Get a single team by ID
 */
export const getTeamById = async (id: number): Promise<TeamResponse> => {
  try {
    const response = await api.get<TeamResponse>(`/teams/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching team:", error);
    throw error;
  }
};

/**
 * Create a new team
 */
export const createTeam = async (data: {
  name: string;
  title?: string;
  managerName?: string;
  managerEmail?: string;
  clientId?: number;
  employeeIds?: number[];
}): Promise<Team> => {
  try {
    const response = await api.post<{ success: boolean; data: Team }>(
      "/teams",
      data
    );
    return response.data.data;
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
};

/**
 * Update a team
 */
export const updateTeam = async (
  id: number,
  data: {
    name?: string;
    title?: string;
    managerName?: string;
    managerEmail?: string;
    clientId?: number;
    employeeIds?: number[];
  }
): Promise<Team> => {
  try {
    const response = await api.put<{ success: boolean; data: Team }>(
      `/teams/${id}`,
      data
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating team:", error);
    throw error;
  }
};

/**
 * Delete a team
 */
export const deleteTeam = async (id: number): Promise<void> => {
  try {
    await api.delete(`/teams/${id}`);
  } catch (error) {
    console.error("Error deleting team:", error);
    throw error;
  }
};

/**
 * Get team employees
 */
export const getTeamEmployees = async (id: number) => {
  try {
    const response = await api.get(`/teams/${id}/employees`);
    return response.data;
  } catch (error) {
    console.error("Error fetching team employees:", error);
    throw error;
  }
};

export default {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamEmployees,
};

import api from "./axios";

export interface Client {
  id: number;
  name: string;
  pocInternalName?: string;
  pocInternalEmail?: string;
  pocExternalName?: string;
  pocExternalEmail?: string;
  address?: string;
  teams?: Array<{
    id: number;
    name: string;
    title?: string;
    managerName?: string;
    _count?: {
      employees: number;
    };
  }>;
  employees?: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    title?: string;
    team?: {
      id: number;
      name: string;
    };
  }>;
  _count?: {
    teams: number;
    employees: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientResponse {
  success: boolean;
  data: Client[] | Client;
  message?: string;
}

/**
 * Get all clients
 */
export const getClients = async (params?: {
  search?: string;
  includeTeams?: boolean;
  includeEmployees?: boolean;
}): Promise<ClientResponse | Client[]> => {
  try {
    const queryString = params
      ? "?" +
        Object.entries(params)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([_, v]) => v !== undefined && v !== null)
          .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
          .join("&")
      : "";

    const response = await api.get<ClientResponse>(`/clients${queryString}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
};

/**
 * Get a single client by ID
 */
export const getClientById = async (id: number): Promise<ClientResponse> => {
  try {
    const response = await api.get<ClientResponse>(`/clients/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching client:", error);
    throw error;
  }
};

/**
 * Create a new client
 */
export const createClient = async (data: {
  name: string;
  pocInternalName?: string;
  pocInternalEmail?: string;
  pocExternalName?: string;
  pocExternalEmail?: string;
  address?: string;
}): Promise<Client> => {
  try {
    const response = await api.post<{ success: boolean; data: Client }>(
      "/clients",
      data
    );
    return response.data.data;
  } catch (error) {
    console.error("Error creating client:", error);
    throw error;
  }
};

/**
 * Update a client
 */
export const updateClient = async (
  id: number,
  data: {
    name?: string;
    pocInternalName?: string;
    pocInternalEmail?: string;
    pocExternalName?: string;
    pocExternalEmail?: string;
    address?: string;
  }
): Promise<Client> => {
  try {
    const response = await api.put<{ success: boolean; data: Client }>(
      `/clients/${id}`,
      data
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating client:", error);
    throw error;
  }
};

/**
 * Delete a client
 */
export const deleteClient = async (id: number): Promise<void> => {
  try {
    await api.delete(`/clients/${id}`);
  } catch (error) {
    console.error("Error deleting client:", error);
    throw error;
  }
};

/**
 * Get client teams
 */
export const getClientTeams = async (id: number) => {
  try {
    const response = await api.get(`/clients/${id}/teams`);
    return response.data;
  } catch (error) {
    console.error("Error fetching client teams:", error);
    throw error;
  }
};

/**
 * Get client employees
 */
export const getClientEmployees = async (id: number) => {
  try {
    const response = await api.get(`/clients/${id}/employees`);
    return response.data;
  } catch (error) {
    console.error("Error fetching client employees:", error);
    throw error;
  }
};

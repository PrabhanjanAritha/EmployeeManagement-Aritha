/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./axios";

export async function getClients() {
  const res = await api.get("/clients");
    return res.data;
}

export async function createClient(data: any) {
  const res = await api.post("/clients", data);
    return res.data;
}

export async function updateClient(id: number, data: any) {
  const res = await api.put(`/clients/${id}`, data);
    return res.data;
}

export async function deleteClient(id: number) {
  const res = await api.delete(`/clients/${id}`);
    return res.data;
}

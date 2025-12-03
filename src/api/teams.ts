/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./axios";

export async function getTeams() {
  const res = await api.get("/teams");
    return res.data;
}

export async function createTeam(data: any) {
  const res = await api.post("/teams", data);
    return res.data;
}

export async function updateTeam(id: number, data: any) {
  const res = await api.put(`/teams/${id}`, data);
    return res.data;
}

export async function deleteTeam(id: number) {
  const res = await api.delete(`/teams/${id}`);
    return res.data;
}

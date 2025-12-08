import api from "./axios";

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });

  const { token, user } = res.data;

  localStorage.setItem("token", token);

  return user;
}

export async function register(email: string, password: string, role = "hr") {
  const res = await api.post("/auth/register", { email, password, role });
  return res.data;
}

export type LoginPayload = {
  email: string;
  password: string;
};

export async function loginApi(payload: LoginPayload) {
  const res = await api.post("/auth/login", payload);
  console.log(res.data);
  const { token, user } = res.data;

  // store token (and user if you want)
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("role", user.role);

  return user;
}

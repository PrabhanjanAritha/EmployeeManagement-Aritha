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

/**
 * Set recovery answer (admin only)
 */
export const setRecoveryAnswer = async (answer: string) => {
  try {
    const res = await api.post("/auth/set-recovery-answer", { answer });
    return res.data;
  } catch (error) {
    console.error("Error setting recovery answer:", error);
    throw error;
  }
};

/**
 * Update recovery answer (admin only)
 */
export const updateRecoveryAnswer = async (
  oldAnswer: string,
  newAnswer: string
) => {
  try {
    const res = await api.post("/auth/update-recovery-answer", {
      oldAnswer,
      newAnswer,
    });
    return res.data;
  } catch (error) {
    console.error("Error updating recovery answer:", error);
    throw error;
  }
};

/**
 * Change password (admin only)
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  try {
    const res = await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return res.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};
export const resetAdminPassword = async (
  answer: string,
  newPassword: string
) => {
  try {
    const res = await api.post("/auth/reset-admin-password", {
      answer,
      newPassword,
    });
    return res.data;
  } catch (err) {
    console.error("Error resetting admin password:", err);
    throw err;
  }
};
export default {
  login,
  register,
  loginApi,
  setRecoveryAnswer,
  updateRecoveryAnswer,
  changePassword,
  resetAdminPassword,
};

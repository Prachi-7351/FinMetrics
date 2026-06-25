// client/src/services/authService.js
import api from "./api.js";

export const registerUser = async (formData) => {
  const { data } = await api.post("/auth/register", formData);
  return data; // { token, user }
};

export const loginUser = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data; // { token, user }
};

export const fetchMe = async () => {
  const { data } = await api.get("/auth/me");
  return data.user;
};

export const updateProfile = async (updates) => {
  const { data } = await api.put("/auth/me", updates);
  return data.user;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const { data } = await api.put("/auth/password", { currentPassword, newPassword });
  return data;
};

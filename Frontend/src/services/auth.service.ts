import api from "../api/axios";

export const login = (email: string, password: string) => {
  return api.post("/auth/login", {
    email,
    password,
  });
};
export const getProfile = () => {
  return api.get("/auth/profile");
};
export const forgotPassword = (email: string) => {
  return api.post("/auth/forgot-password", {
    email,
  });
};

export const resetPassword = (email: string, otp: string, password: string) => {
  return api.post("/auth/reset-password", {
    email,
    otp,
    password,
  });
};

export const logout = () => {
  return api.post("/auth/logout");
};

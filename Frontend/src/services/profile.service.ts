import api from "../api/axios";

export const getProfile = () => {
  return api.get("/employees/me");
};

export const updateProfile = (data: any) => {
  return api.put("/auth/profile", data);
};

export const changePassword = (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  return api.put("/auth/change-password", data);
};

export const getProfileImageUrl = (image?: string) => {
  if (!image) return undefined;

  return `${api.defaults.baseURL}/uploads/${image}`;
};

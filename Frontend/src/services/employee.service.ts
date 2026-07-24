import type { AxiosRequestConfig } from "axios";
import api from "../api/axios";

export const getEmployees = (
  search = "",
  limit = 10,
  offset = 0,
  chunk = 10,
  sortBy = "",
  sortOrder = "",
  config?: AxiosRequestConfig,
) => {
  let url = `/employees?search=${search}&limit=${limit}&offset=${offset}&chunk=${chunk}`;
  if (sortBy) {
    url += `&sortBy=${sortBy}`;
  }
  if (sortOrder) {
    url += `&sortOrder=${sortOrder}`;
  }
  return api.get(url, config);
};

export const createEmployee = (data: any) => {
  return api.post("/employees", data);
};

export const updateEmployee = (id: string, data: any) => {
  return api.put(`/employees/${id}`, data);
};

export const deleteEmployee = (id: string) => {
  return api.delete(`/employees/${id}`);
};

export const getEmployeeById = (id: string) => {
  return api.get(`/employees/${id}`);
};

export const uploadProfileImage = (employeeId: string, file: File) => {
  const formData = new FormData();

  formData.append("file", file);

  return api.post(`/employees/${employeeId}/profile-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

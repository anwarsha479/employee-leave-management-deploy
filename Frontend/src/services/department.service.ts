import api from "../api/axios";

export const getDepartments = (search = "") => {
  return api.get(`/departments?search=${search}`);
};

export const createDepartment = (data: {
  name: string;
  description: string;
}) => {
  return api.post("/departments", data);
};

export const updateDepartment = (
  id: string,
  data: {
    name: string;
    description: string;
  },
) => {
  return api.put(`/departments/${id}`, data);
};

export const deleteDepartment = (id: string) => {
  return api.delete(`/departments/${id}`);
};
